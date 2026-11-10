# Worker 4 — completed authoring and self-review

Reviewed 2026-11-10. All eleven assigned lessons are complete in `lessons.json`: learning-41 through learning-50 and revision-50. This is a scoped draft check, not publication, deployment, independent language approval, or learner testing.

## Scope and frozen metadata

- Read assignment.md first, then the worker workflow, authoring/README.md, authoring/AGENTS.md, authoring/PRONUNCIATION.md, authoring/data/README.md, app/content/README.md and repository instructions. Used only this worker’s supplied briefs and lessons for content and scheduling; did not read earlier stories, the shared manifest, or other workers’ drafts.
- Only worker-4 files were authored. No app/content, checker, plan, assignment, other worker, deployment, commit, or publishing changes.
- IDs, order, kinds, contentRevision and all introduction IDs/Hanzi/reading lists remain deeply equal to the initial worker-file snapshot in frozen-metadata.json. No frozen-metadata blocker was found. Titles, descriptions and stories were authored.
- authored-sentences.json retains the final explicitly paired Chinese and contextual pinyin. write_lessons.py only aligns these already authored syllables with Hanzi and serializes paragraph/sentence/token arrays; it performs no dictionary inference. The shared checker supplies coverage, bank, pronunciation-consistency and length results.

## Pronunciation sources and attribution

