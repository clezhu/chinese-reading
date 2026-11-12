# Worker-4 author self-review

Completed 2026-11-12. This is my own author review, not an independent Mandarin review or learner test.

## Scope and workflow

Authored all eleven assigned lessons in `lessons.json`: learning-131 through learning-140 and revision-140. Only titles, descriptions and story objects were authored. IDs, kinds, contentRevision 1 and complete character definitions were retained. A final comparison of those frozen fields with **my own** briefs passed for all eleven entries. No frozen defect was identified during this work; this does not independently certify that every rare reading in the coordinator's lists is complete.

Read the root and authoring AGENTS.md files, authoring/parallel-authoring.md, authoring/README.md, authoring/PRONUNCIATION.md, authoring/data/README.md and app/content/README.md. No applicable CLAUDE.md was found at the checked ancestor/root/authoring locations. Also consulted the installed chinese-reading-authoring skill. After sealing, read only this worker's assignment.md, briefs.json and lessons.json for assignment data. Did not read the manifest, other workers' drafts, previous published story text, or archived story examples.

Followed supplied brief → free narrative draft → own meaning/pinyin review → individual scoped check → revision and review. Initial checks caught untaught ordinary characters (for example 舒, 怀, 负, 纸, 灯) and a few missing targets after rewrites. I rewrote those passages and did not expand the bank. The initial punctuation check also required a quotation to remain within one sentence array. Later language review corrected wording such as an invalid 担任…演出 construction, an ambiguous 说不 clause, and an inaccurate implication that a film had already started before the password problem was solved. Final drafts are paragraph → sentence → explicitly authored Hanzi/pinyin tokens, with punctuation strings. `write.mjs` retains my aligned sentence/pinyin working text; it splits my authored syllables into tokens and does not infer readings from a dictionary. `polish.py` records a set of wording revisions; it is not needed to consume the final lessons.json.

## Pronunciation sources actually consulted

Primary source: CC-CEDICT contributors, via MDBG, https://www.mdbg.net/chinese/dictionary?page=cedict . Consulted the local pronunciation archive `/private/tmp/chinese-reading-cedict-next44.gz`, whose header is `2026-11-09T04:23:50Z` and whose compressed SHA-256 I computed as `2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`. No dictionary was imported into application content. This was a local archive consultation, not a live refresh of MDBG.

Queried small exact-entry sets: all fifty new single characters, and relevant compounds including 乐团, 义卖, 功夫, 示意, 选择, 姑娘, 一顿, 放松, 博士, 位置, 密码 and 普通. A later contextual pass consulted 嗯, 精神, 恶心, 冷静, 大娘, 妹妹, 方便, 朋友, 漂亮, 独自, 知道, 衣服, 解释, 选择 and 重复, among the small requested set. These consultations checked readings and meanings, not story example templates. The source's compound 功夫 and 姑娘 were reference checks, not a claim that those words occur in the finished stories.

Adapted pronunciation material retains attribution to the CC-CEDICT contributors and its CC BY-SA 4.0 terms: https://creativecommons.org/licenses/by-sa/4.0/ . Stories are newly authored. Frequency provenance remains Cai and Brysbaert's SUBTLEX-CH as documented in authoring/data/README.md; frequency data was not treated as language approval.

Contextual choices reviewed: 王 as surname wáng; 乐团 yuè tuán; 俩 liǎ for two people; 弹 tán in music; 观 guān in watching/visiting; 足 zú in 足够; 重复 chóng fù; 位置 wèi zhi; 妹妹 mèi mei; 衣服 yī fu; 嗯 èn as an affirmative response. 精神 in learning-132 means vitality, so its second syllable is neutral shen, rather than the shén reading for mind/spirit. 恶心 in learning-140 is nausea, ě xīn, following the consulted archive, not è xīn. Kept conventional underlying third tones, contextual 一/不 changes, and the documented neutral syllable in 一个. Potential-complement readings such as 做不好 and 进不来 use neutral bu. Did not change frozen reading lists.

## Story-by-story meaning and reuse review

