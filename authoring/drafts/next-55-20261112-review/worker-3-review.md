# Worker-3 author self-review

Completed 2026-11-12. This is the author's review, not independent Mandarin approval or learner testing.

## Scope and sources actually consulted

- Read root `AGENTS.md`, `authoring/AGENTS.md`, `authoring/parallel-authoring.md`, `authoring/README.md`, `authoring/PRONUNCIATION.md`, `authoring/data/README.md`, and `app/content/README.md`. Checked for applicable CLAUDE.md files; none were found in this checkout or its applicable parent locations.
- Read the installed Chinese reading authoring skill and Herdr skill as workflow context. Did not create or control panes, tabs, or agents.
- After sealing, used only worker-3's `assignment.md`, `briefs.json`, and `lessons.json` for the assignment. Did not read the manifest, other workers' drafts, baseline story text, or archived story examples. No prior story text supplied a writing model.
- Pronunciation reference: CC-CEDICT contributors, via MDBG: <https://www.mdbg.net/chinese/dictionary?page=cedict>. Consulted the local gzip `/private/tmp/chinese-reading-cedict-next44.gz`, SHA-256 `2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`, whose header date is `2026-11-09T04:23:50Z`. The older-looking filename is not a claim that I read any earlier stories: this file contains dictionary records. This is a local source consultation, not a fresh download or a claim to have checked the current rolling archive.
- Queried small dictionary term sets, including 中毒, 比赛, 投票, 统一, 结束, 清楚, 监视/监督, 排队, 口语, 语文, 家庭, 权利, 落/落水, 来不及, 弹, 调, 长, 差, 片子, 好好, 认识, 保姆, 姆, 排场, 自律, 重建, 重来, 闭上, 手语, 赢得, and 光影. Looked at compounds as well as relevant single-character records. Did not use dictionary examples as story text.
- CC-CEDICT is CC BY-SA 4.0: <https://creativecommons.org/licenses/by-sa/4.0/>. Retain attribution to its contributors and the repository pronunciation notice for adapted reading material. Stories here are newly authored. No dictionary was added to runtime.

The sealed pronunciation lists were retained exactly; I did not claim to re-establish their completeness. No frozen-metadata defect was identified during these contextual consultations or by the scoped checker. A successful compatibility check is not a dictionary-completeness assessment.

## Writing and review process

Used the supplied briefs, wrote new situations freely, reviewed the Mandarin and intended meanings, then ran each story's scoped checker. Reworked illegal-bank wording and missing-target contexts and reviewed the resulting sentences again. A final review improved several sentences and caught coverage lost during polishing; those losses were repaired in context and all eleven individual checks were rerun on the final text before the final whole-worker check.

`authored.json` records Chinese sentences alongside explicitly authored, occurrence-by-occurrence pinyin. `build.py` only aligns those supplied syllables with the supplied Hanzi and serializes paragraph → sentence → token arrays. It does not look up pinyin, infer polyphones, calculate frequency rules, or implement a second coverage checker. `lessons.json` is the final structured draft artifact. Only titles, descriptions and stories were changed in assigned lesson objects; IDs, kinds, revisions and definitions stayed frozen.

Early checks caught many everyday but not-yet-allowed characters, including characters in words such as 休息, 桌子, 程序 and 鸡蛋. I rewrote their contexts instead of extending the bank. I also corrected a sentence-array boundary, changed an unsupported `hāo` occurrence in 好好的 to the documented `hǎo`, reviewed 不/一 sandhi, and corrected 不卖 to `bú mài`. These are actual authoring corrections, not evidence of independent review.

## Meaningful reuse and naturalness

I reread every final story in continuous Chinese, then reviewed contextual readings. Each has a situation, a change or misunderstanding, and an outcome. Names such as 迪丽, 莱丽, 许永维 and 洛伊 are fictional choices; proper-name characters are used as names, not given invented everyday meanings. Some names and school/community settings recur across these newly authored drafts. There is no claim of uniqueness or of continuity with published stories.