- Consulted the user-supplied local cache `/tmp/chinese-reading-cedict-next44.gz` directly, using small exact-entry windows, not a global dictionary-to-story reading mapping. Cache header: CC-CEDICT version 1, date 2026-11-09T04:23:50Z. Compressed SHA-256: `2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`. This is a newer archive than the older 85a742... archive described in authoring/PRONUNCIATION.md; the actual supplied cache was consulted and no sealed definition was changed.
- Primary source: CC-CEDICT contributors, [MDBG download and source information](https://www.mdbg.net/chinese/dictionary?page=cedict), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Consulted pronunciation material and adapted tone-marked pronunciation spellings retain this attribution and share-alike notice. Small exact consulted entries are retained in pronunciation-reference.txt under those same terms. These original stories are newly authored, not copied dictionary example sentences.
- Followed authoring/PRONUNCIATION.md conventions: explicit lowercase tone-marked syllables; underlying third tones; authored 一/不 changes; neutral syllables without digit tones. Supplemental links for the broader 么/有 scope are documented there; this worker did not introduce or modify those cards.
- Checked compound/context contrasts including 会计 kuài jì, 了解 liǎo jiě, 结果 jié guǒ, 更 gèng, 重 zhòng in 重要/保重, 场 chǎng in 会场/现场, 任 rèn in 任何, 当成 dàng chéng and phone-return 还 huán. 嗯 uses en for assent (the cache explicitly lists en5), not ēn or èn.
- Reviewed neutral readings in 朋友 péng you, 东西 dōng xi, 明白 míng bai, 身子 shēn zi, 记住 jì zhu, 时候 shí hou, 不好意思 bù hǎo yì si and 心思 xīn si. Corrected authored 一部分 to yí bù fen from the compound entry, and 心思 to xīn si. Kept potential-complement 不 neutral in 受不了 and 看不起, as distinct from ordinary negation.
- Frequency provenance remains Cai & Brysbaert (2010), SUBTLEX-CH, [dataset](https://plos.figshare.com/articles/dataset/SUBTLEX_CH_Chinese_Word_and_Character_Frequencies_Based_on_Film_Subtitles/143218), CC BY 4.0, per authoring/data/README.md; frequency guidance was not treated as language approval.

## Actual author language self-review

I reread all eleven complete Chinese texts and the authored contextual syllables, checking coherent situations, intended meanings, referents, mandatory reuse, polyphones, neutral tones and dialogue boundaries. This is the author’s own review, not a separate reviewer or proof of Mandarin quality. Mechanical success below is reported separately.

| Lesson | Meaningful new-target use and actual review |
| --- | --- |
| learning-41 | 本来, 中国, 第一次, 好友 and a tall worker (高). A scholar and narrator visit a worker who reuses phone components. Replaced an out-of-bank room term with 车间, clarified why the narrator must learn before opening a phone, and retained due targets in the visit, recycling process, safety advice and evening reflection. Reviewed 过 guo as experience and 得 děi as necessity. |
| learning-42 | 本名 and a pretend 天下第一杀手 title motivate the classmate conversation; 两 hands, 请叫我, 非常, 保重 and 重要 occur in that exchange. The boast, awkward silence and retreat form a small joke. Removed unavailable 名字/意思, then rewrote the awkward repeated 大名 into colloquial 名 phrases. The title is pretend play, not an actual attack. |
| learning-43 | 公车, 记住, 身后, 受不了 and finding the correct stop. Changed an unworkable sleep premise to a crashed phone, kept the helper consistently a university student, and made both passengers share the destination. The phone task and the passenger’s help resolve the practical problem. Reviewed 死机, 受不了 and the thanks/保重 farewell. |
| learning-44 | 生活, 加上我, 如何, 大伙 and 问题 occur in a child’s question about how adults know their ideas are right. Replaced forced 保住想法 wording with the father’s plausible 保安 role; the scholars invite the child’s contribution rather than dismiss it. Removed repeated anxiety lines and replaced 用力想 with 出力. 感受到 supplies 受 meaningfully in the child’s response to kindness. |
| learning-45 | 做完/完成, 接我/接受, 拿起, 望着 and 了解 describe helping an overworked friend. Clarified the link between long-term work and fatigue; his height does not establish current strength. Removed an awkward 老伙 phrase, kept 大伙 in shared-work dialogue, and checked 了 liǎo in 了解 against 了 le as aspect. |
| learning-46 | 其实, 离开/分别, 谈, 又 and 新生活 in an evening before departure. Replaced a grand declaration of love for the friends with love for the shared place, kept 保重 as a real farewell and the unfinished conversation as a reason to meet again. The extra phone recording attempt is abandoned so the friends can talk face to face. |
| learning-47 | 更安定, 钱, 马上, 不好意思 and 全部 arise in finding the owner of money. Made narrator and 比尔 consistently children/classmates; their imaginative 杀手 concern is answered as a mistaken assumption. Replaced the invented-sounding 斯特 with 克里斯 and used 特 in 特别重要. The claimant describes how the money was left before it is returned. Reviewed 接受, 相信 and 更 gèng. |
| learning-48 | 会场/现场/场面, 嗯 en, 会计, 任何 and 确实 in an event where habitual phone communication is unnecessary once the visitor is present. Reviewed the premise as a deliberately overcomplicated arrangement that the narrator simplifies; the dying phone and unused setup explain the work saved. Kept 会计 kuài jì distinct from 会 huì; 心思 is xīn si. |
| learning-49 | 吃, 开始, 结果, 利用 and 朋友 structure an interrupted meal. Reworked the initially vague work call into missing venue equipment and some money brought home by the narrator. A friend who is the venue’s 保安 remembers this; the two friends help locate it. Removed forced 保住 wording, kept a coherent memory/return-call resolution and the child’s final request to eat. Reviewed 朋友, 会计 and 一部分. |
| learning-50 | 警车, 女士, 外面, 这件事 and 难受 in finding a missing phone. Removed unavailable coat/police-officer vocabulary and used the taught 警 in 警车 and 士 in 女士. The returning friend lives in the same place and brings the phone; changed the ending so it does not assert that these friends have been separated for a long time. Reviewed return-phone 还 huán, 任何 rèn hé and the conversation before leaving. |
| revision-50 | All latest-50 introductions occur in one gathering: an overseas friend arrives in person, the organizer feels unready, an accountant helps, a police-car arrival returns her phone, and everyone helps with food. The reception, phones and shared tasks give each target a role. Checked speaker tags and separated interrogative contexts; removed unavailable travel/setup vocabulary. Reviewed the organizer’s anxiety, surprise arrival, two distinct phones, late food and the ending: the event succeeds socially while some setup work remains unfinished. |

All mandatory coverage is also checked by the existing scoped checker. All story Hanzi are taught at their respective lessons; the report shows zero permanent-help characters for every lesson. Soft length warnings remain because these complete scenes use space for contextual reuse; they are not padded to reach a count, and their longer lengths should remain visible to the coordinator.

## Checks and results

Each story was checked while in progress using:

```sh
node authoring/scripts/authoring-batch.mjs check .authoring-runs/next-44-20261109 --worker worker-4 --lesson LESSON_ID
```

Initial failures included unavailable characters, missing due targets and dialogue with more than one sentence per array. Those were revised and rereviewed rather than bypassed. The final required full-worker command was:

```sh
node authoring/scripts/authoring-batch.mjs check .authoring-runs/next-44-20261109 --worker worker-4
```

- Final result: exit 0; `scoped-drafts-checked-not-publication`; errors `[]`; all eleven stories required and checked. Raw final report: check-all.log. Unselected curriculum stories remain explicitly not-checked; this is not a full publication pass.
- `npm run authoring:test`: 79 tests passed, zero failed/skipped/cancelled; authoring-test.log.
- `npm run authoring:typecheck`: passed (`tsc --noEmit -p authoring/tsconfig.json`); authoring-typecheck.log.

| Lesson | Hanzi | Soft range | Permanent help | Length warning |
| --- | ---: | --- | ---: | --- |
| learning-41 | 175 | 96–161 | 0 | above soft range |
| learning-42 | 180 | 97–163 | 0 | above soft range |
| learning-43 | 198 | 99–166 | 0 | above soft range |
| learning-44 | 234 | 100–168 | 0 | above soft range |
| learning-45 | 220 | 101–170 | 0 | above soft range |
| learning-46 | 239 | 103–173 | 0 | above soft range |
| learning-47 | 239 | 104–175 | 0 | above soft range |
| learning-48 | 223 | 106–177 | 0 | above soft range |
| learning-49 | 276 | 107–179 | 0 | above soft range |
| learning-50 | 257 | 108–182 | 0 | above soft range |
| revision-50 | 631 | 543–907 | 0 | none |

No frozen-metadata blocker. No publication, integration, commit or deployment was attempted.
