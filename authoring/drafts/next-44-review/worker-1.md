# Worker 1 author review

Completed learning-11 through learning-20 and revision-20 in `lessons.json`, in assigned order. This is author self-review and scoped mechanical validation, not independent language approval, learner testing, or publication validation. No frozen-metadata blocker was found.

## Scope and method

Read assignment.md first, then repository AGENTS.md, authoring/AGENTS.md, authoring/README.md, authoring/parallel-authoring.md, authoring/PRONUNCIATION.md, authoring/data/README.md and app/content/README.md (the contract, not story content). No root CLAUDE.md was present. Read only this worker's briefs and draft lessons. Did not read earlier stories, the shared manifest, or other workers' stories. Only this worker directory was written. No publication, deployment, commit, app/content edit, checker edit, or shared-plan edit was performed.

All occurrence syllables were explicitly written alongside authored sentences in `author.py`; that local helper only aligns the supplied syllables to Hanzi, serializes tokens and separates authored terminal punctuation into sentence arrays. It does not look up or infer pinyin. `check.py` invokes the existing scoped checker and retains its raw output; neither helper implements curriculum or pronunciation policy.

Compared all eleven IDs, kinds, revision-1 values and complete newCharacters records (including ordered reading lists) with this worker's sealed briefs: exact equality. The coordinator's reading definitions were not changed.

## Sources actually consulted

