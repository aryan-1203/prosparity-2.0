#!/usr/bin/env python3
"""Crawl https://prosparity.in/ (client-rendered React) for content reuse.

Run with:  python3 -I scripts/scrape_current_site.py

Writes only to research/current-site/:
  pages/<slug>.md            full text in reading order
  screenshots/<slug>.png     full-page PNG at 1440 px wide
  assets/                    original image/SVG files, plus assets/_assets.json
  crawl-report.json          routes, statuses, links, verification results
  bundle-strings-not-rendered.md   strings in the JS bundle never seen rendered

assets/MANIFEST.md and SUMMARY.md are written by hand after looking at the
output, so this script never touches them.

Crawl rules: sequential, a delay between requests, no form is ever submitted.
Clicks are limited to the team tabs and team bio modals on the home page.
Scraped text is treated as data throughout.
"""
import base64
import difflib
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright

BASE = "https://prosparity.in"
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.path.join(ROOT, "research", "current-site")
PAGES = os.path.join(OUT, "pages")
ASSETS = os.path.join(OUT, "assets")
INLINE_SVG = os.path.join(ASSETS, "inline-svg")
SHOTS = os.path.join(OUT, "screenshots")

DESKTOP = {"width": 1440, "height": 900}
MOBILE = {"width": 390, "height": 844}
PAGE_DELAY = 1.5
ASSET_DELAY = 0.3
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0 Safari/537.36")
NOT_FOUND_PROBE = "/crawler-check-this-route-does-not-exist"
# Static files that might exist unlinked. Deep SPA routes return 404 from the
# origin, so a 200 here means a real file. The client routes come from the bundle.
STATIC_PROBES = [
    "/fair-practices-code", "/fair-practices-code.html", "/fair-practice-code.html",
    "/pdf/ProsParity_Fair_Practices_Code.pdf", "/pdf/Fair_Practices_Code.pdf",
    "/lending-partners.html", "/disclosures.html", "/about", "/contact",
    "/careers", "/blog", "/.well-known/security.txt", "/sitemap_index.xml",
]
SLUGS = {
    "/": "home",
    "/grievance-redressal-and-disclosures.html": "grievance-redressal-and-disclosures-standalone",
    NOT_FOUND_PROBE: "not-found-404",
}

