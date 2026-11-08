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

## Introductions checked against the reference

| Lesson | Authored lexical Mandarin reading lists |
| --- | --- |
| first-characters | 的 de / dī / dí / dì; 一 yī / yāo; 是 shì; 不 bù; 了 le / liǎo |
| people-and-places | 我 wǒ; 你 nǐ; 他 tā; 在 zài; 人 rén |
| everyday-connections | 有 yǒu / yòu; 这 zhè / zhèi; 个 gè / gě; 上 shàng / shǎng; 中 zhōng / zhòng |

CC-CEDICT explicitly mentions 一 **yāo** for spelling digits; it must not be
dropped just to keep an old test's one-reading expectation. 的 **dī** is used
for taxis, **dí** for “really”, **dì** for a target. 个 **gě** appears in
自个儿; 上 **shǎng** in 上声. These are not surface tone changes.

“Complete” here means the lexical Mandarin readings for the standard simplified
character, including the listed colloquial/literary readings. It does not mean
every dialect reading, singing pronunciation, Unicode variant merger or surname
capitalization is a separate card reading. For example, CC-CEDICT's note about
的 di in songs does not add a neutral `di` card reading; the unofficial mapping
of 瞭 liào to 了 does not add liào. Revisit this scope in #7 if the owner wants
those variants. Automated validation cannot prove a reading list complete;
the reviewer must consult both single-character entries and relevant compounds.

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
- Neutral examples in these texts include 姐姐 jiě jie, 妈妈 mā ma, 弟弟 dì di,
  认识 rèn shi, 明白 míng bai, 盒子 hé zi, and 一个 yí ge. The fixture deliberately
  contrasts 了 **le** with 了解 **liǎo jiě**, then repeats 了 later.
- The checker compares occurrence readings to all lesson-owned definitions
  where available, allowing the documented 一/不 changes and matching neutral
  syllables. It cannot decide whether that neutral tone or a polyphonic choice
  is appropriate in a sentence. Unintroduced characters still need dictionary
  and Mandarin review; lack of an authored definition is not a validation error.

## Status

The three runtime stories are **illustrative checked reader fixtures**. The
three separate texts in `drafts/initial-stories.ts` are **actual first drafts**
for #7, not approved replacements. Source comparison and structural checks are
not independent fluent-speaker approval or learner testing. #7 must check
naturalness, intended meanings, every contextual pronunciation, completeness
of reading lists, and the amount of permanent help before promotion/release.
