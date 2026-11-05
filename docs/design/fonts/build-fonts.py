#!/usr/bin/env python3
"""Build the two self-hosted web fonts from the upstream google/fonts files.

    pip install fonttools brotli
    python3 build-fonts.py <GoogleSansFlex.ttf> <GoogleSans.ttf> [out_dir]

Sources (SIL OFL 1.1, no Reserved Font Names):
    https://github.com/google/fonts/tree/main/ofl/googlesansflex
    https://github.com/google/fonts/tree/main/ofl/googlesans

A subset is a Modified Version under the OFL. The OFL would let us keep the name,
but each upstream TRADEMARKS.md limits the Google marks to the original software,
so the outputs are renamed. Copyright and licence records (name IDs 0, 13, 14)
are kept, which meets OFL condition 2.
"""
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FEATURES = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "rvrn", "rclt",
            "tnum", "pnum", "lnum", "frac", "case", "sups", "subs", "numr", "dnom"]
DEVA_FEATURES = FEATURES + ["abvm", "abvs", "akhn", "blwf", "blwm", "blws", "cjct", "dist",
                            "half", "haln", "init", "nukt", "pres", "psts", "rkrf", "rphf",
                            "vatu", "pref", "abvf", "pstf"]

# Latin-1 plus typographic punctuation and U+20B9. Google's `latin` slice omits the
# rupee sign, which is the main reason this file exists.
LATIN = ("U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2009-200D,"
         "U+2010-2015,U+2018-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,"
         "U+20B9,U+2122,U+2212,U+2215,U+FEFF,U+FFFD")
# Same range Google serves as its `devanagari` slice, including dotted circle and ZWJ/ZWNJ.
DEVANAGARI = "U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF"


def rename(font, family, ps):
    name = font["name"]
    for rec in list(name.names):
        if rec.nameID in (7, 16, 17, 21, 22, 25):
            name.removeNames(nameID=rec.nameID)
    for nid, value in ((1, family), (2, "Regular"), (3, f"{ps};subset"), (4, family), (6, f"{ps}-Regular")):
        name.setName(value, nid, 3, 1, 0x409)
        name.setName(value, nid, 1, 0, 0)


def build(src, out, unicodes, limits, features, family, ps):
    font = TTFont(src)
    opts = subset.Options()
    opts.layout_features = features
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.hinting = False
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(unicodes))
    sub.subset(font)  # subset first: instancing first trips on the Google logo glyphs
    tmp = out + ".tmp.ttf"
    font.save(tmp)
    font = instancer.instantiateVariableFont(TTFont(tmp), limits, inplace=False)
    os.remove(tmp)
    rename(font, family, ps)
    font.flavor = "woff2"
    font.save(out)
    print(f"{os.path.basename(out):40s} {os.path.getsize(out) / 1024:6.1f} KB  {font['maxp'].numGlyphs} glyphs")


def main():
    flex, sans = sys.argv[1], sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else os.path.dirname(os.path.abspath(__file__))
    build(flex, os.path.join(out, "prosparity-sans.woff2"), LATIN,
          {"ROND": 0, "slnt": 0, "wdth": 100, "wght": (400, 700), "opsz": (14, 96)},
          FEATURES, "ProsParity Sans", "ProsParitySans")
    build(sans, os.path.join(out, "prosparity-sans-devanagari.woff2"), DEVANAGARI,
          {"GRAD": 0, "opsz": 18, "wght": (400, 700)},
          DEVA_FEATURES, "ProsParity Sans Devanagari", "ProsParitySansDevanagari")


if __name__ == "__main__":
    main()
