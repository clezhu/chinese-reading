# Worker 2 author review

Completed all eleven assigned lessons in `lessons.json`, in order: learning-21 through learning-30, then revision-30. This is an author self-review, not an independent Mandarin review or publication approval.

## Scope and frozen metadata

Read `assignment.md` first, then repository/authoring instructions, `authoring/parallel-authoring.md`, `authoring/README.md`, `authoring/PRONUNCIATION.md`, `authoring/data/README.md`, `app/content/README.md`, and this worker's own briefs and draft. There is no root `CLAUDE.md`. Used the chinese-reading-authoring skill for the worker workflow. Did not read baseline story text, the shared manifest, or another worker's stories/briefs.

Only worker-2 files were written. No app/content, checker, shared plan, assignment, other-worker, publication, deployment or commit changes were made. Final comparison against my own sealed briefs confirmed all eleven IDs, kinds, revision numbers (1), and complete `newCharacters` objects, including reading-list order, remain unchanged. No frozen-metadata blocker was found. The scoped checker necessarily reads global frozen metadata internally; its unselected reports are not story reviews.

`authored.json` retains the explicitly written sentence/pinyin pairs. `write_lesson.py` only serializes these pairs into Hanzi tokens and punctuation, checks alignment, and updates the three authorable fields. It does not consult a dictionary, infer pinyin, select readings, generate language, or change definitions. Earlier local editing scripts are drafting history; final `lessons.json` is the deliverable.

## Pronunciation sources and attribution

Consulted the user-supplied `/tmp/chinese-reading-cedict-next44.gz`, using small exact-entry/compound queries. This archive's header says **2026-11-09T04:23:50Z**, 125397 entries; its actual compressed SHA-256 is:

`2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`

This is different from the older archive hash recorded in `authoring/PRONUNCIATION.md`; I used the supplied cache and have not changed the repository attribution or frozen readings.

Primary reference: **CC-CEDICT contributors**, published by [MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict), under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/). Pronunciation material adapted from this reference retains that attribution and share-alike notice. The stories are newly authored; dictionary example sentences were not copied. The repository pronunciation document supplies the additional variant/supplemental scope for the already sealed cards; I did not alter those cards or claim to have independently reopened all their rare readings. Frequency provenance remains Cai and Brysbaert (2010), SUBTLEX-CH, as documented in `authoring/data/README.md`.

Entries/compounds actually consulted included 地, 地方, 女儿, 因为, 告诉, 告别, 手, 手心, 行, 死心, 打听, 当, 当成, 当作, 当做, 当时, 作家, 工作, 心中, 心情, 心意, 已经, 之前, 之后, 见面, 孩子, 斯, 欢, 干, 干什么, 干活, 干事, 没电, 间, 时候, 感觉, 发现, 自然, 法子, 成, 实在, 看看, 知道, 等一等, 一心一意, 事情, 找不到, 起来, 下来, 出来, 上来, 过去. Some consulted compounds were rejected because their characters were outside the brief's bank; consultation did not grant permission to use them.

Authored every occurrence from sentence context. In particular:

- 地 is dì in 地上 and de in adverbial uses. 女 is nǚ; 呢 is ne; 行 is xíng; 作家 uses zuò; 中 is zhōng; room/classifier 间 is jiān; 哪 is nǎ; 干 is gàn for doing things. 哦 is ò for realization.
- 当 is dàng when treating/supposing someone to be something, including 当我不在, 就当在家里一样 and 把…当成; 当时 is dāng shí. 以为 is yǐ wéi, 因为/为了 use wèi.
- 告诉 is gào su (telling), 打听 is dǎ ting, 孩子 is hái zi, 法子 is fǎ zi, 时候 is shí hou, 事情 is shì qing. Corrected earlier marked tones in 打听 and 事情 after reference consultation. 心情 retains qíng.
- Potential complements 找不到, 用不了, 做不成 have neutral bu; 用不了 has liǎo. Ordinary negative 不 follows the documented sandhi, e.g. bú shì / bú zài / bú yòng, with bù before non-fourth tones. Corrected the two 找不到 contexts during final review.
- 一 uses the documented yí/yì changes; 一心一意 is yì xīn yí yì. 等一等 is authored děng yì děng. Kept underlying third-tone spellings.
- Reviewed directional/continuative contexts separately: 说起来 has qǐ lai; 下来 has xià lai; complement 说出来/走出来 uses chu lai, while independent 出来 retains chū lái. 起来 as physical rising retains the source's permitted qǐ lái variant. 打了过去 uses guò qu. These were explicit contextual decisions, not dictionary-driven substitutions.
- 小斯 and 欢欢 are authored names using sī and huān huān. They are meaningful participants, not claims that these names establish the characters' most useful everyday compounds.

## Actual language self-review

Reread my own Chinese paragraphs and the authored pinyin, considering setup, speaker/reference clarity, target meanings, natural dialogue, and endings. Checked per-Hanzi alignment, paragraph/sentence boundaries and contextual polyphony. Revised out-of-bank wording instead of changing introductions. Split a quoted exclamation and following sentence into separate sentence arrays. Checked again after revisions.

