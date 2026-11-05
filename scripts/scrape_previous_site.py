#!/usr/bin/env python3
"""Crawl the rejected ProsParity redesign (a client-rendered Vite/React SPA).

Run from anywhere, isolated from the working directory:

    python3 -I scripts/scrape_previous_site.py            # full crawl
    python3 -I scripts/scrape_previous_site.py --only / /team
    python3 -I scripts/scrape_previous_site.py --render-only   # rebuild pages/*.md from raw JSON

Output goes to research/previous-site/ (pages/, assets/, screenshots/).
Raw per-page JSON and the fetched JS bundles go to --raw-dir, which defaults to
a temp directory and is not part of the deliverable.

Behaviour:
  * Discovers routes from rendered links AND from the JS bundles (React Router
    table, slug fields, /legal, /news, /products literals).
  * One page at a time with a delay between navigations. No form is ever
    submitted; POST requests are aborted at the network layer as a backstop.
  * Scraped content is treated as data only.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import sys
import tempfile
import time
import urllib.parse
import urllib.request
import zlib
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "https://prosparity-website.vercel.app"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "research" / "previous-site"
UA = "ProsParityInternalArchiver/1.0 (site owner's rebuild research)"
NAV_DELAY_S = 1.0
VIEWPORTS = {
    "1440": dict(viewport={"width": 1440, "height": 900}, device_scale_factor=1),
    "390": dict(
        viewport={"width": 390, "height": 844},
        device_scale_factor=1,
        is_mobile=True,
        has_touch=True,
    ),
}
# The installed Playwright expects a newer browser build than the cached one, so
# launch the cached binary directly rather than downloading another.
CHROMIUM_CACHE = Path.home() / "Library" / "Caches" / "ms-playwright"


def chromium_path() -> str | None:
    hits = sorted(CHROMIUM_CACHE.glob("chromium_headless_shell-*/chrome-mac*/*headless*shell"))
    return str(hits[-1]) if hits else None


ASSET_EXT = re.compile(r"\.(png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|pdf)(\?|$)", re.I)

# Runs inside the page. Returns ordered text blocks, tagged with their section.
EXTRACT_JS = r"""
() => {
  const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','TEMPLATE','PATH','DEFS','CLIPPATH','LINK','META']);
  const norm = s => (s||'').replace(/ /g,' ').replace(/\s+/g,' ').trim();
  const hiddenCss = el => { const c=getComputedStyle(el); return c.display==='none'||c.visibility==='hidden'; };
  const isInline = el => {
    const d=getComputedStyle(el).display;
    if(!d.startsWith('inline')&&d!=='contents') return false;
    if(el.tagName==='A'||el.tagName==='BUTTON') {
      if(d!=='inline'||el.querySelector('p,h1,h2,h3,h4,h5,h6,div,li')) return false;
      const host=el.closest('p,li,h1,h2,h3,h4,h5,h6,td,blockquote');
      return !!host&&norm(host.textContent)!==norm(el.textContent);
    }
    if(el.querySelector('a,button,p,h1,h2,h3,h4,h5,h6,ul,ol,li,img,input,select,textarea')) return false;
    return true;
  };
  const inlineText = el => {
    if(el.nodeType===3) return el.nodeValue;
    if(el.nodeType!==1||SKIP.has(el.tagName.toUpperCase())) return '';
    if(hiddenCss(el)) return '';
    const al=el.getAttribute('aria-label');
    if(al&&el.querySelector('[aria-hidden="true"]')&&!el.querySelector(':scope > :not([aria-hidden="true"])')) return al;
    if(el.getAttribute('aria-hidden')==='true') return '';
    if(el.tagName==='BR') return ' ';
    if(el.tagName.toLowerCase()==='svg') return '';
    let o=''; for(const n of el.childNodes) o+=inlineText(n); return o;
  };
  const sep = (el,top) => {
    if(el.nodeType===3) return el.nodeValue;
    if(el.nodeType!==1||SKIP.has(el.tagName.toUpperCase())) return '';
    if(hiddenCss(el)) return '';
    if(!top&&el.getAttribute('aria-hidden')==='true'&&el.parentElement.getAttribute('aria-label')) return '';
    const al=el.getAttribute('aria-label');
    if(!top&&al&&el.children.length&&!el.querySelector(':scope > :not([aria-hidden="true"])')) return '\u0001'+al+'\u0001';
    if(el.tagName.toLowerCase()==='svg') return '';
    let o=''; for(const n of el.childNodes) o+=sep(n,false);
    return !top&&getComputedStyle(el).display!=='inline' ? '\u0001'+o+'\u0001' : o;
  };
  const decor = el => sep(el,true).split('\u0001').map(norm).filter(Boolean).join(' · ');

  function run(root,skip=[]){
    const blocks=[]; let buf=''; let bufTag='p';
    const secOf = el => {
      let n=el;
      while(n&&n!==root&&n.parentElement!==root){
        if(n.tagName==='SECTION') break;
        n=n.parentElement;
      }
      return n;
    };
    const secIds=new Map();
    const sec = el => { const s=secOf(el); if(!secIds.has(s)) secIds.set(s,secIds.size); return secIds.get(s); };
    const push = (b,el) => { b.section=sec(el); blocks.push(b); };
    const blockTag = el => {
      let n=el;
      while(n&&n!==root){
        const t=n.tagName;
        if(/^H[1-6]$/.test(t)||t==='BLOCKQUOTE'||t==='LI'||t==='LABEL'||t==='FIGCAPTION'||t==='LEGEND'||t==='SUMMARY'||t==='DT'||t==='DD'||t==='BUTTON') return t.toLowerCase();
        n=n.parentElement;
      }
      return 'p';
    };
    let bufEl=null;
    const flush=()=>{ const t=norm(buf); if(t&&bufEl) push({tag:blockTag(bufEl),text:t},bufEl); buf=''; bufEl=null; };
    function walk(node){
      for(const ch of node.childNodes){
        if(ch.nodeType===3){ if(norm(ch.nodeValue)){ bufEl=bufEl||node; } buf+=ch.nodeValue; continue; }
        if(ch.nodeType!==1) continue;
        const tag=ch.tagName.toUpperCase();
        if(SKIP.has(tag)||skip.includes(ch)) continue;
        if(hiddenCss(ch)) continue;
        if(ch.getAttribute('aria-hidden')==='true'){
          if(tag==='SVG'){ continue; }
          const t=decor(ch);
          if(t){ flush(); push({tag:'decor',text:t},ch); }
          continue;
        }
        if(tag==='SVG'){
          const lbl=ch.getAttribute('aria-label')||(ch.querySelector('title')&&ch.querySelector('title').textContent);
          const ts=[...ch.querySelectorAll('text')].map(e=>norm(e.textContent)).filter(Boolean);
          if(lbl||ts.length){ flush(); push({tag:'svg',text:norm(lbl),texts:ts},ch); }
          continue;
        }
        if(tag==='IMG'){ flush(); push({tag:'img',alt:ch.getAttribute('alt')||'',src:ch.currentSrc||ch.src},ch); continue; }
        if(tag==='VIDEO'){ flush(); push({tag:'video',src:ch.currentSrc||ch.src},ch); continue; }
        if(tag==='IFRAME'){ flush(); push({tag:'iframe',src:ch.src},ch); continue; }
        if(tag==='INPUT'||tag==='TEXTAREA'){
          if(ch.type==='hidden') continue;
          flush(); push({tag:'input',type:ch.type||tag.toLowerCase(),name:ch.name||ch.id||'',placeholder:ch.placeholder||'',value:ch.type==='range'||ch.type==='radio'||ch.type==='checkbox'?ch.value:'',min:ch.min||'',max:ch.max||'',required:ch.required},ch); continue;
        }
        if(tag==='SELECT'){
          flush(); push({tag:'select',name:ch.name||ch.id||'',options:[...ch.options].map(o=>norm(o.textContent))},ch); continue;
        }
        if(tag==='TABLE'){
          flush();
          push({tag:'table',rows:[...ch.rows].map(r=>[...r.cells].map(c=>norm(c.innerText)))},ch); continue;
        }
        const al=ch.getAttribute('aria-label');
        const allHid=al&&ch.children.length&&!ch.querySelector(':scope > :not([aria-hidden="true"])');
        if(allHid){
          // Split-text / scramble components keep the real string in aria-label.
          if(!bufEl) bufEl=ch;
          buf+=al; continue;
        }
        if(isInline(ch)){ const t=inlineText(ch); if(norm(t)){ bufEl=bufEl||ch; } buf+=t; continue; }
        flush();
        if(tag==='A'){
          const href=ch.getAttribute('href')||'';
          if(ch.querySelector('p,h1,h2,h3,h4,h5,h6,div,li,img')||getComputedStyle(ch).display.match(/block|flex|grid/)&&ch.querySelector('span span')){
            push({tag:'cardlink',href,label:al||''},ch);
            walk(ch); flush();
            push({tag:'cardend'},ch);
          } else {
            const t=decor(ch)||al||'';
            if(t) push({tag:'link',text:t,href},ch);
          }
          continue;
        }
        if(tag==='BUTTON'){
          const t=decor(ch)||al||'';
          if(t) push({tag:'button',text:t},ch);
          continue;
        }
        walk(ch); flush();
      }
    }
    walk(root); flush();
    return blocks;
  }

  const main=document.querySelector('#main');
  const footer=document.querySelector('footer');
  const app=document.querySelector('#root');
  const links=[...document.querySelectorAll('a[href]')].map(a=>({href:a.getAttribute('href'),abs:a.href,text:norm(a.innerText)||a.getAttribute('aria-label')||''}));
  const svgs=[...document.querySelectorAll('#main svg, header svg, footer svg')]
     .filter(s=>!s.classList.contains('lucide'))
     .map(s=>{const r=s.getBoundingClientRect();return {html:s.outerHTML,w:Math.round(r.width),h:Math.round(r.height),len:s.outerHTML.length,aria:s.getAttribute('aria-label')||''};})
     .filter(s=>s.len>400);
  const bg=[...document.querySelectorAll('*')].map(e=>getComputedStyle(e).backgroundImage).filter(b=>b&&b.includes('url(')&&!b.includes('data:'));
  return {
    title:document.title,
    description:(document.querySelector('meta[name=description]')||{}).content||'',
    h:document.documentElement.scrollHeight,
    w:document.documentElement.scrollWidth,
    main: main?run(main):[],
    header: run(app,[main,footer]),
    dialogs: [...document.querySelectorAll('[role=dialog]')].flatMap(d=>run(d)),
    footer: footer?run(footer):[],
    links, svgs, bg:[...new Set(bg)],
    mainTextLen:(main&&main.innerText||'').length,
  };
}
"""

# Reports the state of the DOM relevant to scroll/motion audit.
MOTION_JS = r"""
() => {
  const out={stillHidden:[],infinite:[],sticky:[],willChange:0,blur:0,total:0};
  for(const el of document.querySelectorAll('#main *')){
    out.total++;
    const c=getComputedStyle(el);
    if(c.position==='sticky') {const r=el.getBoundingClientRect(); out.sticky.push({cls:(el.className.baseVal??el.className).toString().slice(0,90),h:Math.round(r.height),parentH:Math.round(el.parentElement.getBoundingClientRect().height)});}
    if(c.willChange&&c.willChange!=='auto') out.willChange++;
    if(c.filter&&c.filter.includes('blur')) out.blur++;
    if(c.animationIterationCount==='infinite'&&c.animationName!=='none') out.infinite.push(c.animationName);
    if(parseFloat(c.opacity)===0&&el.textContent.trim()&&el.children.length<4) out.stillHidden.push(el.textContent.trim().slice(0,80));
  }
  out.running=document.getAnimations().map(a=>({n:a.animationName||a.transitionProperty||'waapi',s:a.playState})).reduce((m,a)=>{const k=a.n+':'+a.s;m[k]=(m[k]||0)+1;return m;},{});
  return out;
}
"""


def log(*a):
    print(*a, flush=True)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def slug_for(route: str) -> str:
    path = route.split("?")[0].strip("/")
    q = route.split("?", 1)[1] if "?" in route else ""
    s = path.replace("/", "--") or "home"
    if q:
        s += "--" + re.sub(r"[^a-z0-9]+", "-", q.lower())
    return s


def discover_from_bundle(raw: Path) -> dict:
    """Return route seeds and every bundle-referenced static file."""
    bdir = raw / "bundle"
    bdir.mkdir(parents=True, exist_ok=True)
    html = fetch(BASE + "/").decode()
    main_js = re.search(r'src="(/assets/index-[^"]+\.js)"', html).group(1)
    src = fetch(BASE + main_js).decode()
    (bdir / "index.js").write_text(src)
    chunks = sorted(set(re.findall(r"assets/[A-Za-z0-9_.-]+\.js", src)))
    chunks += [
        "assets/" + m for m in set(re.findall(r"\./([A-Za-z0-9_.-]+\.js)", src))
    ]
    texts = {"index.js": src}
    for c in sorted(set(chunks)):
        try:
            texts[c] = fetch(f"{BASE}/{c}").decode()
            (bdir / Path(c).name).write_text(texts[c])
            time.sleep(0.1)
        except Exception as e:  # noqa: BLE001
            log("chunk failed", c, e)
    table = re.findall(r"\{path:`(/[^`]*|\*)`", src)
    static_routes = [p for p in table if ":" not in p and p != "*"]
    literal = set()
    files = set()
    for t in texts.values():
        for m in re.finditer(r"[`\"'](/(?:products|news|legal|careers|support|team|about)[a-z0-9/_-]*)[`\"']", t):
            literal.add(m.group(1))
        for m in re.finditer(r"[`\"'](/[A-Za-z0-9/_.-]+\.(?:png|jpe?g|webp|svg|gif|pdf|mp4|ico))[`\"']", t):
            files.add(m.group(1))
    # Data-driven slugs for the dynamic routes.
    for kind, key in (("products", r"slug:`([a-z0-9-]+)`,name:`[^`]+`,short:`"), ("news", r"slug:`([a-z0-9-]+)`,title:`[^`]+`,author")):
        for m in re.finditer(key, src):
            literal.add(f"/{kind}/{m.group(1)}")
    for t in texts.values():
        for m in re.finditer(r"/legal/([a-z0-9-]+)", t):
            literal.add("/legal/" + m.group(1))
    api = {"/careers/openings", "/careers/applications", "/partners/enquiries", "/support/tickets", "/newsletter"}
    seeds = sorted((set(static_routes) | literal) - api)
    return {"table": table, "seeds": seeds, "files": sorted(files)}


def slow_scroll(page, vp_h: int):
    """Scroll in small steps so in-view reveals, counters and lazy images fire."""
    y = 0
    step = int(vp_h * 0.3)
    for _ in range(600):
        y += step
        page.evaluate("y => window.scrollTo({top:y,behavior:'instant'})", y)
        page.wait_for_timeout(140)
        h = page.evaluate("document.documentElement.scrollHeight")
        if y >= h - vp_h:
            break
    page.wait_for_timeout(2600)  # longest count-up is 2.2 s


def wait_ready(page):
    try:
        page.wait_for_load_state("networkidle", timeout=15000)
    except Exception:  # noqa: BLE001
        log("  networkidle timeout")
    # The first-visit preloader holds the page for ~2.9 s + 1 s exit.
    try:
        page.wait_for_selector('[role="status"][aria-label="Loading ProsParity"]', state="detached", timeout=7000)
    except Exception:  # noqa: BLE001
        pass
    page.wait_for_timeout(1800)  # page-transition overlay + hero reveal


def crawl_viewport(pw, name, conf, routes, raw, shots, assets_seen, extra_discovery):
    browser = pw.chromium.launch(headless=True, executable_path=chromium_path())
    ctx = browser.new_context(user_agent=None, **conf)
    page = ctx.new_page()

    current = {"route": None}
    responses = []

    def on_route(r):
        if r.request.method != "GET":
            log("  blocked", r.request.method, r.request.url)
            r.abort()
        else:
            r.continue_()

    ctx.route("**/*", on_route)

    def on_response(resp):
        try:
            u = resp.url
            ct = resp.headers.get("content-type", "")
            responses.append({"url": u, "status": resp.status, "ct": ct, "type": resp.request.resource_type})
            if ASSET_EXT.search(u.split("#")[0]) or ct.startswith(("image/", "video/")):
                assets_seen.setdefault(u, {"pages": set(), "ct": ct})["pages"].add(current["route"])
        except Exception:  # noqa: BLE001
            pass

    page.on("response", on_response)
    console = []
    page.on("console", lambda m: console.append(f"{m.type}: {m.text[:200]}") if m.type == "error" else None)
    page.on("pageerror", lambda e: console.append("pageerror: " + str(e)[:200]))

    queue = list(routes)
    done = set()
    while queue:
        route = queue.pop(0)
        if route in done:
            continue
        done.add(route)
        current["route"] = route
        responses.clear()
        console.clear()
        log(f"[{name}] {route}")
        try:
            page.goto(BASE + route, wait_until="domcontentloaded", timeout=45000)
            if name == "1440" and route == routes[0]:
                page.wait_for_timeout(1500)
                page.screenshot(path=str(shots / "_preloader-1440.png"))
            wait_ready(page)
            pre = page.evaluate(EXTRACT_JS)  # pre-scroll snapshot: what shows without scrolling
            motion_pre = page.evaluate(MOTION_JS)
            slow_scroll(page, conf["viewport"]["height"])
            data = page.evaluate(EXTRACT_JS)
            motion = page.evaluate(MOTION_JS)
            page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
            page.wait_for_timeout(900)
            data["motion"] = motion
            data["motion_pre"] = motion_pre
            data["preLen"] = pre["mainTextLen"]
            data["route"] = route
            data["url"] = page.url
            data["console"] = list(console)
            data["responses"] = [r for r in responses if BASE in r["url"] and r["type"] in ("fetch", "xhr", "image", "media", "document")]
            (raw / f"{slug_for(route)}.{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
            size = tiled_screenshot(page, shots / f"{slug_for(route)}-{name}.png", conf["viewport"]["height"], conf["viewport"]["width"])
            log("  screenshot", size)
            if name == "1440":
                explore_states(page, route, raw, name, data)
            if extra_discovery:
                for link in data["links"]:
                    u = urllib.parse.urlsplit(link["abs"])
                    if link["abs"].startswith(BASE) and u.path:
                        r = u.path  # /apply?product=x is a state of /apply
                        if r not in done and r not in queue and not ASSET_EXT.search(u.path):
                            queue.append(r)
                            log("  discovered", r)
        except Exception as e:  # noqa: BLE001
            log("  FAILED", route, repr(e)[:300])
            (raw / f"{slug_for(route)}.{name}.error.txt").write_text(repr(e))
        time.sleep(NAV_DELAY_S)
    ctx.close()
    browser.close()
    return sorted(done)



def _png_parts(data: bytes):
    """Return (width, height, bytes-per-pixel, decompressed scanlines)."""
    pos, idat, ihdr = 8, [], None
    while pos < len(data):
        ln, typ = struct.unpack(">I4s", data[pos : pos + 8])
        body = data[pos + 8 : pos + 8 + ln]
        if typ == b"IHDR":
            ihdr = struct.unpack(">IIBBBBB", body)
        elif typ == b"IDAT":
            idat.append(body)
        pos += 12 + ln
    w, h, depth, ctype, _, _, interlace = ihdr
    assert depth == 8 and interlace == 0 and ctype in (2, 6), ihdr
    return w, h, {2: 3, 6: 4}[ctype], ctype, zlib.decompress(b"".join(idat))


def _chunk(typ: bytes, body: bytes) -> bytes:
    return struct.pack(">I", len(body)) + typ + body + struct.pack(">I", zlib.crc32(typ + body))


def stitch_png(tiles: list[bytes], dest: Path):
    """Stack same-width PNGs vertically without an imaging library.

    Filtered scanlines only depend on the row above, so each tile stays valid
    if its first row is unfiltered (it had an all-zero row above it) and stored
    with filter type 0.
    """
    comp = zlib.compressobj(6)
    out = bytearray()
    total = 0
    width = bpp = ctype = None
    for t in tiles:
        w, h, b, c, rows = _png_parts(t)
        width, bpp, ctype = width or w, bpp or b, ctype or c
        assert (w, b, c) == (width, bpp, ctype), "tile format changed"
        stride = 1 + w * b
        line = bytearray(rows[1:stride])
        ft = rows[0]
        if ft in (1, 4):  # Sub, and Paeth with a zero row above, reduce to left
            for i in range(b, len(line)):
                line[i] = (line[i] + line[i - b]) & 255
        elif ft == 3:  # Average
            for i in range(len(line)):
                left = line[i - b] if i >= b else 0
                line[i] = (line[i] + left // 2) & 255
        out += comp.compress(b"\x00" + bytes(line) + rows[stride:])
        total += h
    out += comp.flush()
    hdr = struct.pack(">IIBBBBB", width, total, 8, ctype, 0, 0, 0)
    dest.write_bytes(b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", hdr) + _chunk(b"IDAT", bytes(out)) + _chunk(b"IEND", b""))
    return width, total


def tiled_screenshot(page, dest: Path, vp_h: int, vp_w: int):
    """Screenshot viewport by viewport and stitch.

    A plain full_page capture blanks everything past ~16,384 px in Chromium and
    shows pinned (sticky) sections as empty tracks. Tiling records the frames a
    visitor actually sees, including stages of pinned sequences.
    """
    page.add_style_tag(content=".fixed.top-0.origin-left{display:none!important}")  # scroll progress bar
    total = page.evaluate("document.documentElement.scrollHeight")
    tiles = []
    y = 0
    while y < total:
        rem = total - y
        target = y if rem >= vp_h else total - vp_h
        page.evaluate("y => window.scrollTo({top:y,behavior:'instant'})", target)
        page.wait_for_timeout(950)
        if rem >= vp_h:
            tiles.append(page.screenshot())
        else:
            tiles.append(page.screenshot(clip={"x": 0, "y": vp_h - rem, "width": vp_w, "height": rem}))
        y += vp_h
    return stitch_png(tiles, dest)


LIST_BUTTONS_JS = r"""
(rootSel) => {
  const norm=s=>(s||'').replace(/\s+/g,' ').trim();
  const roots=[...document.querySelectorAll(rootSel)];
  const out=[];
  for(const r of roots) for(const b of r.querySelectorAll('button,[role=tab],summary')){
    if(b.closest('form')||b.disabled) continue;
    const c=getComputedStyle(b); if(c.display==='none'||c.visibility==='hidden') continue;
    out.push(norm(b.getAttribute('aria-label')||b.innerText||b.textContent).slice(0,90));
  }
  return out;
}
"""
CLICK_BUTTON_JS = r"""
([rootSel,label,nth]) => {
  const norm=s=>(s||'').replace(/\s+/g,' ').trim();
  let i=0;
  for(const r of document.querySelectorAll(rootSel)) for(const b of r.querySelectorAll('button,[role=tab],summary')){
    if(b.closest('form')||b.disabled) continue;
    if(norm(b.getAttribute('aria-label')||b.innerText||b.textContent).slice(0,90)===label){
      if(i++===nth){ b.scrollIntoView({block:'center',behavior:'instant'}); b.click(); return true; }
    }
  }
  return false;
}
"""
# /apply is a form flow; its later steps are read from the bundle, not clicked.
# /how-it-works buttons scroll a pinned sequence, so a click reads the wrong stage;
# the same seven stages are captured in order from the 390 px layout instead.
NO_EXPLORE = {"/apply", "/how-it-works"}
RENDER_NOTES = {
    "how-it-works": "<!-- at 1440 px these seven stages appear one at a time inside the pinned sequence; the 390 px layout lists all of them, in order, so they are recorded from there -->",
}
APPLY_FLOW = [
    "<!-- later steps of the application flow, verbatim from the Apply JS chunk; the crawl did not step through the form -->",
    "## What do you do?",
    "Closest match is fine",
    "- Delivery or gig rider\n- E-rickshaw driver\n- Fleet or logistics\n- Small business owner\n- Daily commuter\n- EV dealer",
    "## Monthly income?",
    "A rough band",
    "- Under ₹15K\n- ₹15K – ₹25K\n- ₹25K – ₹50K\n- ₹50K+",
    "## Vehicle budget?",
    "Ballpark",
    "- Under ₹1L\n- ₹1L – ₹2L\n- ₹2L – ₹4L\n- ₹4L+",
    "## Credit you need? (replaces the budget question when Dealer Financing is chosen)",
    "Ballpark",
    "- Under ₹10L\n- ₹10L – ₹25L\n- ₹25L – ₹50L\n- ₹50L+",
    "## Where do we call you?",
    "A relationship manager rings within working hours",
    "[field label] Full name",
    "[field label] Mobile number (prefix +91)",
    "[field label] City",
    "[button] Request a call",
    "No documents needed yet.",
    "Error states: Enter your name / 10-digit mobile starting 6–9 / Enter your city / Connection dropped. / Almost there. / We couldn't reach our servers. Your answers are safe — give it another go. / Try again / Sending…",
    "<!-- success state -->",
    "Fully charged",
    "## You're plugged in.",
    "A relationship manager will call you soon.",
    "Reference",
    "[link] Explore products -> /products",
    "[link] Back home -> /",
]


def settle(page, min_ms: int, cap_ms: int = 3200):
    """Wait for count-ups to finish so a click never records a mid-animation number."""
    last, t = None, 0
    while t < cap_ms:
        cur = page.evaluate("(document.querySelector('#main')||document.body).innerText.replace(/[^0-9]/g,'')")
        if cur == last and t >= min_ms:
            return
        last = cur
        page.wait_for_timeout(400)
        t += 400


def explore_nav(page, raw: Path):
    """Open each desktop nav dropdown and record its links and descriptions."""
    lines = ["<!-- desktop nav dropdowns, revealed by clicking -->"]
    for lbl in page.evaluate(LIST_BUTTONS_JS, "header"):
        if not lbl or re.search(r"menu", lbl, re.I):
            continue
        page.evaluate(CLICK_BUTTON_JS, ["header", lbl, 0])
        page.wait_for_timeout(700)
        lines.append(f"[after clicking: {lbl}]")
        for b in page.evaluate(EXTRACT_JS)["header"]:
            if b.get("tag") in ("cardlink", "link", "p", "li") and (b.get("text") or b.get("href")) and b.get("section", 0) >= 2:
                render_block(b, lines)
        page.evaluate(CLICK_BUTTON_JS, ["header", lbl, 0])
        page.wait_for_timeout(300)
    (raw / "_chrome.states.txt").write_text(json.dumps(lines, ensure_ascii=False))


def explore_states(page, route: str, raw: Path, name: str, base: dict):
    """Click tabs, accordions, carousels and dialog triggers; record new text.

    Buttons inside a <form> are never clicked. (A <button> with no type attribute
    reports type "submit" even outside a form, so form membership is the test.)
    """
    if route in NO_EXPLORE:
        return
    known = {block_key(b) for b in base["main"]}
    root = "#main, [role=dialog]"
    if route == "/":
        explore_nav(page, raw)
    done, queue, sections = set(), [], []
    for lbl in page.evaluate(LIST_BUTTONS_JS, root):
        if lbl and lbl not in queue:
            queue.append(lbl)
    # Long labels first: accordion rows before the short filter chips that hide them.
    queue.sort(key=len, reverse=True)
    clicks = 0
    while queue and clicks < 70:
        lbl = queue.pop(0)
        if lbl in done:
            continue
        done.add(lbl)
        repeat = 6 if re.search(r"next|previous", lbl, re.I) else 1
        for _ in range(repeat):
            url = page.url
            if not page.evaluate(CLICK_BUTTON_JS, [root, lbl, 0]):
                break
            clicks += 1
            settle(page, 2600 if route == "/network" else 800)
            if page.url.split("#")[0] != url.split("#")[0]:
                page.go_back()
                page.wait_for_timeout(1500)
                break
            d = page.evaluate(EXTRACT_JS)
            fresh = []
            for b in d["main"] + d["dialogs"]:
                k = block_key(b)
                if k not in known and b.get("tag") not in ("cardend", "decor"):
                    known.add(k)
                    fresh.append(b)
            if fresh:
                sections.append((lbl, fresh))
            if d["dialogs"]:
                page.keyboard.press("Escape")
                page.wait_for_timeout(500)
            for new in page.evaluate(LIST_BUTTONS_JS, root):
                if new and new not in done and new not in queue:
                    queue.append(new)
    log(f"  explored {clicks} clicks, {len(sections)} states with new text")
    if sections:
        lines = ["<!-- text revealed by interaction (tabs, accordions, carousels, dialogs) -->"]
        for lbl, blocks in sections:
            lines.append(f"[after clicking: {lbl}]")
            for b in blocks:
                b["section"] = 0
                render_block(b, lines)
        (raw / f"{slug_for(route)}.{name}.states.txt").write_text(json.dumps(lines, ensure_ascii=False))


def reextract(pw, raw: Path, routes: list[str]):
    """Refresh the text blocks in the raw JSON without redoing the screenshots."""
    for name, conf in VIEWPORTS.items():
        browser = pw.chromium.launch(headless=True, executable_path=chromium_path())
        ctx = browser.new_context(**conf)
        ctx.route("**/*", lambda r: r.continue_() if r.request.method == "GET" else r.abort())
        page = ctx.new_page()
        for route in routes:
            log(f"[reextract {name}]", route)
            f = raw / f"{slug_for(route)}.{name}.json"
            d = json.loads(f.read_text())
            page.goto(BASE + route, wait_until="domcontentloaded", timeout=45000)
            wait_ready(page)
            slow_scroll(page, conf["viewport"]["height"])
            new = page.evaluate(EXTRACT_JS)
            for k in ("main", "header", "footer", "dialogs", "title", "description"):
                d[k] = new[k]
            f.write_text(json.dumps(d, ensure_ascii=False, indent=1))
            time.sleep(NAV_DELAY_S)
        ctx.close()
        browser.close()


def explore_only(pw, raw: Path, routes: list[str]):
    conf = VIEWPORTS["1440"]
    browser = pw.chromium.launch(headless=True, executable_path=chromium_path())
    ctx = browser.new_context(**conf)
    ctx.route("**/*", lambda r: r.continue_() if r.request.method == "GET" else (log("  blocked", r.request.url), r.abort()))
    page = ctx.new_page()
    for route in routes:
        log("[explore]", route)
        base = json.loads((raw / f"{slug_for(route)}.1440.json").read_text())
        page.goto(BASE + route, wait_until="domcontentloaded", timeout=45000)
        wait_ready(page)
        slow_scroll(page, conf["viewport"]["height"])
        explore_states(page, route, raw, "1440", base)
        time.sleep(NAV_DELAY_S)
    ctx.close()
    browser.close()


def render_block(b, lines):
    t = b.get("tag")
    if t and re.fullmatch(r"h[1-6]", t):
        lines.append("#" * int(t[1]) + " " + b["text"])
    elif t == "p":
        lines.append(b["text"])
    elif t == "li":
        lines.append("- " + b["text"])
    elif t == "blockquote":
        lines.append("> " + b["text"])
    elif t == "button":
        lines.append(f"[button] {b['text']}")
    elif t == "link":
        lines.append(f"[link] {b['text']} -> {b['href']}")
    elif t == "cardlink":
        lines.append(f"[card link -> {b['href']}]" + (f" ({b['label']})" if b.get("label") else ""))
    elif t == "cardend":
        return
    elif t == "label":
        lines.append(f"[field label] {b['text']}")
    elif t == "decor":
        lines.append(f"[decorative, aria-hidden] {b['text']}")
    elif t == "img":
        lines.append(f"[image] alt=\"{b['alt']}\" src={urllib.parse.urlsplit(b['src']).path}")
    elif t in ("video", "iframe"):
        lines.append(f"[{t}] {b['src']}")
    elif t == "svg":
        bits = ([b["text"]] if b["text"] else []) + b.get("texts", [])
        lines.append("[svg text] " + " | ".join(bits))
    elif t == "input":
        extra = ""
        if b.get("type") == "range":
            extra = f" min={b['min']} max={b['max']} default={b['value']}"
        lines.append(f"[input {b['type']}] name={b['name']} placeholder=\"{b['placeholder']}\"{extra}" + (" required" if b.get("required") else ""))
    elif t == "select":
        lines.append(f"[select] name={b['name']} options: " + " | ".join(b["options"]))
    elif t == "table":
        rows = b["rows"]
        if rows:
            n = max(len(r) for r in rows)
            lines.append("| " + " | ".join((rows[0] + [""] * n)[:n]) + " |")
            lines.append("|" + " --- |" * n)
            for r in rows[1:]:
                lines.append("| " + " | ".join((r + [""] * n)[:n]) + " |")
    else:
        lines.append(f"[{t}] {b.get('text', '')}")


def _letters(t):
    return re.sub(r"[^a-z]", "", (t or "").lower())


def blocks_to_md(blocks):
    """Drop aria-hidden copies of text that is already on the page."""
    lines = []
    sec = None
    n = 0
    seen_decor = set()
    for i, b in enumerate(blocks):
        if b.get("tag") == "decor":
            key = _letters(b["text"])
            near = [x.get("text") or "" for x in blocks[max(0, i - 8) : i + 8] if x.get("tag") != "decor"]
            joined = {_letters("".join(near[a:c])) for a in range(len(near)) for c in range(a + 1, len(near) + 1)}
            if key in seen_decor or not key or key in joined:
                continue
            seen_decor.add(key)
        if b["section"] != sec:
            sec = b["section"]
            n += 1
            lines.append(f"<!-- section {n} -->")
        render_block(b, lines)
    return lines


def block_key(b):
    return (b.get("tag"), b.get("text") or b.get("alt") or b.get("name") or "")


def render_pages(raw: Path, out_pages: Path, hidden_states: dict | None = None):
    out_pages.mkdir(parents=True, exist_ok=True)
    chrome_done = False
    for f in sorted(raw.glob("*.1440.json")):
        d = json.loads(f.read_text())
        slug = f.name[: -len(".1440.json")]
        lines = [
            f"URL: {BASE}{d['route']}",
            f"Title: {d['title']}",
            f"Meta description: {d['description']}",
            "Shared header and footer text: see pages/_site-chrome.md",
            "",
        ]
        lines += blocks_to_md(d["main"])
        m = raw / f"{slug}.390.json"
        if m.exists():
            md = json.loads(m.read_text())
            have = {block_key(b) for b in d["main"]}
            extra = [b for b in md["main"] if block_key(b) not in have and b.get("tag") not in ("img", "cardlink", "cardend", "decor", "input")]
            if extra:
                lines += ["", RENDER_NOTES.get(slug, "<!-- text present only at 390 px wide -->")]
                for b in extra:
                    b["section"] = 0
                    render_block(b, lines)
        hs = raw / f"{slug}.1440.states.txt"
        if hs.exists():
            lines += [""] + json.loads(hs.read_text())
        if slug == "apply":
            lines += [""] + APPLY_FLOW
        gaps = raw / f"{slug}.gaps.txt"
        if gaps.exists():
            lines += [""] + json.loads(gaps.read_text())
        (out_pages / f"{slug}.md").write_text("\n\n".join(_join(lines)) + "\n")
        if not chrome_done and d["route"] == "/":
            c = [f"URL: every page on {BASE}", "Title: Site chrome (header and footer shown on every page)", ""]
            c += ["<!-- header, desktop -->"] + blocks_to_md(d["header"])
            c += ["<!-- footer -->"] + blocks_to_md(d["footer"])
            cs = raw / "_chrome.states.txt"
            if cs.exists():
                c += json.loads(cs.read_text())
            c += ["<!-- first-visit preloader, strings read from the JS bundle; the word after 'Credit flows to' cycles and the number counts 000 to 100 -->"]
            c += ["Credit flows to", "- Lenders", "- Dealers", "- Riders", "- Bharat.", "Unlocking EV Finance"]
            (out_pages / "_site-chrome.md").write_text("\n\n".join(_join(c)) + "\n")
            chrome_done = True



# Route -> JS chunks that hold its strings (names without the content hash).
ROUTE_CHUNKS = {
    "home": ["Home"],
    "products": ["Products"],
    "products--*": ["ProductDetail"],
    "apply": ["Apply"],
    "how-it-works": ["HowItWorks"],
    "technology": ["Technology"],
    "network": ["Network"],
    "impact": ["Impact"],
    "partners": ["Partners"],
    "about": ["About"],
    "team": ["Team"],
    "careers": ["Careers"],
    "news": ["News"],
    "news--*": ["NewsArticle"],
    "support": ["Support"],
    "legal--*": ["Legal"],
    "this-route-does-not-exist": ["NotFound"],
}
TAILWINDISH = re.compile(r"^[a-z0-9!\-:_\[\]/.%#()&>,'+*=~@|\"\\ ]+$")


def template_literals(js: str):
    """Yield the static text of every `...` literal, including ones nested in ${}.

    The bundle is minified with backtick strings throughout, so a regex that pairs
    backticks drifts out of step at the first nested literal.
    """
    found = []

    def read(i: int) -> int:  # js[i] is the opening backtick
        buf, parts, j = [], [], i + 1
        while j < len(js) and js[j] != "`":
            if js[j] == "\\":
                buf.append(js[j : j + 2])
                j += 2
            elif js.startswith("${", j):
                parts.append("".join(buf))
                buf = []
                j += 2
                depth = 1
                while j < len(js) and depth:
                    c = js[j]
                    if c == "`":
                        j = read(j)
                        continue
                    depth += (c == "{") - (c == "}")
                    j += 1
            else:
                buf.append(js[j])
                j += 1
        parts.append("".join(buf))
        found.extend(p for p in parts if p.strip())
        return j + 1

    i = 0
    while i < len(js):
        i = read(i) if js[i] == "`" else i + 1
    return found


def human_strings(js: str) -> list[str]:
    """Template-literal strings that read like copy rather than code."""
    out = []
    for raw_t in template_literals(js):
        if len(raw_t) > 600:
            continue
        t = raw_t.replace("\\xA0", " ").replace("\\n", " ").strip()
        if not re.search(r"[A-Za-z₹]{2}", t) or len(t) < 3:
            continue
        if re.search(r"[{};]|=>|^\.|^https?:|^/|^#|^M\d|^\[|cubic-bezier|rgba\(|var\(--|translate|inset\(", t):
            continue
        toks = t.split()
        if TAILWINDISH.match(t) and (t == t.lower()) and (len(toks) == 1 or any(("-" in k or ":" in k) for k in toks)):
            continue
        if re.fullmatch(r"[a-z][A-Za-z]+", t):  # identifiers such as onChange
            continue
        if any(k.startswith(("hover:", "md:", "lg:", "sm:", "group-", "bg-", "text-", "border-", "rounded-", "flex", "grid", "absolute", "relative")) for k in toks):
            continue
        out.append(re.sub(r"\s+", " ", t))
    return list(dict.fromkeys(out))


def corpus_text(d: dict) -> str:
    bits = []
    for key in ("main", "header", "footer", "dialogs"):
        for b in d.get(key, []):
            bits += [str(b.get(k, "")) for k in ("text", "alt", "placeholder", "label", "name")]
            bits += b.get("options", []) + b.get("texts", [])
            for r in b.get("rows", []):
                bits += r
    return re.sub(r"\s+", " ", " ".join(bits)).lower()


def bundle_gaps(raw: Path):
    """Write strings a page's chunks contain but the crawl never rendered."""
    bdir = raw / "bundle"
    chunks = {f.name: f.read_text() for f in bdir.glob("*.js")}
    for f in sorted(raw.glob("*.1440.json")):
        slug = f.name[: -len(".1440.json")]
        key = slug if slug in ROUTE_CHUNKS else slug.split("--")[0] + "--*"
        names = ROUTE_CHUNKS.get(key, [])
        d = json.loads(f.read_text())
        seen = corpus_text(d)
        st = raw / f"{slug}.1440.states.txt"
        if st.exists():
            seen += " " + " ".join(json.loads(st.read_text())).lower()
        mob = raw / f"{slug}.390.json"
        if mob.exists():
            seen += " " + corpus_text(json.loads(mob.read_text()))
        seen = seen.replace("’", "'")
        missing = []
        for n in names:
            for fname, js in chunks.items():
                if fname.startswith(n + "-"):
                    for t in human_strings(js):
                        if t.lower().replace("’", "'") not in seen and t not in missing:
                            missing.append(t)
        keep = [t for t in missing if re.match(r"^[A-Z₹0-9“]", t) and not re.search(r"[()=]|^Arrow|^Escape$|^\d+px", t)]
        lines = []
        if keep and slug != "apply":  # apply's strings are rendered in APPLY_FLOW
            lines = ["<!-- strings in this page's JS chunk that did not render during the crawl (aria labels, error states, animated demos); not in reading order -->"]
            lines += ["- " + t for t in keep]
        (raw / f"{slug}.gaps.txt").write_text(json.dumps(lines, ensure_ascii=False))
        log(slug, len(keep))