| Lesson | Hanzi | Narrative and reviewed target uses |
| --- | ---: | --- |
| learning-131 | 286 | A singer's anxiety changes a boat concert into shared singing. 团/王 identify the group and teacher, 惊 is the morning awakening, 迎 is the welcome, and 段 is the changed musical passage. Breakfast oil is explicitly for cooking aboard, not an unexplained coverage object. Due targets support the setting, work and discussion; 伊洛/阿姆 are authored names. |
| learning-132 | 300 | A charity-sale accounting discrepancy is traced to reversed entries. 标/检 are practical marks and checks, 各 distributes tasks, 义 is the fundraiser's purpose, 百 is the actual discrepancy. 林威/雷姆 and fictional 莱城 support required name characters. The ending links the work to renewed energy and family participation. |
| learning-133 | 303 | A family craft competition includes a hospitalized child through a recording. 民 is in 人民医院, 功 in 成功, 唯 in 唯一, 夜 is the showing time, 示 appears in 表示. The repaired lighted boat, participation rights, and child's hope give due targets roles. The electrical object is described generically because the bank lacks 灯; no circuit-building instructions are implied. |
| learning-134 | 307 | A photographer changes his selected image after the subject objects. 靠/脸 describe the photograph, 释 explains intention, 引 concerns attracting visitors, 择 is the subject's and photographer's choice. Monitoring-system and protection references establish his inconsistency, rather than treating refusal as a problem to overcome. |
| learning-135 | 336 | An exhausted musician accepts shared singing and food from family. 疑 is doubt, 赶 is the teacher arriving, 俩 is their conversation, 独 is solitary work, 冷 is physical discomfort. The late rewrite makes family warmth a concrete meal, not the awkward phrase about manufacturing a welcome. |
| learning-136 | 344 | A missing leather costume turns out to have been moved by a helper. 妹/楼/皮/存/练 are central people, location, object, its preservation and rehearsal. 偷 is an explicitly unproven suspicion, not an accusation established as fact. The children verify the situation and thank the helper. |
| learning-137 | 372 | A power outage changes a film night into a shared story. 娘 is the host, 顿 the meal, 断 the outage and diagnosis, 设 the equipment, 松 the response. An adult checks the external cause by phone; a child waits for the person responsible for electricity. 块 belongs to bread already being eaten at the event. |
| learning-138 | 334 | A robot demonstration stops to hear a visitor's pain. 博 is the designer's title, 置 is a comfortable position, 逃 is the child's attempted exit, 观 is the visit, 痛 is the reason. The narrator corrects the mistaken assumption of fear. Clothing is changed and time passes; food is not stated to treat pain. |
| learning-139 | 341 | A young projection helper solves a password problem by contacting the responsible person. 狂 is the previous night's wind, 足 is available time, 码 is the access problem, 恐 is apprehension, 吉 is the host's guitar. Film-viewing language now occurs after access is restored. |
| learning-140 | 365 | A mountain outing slows down when a wife becomes unwell. 历 is 经历, 慢 the changed pace, 妻 the family relationship, 山 the setting, 普 in 普通/科普. Head pain is explicit so the later 痛不痛 reference has a referent. Tickets, numbers and the changed return bus are practical details. |
| revision-140 | 833 | A home becomes a shared reading/music space. Wind, limited room and a brief sound interruption require changes to the opening event. All latest-fifty targets recur through that single situation: the group and welcome, signage and checking, charity purpose, visitors' needs, family, clothing, music, equipment and pacing. The wind subsides before people wait outside. No introductions were added. |

Reviewed all mandatory targets against the supplied briefs while writing and rewriting. Names and some relatively formal phrases help accommodate this particular bank; this is a limitation, not evidence of independently approved idiomatic speech. The stories remain complete situations with causes, decisions and outcomes rather than lists of target words. Repeat exposure is natural where possible, without a fixed repeat count. Some new characters occur mainly in compounds such as 解释, 选择, 普通 and 唯一; the stories do not demonstrate every reading or sense on the character cards.

## Mechanical results and help load

Each completed lesson was checked individually with:

```sh
node authoring/scripts/authoring-batch.mjs check /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112 --worker worker-4 --lesson ID
```

All eleven final individual checks exited 0; their final outputs are `final-learning-131.json` through `final-learning-140.json` and `final-revision-140.json`. Changed learning-132 and learning-133 were checked individually again after the last wording edits.

The final whole-worker command also exited 0:

```sh
node authoring/scripts/authoring-batch.mjs check /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112 --worker worker-4
```

Full output: `check-worker.txt`. Status: `scoped-drafts-checked-not-publication`; errors: `[]`. Every assigned story has `permanentHelp: []`, with taughtCount equal to Hanzi count. Zero permanent help means every used Hanzi has been introduced by that point, not that every compound or sentence is easy or that learners know them.

Actual soft warnings retained:

- learning-137: 372 Hanzi; suggested 219–367 (five above the upper boundary).
- revision-140: 833 Hanzi; suggested 1117–1863.

The checkpoint is deliberately a shorter complete event, not padded to reach the suggested length. All fifty revision targets are present; occurrence coverage does not prove meaningful reuse. Unassigned stories in scoped reports remain not-checked by this worker. No full publication collection, shared tests/typecheck, publication, commit or deployment was performed by this worker. Existing runtime stories and shared checker code were not edited.

Mechanical validation establishes only the rules it checks. The narrative, meaning, reading and naturalness judgments above are my author self-review, with no independent Mandarin approval or learner-efficacy claim.