| Lesson | Language review and meaningful target use |
| --- | --- |
| learning-21 | A daughter cannot speak comfortably while watched; the mother looks away, and the daughter then speaks facing her. 地上 establishes her lowered gaze, 因为 explains the change, and 再/呢 occur in the conversation. The final tap is a child's celebratory gesture. |
| learning-22 | A child unfamiliar with goodbye copies a family palm-tap gesture. 告别, 手心, finding him, 最后 and 前/后 belong to that situation. 出生 explains why the mother's departure is unfamiliar. Retained the reciprocal gesture rather than an isolated target list. |
| learning-23 | The daughter looks upstairs before checking where the mother actually is; 下来 completes that spatial sequence. 死心 means giving up the search, not literal death; 行 is capability, 而 contrasts search choices. Reviewed the longer final admonition as the mother's speech. |
| learning-24 | An old companion's grown daughter is mistaken for her mother. 像, 被…看, 等 and 从 support the mistaken identity and meeting. Fixed an actual timing contradiction: the companion leaves tomorrow but comes to say goodbye now. The opening now establishes that the mothers knew each other from childhood. |
| learning-25 | The mother is a writer; the death is of her imagined character. The child objects and offers that person a different future. 中/心情/作家/跟 belong to this creative disagreement, rather than unrelated emotional statements. The mother's pleasure resolves the disagreement; no real death occurs in the scene. |
| learning-26 | A visiting child tells the busy writer mother she is the child's favorite writer. Replaced an earlier confusing identity reveal with a direct visit and appreciation. 手上有事 is an idiom for being occupied; 手 also makes the child's gratitude concrete. 之前, 已经, 告诉 and 见面 mark the visit's sequence. |
| learning-27 | 小斯 mistakes a visitor for the writer he has heard about. 当成 marks mistaken identity; 错 is his question about the error; the mother redirects him toward greeting the visitor. 死心 is his initial refusal to abandon the assumption. Reviewed the mother/visitor/child speaker changes. |
| learning-28 | A child tries to talk to his absent mother on an unpowered telephone; the helper hears his wish and finds a working phone. 它 refers to the phone, 感觉 to the helper's inference, 法子 to the alternate call, 电 to the failure, 干什么 to the child's opening question. The later reunion is explicitly later than the call. The earlier woman is backstory supplied in this story, not a dependency on an earlier published story. |
| learning-29 | A distracted writer repeatedly asks her child which room contains her phone, then realizes she has not listened. 西面那一间 and 中间 locate the search; 自己/时候 describe distraction; 成 asks whether the search succeeded. The final handoff gives the child a turn with the phone. |
| learning-30 | 欢欢 distrusts the explanation that a previously working phone is now discharged; a long earlier call explains it. 正好 introduces the mother's working phone as the immediate solution, rather than leaving the repair unexplained. 实在, 信 and 次 have their ordinary meanings; 欢 is in the child's name. |
| revision-30 | A writer's children send visitors to the wrong room while distracted; a dead phone forces an in-person search. The mother turns the mix-up into a shared conversation and reassurance. Reread the entire setup/misunderstanding/search/reunion/closing exchange. All fifty targets have scene roles; the final 心中的人 exchange refers back to the writer's opening. |

All selected reports show an empty permanent-help list: every story character is already introduced by its lesson. That does not establish vocabulary familiarity. The hand-gesture, family and phone motifs recur; I do not claim stylistic independence or learner-tested difficulty. The longer learning stories retain setup/dialogue/resolution; their length warnings are real and remain visible below. No text was added to satisfy a minimum length.

## Checks and results

Checked individual completed lessons during drafting, corrected hard errors, and reran each assigned lesson after the final pronunciation changes. Per-lesson final outputs are `check-LESSON_ID.txt`.

Final worker command (also run through the local logging wrapper):

```sh
node authoring/scripts/authoring-batch.mjs check .authoring-runs/next-44-20261109 --worker worker-2
```

Result in `check-all.txt`: **scoped-drafts-checked-not-publication**, **0 errors**, all eleven assigned stories checked. Other stories remain `not-checked`. This is not the coordinator's combined publication pass.

| Lesson | Hanzi | Soft range | Result |
| --- | ---: | --- | --- |
| learning-21 | 125 | 68–115 | Pass; length warning |
| learning-22 | 128 | 70–118 | Pass; length warning |
| learning-23 | 135 | 71–120 | Pass; length warning |
| learning-24 | 143 | 73–122 | Pass; length warning |
| learning-25 | 134 | 74–124 | Pass; length warning |
| learning-26 | 158 | 75–127 | Pass; length warning |
| learning-27 | 154 | 77–129 | Pass; length warning |
| learning-28 | 181 | 78–131 | Pass; length warning |
| learning-29 | 183 | 79–134 | Pass; length warning |
| learning-30 | 185 | 81–136 | Pass; length warning |
| revision-30 | 473 | 406–678 | Pass; no warnings |

Exactly ten soft length warnings remain; there are no other reported warnings. These are not hard errors and are not hidden as a clean/no-warning pass.

Additional repository checks:

- `npm run authoring:test`: **79 passed, 0 failed**, exit 0 (`authoring-tests.txt`).
- `npm run authoring:typecheck`: **passed**, exit 0 (`authoring-typecheck.txt`).
- Final own-brief comparison: **11/11 metadata objects unchanged**, **11/11 complete stories**.

Mechanical checks establish structure, authored-reading compatibility, allowed characters and required occurrences. They do not prove naturalness, meaningful reuse, independent language approval, or learning efficacy.