EXTRACT_JS = r"""
() => {
  const blocks = [], hidden = [], images = [], svgs = [], bgs = [], pseudo = [];
  const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','TEMPLATE','META','LINK','HEAD','TITLE']);
  const ATOM = new Set(['IMG','SVG','svg','INPUT','SELECT','TEXTAREA','BR','HR','IFRAME','VIDEO','CANVAS','PICTURE']);
  const LAND = {HEADER:'site header', FOOTER:'site footer', MAIN:'main content'};
  let aDepth = 0, buf = '', bufEl = null, bufFs = 0, directFs = false;
  const cs = (el, p) => el.ownerDocument.defaultView.getComputedStyle(el, p);
  const norm = s => s.replace(/[ \t\r\n\f\u00a0]+/g, ' ');

  function hiddenReason(el) {
    const s = cs(el);
    if (s.display === 'none') return 'display:none';
    if (s.visibility === 'hidden') return 'visibility:hidden';
    if (el.classList && el.classList.contains('sr-only')) return 'screen-reader only';
    const r = el.getBoundingClientRect();
    if (s.position === 'fixed' && r.left >= el.ownerDocument.defaultView.innerWidth) return 'off-canvas drawer';
    return null;
  }
  function addImage(img, isHidden) {
    images.push({src: img.getAttribute('src') || '', abs: img.currentSrc || img.src || '',
      srcset: img.getAttribute('srcset') || '', alt: img.getAttribute('alt'),
      nw: img.naturalWidth, nh: img.naturalHeight,
      rw: Math.round(img.getBoundingClientRect().width), rh: Math.round(img.getBoundingClientRect().height),
      hidden: !!isHidden, frame: img.ownerDocument.location.href,
      section: (img.closest('[id]') || {}).id || ''});
    return images.length - 1;
  }
  function addSvg(el) {
    const label = el.getAttribute('aria-label') || '';
    const t = el.querySelector('title');
    svgs.push({html: el.outerHTML, label: label || (t ? t.textContent : ''),
      section: (el.closest('[id]') || {}).id || '',
      parent: el.parentElement ? el.parentElement.tagName : '',
      href: (el.closest('a') || {}).href || ''});
  }
  function collectHidden(el, reason) {
    const text = norm(el.textContent || '').trim();
    if (text) hidden.push({reason, text, tag: el.tagName.toLowerCase()});
    el.querySelectorAll('img').forEach(i => addImage(i, true));
  }
  function hasBlockDesc(el) {
    for (const d of el.querySelectorAll('*')) {
      if (SKIP.has(d.tagName) || ATOM.has(d.tagName) || d.tagName === 'path') continue;
      if (d.closest('svg')) continue;
      const s = cs(d);
      if (s.display === 'none') continue;
      if (!s.display.startsWith('inline') && s.display !== 'contents') return true;
    }
    return false;
  }
  function fieldToken(el) {
    const req = el.required ? ' required' : '';
    const ph = el.getAttribute('placeholder');
    const phs = ph ? ` placeholder="${ph}"` : '';
    if (el.tagName === 'SELECT')
      return `[select name=${el.name || el.id}${req} options: ${[...el.options].map(o => o.textContent.trim()).join(' | ')}]`;
    if (el.tagName === 'TEXTAREA') return `[textarea name=${el.name || el.id}${req}${phs}]`;
    return `[input type=${el.getAttribute('type') || 'text'} name=${el.name || el.id}${req}${phs}]`;
  }
  function inl(node) {
    if (node.nodeType === 3) {
      if (node.nodeValue.trim() && node.parentElement)
        bufFs = Math.max(bufFs, parseFloat(cs(node.parentElement).fontSize));
      return norm(node.nodeValue);
    }
    if (node.nodeType !== 1) return '';
    const tag = node.tagName;
    if (SKIP.has(tag)) return '';
    if (tag === 'svg' || tag === 'SVG') { addSvg(node); return ''; }
    const hr = hiddenReason(node);
    if (hr) { collectHidden(node, hr); return ''; }
    if (tag === 'BR') return '\n';
    if (tag === 'IMG') {
      const tok = `{{IMG:${addImage(node, false)}}}`;
      const a = node.closest('a');
      return (a && !aDepth) ? `[${tok}](${a.getAttribute('href')})` : tok;
    }
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return fieldToken(node);
    if (tag === 'A') aDepth++;
    let inner = '';
    node.childNodes.forEach(c => inner += inl(c));
    if (tag === 'A') {
      aDepth--;
      const t = inner.trim();
      if (!t) return '';
      const lead = inner.match(/^\s*/)[0], trail = inner.match(/\s*$/)[0];
      return `${lead}[${t}](${node.getAttribute('href')})${trail}`;
    }
    if (tag === 'BUTTON') { const t = inner.trim(); return t ? `[button: ${t}]` : ''; }
    const wrap = (tag === 'STRONG' || tag === 'B') ? '**' : (tag === 'EM' || tag === 'I') ? '*' : '';
    if (wrap && inner.trim()) {
      const lead = inner.match(/^\s*/)[0], trail = inner.match(/\s*$/)[0];
      return `${lead}${wrap}${inner.trim()}${wrap}${trail}`;
    }
    return inner;
  }
  function isInlineFlow(el) {
    const tag = el.tagName;
    if (tag === 'IFRAME') return false;
    if (ATOM.has(tag)) return true;
    const d = cs(el).display;
    return (d.startsWith('inline') || d === 'contents') && !hasBlockDesc(el);
  }
  function bgOf(el) {
    const b = cs(el).backgroundImage;
    if (!b || b === 'none') return;
    for (const m of b.matchAll(/url\("?([^")]+)"?\)/g)) {
      bgs.push({url: m[1], cls: (el.getAttribute('class') || '').slice(0, 120),
        tag: el.tagName.toLowerCase(), frame: el.ownerDocument.location.href,
        section: (el.closest('[id]') || {}).id || ''});
      blocks.push({t: 'bg', url: m[1]});
    }
  }
  function flush() {
    const text = buf.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').trim();
    if (text) {
      const s = cs(bufEl);
      blocks.push({t: 'p', text, fs: Math.max(bufFs, directFs ? parseFloat(s.fontSize) : 0),
        fw: parseInt(s.fontWeight) || 400, tag: bufEl.tagName.toLowerCase(), tt: s.textTransform});
    }
    buf = ''; bufEl = null; bufFs = 0; directFs = false;
  }
  function walk(el) {
    el.childNodes.forEach(c => {
      if (c.nodeType === 3) { if (!bufEl) bufEl = el; if (c.nodeValue.trim()) directFs = true; buf += norm(c.nodeValue); return; }
      if (c.nodeType !== 1 || SKIP.has(c.tagName)) return;
      const hr = hiddenReason(c);
      if (hr) { collectHidden(c, hr); return; }
      if (isInlineFlow(c)) { if (!bufEl) bufEl = el; buf += inl(c); return; }
      flush();
      block(c);
      flush();
    });
    flush();
  }
  function listBlock(el, depth) {
    const ordered = el.tagName === 'OL';
    let n = parseInt(el.getAttribute('start') || '1');
    const style = cs(el).listStyleType;
    [...el.children].forEach(li => {
      if (li.tagName !== 'LI') { block(li); return; }
      const hr = hiddenReason(li);
      if (hr) { collectHidden(li, hr); return; }
      const start = blocks.length;
      li.childNodes.forEach(c => {
        if (c.nodeType === 3) { if (!bufEl) bufEl = li; buf += norm(c.nodeValue); return; }
        if (c.nodeType !== 1 || SKIP.has(c.tagName)) return;
        const h2 = hiddenReason(c);
        if (h2) { collectHidden(c, h2); return; }
        if (c.tagName === 'UL' || c.tagName === 'OL') { flush(); listBlock(c, depth + 1); return; }
        if (isInlineFlow(c)) { if (!bufEl) bufEl = li; buf += inl(c); return; }
        flush(); block(c); flush();
      });
      flush();
      let marker = '-';
      if (style === 'none') marker = '';
      else if (ordered) {
        const al = String.fromCharCode(96 + n);
        const rom = ['','i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv'][n] || n;
        marker = style === 'lower-alpha' || style === 'lower-latin' ? `${al}.`
               : style === 'upper-alpha' || style === 'upper-latin' ? `${al.toUpperCase()}.`
               : style === 'lower-roman' ? `${rom}.`
               : style === 'upper-roman' ? `${String(rom).toUpperCase()}.` : `${n}.`;
      }
      n++;
      let first = true;
      for (let i = start; i < blocks.length; i++) {
        const b = blocks[i];
        if (b.t === 'p') {
          if (first) { blocks[i] = {t: 'li', depth, marker, text: b.text}; first = false; }
          else blocks[i] = {t: 'cont', depth, text: b.text};
        } else if (b.t === 'li' || b.t === 'cont') first = false;
      }
      if (first && blocks.length === start) blocks.push({t: 'li', depth, marker, text: ''});
    });
  }
  function table(el) {
    const rows = [...el.querySelectorAll('tr')].filter(r => r.closest('table') === el).map(r => {
      const hdr = [...r.children].every(c => c.tagName === 'TH');
      return {hdr, cells: [...r.children].map(c => {
        let t = ''; c.childNodes.forEach(n => t += inl(n));
        return {text: t.replace(/\s*\n\s*/g, ' <br> ').replace(/\s+/g, ' ').trim(),
                span: (c.colSpan > 1 ? c.colSpan : 1), rspan: (c.rowSpan > 1 ? c.rowSpan : 1)};
      })};
    });
    blocks.push({t: 'table', rows});
  }
  function block(el) {
    const tag = el.tagName;
    if (el.id) blocks.push({t: 'anchor', id: el.id});
    bgOf(el);
    if (/^H[1-6]$/.test(tag)) {
      let t = ''; el.childNodes.forEach(c => t += inl(c));
      t = t.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
      if (t) blocks.push({t: 'h', level: +tag[1], text: t, tt: cs(el).textTransform});
      return;
    }
    if (tag === 'UL' || tag === 'OL') { listBlock(el, 0); return; }
    if (tag === 'TABLE') { table(el); return; }
    if (tag === 'HR') { blocks.push({t: 'hr'}); return; }
    if (tag === 'IFRAME') {
      const doc = el.contentDocument;
      blocks.push({t: 'mark', text: `iframe start: ${el.getAttribute('src')} (title: ${el.getAttribute('title') || ''})`});
      if (doc && doc.body) walk(doc.body);
      else blocks.push({t: 'mark', text: 'iframe content not accessible'});
      blocks.push({t: 'mark', text: 'iframe end'});
      return;
    }
    if ((tag === 'A' || tag === 'BUTTON') && !hasBlockDesc(el)) {
      const t = inl(el).trim();
      if (t) blocks.push({t: 'p', text: t, fs: parseFloat(cs(el).fontSize), fw: 400, tag: tag.toLowerCase()});
      return;
    }
    if (LAND[tag]) { blocks.push({t: 'mark', text: `${LAND[tag]} start`}); walk(el); blocks.push({t: 'mark', text: `${LAND[tag]} end`}); return; }
    walk(el);
  }

  walk(document.body);

  const allDocs = [document];
  document.querySelectorAll('iframe').forEach(f => { if (f.contentDocument) allDocs.push(f.contentDocument); });
  const links = [], heads = [], ids = {}, inner = [];
  for (const d of allDocs) {
    const frame = d.location.href;
    d.querySelectorAll('a[href]').forEach(a => links.push({href: a.getAttribute('href'), abs: a.href,
      text: norm(a.textContent || '').trim(), target: a.getAttribute('target') || '', frame,
      download: a.getAttribute('download')}));
    ids[frame] = [...d.querySelectorAll('[id]')].map(e => e.id);
    inner.push({frame, text: d.body ? d.body.innerText : ''});
    d.querySelectorAll('*').forEach(el => {
      for (const p of ['::before', '::after']) {
        const c = cs(el, p).content;
        if (c && c !== 'none' && c !== 'normal' && c !== '""' && !c.startsWith('url('))
          pseudo.push({content: c, pseudo: p, cls: (el.getAttribute('class') || '').slice(0, 60)});
      }
      for (const p of ['::before', '::after']) {
        const b = cs(el, p).backgroundImage;
        if (b && b !== 'none') for (const m of b.matchAll(/url\("?([^")]+)"?\)/g))
          bgs.push({url: m[1], cls: (el.getAttribute('class') || '').slice(0, 120), tag: p, frame, section: ''});
      }
    });
  }
  const metas = {};
  document.querySelectorAll('meta').forEach(m => {
    const k = m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('itemprop');
    if (k) metas[k] = m.getAttribute('content');
  });
  const head = {title: document.title, lang: document.documentElement.lang, metas,
    canonical: (document.querySelector('link[rel=canonical]') || {}).href || '',
    icons: [...document.querySelectorAll('link[rel*=icon]')].map(l => l.href),
    h: document.documentElement.scrollHeight};
  return {blocks, hidden, images, svgs, bgs, pseudo, links, ids, inner, head,
    forms: allDocs.reduce((n, d) => n + d.forms.length, 0)};
}
"""