- CC-CEDICT contributors, published by [MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict), supplied archive `/tmp/chinese-reading-cedict-next44.gz`. Its header date is **2026-11-09T04:23:50Z**, entries 125397. Compressed SHA-256: **2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a**. This is a different archive from the older one whose hash appears in PRONUNCIATION.md; I used the supplied cache and did not claim they match.
- Licence: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Pronunciation spellings adapted from the consulted reference retain attribution to the CC-CEDICT contributors and the same share-alike terms. Newly authored prose is not copied from dictionary examples. No dictionary was imported into runtime content.
- Consulted small exact-entry windows for 现在, 一下, 样子, 怎么, 出来, 大家, 起来, 打开, 谢谢, 如果, 儿子, 所以, 然后, 发现, 开心, 一定, 觉得, 妈妈, 不用, 打点, 不经意, 在意, 好意, 小看, 自大, 自有, 自然, 心意, 好好, 点心, 当, 看 and 看守. Also inspected source entries for 主意, 有意思, 之后, 当然, 已经, 应该, 睡觉 and 自己 while evaluating language; their consultation does not mean those words were used or their characters allowed.
- Read authoring/PRONUNCIATION.md for lexical/surface-tone distinctions, neutral tones and underlying third-tone spelling. Its linked 汉典 supplements concern the existing sealed lists; I did not independently recheck those web pages or re-author the lists.
- Frequency provenance: Cai and Brysbaert (2010), [SUBTLEX-CH dataset](https://plos.figshare.com/articles/dataset/SUBTLEX_CH_Chinese_Word_and_Character_Frequencies_Based_on_Film_Subtitles/143218), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), as documented in authoring/data/README.md. Used the supplied brief groups and allowed bank, not the full frequency dataset.

## Actual language self-review

Reread all eleven final passages as Chinese, following each speaker, situation and outcome. Checked the mandatory targets against their uses in the prose, not just a list of characters. Then inspected the written occurrence syllables in context, especially 一/不, 看, 着, 得, 当, 经, neutral suffixes and complements. Retained underlying third-tone spelling. Used neutral zi in 儿子/样子, xin in 点心, xie in 谢谢, kan in 看看, and ting in 听听. 看着 is kān zhe when the narrator is asked to guard the treats in learning-14, and kàn zhe for looking at someone. 打点 meaning to organize household matters is dǎ dian; this was corrected after checking the entry. 当然 and temporal 当 use dāng; 觉得 uses jué de; procedural 得 is děi. Potential 做不出来 uses neutral bu and lai. Checked 一下 yí xià, 一起 yì qǐ, 一天 yì tiān, 一个 yí ge, 一定 yí dìng, and corrected 不就是 to bú jiù shì. Progressive 起来 uses authored neutral lai; narrative standalone 出来 retains chū lái. All of these are author decisions, not dictionary-generated occurrence choices.

Sentence arrays separate terminal statements and questions, including multiple sentences within dialogue. Paragraphs separate situation from response or resolution. Initial checks exposed illegal everyday characters, missing obligations and dialogue containing multiple sentences in one array; these were corrected. I removed a misplaced 说着了 ending from learning-15 because no successful guess had actually occurred. I removed redundant happiness narration in learning-18, and changed revision-20's opening from all chores being finished to chores still being done, so the later offer of help has a consistent timeline.

| Lesson | Meaning and target review | Hanzi | Permanent-help Hanzi |
| --- | --- | ---: | --- |
| learning-11 | A woman who has spent her life doing things for others accepts an outing. 也/和 convey inclusion, 下 a brief consideration, 真 the eventual change, 现 the grown son's present situation. Due 生 appears meaningfully in 一生, 时 in 有时, and 样 in her expected response. | 88 | 天起别做点着家儿出大 |
| learning-12 | A son plays the grown-up role and immediately forbids an outing; talking replaces the automatic refusal. 做/大 establish the role, 啊 the agreement, 怎 the parent's uncertainty and 出 the proposed outing. 发生 and 有事 advice supplies the due 生 within the conversation. | 100 | 儿着话发家起天该 |
| learning-13 | Two people speak openly after an argument. 点 softens the attempt to speak, 起 joins them in a shared activity, 天 sets the scene, 把 introduces speaking the concern aloud, 开 functions in 开心. Due 为 distinguishes 以为 wéi from 为了 wèi. | 100 | 心话回该 |
| learning-14 | A son has given away some treats entrusted to the narrator. 让/给 describe the transfer, 但 qualifies appearance, 谢 is actual gratitude and 着 differentiates guarding from looking. The mother's request to be told next time resolves the confusion. | 111 | 心家只些发儿回 |
| learning-15 | A recipient asks to look at treats, then negotiates to receive them early. 只 limits the request, 些 identifies the treats, 如 sets her conditional appeal, 家 gives the setting and 后 sequences the concession. Removed the unsuccessful-guess wording. | 102 | 心多果 |
| learning-16 | A parent dismisses a son's offer to help; another adult persuades the parent to let him serve treats. 儿/多 express the child's involvement and happiness, 意 is the other adult's good intention, 别 stops renewed interference and 所 connects reconsideration to action. | 116 | 用小话果心 |
| learning-17 | A son explains why being prevented from giving treats mattered to him. 话 is the initially withheld conversation, 小 the parent's dismissive assessment, 自 appears in the parent's admission of arrogance, 回 in return/next time and 然 in the offer to work together. The apology and future arrangement complete the situation. | 135 | 发心果当 |
| learning-18 | A quiet child returns home to make treats for his mother. 果 participates in 如果, 发/见 mark the mother's discovery, 心 carries both happiness and intention, and 走 contrasts the outing with his chosen task. The conditional intervention, gift and realization carry the due targets in one situation. | 132 | 当 |
| learning-19 | A mother pauses her work to listen to a child whom adults underestimate. 定 is her inference, 听 the change in attention, 觉 the adults' assessment, 太 their objection and 该 her reconsideration. He finishes by describing what he wants to do. | 114 | None |
| learning-20 | A son volunteers to take over household work. 当 is temporal when the mother hears him, 经 occurs in a spontaneous 不经意 remark, 妈 identifies the family relationship, 用 rejects the need for her labor and 打 appears in household 打点. The treats' rough appearance contrasts with her appreciation of the help. | 124 | None |
| revision-20 | A son initially treats his mother's wish to walk alone as a problem with chores, then listens and takes responsibility. Her outing and his imperfect treats provide a resolved narrative covering all latest fifty introductions. 自然, 不经意, 打点, 当然, 如果/果然, 所以, 心意-related concern, temporal sequencing and dialogue carry the required characters. | 359 | None |

The early stories have noticeable permanent help (10 distinct characters in learning-11, 8 in learning-12); these support coherent adult dialogue, not new introductions. The load declines to none for learning-19 onward. Several stories use family and treats as a simple concrete situation; they are independent passages, with no required serial continuity. This repetition and the abstract relational vocabulary are limitations of this draft set, not evidence of learner suitability. I retained natural explanatory dialogue beyond the soft length range instead of padding or treating the range as a hard target.

## Checks actually run

Ran the existing command on each completed story, then corrected failures and reran. The single-lesson form was:

```sh
node authoring/scripts/authoring-batch.mjs check .authoring-runs/next-44-20261109 --worker worker-1 --lesson LESSON_ID
```

All eleven were checked individually while writing. The final worker-wide command, run again after the final pinyin and timeline corrections, was:

```sh
node authoring/scripts/authoring-batch.mjs check .authoring-runs/next-44-20261109 --worker worker-1
```

Final exit code **0**, status **scoped-drafts-checked-not-publication**, errors **[]**. Final raw output is `check-all.txt`. All eleven selected stories were checked; other stories remain explicitly not-checked. Frozen-definition equality against my briefs also passed for all eleven records. No full-publication, app, runtime/browser, deployment or unrelated repository test pass is claimed.

Final warnings, all soft upper-length warnings:

- learning-12: 100, range 58–98.
- learning-14: 111, range 60–102.
- learning-16: 116, range 63–105.
- learning-17: 135, range 64–107.
- learning-18: 132, range 65–109.
- learning-19: 114, range 66–111.
- learning-20: 124, range 67–113.

learning-11, learning-13, learning-15 and revision-20 have no final length warning. Mechanical success establishes structure, permitted characters, pronunciation-list compatibility and mandatory occurrence coverage; it does not establish natural Mandarin or learning efficacy.