| Lesson | Meaning and reuse reviewed | Reading choices reviewed |
| --- | --- | --- |
| learning-121 | A report competition dream changes how 迪丽 prepares a report. 赢 motivates the competition; 药/店 concern the remembered shop visit; new name 迪丽 is the protagonist. Due characters support the report, dream, investigation and gratitude. 圣人/好强 contrast perfection with competitiveness. | 药 yào; 丽 lì; 中毒 zhòng dú; 好强 hào qiáng; 差 chà for ability; 统一 retains lexical yī. |
| learning-122 | Helping run a film-prop shop exposes the difference between looking competent and knowing the stock. 卖, 图, 显, 半 and 监视器 belong to that shop and its monitoring. The class leader's intervention explains why she asks more questions. | 看店 kān; 班长/店长 zhǎng; 子弹 dàn; 空军 kōng; 显得 de; 不卖 bú mài. |
| learning-123 | A fundraising performance includes a doctor who cannot hear. Hand gestures become the opening rather than an isolated character list. 语, 付, 热, 排 and 清楚 describe communication, proceeds and preparation. | 口语/手语 yǔ; 清楚 qīng chu; 听不见 potential-complement bu; 喂 wèi on the telephone; 未 wèi. |
| learning-124 | A student tries to obtain a restaurant's method covertly, breaks his equipment, then asks openly. 偷/敢/油/餐/破 are consequences and setting. The copied quantity note is an offered recipe rather than a mysterious clue. | 倒 dǎo for falling versus dào in 店主倒不生气; 复写 fù xiě; 认识 rèn shi; film 片子 piān zi; 片头 piān tóu. |
| learning-125 | An apparent injury in a film city is a staged scene. Help shifts to making the opening understandable; no actual rescue is claimed at the end. 莱丽, 市/城, 杯 and 哇 belong to the visit, cup prop and reaction. | 哇 wā as exclamation; 漂亮 piào liang; 赢得 yíng dé; 认识 rèn shi; 杯子 zi. |
| learning-126 | A ten-year-old's breakfast project must complete the event's registration. 权利 is permission within this fictional event, 某 is an unnamed classmate, 激动 a reaction, 立下约定 a commitment, and 过程 the registration sequence. | 许 xǔ in the fictional surname; 永维 yǒng wéi; 数完 shǔ; 一份 yí fèn; 这一次 yí cì. |
| learning-127 | A family anniversary performance is changed after considering the intended audience. 伊兰 asks for an explanation; the teacher does not blame her. 昨天, 闭眼, 讨说法 and 责怪 carry the action, and the shadow effect supplies the ghost/white-clothing context. | 伊 yī; 金婚 jīn hūn; 弹力球 tán; 排场 pái chang; 好强 hào qiáng; 长者 zhǎng; 差别 chā. |
| learning-128 | Dinner waits for an exchange student delayed after work. 家庭, 林家, 饭, a forgotten 药包 and changing a broken cup are central. Cooking, messages, finding the bag and the family discussion carry the due characters. | 落 là for a bag left in a car; 调味 tiáo wèi; 巴不得 bā bu dé; 蛋 dàn; 赢得 dé; 一会儿 yí huì er. |
| learning-129 | A novel prompts an unsupported suspicion aboard a boat; asking and helping resolves it. 及 appears in 来不及, 船 is the setting, 争 the disagreement, 猜 the mistaken inference, and 洛伊 the protagonist. 圣杯/毒 are explicitly within the novel. | 落水 luò shuǐ; 来不及 lái bu jí; 当成 dàng chéng; 英国 yīng guó; 哥哥 gē ge. |
| learning-130 | A class boat-building event moves indoors during thunder. 级 sets the class, 保姆 accompanies 罗林, 雷 changes the plan, 刻 is the desired lettering, 建/重建 are construction. The ending acknowledges the boat sinking rather than manufacturing a win. | 保姆 mǔ, not the regional m̄; 重建/重新 chóng; 船长 zhǎng; 落水 luò; 自律 lǜ; 语文 yǔ wén. |
| revision-130 | One community event connects the latest fifty: a market notice, pharmacy back room, food, changing venue, a missing boat, checking the monitor, and explaining each design. Suspecting theft is resolved by evidence and an apology. The mother's reserved place closes the opening wish. | 落 luò for a boat that fell under a stand, distinct from the forgotten bag in 128; 监视 jiān shì; 好好的 hǎo hǎo de; potential/A-not-A bu; 看看 kàn kan; 赢 yíng; 保姆 mǔ. |

These are my judgments about language and reuse, not mechanically established facts. I replaced some awkward expressions during final review: concentrated food became gathering people; the film-city ending now describes help rather than asserting a real rescue; the small-boat ending no longer removes the boat and simultaneously leaves it underwater. Tight banks still make the prose somewhat more formal in places, especially words of permission and event procedure. An orally fluent reader may have different stylistic preferences. No separate human or model reviewer was used.

All occurrence pinyin is authored, including polyphones and neutral syllables. I reviewed 一/不 in their sentence contexts and retained underlying third-tone spelling. The checker cannot decide that these are the right readings. Frozen rare readings such as 姆 m̄ are not exercised merely for variety.

## Mechanical checks actually run

For every assigned ID, ran the required individual command after drafting and again after final wording:

```sh
node authoring/scripts/authoring-batch.mjs check /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112 --worker worker-3 --lesson ID
```

Final individual results: **11/11 exit 0**. See `individual-results.json` and `check-learning-121.txt` through `check-learning-130.txt`, plus `check-revision-130.txt`.

Then ran:

```sh
node authoring/scripts/authoring-batch.mjs check /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112 --worker worker-3
```

Final result: exit 0, `status: scoped-drafts-checked-not-publication`, `errors: []`. Final report is `check-worker-3.txt`. All eleven assigned stories were checked. Other stories are outside this selection; this is not a full combined-publication pass.

| Lesson | Hanzi occurrences | Permanent-help characters reported |
| --- | ---: | --- |
| learning-121 | 284 | none |
| learning-122 | 282 | none |
| learning-123 | 300 | none |
| learning-124 | 323 | none |
| learning-125 | 322 | none |
| learning-126 | 312 | none |
| learning-127 | 306 | none |
| learning-128 | 349 | none |
| learning-129 | 292 | none |
| learning-130 | 343 | none |
| revision-130 | 913 | none |

Two warning-only length results remain:

- learning-128: 349 Hanzi, soft range 208–347.
- revision-130: 913 Hanzi, soft range 1053–1757.

I retained the dinner story's final context and the revision story's complete event rather than writing to a numerical boundary or padding. Zero permanent help means every occurrence is taught according to the supplied policy; it does not measure reading difficulty, compound familiarity, comprehension or instructional value.

No shared checker/runtime code, sealed metadata, published stories, or other worker files were edited. No publishing, collection, integration, commit or deployment was performed. App tests and combined publication validation are not claimed here; the coordinator still needs to collect and validate the complete five-worker candidate.