def log(*a):
    print(*a, flush=True)


def fetch(url, method="GET", timeout=30):
    # Some asset filenames contain spaces, which urllib rejects unless quoted.
    url = urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%~-._")
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, dict(r.headers), r.read() if method == "GET" else b"", r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read() if method == "GET" else b"", url


def launch(p):
    try:
        return p.chromium.launch(headless=True), "playwright default"
    except Exception:
        # The installed Playwright can expect a newer build than the one cached.
        found = sorted(glob.glob(os.path.expanduser(
            "~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-mac*/headless_shell")))
        if not found:
            raise
        return p.chromium.launch(headless=True, executable_path=found[-1]), found[-1]


def settle(page):
    """Scroll in steps to trigger lazy content and scroll animations, then return to the top."""
    y, h = 0, page.evaluate("document.documentElement.scrollHeight")
    while y < h:
        page.evaluate("y => window.scrollTo(0, y)", y)
        page.wait_for_timeout(200)
        y += 450
        h = page.evaluate("document.documentElement.scrollHeight")
    page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
    page.wait_for_timeout(500)
    try:
        page.wait_for_load_state("networkidle", timeout=15000)
    except Exception:
        pass
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(1000)


def discover():
    found = {"robots": None, "sitemap_urls": [], "routes": [], "static_refs": [], "probes": {}}
    _, _, body, _ = fetch(BASE + "/robots.txt")
    found["robots"] = body.decode("utf8", "replace")
    time.sleep(ASSET_DELAY)
    _, _, body, _ = fetch(BASE + "/sitemap.xml")
    found["sitemap_raw"] = body.decode("utf8", "replace")
    found["sitemap_urls"] = re.findall(r"<loc>(.*?)</loc>", found["sitemap_raw"])
    time.sleep(ASSET_DELAY)
    _, _, home, _ = fetch(BASE + "/")
    home = home.decode("utf8", "replace")
    js_path = re.search(r'src="(/static/js/main\.[^"]+\.js)"', home).group(1)
    css_path = re.search(r'href="(/static/css/main\.[^"]+\.css)"', home).group(1)
    time.sleep(ASSET_DELAY)
    js = fetch(BASE + js_path)[2].decode("utf8", "replace")
    time.sleep(ASSET_DELAY)
    css = fetch(BASE + css_path)[2].decode("utf8", "replace")
    found.update(js_path=js_path, css_path=css_path,
                 js_sha256=hashlib.sha256(js.encode()).hexdigest())
    found["routes"] = sorted(set(re.findall(r'path:"(/[^"*]*)"', js)))
    found["static_refs"] = sorted(set(re.findall(r'"(/[\w./-]+\.(?:html|pdf))"', js)))
    for path in STATIC_PROBES:
        time.sleep(ASSET_DELAY)
        status, hdrs, _, _ = fetch(BASE + path, "HEAD")
        found["probes"][path] = {"status": status, "type": hdrs.get("content-type", hdrs.get("Content-Type", ""))}
    return found, js, css