def _join(lines):
    """Keep table rows on consecutive lines; everything else becomes a paragraph."""
    out = []
    for ln in lines:
        if ln.startswith("|") and out and out[-1].startswith("|"):
            out[-1] += "\n" + ln
        elif ln.startswith("- ") and out and out[-1].startswith("- "):
            out[-1] += "\n" + ln
        else:
            out.append(ln)
    return out


def download_assets(assets_seen: dict, bundle_files: list, assets_dir: Path, raw: Path):
    assets_dir.mkdir(parents=True, exist_ok=True)
    index = {}
    urls = dict(assets_seen)
    for p in bundle_files:
        urls.setdefault(BASE + p, {"pages": {"(referenced in JS bundle)"}, "ct": ""})
    for u, meta in sorted(urls.items()):
        if not u.startswith(BASE):
            index[u] = {"file": None, "pages": sorted(map(str, meta["pages"])), "note": "external, not downloaded"}
            continue
        path = urllib.parse.urlsplit(u).path
        if path.startswith("/assets/") and path.endswith((".js", ".css")):
            continue
        rel = path.lstrip("/")
        dest = assets_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            body = fetch(u)
            if body[:15].lower().startswith(b"<!doctype html"):
                index[u] = {"file": None, "pages": sorted(map(str, meta["pages"])), "note": "SPA fallback HTML: file does not exist"}
                continue
            dest.write_bytes(body)
            index[u] = {"file": rel, "bytes": len(body), "pages": sorted(map(str, meta["pages"]))}
            time.sleep(0.1)
        except Exception as e:  # noqa: BLE001
            index[u] = {"file": None, "pages": sorted(map(str, meta["pages"])), "note": repr(e)[:200]}
    # Inline SVG artwork (not lucide icons), de-duplicated by content.
    inline = assets_dir / "inline-svg"
    inline.mkdir(exist_ok=True)
    seen = {}
    for f in sorted(raw.glob("*.1440.json")):
        d = json.loads(f.read_text())
        for s in d.get("svgs", []):
            h = hashlib.sha1(s["html"].encode()).hexdigest()[:10]
            if h not in seen:
                seen[h] = {"route": d["route"], "w": s["w"], "h": s["h"], "len": s["len"], "aria": s["aria"], "html": s["html"], "routes": set()}
            seen[h]["routes"].add(d["route"])
    rows = []
    for h, s in seen.items():
        name = f"{slug_for(s['route'])}-{h}.svg"
        html = s["html"]
        if "xmlns=" not in html[:300]:
            html = html.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
        (inline / name).write_text(html)
        rows.append({"file": f"inline-svg/{name}", "w": s["w"], "h": s["h"], "len": s["len"], "routes": sorted(s["routes"])})
    (raw / "assets_index.json").write_text(json.dumps({"files": index, "inline": rows}, indent=1, ensure_ascii=False))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw-dir", default=str(Path(tempfile.gettempdir()) / "prosparity-previous-site-raw"))
    ap.add_argument("--only", nargs="*", help="crawl only these routes, no link following")
    ap.add_argument("--render-only", action="store_true")
    ap.add_argument("--no-assets", action="store_true")
    ap.add_argument("--gaps", action="store_true", help="report chunk strings that never rendered")
    ap.add_argument("--explore-only", action="store_true", help="redo the click-through pass over crawled pages")
    ap.add_argument("--reextract", action="store_true", help="refresh page text without new screenshots")
    a = ap.parse_args()
    raw = Path(a.raw_dir)
    raw.mkdir(parents=True, exist_ok=True)
    pages, assets, shots = OUT / "pages", OUT / "assets", OUT / "screenshots"
    shots.mkdir(parents=True, exist_ok=True)
    if a.gaps:
        bundle_gaps(raw)
        return
    if a.render_only:
        render_pages(raw, pages)
        return
    if a.reextract:
        routes = a.only or sorted(json.loads(f.read_text())["route"] for f in raw.glob("*.1440.json"))
        with sync_playwright() as pw:
            reextract(pw, raw, routes)
        return
    if a.explore_only:
        routes = a.only or sorted(json.loads(f.read_text())["route"] for f in raw.glob("*.1440.json"))
        with sync_playwright() as pw:
            explore_only(pw, raw, routes)
        return
    disc = discover_from_bundle(raw)
    (raw / "discovery.json").write_text(json.dumps(disc, indent=1))
    log("route table:", disc["table"])
    log("seeds:", disc["seeds"])
    routes = a.only or (["/"] + [s for s in disc["seeds"] if s != "/"] + ["/this-route-does-not-exist"])
    seen: dict = {}
    with sync_playwright() as pw:
        done = crawl_viewport(pw, "1440", VIEWPORTS["1440"], routes, raw, shots, seen, extra_discovery=not a.only)
        crawl_viewport(pw, "390", VIEWPORTS["390"], done, raw, shots, seen, extra_discovery=False)
    if not a.no_assets:
        download_assets(seen, disc["files"], assets, raw)
    render_pages(raw, pages)
    log("done:", len(done), "routes")


if __name__ == "__main__":
    sys.exit(main())
