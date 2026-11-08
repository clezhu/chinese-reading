# SUBTLEX-CH character frequencies

## Attribution and permission

Qing Cai and Marc Brysbaert (2010), **SUBTLEX-CH: Chinese Word and Character Frequencies Based on Film Subtitles**, PLOS ONE 5(6): e10729. https://doi.org/10.1371/journal.pone.0010729

Dataset: https://plos.figshare.com/articles/dataset/SUBTLEX_CH_Chinese_Word_and_Character_Frequencies_Based_on_Film_Subtitles/143218

Licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)** according to the publisher's dataset record: https://creativecommons.org/licenses/by/4.0/

Machine-readable licence evidence: https://api.figshare.com/v2/articles/143218

This attribution applies to the derived dataset even if other project code uses different terms. No endorsement by the original authors is implied. Permission does not extend to underlying subtitle texts.

## Reproducible source and transformation

- Source archive: https://ndownloader.figshare.com/files/421463 (`Files_S1.zip`).
- Archive SHA-256: `cced9cb382914b93956a24fd06c10de709d351ff4501ac94c9ab136004421f07`.
- Only archive member `SUBTLEX-CH-CHR` is used, not word-frequency or part-of-speech tables.
- Original GB18030 tab-separated data is decoded strictly and converted to UTF-8 JSON without a BOM. Two corpus metadata lines are removed; headers are renamed; numbers become JSON numbers. Original rows/order (including count ties), characters, and numeric values are preserved. Numeric formatting such as trailing decimal zeroes is not preserved.
- A one-based `rank` records source row order. No script conversion, filtering, normalization, count merging, or reranking is performed.
- Corpus: 46,841,097 character tokens, 5,936 distinct characters, 6,243 subtitle contexts. The importer checks row count, total, uniqueness, and descending counts before writing.

## JSON row schema

| Field | Meaning / original column |
| --- | --- |
| `rank` | One-based source row position |
| `hanzi` | Original `Character` |
| `count` | Raw character count / `CHRCount` |
| `perMillion` | Character frequency per million / `CHR/million` |
| `logCount` | Source logarithmic frequency / `logCHR` |
| `contextCount` | Number of subtitle contexts containing the character / `CHR-CD` |
| `contextPercent` | Percentage of contexts / `CHR-CD%` |
| `logContextCount` | Source logarithmic context count / `logCHR-CD` |

The table is simplified-oriented but retains some traditional forms as separate rows (e.g. 这 / 這). Its scripted/translated entertainment corpus and age are limitations. It supplies no authoritative pronunciation definitions. See `docs/research/character-frequency-sources.md` for source comparison.