def slug_for(path):
    return SLUGS.get(path) or re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-")


def clean_name(url):
    path = urllib.parse.unquote(urllib.parse.urlparse(url).path)
    base = os.path.basename(path)
    base = re.sub(r"\.[0-9a-f]{16,32}(\.\w+)$", r"\1", base)
    stem, ext = os.path.splitext(base)
    stem = re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-") or "asset"
    return stem + ext.lower()


class Assets:
    def __init__(self):
        self.items = {}   # url or data-hash -> record
        self.names = set()

    def add(self, url, page, how, alt=None, section="", rendered=None, hidden=False):
        if not url:
            return
        if not url.startswith("data:"):
            url = urllib.parse.unquote(url)  # the same file can arrive as %20 or as a space
        rec = self.items.setdefault(url, {"url": url, "uses": []})
        use = {"page": page, "how": how, "alt": alt, "section": section,
               "rendered": rendered, "hidden_at_1440": hidden}
        if use not in rec["uses"]:
            rec["uses"].append(use)

    def unique(self, name):
        stem, ext = os.path.splitext(name)
        out, i = name, 2
        while out in self.names:
            out, i = f"{stem}-{i}{ext}", i + 1
        self.names.add(out)
        return out

    def download(self):
        for url, rec in self.items.items():
            if url.startswith("data:"):
                m = re.match(r"data:image/([\w+.-]+)(;base64)?,(.*)", url, re.S)
                if not m:
                    rec["error"] = "unparsed data URI"
                    continue
                raw = (base64.b64decode(m.group(3)) if m.group(2)
                       else urllib.parse.unquote(m.group(3)).encode())
                ext = {"svg+xml": ".svg", "jpeg": ".jpg"}.get(m.group(1), "." + m.group(1))
                alt = next((u["alt"] for u in rec["uses"] if u["alt"]), "") or "embedded"
                name = self.unique("data-uri-" + re.sub(r"[^a-z0-9]+", "-", alt.lower()).strip("-") + ext)
                rec["source"] = "data URI embedded in the JS bundle or CSS"
            else:
                time.sleep(ASSET_DELAY)
                try:
                    status, hdrs, raw, _ = fetch(url)
                except Exception as e:
                    rec["error"] = repr(e)
                    continue
                rec["status"] = status
                rec["content_type"] = hdrs.get("content-type", hdrs.get("Content-Type", ""))
                if status != 200 or "text/html" in rec["content_type"]:
                    rec["error"] = f"HTTP {status} {rec['content_type']}"
                    continue
                name = self.unique(clean_name(url))
                rec["source"] = url
            with open(os.path.join(ASSETS, name), "wb") as f:
                f.write(raw)
            rec.update(file=name, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
            rec["pixels"] = pixels(os.path.join(ASSETS, name), raw)
            log("  asset", name, rec["pixels"], rec["bytes"])

    def save(self):
        out = sorted((dict(r, url=(r["url"] if not r["url"].startswith("data:") else "data:(omitted)"))
                      for r in self.items.values()), key=lambda r: r.get("file", "~"))
        with open(os.path.join(ASSETS, "_assets.json"), "w") as f:
            json.dump(out, f, indent=1)


def pixels(path, raw):
    if path.endswith(".svg"):
        head = raw[:2000].decode("utf8", "replace")
        w = re.search(r'\bwidth="([\d.]+)', head)
        h = re.search(r'\bheight="([\d.]+)', head)
        vb = re.search(r'viewBox="([^"]+)"', head)
        return f"svg {w.group(1) if w else '?'}x{h.group(1) if h else '?'} viewBox {vb.group(1) if vb else '?'}"
    try:
        o = subprocess.run(["/usr/bin/sips", "-g", "pixelWidth", "-g", "pixelHeight", path],
                           capture_output=True, text=True, timeout=20).stdout
        w = re.search(r"pixelWidth: (\d+)", o)
        h = re.search(r"pixelHeight: (\d+)", o)
        return f"{w.group(1)}x{h.group(1)}" if w and h else "unknown"
    except Exception:
        return "unknown"


def visual_level(b):
    """Non-heading elements styled as headings. Returns a level, or None for body text."""
    text = b["text"].strip()
    if b["tag"] in ("a", "button", "label") or len(text) > 120 or text.endswith("."):
        return None
    if b["fs"] >= 36:
        return 2
    if b["fs"] >= 22:
        return 3
    return None


def render_table(rows):
    if not rows:
        return ""
    if any(c["span"] > 1 or c["rspan"] > 1 for r in rows for c in r["cells"]):
        html = ["<table>"]
        for r in rows:
            html.append("<tr>" + "".join(
                '<{t}{a}{b}>{x}</{t}>'.format(
                    t="th" if r["hdr"] else "td", x=c["text"],
                    a=f' colspan="{c["span"]}"' if c["span"] > 1 else "",
                    b=f' rowspan="{c["rspan"]}"' if c["rspan"] > 1 else "")
                for c in r["cells"]) + "</tr>")
        return "\n".join(html + ["</table>"])
    width = max(len(r["cells"]) for r in rows)
    line = lambda cells: "| " + " | ".join(
        (cells[i]["text"].replace("|", "\\|") if i < len(cells) else "") for i in range(width)) + " |"
    out = [line(rows[0]["cells"]), "|" + " --- |" * width]
    return "\n".join(out + [line(r["cells"]) for r in rows[1:]])


def to_markdown(blocks, img_tok, bg_tok):
    out = []
    prev = None
    # A page with no real <h1> gets its first styled heading as level 1.
    need_h1 = not any(b["t"] == "h" and b["level"] == 1 for b in blocks)
    for b in blocks:
        t = b["t"]
        chunk = None
        tight = False
        if t == "h":
            chunk = "#" * b["level"] + " " + img_tok(b["text"])
        elif t == "p":
            text = img_tok(b["text"])
            lvl = visual_level(b) if "{{IMG" not in b["text"] else None
            if lvl:
                if need_h1:
                    lvl, need_h1 = 1, False
                one = re.sub(r"\s*\n\s*", " ", text)
                chunk = f"<!-- visual heading: <{b['tag']}> at {b['fs']:g}px, not a semantic heading on the site -->\n{'#' * lvl} {one}"
            else:
                chunk = text.replace("\n", "  \n")
        elif t == "li":
            ind = "  " * b["depth"]
            chunk = ind + (b["marker"] + " " if b["marker"] else "") + img_tok(b["text"]).replace("\n", "  \n" + ind + "  ")
            # Items with no visible marker need blank lines or they merge into one paragraph.
            tight = prev in ("li", "cont") and bool(b["marker"])
        elif t == "cont":
            chunk = "  " * (b["depth"] + 1) + img_tok(b["text"]).replace("\n", "  \n")
            tight = prev in ("li", "cont")
        elif t == "table":
            chunk = img_tok(render_table(b["rows"]))
        elif t == "hr":
            chunk = "---"
        elif t == "mark":
            chunk = f"<!-- {b['text']} -->"
        elif t == "bg":
            chunk = f"<!-- CSS background image: {bg_tok(b['url'])} -->"
        elif t == "raw":
            chunk = b["text"]
        if chunk is None:
            continue
        if tight and out:
            out[-1] += "\n" + chunk
        else:
            out.append(chunk)
        prev = t
    return "\n\n".join(out)


def words(s):
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[button: ([^\]]*)\]", r"\1", s)
    s = re.sub(r"\[(?:input|textarea|select)[^\]]*\]", " ", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"^\s*(?:#+|-|\d+\.|[a-z]\.|[ivx]+\.)\s+", " ", s, flags=re.M)
    s = re.sub(r"[*|]", " ", s)
    return re.findall(r"[^\s]+", s.lower())


