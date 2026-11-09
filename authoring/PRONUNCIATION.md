# Pronunciation sources and review scope

## Reference and reuse

Primary reference: **CC-CEDICT**, published by the CC-CEDICT contributors through
[MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict). Download:
https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz

The consulted archive identifies itself as `2026-11-08T08:49:26Z`; compressed
SHA-256: `85a742880b294197546c5c48b716a2811d7790367d98cc3ef814df8095fe991e`.
This records what was consulted, not a promise that the rolling download stays
unchanged. No full dictionary is checked in, shipped, or queried at runtime.

CC-CEDICT is [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Authored reading lists adapt its numbered pinyin to lowercase tone-marked pinyin,
merge readings across entries for a simplified character, and retain neutral
tones without `5`. Attribute the contributors and preserve this notice and
share-alike terms when reusing the adapted pronunciation material. The original
stories are newly authored, not copied dictionary example sentences. The
frequency dataset has its own separate attribution/licence in `data/README.md`.

Supplement: [汉典 有](https://www.zdic.net/hans/%E6%9C%89), consulted 2026-11-08,
confirms **yòu**, the literary equivalent of 又 used between an integer and a
remainder. That reading is absent from the consulted CC-CEDICT single-character
有 entries. This is a reference link, not a redistributed 汉典 database or
definition; no licence to copy its database is assumed.

Rechecked the same CC-CEDICT archive on 2026-11-09 for #7 (same SHA-256 above),
including single-character entries and relevant compounds, without importing
the full dictionary into the app. Supplemental references consulted that day:
[汉典 么](https://www.zdic.net/hans/%E4%B9%88) and
[汉典 麼](https://www.zdic.net/hans/%E9%BA%BC). Only authored reading spellings
and reference links are retained here, not copied dictionary definitions.

## Introductions checked against the reference

| Lesson | Authored lexical Mandarin reading lists |
| --- | --- |
| first-characters | 我 wǒ; 的 de / dī / dí / dì; 你 nǐ; 是 shì; 了 le / liǎo |
| people-and-places | 不 bù; 们 men / mén; 这 zhè / zhèi; 一 yī / yāo; 他 tā |
| everyday-connections | 么 me / mó / ma / má / yāo; 在 zài; 有 yǒu / yòu; 个 gè / gě; 好 hǎo / hào |

CC-CEDICT explicitly mentions 一 **yāo** for spelling digits; it must not be
dropped just to keep an old test's one-reading expectation. 的 **dī** is used
for taxis, **dí** for “really”, **dì** for a target. 个 **gě** appears in
自个儿. These are not surface tone changes. 好 **hǎo** and **hào** are both
explicit CC-CEDICT single-character entries; compounds such as 好学 and 好吃
contrast the two lexical readings. The stories use hǎo only. 们 normally has
neutral **men**, but the same archive's 图们 / 图们江 entries attest **mén**;
that proper-name reading is included, not inferred from a neutral-tone rule.

### The exceptional spelling 么

Do not claim that CC-CEDICT directly lists `么 mó` or `么 yāo`: it does not in
this archive's simplified-character field. Its exact records include
`麼 么 [me5]`, `麼 么 [ma2]`, `麼 么 [ma5]`, and `麽 么 [me5]`;
the literary record is `麼 麽 [mo2]`, while `么 幺 [yao1]` maps the old
traditional glyph to simplified **幺**, not to simplified 么.

For this authored **么** card the supplemental scope includes the Mandarin
readings of its documented 麼/幺 variant uses as well as modern suffix **me**.
汉典's 么 page explicitly gives **me / ma / yāo**, identifies the 幺 use,
and its page title also lists **má / mó**. The linked 麼 page independently
supplies the literary **mó**, interrogative **má / ma**, and suffix **me**,
and lists 么 among its variants. This supports the authored five-reading list
`me / mó / ma / má / yāo`; **má** must not be silently dropped when retaining
the source's interrogative readings. There is no extra `mǎ` entry established
for this card merely because 吗 has a separate mǎ reading.

The references partition historical/variant glyphs differently; the list is
complete **within this explicitly broader variant scope**, not evidence that
all five are common modern pronunciations of 什么. Only **me** is used in
the actual stories. Rare variant scope remains a reference/teaching caveat,
not an unresolved choice of contextual pronunciation in these scenes.

“Complete” here means the lexical Mandarin readings for the standard simplified
character, including the listed colloquial/literary and proper-name readings,
with the explicit broader variant scope for 么 above. It does not mean
every dialect reading, singing pronunciation, Unicode variant merger or surname
capitalization is a separate card reading. For example, CC-CEDICT's note about
的 di in songs does not add a neutral `di` card reading; the unofficial mapping
of 瞭 liào to 了 does not add liào. Revisit this scope in #7 if the owner wants
those variants. Automated validation cannot prove a reading list complete;
the author must consult both single-character entries and relevant compounds.

## Per-occurrence convention

- Write one actual syllable per Hanzi token, lowercase NFC with tone marks;
  neutral tone has no mark. No digit tones or runtime segmentation/guessing.
  Tone marks go on a, otherwise e (including ê), otherwise o in ou,
  otherwise the last vowel (including ü); syllabic m/n carry their own tone.
  The checker rejects misplaced marks such as xǐao or yaō, not just unknown
  unmarked syllables. Unicode combining marks are allowed where NFC has no
  precomposed letter, e.g. toned ê or syllabic m/n.
- Author **一** as yí before a fourth tone, yì before first/second/third tones,
  and yī in lexical/counting uses as appropriate. Author **不** as bú before a
  fourth tone, otherwise bù (or neutral bu where context requires it).
- Keep conventional underlying third-tone spelling, e.g. nǐ, rather than
  rewriting every third-tone sandhi sequence. This is a spelling convention,
  not a claim that speech has no sandhi.
- Neutral examples in the published texts include 妈妈 mā ma, 儿子 ér zi,
  看看 kàn kan, 点心 diǎn xin, 什么 shén me, and 一个 yí ge. In 说不好,
  potential-complement 不 is neutral **bu**; the standalone refusal 不 is **bù**.
  The separate illustrative reader fixture contrasts 了 **le** with
  了解 **liǎo jiě**; it is not a fourth published story.
- The checker compares occurrence readings to all lesson-owned definitions
  where available, allowing the documented 一/不 changes and matching neutral
  syllables. It cannot decide whether that neutral tone or a polyphonic choice
  is appropriate in a sentence. Unintroduced characters still need dictionary
  and author self-review; lack of an authored definition is not a validation error.

## Status

The three runtime stories in `app/content/fundamentals-stories.ts` are #7's
original, **author-self-reviewed** texts, promoted at revision 3. The exact
review and mechanical results are in [`drafts/REVIEW-7.md`](drafts/REVIEW-7.md).
The author reviewed Chinese, meanings, meaningful mandatory reuse, per-token
pinyin, sentence/paragraph boundaries, reading lists and permanent-help load
before checks and after the tool-forced edit. No separate human review,
independent Mandarin approval or learner testing is claimed. Source comparison
and mechanical validation do not establish language quality or learning efficacy.