def verify(md_body, inner):
    """Word-level diff of the markdown against the browser's innerText, ignoring case."""
    a = words(md_body)
    b = words(re.sub(r"\[\s*\]", " ", "\n".join(x["text"] for x in inner)))
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    diffs = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op != "equal":
            diffs.append({"op": op, "markdown": " ".join(a[i1:i2])[:200], "rendered": " ".join(b[j1:j2])[:200]})
    return {"md_words": len(a), "rendered_words": len(b), "ratio": round(sm.ratio(), 5), "diffs": diffs[:60]}


def capture_team(page, slug):
    """Click the team tabs and open each bio modal. Nothing is submitted."""
    close_d = "M6 18 18 6M6 6l12 12"
    result = {}
    for tab in ("Founding Team", "Team"):
        page.locator("#teams").scroll_into_view_if_needed()
        page.get_by_role("button", name=tab, exact=True).click()
        page.wait_for_timeout(700)
        if tab == "Team":
            settle(page)
            page.screenshot(path=os.path.join(SHOTS, f"{slug}--team-tab.png"), full_page=True)
        members = []
        count = page.locator("#teams article").count()
        for i in range(count):
            card = page.locator("#teams article").nth(i)
            card.scroll_into_view_if_needed()
            data = card.evaluate("""a => ({
              spans: [...a.querySelectorAll('span')].filter(s => !s.classList.contains('sr-only'))
                     .map(s => s.textContent.trim()).filter(Boolean),
              img: (a.querySelector('img') || {}).src, alt: (a.querySelector('img') || {alt: ''}).alt})""")
            card.locator("button").first.click()
            dlg = page.locator("[role=dialog]")
            # The dialog root has no box of its own, so wait on its contents.
            dlg.locator("img").first.wait_for(state="visible", timeout=8000)
            page.wait_for_timeout(500)
            modal = dlg.evaluate("""d => ({
              spans: [...d.querySelectorAll('span')].filter(s => !s.classList.contains('sr-only'))
                     .map(s => s.textContent).filter(s => s.trim()),
              links: [...d.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
              img: (d.querySelector('img') || {}).src, alt: (d.querySelector('img') || {alt: ''}).alt,
              text: d.innerText})""")
            name = re.sub(r"[^a-z0-9]+", "-", data["spans"][0].lower()).strip("-")
            page.screenshot(path=os.path.join(SHOTS, f"{slug}--bio-{name}.png"))
            dlg.locator(f'button:has(path[d="{close_d}"])').filter(visible=True).first.click()
            page.wait_for_timeout(350)
            members.append({"card": data, "modal": modal})
            log("   ", tab, data["spans"])
        result[tab] = members
    page.get_by_role("button", name="Founding Team", exact=True).click()
    page.wait_for_timeout(300)
    return result


def team_blocks(team, slug):
    out = [{"t": "mark", "text": "team section: the card and bio text below comes from clicking each tab and each card's button"}]
    for tab, members in team.items():
        out.append({"t": "raw", "text": f"### {tab}\n\n<!-- tab button: \"{tab}\" -->"})
        for m in members:
            sp = m["modal"]["spans"]
            name = sp[0]
            role = sp[1] if len(sp) > 1 else ""
            bio = sp[2] if len(sp) > 2 else ""
            extra = sp[3:]
            lines = [f"#### {name}", f"{{{{SRC:{m['card']['img']}|{m['card']['alt']}}}}}",
                     role, bio]
            if extra:
                lines.append("Other text in the modal: " + " | ".join(extra))
            for link in m["modal"]["links"]:
                lines.append(f"LinkedIn: {link}")
            out.append({"t": "raw", "text": "\n\n".join(x for x in lines if x)})
    return out


def splice_team(blocks, team, slug):
    start = next((i for i, b in enumerate(blocks) if b["t"] == "anchor" and b["id"] == "teams"), None)
    end = next((i for i, b in enumerate(blocks) if b["t"] == "anchor" and b["id"] == "investors"), None)
    if start is None or end is None:
        return blocks
    return blocks[: start + 1] + team_blocks(team, slug) + blocks[end:]


def capture(page, url, path, assets, report):
    slug = slug_for(path)
    responses = []
    handler = lambda r: responses.append(r)
    page.on("response", handler)
    resp = page.goto(url, wait_until="networkidle", timeout=60000)
    settle(page)
    data = page.evaluate(EXTRACT_JS)
    page.screenshot(path=os.path.join(SHOTS, f"{slug}.png"), full_page=True)
    team = capture_team(page, slug) if path == "/" else None
    page.remove_listener("response", handler)
    media = [(r.url, r.status, r.headers.get("content-type", "")) for r in responses
             if r.request.resource_type in ("image", "media")]
    for u, _, _ in media:
        assets.add(u, slug, "network response")
    return slug, resp.status, data, team, media


def write_page(slug, url, status, data, md_body, mobile_only, notes):
    head = data["head"]
    m = head["metas"]
    lines = [f"- **URL:** {url}",
             f"- **HTTP status on direct load:** {status}",
             f"- **Title:** {head['title']}",
             f"- **Meta description:** {m.get('description', '(none)')}",
             f"- **Meta title:** {m.get('title', '(none)')}",
             f"- **Canonical:** {head['canonical'] or '(none)'}",
             f"- **og:title:** {m.get('og:title', '(none)')}",
             f"- **og:url:** {m.get('og:url', '(none)')}",
             f"- **Robots:** {m.get('robots', '(none)')}",
             f"- **Screenshot:** ../screenshots/{slug}.png"]
    lines += [f"- **Capture note:** {n}" for n in notes]
    lines.append("- **Text fidelity:** wording and letter case come from the DOM text nodes, not the "
                 "on-screen rendering, so CSS uppercase or capitalise is not applied here.")
    parts = ["\n".join(lines), "---", md_body]
    if data["hidden"]:
        seen, rows = set(), []
        for h in data["hidden"]:
            k = (h["reason"], h["text"])
            if k not in seen:
                seen.add(k)
                rows.append(f"- ({h['reason']}, <{h['tag']}>) {h['text']}")
        parts += ["---", "## Appendix: text in the DOM but not visible at 1440 px", "\n".join(rows)]
    if mobile_only:
        parts += ["---", "## Appendix: text visible at 390 px but not at 1440 px",
                  "\n".join(f"- {t}" for t in mobile_only)]
    with open(os.path.join(PAGES, f"{slug}.md"), "w") as f:
        f.write("\n\n".join(parts).rstrip() + "\n")


def block_texts(blocks):
    out = []
    for b in blocks:
        if b["t"] in ("p", "h", "li", "cont"):
            t = re.sub(r"\{\{IMG:\d+\}\}", " ", b["text"])
            t = re.sub(r"\s+", " ", t).strip()
            if t:
                out.append(t)
    return out


def capture_pdf(url, path, assets_records):
    status, hdrs, raw, _ = fetch(url)
    name = os.path.basename(urllib.parse.urlparse(url).path)
    dest = os.path.join(ASSETS, name)
    with open(dest, "wb") as f:
        f.write(raw)
    slug = "grievance-redressal-policy-pdf"
    text = subprocess.run(["pdftotext", "-layout", dest, "-"], capture_output=True, text=True).stdout
    info = subprocess.run(["pdfinfo", dest], capture_output=True, text=True).stdout
    prefix = os.path.join(SHOTS, f"{slug}-page")
    subprocess.run(["pdftoppm", "-r", "110", "-png", dest, prefix], capture_output=True)
    body = ["- **URL:** " + url, f"- **HTTP status:** {status}", f"- **Local copy:** ../assets/{name}",
            "- **Title:** (PDF, see metadata below)", "- **Meta description:** (none, PDF)",
            f"- **Screenshots:** ../screenshots/{slug}-page-*.png",
            "- **Capture note:** text extracted with pdftotext -layout. Line breaks and spacing follow "
            "the PDF layout. Wording is unchanged.",
            "", "PDF metadata:", "", "```", info.strip(), "```", "", "---", "", "```text", text.rstrip(), "```", ""]
    with open(os.path.join(PAGES, f"{slug}.md"), "w") as f:
        f.write("\n".join(body))
    return {"path": path, "slug": slug, "status": status, "bytes": len(raw), "file": name,
            "sha256": hashlib.sha256(raw).hexdigest(), "pdfinfo": info}


def bundle_leftovers(js, corpus):
    keys = (r'(?:children|desc|title|text|message|placeholder|alt|designation|name|label|heading|'
            r'subtitle|description|content|caption)')
    found = set(re.findall(keys + r':"((?:[^"\\]|\\.){3,})"', js))
    found |= set(re.findall(r'\.(?:required|email|min|max|matches|success|error|warn|info|typeError)\('
                            r'(?:[^,()"]*,\s*)?"((?:[^"\\]|\\.){3,})"', js))
    found |= set(re.findall(r'children:\[\s*"((?:[^"\\]|\\.){3,})"', js))
    # Single-sentence call arguments, which is how toasts and zod messages appear.
    found |= set(re.findall(r'\((?:\d+,\s*)?"([A-Z][a-z]+ [^"\\]{6,})"\)', js))
    plain = re.sub(r"\s+", " ", corpus.lower())
    left = []
    for s in sorted(found):
        try:
            t = json.loads('"' + re.sub(r"\\x([0-9a-fA-F]{2})", r"\\u00\1", s) + '"')
        except Exception:
            t = s
        n = re.sub(r"\s+", " ", t).strip()
        if len(n) < 8 or " " not in n or re.search(r"[{}<>=]|\bfunction\b|\.concat|https?:", n):
            continue
        if n.lower() in plain:
            continue
        left.append(n)
    return left


def main():
    for d in (PAGES, SHOTS):
        shutil.rmtree(d, ignore_errors=True)
    for d in (PAGES, ASSETS, INLINE_SVG, SHOTS):
        os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(ASSETS, "*")) + glob.glob(os.path.join(INLINE_SVG, "*")):
        if os.path.isfile(f) and os.path.basename(f) != "MANIFEST.md":
            os.remove(f)

    report = {"crawled_at": datetime.now(timezone.utc).isoformat(), "base": BASE,
              "pages": [], "failures": []}
    found, js, css = discover()
    report["discovery"] = found
    log("routes", found["routes"], "static", found["static_refs"])

    queue = ["/"] + [r for r in found["routes"] if r != "/"] + found["static_refs"] + [NOT_FOUND_PROBE]
    seen, captured = set(), []
    assets = Assets()
    all_links, svg_seen, corpus = [], {}, []

    with sync_playwright() as p:
        browser, how = launch(p)
        report["browser"] = {"binary": how, "version": browser.version}
        log("browser", how, browser.version)
        ctx = browser.new_context(viewport=DESKTOP, user_agent=UA)
        page = ctx.new_page()
        mctx = browser.new_context(viewport=MOBILE, user_agent=UA, is_mobile=True, has_touch=True)
        mpage = mctx.new_page()

        while queue:
            path = queue.pop(0)
            if path in seen:
                continue
            seen.add(path)
            url = BASE + path
            time.sleep(PAGE_DELAY)
            if path.endswith(".pdf"):
                log("PDF", url)
                try:
                    report["pdf"] = capture_pdf(url, path, assets)
                except Exception as e:
                    report["failures"].append({"url": url, "error": repr(e)})
                continue
            log("PAGE", url)
            try:
                slug, status, data, team, media = capture(page, url, path, assets, report)
            except Exception as e:
                log("  FAILED", repr(e))
                report["failures"].append({"url": url, "error": repr(e)})
                continue

            for img in data["images"]:
                assets.add(img["abs"], slug, "img", img["alt"], img["section"],
                           f"{img['rw']}x{img['rh']}", img["hidden"])
                for part in filter(None, (s.strip().split(" ")[0] for s in img["srcset"].split(","))):
                    assets.add(urllib.parse.urljoin(url, part), slug, "srcset", img["alt"], img["section"])
            for b in data["bgs"]:
                assets.add(urllib.parse.urljoin(b["frame"], b["url"]), slug, "css background", None, b["section"])
            for ic in data["head"]["icons"]:
                assets.add(ic, slug, "head icon")
            og = data["head"]["metas"].get("og:image")
            assets.add(og, slug, "og:image", data["head"]["metas"].get("og:image:alt"))
            for s in data["svgs"]:
                h = hashlib.sha256(s["html"].encode()).hexdigest()[:10]
                rec = svg_seen.setdefault(h, {"html": s["html"], "uses": []})
                use = {"page": slug, "section": s["section"], "href": s["href"], "label": s["label"]}
                if use not in rec["uses"]:
                    rec["uses"].append(use)
            for link in data["links"]:
                all_links.append(dict(link, page=slug))
                u = urllib.parse.urlparse(link["abs"])
                if u.scheme in ("http", "https") and u.hostname in ("prosparity.in", "www.prosparity.in"):
                    if u.path and u.path not in seen and u.path not in queue:
                        queue.append(u.path)

            blocks = data["blocks"]
            if team:
                blocks = splice_team(blocks, team, slug)
                report["team"] = team
                for members in team.values():
                    for m in members:
                        assets.add(m["card"]["img"], slug, "img", m["card"]["alt"], "teams")
                        assets.add(m["modal"]["img"], slug, "img (bio modal)", m["modal"]["alt"], "teams")
                        corpus.append(m["modal"]["text"])
            # Mobile pass, to find text that only exists at phone width.
            time.sleep(PAGE_DELAY)
            mobile_only = []
            try:
                mpage.goto(url, wait_until="networkidle", timeout=60000)
                settle(mpage)
                mdata = mpage.evaluate(EXTRACT_JS)
                desk = {t.lower() for t in block_texts(data["blocks"])}
                desk_all = " ".join(desk) + " " + " ".join(h["text"].lower() for h in data["hidden"])
                if team:
                    desk_all += " " + " ".join(m["modal"]["text"].lower() for v in team.values() for m in v)
                desk_all = re.sub(r"\s+", " ", desk_all)
                for t in block_texts(mdata["blocks"]):
                    if t.lower() not in desk and t.lower() not in desk_all and t not in mobile_only:
                        mobile_only.append(t)
                for img in mdata["images"]:
                    assets.add(img["abs"], slug, "img (390px pass)", img["alt"], img["section"], None, img["hidden"])
                for b in mdata["bgs"]:
                    assets.add(urllib.parse.urljoin(b["frame"], b["url"]), slug, "css background (390px pass)", None, b["section"])
            except Exception as e:
                report["failures"].append({"url": url, "stage": "mobile pass", "error": repr(e)})

            captured.append({"slug": slug, "path": path, "url": url, "status": status, "data": data,
                             "blocks": blocks, "mobile_only": mobile_only, "media": media})
            corpus += [x["text"] for x in data["inner"]] + [h["text"] for h in data["hidden"]]
            corpus += block_texts(blocks) + mobile_only

        # Anchor targets used by in-site hash links.
        browser.close()

    # Images referenced by the CSS or bundle but possibly never displayed.
    for ref in sorted(set(re.findall(r'url\(["\']?(/?static/media/[^"\')]+\.(?:png|jpe?g|svg|webp|gif)|data:image/[^"\')]+)', css))):
        if ref.startswith("data:"):
            assets.add(ref, "(stylesheet)", "css url()")
        else:
            assets.add(urllib.parse.urljoin(BASE + "/", ref), "(stylesheet)", "css url()")
    for ref in sorted(set(re.findall(r'"?(static/media/[^"\']+\.(?:png|jpe?g|svg|webp|gif))"', js))):
        assets.add(BASE + "/" + ref, "(bundle)", "bundle reference")
    for ref in sorted(set(re.findall(r'"data:image/[a-z+]+;base64,[A-Za-z0-9+/=]+"', js))):
        assets.add(ref.strip('"'), "(bundle)", "bundle data URI")
    assets.download()
    assets.save()
    report["asset_errors"] = [{"url": r["url"][:200], "error": r["error"]}
                              for r in assets.items.values() if r.get("error")]

    svg_index = []
    for h, rec in sorted(svg_seen.items()):
        name = f"inline-{h}.svg"
        html = rec["html"]
        if "xmlns=" not in html.split(">")[0]:
            html = html.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        with open(os.path.join(INLINE_SVG, name), "w") as f:
            f.write(html)
        svg_index.append({"file": "inline-svg/" + name, "bytes": len(html), "uses": rec["uses"]})
    with open(os.path.join(INLINE_SVG, "_index.json"), "w") as f:
        json.dump(svg_index, f, indent=1)

    file_for = {u: r.get("file") for u, r in assets.items.items()}

    for c in captured:
        data, url = c["data"], c["url"]

        def rel(u, base=url):
            full = u if u.startswith("data:") else urllib.parse.unquote(urllib.parse.urljoin(base, u))
            f = file_for.get(full)
            return f"../assets/{f}" if f else full[:120]

        def img_tok(text, imgs=data["images"]):
            def one(m):
                im = imgs[int(m.group(1))]
                return f"![{im['alt'] or ''}]({rel(im['abs'])})"

            def src(m):
                return f"![{m.group(2)}]({rel(m.group(1))})"
            text = re.sub(r"\{\{IMG:(\d+)\}\}", one, text)
            return re.sub(r"\{\{SRC:(.*?)\|(.*?)\}\}", src, text)

        notes = []
        if c["slug"] == "home":
            notes.append("the team section shows both tabs and all bio modals, which appear only after clicking.")
        if c["path"] == "/grievance-redressal-and-disclosures":
            notes.append("the page body is an iframe of /grievance-redressal-and-disclosures.html. The parent page "
                         "removes the iframe's .nav and .foot, so that header and footer text appears only in the "
                         "standalone capture.")
        if c["path"] == NOT_FOUND_PROBE:
            notes.append("deliberately fake URL, captured to record the site's not-found view.")
        for b in c["blocks"]:
            if b["t"] == "raw":
                b["text"] = img_tok(b["text"])
        md_body = to_markdown(c["blocks"], img_tok, rel)
        write_page(c["slug"], url, c["status"], data, md_body, c["mobile_only"], notes)
        # The default-state blocks are what innerText describes, so verify those.
        check = to_markdown(data["blocks"], img_tok, rel)
        v = verify(check, data["inner"])
        log("verify", c["slug"], v["ratio"], v["md_words"], v["rendered_words"], len(v["diffs"]))
        ids = data["ids"]
        report["pages"].append({
            "slug": c["slug"], "url": url, "status": c["status"], "title": data["head"]["title"],
            "metas": data["head"]["metas"], "canonical": data["head"]["canonical"],
            "lang": data["head"]["lang"], "height": data["head"]["h"], "forms": data["forms"],
            "headings": [(b["level"], b["text"]) for b in data["blocks"] if b["t"] == "h"],
            "visual_headings": [(b["fs"], b["text"]) for b in data["blocks"]
                                if b["t"] == "p" and visual_level(b)],
            "pseudo_content": sorted({x["content"] for x in data["pseudo"]}),
            "mobile_only": c["mobile_only"], "media": c["media"], "verify": v,
            "ids": ids})

    # Link audit: internal hash targets and external URLs, checked one at a time.
    ext, audit = {}, []
    home_ids = next((set(i for v in p_["ids"].values() for i in v) for p_ in report["pages"] if p_["slug"] == "home"), set())
    for link in all_links:
        u = urllib.parse.urlparse(link["abs"])
        if u.scheme in ("mailto", "tel"):
            continue
        if u.hostname in ("prosparity.in", "www.prosparity.in"):
            if u.fragment and u.path in ("", "/") and link["frame"].rstrip("/") == BASE and u.fragment not in home_ids:
                audit.append({"link": link["abs"], "page": link["page"], "problem": "anchor target missing"})
            continue
        if u.scheme in ("http", "https"):
            ext.setdefault(link["abs"], []).append(link["page"])
    results = []
    for u, pgs in sorted(ext.items()):
        time.sleep(0.5)
        try:
            status, _, _, final = fetch(u, "HEAD", 15)
            if status in (403, 405, 501):
                status, _, _, final = fetch(u, "GET", 20)
        except Exception as e:
            status, final = f"error: {e!r}"[:120], ""
        results.append({"url": u, "status": status, "final": final, "pages": sorted(set(pgs))})
        log("  ext", status, u)
    report["links"] = {"all": all_links, "external": results, "anchor_problems": audit}

    left = bundle_leftovers(js, " ".join(corpus))
    with open(os.path.join(OUT, "bundle-strings-not-rendered.md"), "w") as f:
        f.write("# Strings in the JS bundle not seen in any captured page\n\n"
                "Automatically extracted from " + found["js_path"] + ". Includes third-party library "
                "strings and text that only appears after interaction, such as form validation messages. "
                "Review before relying on any line.\n\n")
        f.write("\n".join(f"- {s}" for s in left) + "\n")
    with open(os.path.join(OUT, "crawl-report.json"), "w") as f:
        json.dump(report, f, indent=1, ensure_ascii=False)
    log("done:", len(report["pages"]), "pages,", len(assets.items), "assets,",
        len(svg_seen), "inline svgs, failures:", report["failures"])


if __name__ == "__main__":
    main()
