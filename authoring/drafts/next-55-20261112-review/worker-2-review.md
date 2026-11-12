# Worker-2 author self-review

Completed 2026-11-12. Assignment: learning-111–learning-120 and revision-120, exactly eleven stories. Final structured drafts are in `lessons.json`; `authored.txt` is my aligned Chinese/syllable working source, not another curriculum. The small temporary builder only transcribes the explicitly authored syllables into tokens and preserves sentence/paragraph boundaries. It does not choose readings or derive words from a dictionary.

## Scope and sources actually consulted

I read root AGENTS.md, authoring/AGENTS.md, authoring/parallel-authoring.md, authoring/README.md, authoring/PRONUNCIATION.md, authoring/data/README.md, and app/content/README.md. No applicable CLAUDE.md was found. I also read the installed chinese-reading-authoring skill. Once sealed, my writing inputs were only worker-2/assignment.md, worker-2/briefs.json, and worker-2/lessons.json. I did not read the manifest, baseline story text, other workers' stories, or archived stories as examples. The canonical checker necessarily validates frozen global metadata; its other lesson reports are not story-writing input.

For lexical pronunciation and senses I consulted targeted single-character/compound entries in the local CC-CEDICT reference archive `/private/tmp/chinese-reading-cedict-next44.gz`, dated 2026-11-09T04:23:50Z, SHA-256 `2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`. This is a dictionary archive, not an archived story run. Consulted entries included 简单, 容易, 流行, 圣歌, 节律, 计划, 控制, 记录, 几乎, 漂, 答应, 倒, 划, 弹, 喂, 曾, 差, 味道, 恶意, 恶心, 从容, 夫人, 斯文, 衣服, 点心, 乐器, 差点, 睡着, 不得了, 试一试, 待会儿, and kinship/neutral-tone compounds. `pronunciation-consultations.txt` retains targeted spelling evidence from the second consultation, archive identification and hash. I did not consult a new live web dictionary in this worker turn.

CC-CEDICT contributor attribution and CC BY-SA 4.0 apply to adapted pronunciation material; see authoring/PRONUNCIATION.md and https://www.mdbg.net/chinese/dictionary?page=cedict. The SUBTLEX-CH attribution/licence in authoring/data/README.md remains applicable to frequency-derived metadata. The stories are newly written, not dictionary example sentences.

Frozen IDs, kinds, revisions, order, and character definitions were not edited. I did not reauthor or claim an exhaustive independent dictionary audit of every frozen reading list. No frozen defect was found in the readings needed by these stories. Runtime content, shared code, publication, commits and deployment are outside this worker's changes.

## Language and meaningful-reuse review

I wrote each situation from its supplied brief, reviewed sense and causality, checked it individually, then revised and reread it. The first checks caught unsupported everyday characters, one sentence array containing two questions, and omissions introduced by rewrites. I changed wording and sometimes the premise, not the allowed bank. I reread all eleven reconstructed Chinese stories together during the final review. That caught problems a token checker cannot: a muddled negation about disturbing other hospital rooms, an implausible line about having to remember a law in an acting rehearsal, unnatural thread/book handling, an unexplained instruction not to drop an instrument into water, and several clumsy transitions. These were rewritten before the final checks.

The following are semantic anchors from my self-review, not a claim that counting characters establishes meaningful use. I examined every supplied mandatory character against its actual sentence. Some obligatory characters occur only once in an ordinary word, name or scene detail; there is no fixed repetition claim.

| Story | Situation, new-character meanings, and due-character anchors reviewed |
| --- | --- |
| learning-111 — 病房里的歌 | A withdrawn patient and her brother make a small change to a bag and try singing together. 简单易学 gives 简/易 a relevant difficulty meaning; 流行歌 is explicitly contrasted with a secret method, 治病 establishes the hospital, and 唱 is the activity throughout. Due words belong to the visit/preparation (代取、演出票、准备、探望、圣歌、包、几条线合在一起、打结), her mood (坏性子、烦死了、恶意), and sound/sharing (反复、节律、音量、传到每个房间、收费、保密). 科学/消毒 remain hospital context. I removed a sweeping emotional-cure claim; the brother explicitly cannot act as a doctor and does not guarantee relief. |
| learning-112 — 一场不像样的演出 | A charity rehearsal's fake-blood mix-up becomes a doctor-led question session. 答应/回答 distinguish dā/dá; 倒把 and 倒在手上 use dào, 划分 is huà, 控制音响 timing belongs to the event, and 味道 reveals the wrong liquid. The due groups have concrete roles: 德/弟弟/队员 rehearse, 衣服/服装/假血/包装 cause the mistake, 五点钟/简易台子 locate it, 游客/病人/医生 are roles, 医术/科室/医院/基本方法 motivate changing the program, 服务/交流/议论/犯错/局长 supply the aftermath. The joke now concerns checking packaging, not a fabricated law. No practical medical procedure is taught. |
| learning-113 — 没有录下的歌 | A birthday recording gift captures the teacher's real work instead of just a hymn. 小区, 漂到对面, 支持, 几乎, and 录音 each affect what happens. The doctor is also an 恩师, so 三名学生、五十岁、两份歌本、另一份、书、派人送、身体、保护、继续 have a reason to occur. 风 and lost songbooks explain moving indoors; 统一调整/控制 and 放倒 the book belong to setup; 门外对话/根据医院制度/消毒/探病 explain the accidental recording. 快乐 and 永远 refer to preserving the human sound, not claiming a flawless musical performance. |
| learning-114 — 黑房间的花 | A student seeking an impressive exam photograph pauses for a stranger's fading flowers. 考/超过/拍/轻轻/连 naturally serve ambition, interruption and observation. 花节入场票、四支花、黑房间、划线、保持方向、控制光、影子、海面星光 form the photographing scene; 是否安全、害怕有鬼、恶意 are her initial suspicion, not supernatural facts. 近/险/平安 serve her care for the visitor; 道歉/之前/记录/拜拜 and the teacher's response complete a change in attitude. 光的定律 remains relevant to learning photography. |
| learning-115 — 空房间里的音乐 | A cancelled school trip turns into a performance recorded for an ill classmate. 往巴士站, 合唱组/分组, 满是光, 造出月亮/世界, and 弹歌 each matter to the replacement plan. 米杰 names one child, 斯文 describes his brother, and 兄弟/嗨/穿衣/睡眼/五十分钟/糟了/啦 belong to the opening. 命令/发言 give the teacher a genuine response to student agency. 调音量/节拍/轻唱/拍摄/超过, 想象太空游玩, and 与/生命/愿望/小区治病同学 support the recording and gift rather than detached target sentences. |
| learning-116 — 镜头外的小狗 | Filmmakers stop trying to force a frightened dog into a planned action shot. 集合/小组 and 安静 frame the collaboration; 故意拍手 is a failed tactic, 喂水 is a proposed one, and 吸一口气 precedes quiet singing. New methods, 拍片/影片/反复看/作品/传出/音量/改方式 explain technical vocabulary; 球/弹球/击球 supply the original action-shot idea. 阿英 is the handler, 衣服/嘴/紧张/害怕/感觉 reveal the animal's state. 受罪、强行控制、照看、使动物受罪 support the decision to stop forcing it. 二次/超过想象/满满一小份吃的 give a small outcome. The later 消毒 is of objects, not an instruction to disinfect an outdoor landscape. |
| learning-117 — 白布下的声音 | Sorting donated possessions turns into exploring a homemade instrument and hearing the donor's performance. 分类/各类物品, 一块白布, 讲从前的故事, 有趣极了 connect all five new targets. 罗夫人/先生, 假日/上个月/时候/房间/来客 ground the scene; 自制/制造/乐器/察看内部/手法/律动 connect curiosity to sound. 小文/跳起/几乎/水上漂 is a child's auditory image. 抓住/轻弹/往一边用力 explains discovering a technique; 收集录音/科学小书/美术老师/不收费 supports making something shareable. 忘了/掉了录音带/联系/电话喂/吸气/麻烦/局面 produce a resolution, not a recital of categories. |
| learning-118 — 狗也有台词 | A ten-year-old replacement actor's mistake becomes improvised dialogue in a dog story. 曾经演戏 supports his confidence, 容易理解 is the group's later lesson, 走两步 is stage action, and 呀 is actual dialogue. 主业/星期日/表演组/交流, 海/小维/根据/派人/帮助/治病 explain the substitution. 唱歌跳舞 are explicitly unnecessary to this role, not an unrelated list. 正式/够/其实/任务/混/脑子/吸气/轻声/安静/连名字叫错 explain the failure and recovery. 收集意见/方案/内容/讲故事/有趣/自然极了 relate to the audience response; 一块点心/方便/待会儿/永远/考第一/超过/达到/期待 form the closing conversation. |
| learning-119 — 给未来的一束花 | An organizer brings a hesitant young performer a small gift and an invitation that does not demand perfection. 文化活动/投票选节目, 一束花, 未来, 结束, and 醒过神来 all belong to the same invitation. 兰取票收钱/精心准备包/车/约好, 朋友拜托/男孩去年曾表演/恶心的自评, 弹歌/趣味/关于歌的事/回答/失控 explain the request and resistance. 除了花还有点心卡片/写字/一步 supplies the invitation's meaning. 往外走/谈计划/简单/满场/拍子不完全对/倒受欢迎 establish a modest return. 舞台造出来、绝不可能的看法发生转变、从容、世界 are the narrator's perspective, not a promise of instant psychological treatment. |
| learning-120 — 下班后的帝国 | A working father admits he once wanted to perform and rehearses before his next shift. 上班/接班, 帝国/威风, 梦/醒, 差点 and 终于 link the imagined role to his actual schedule. 爸爸/父亲/姐姐/受伤/医院/院子/公司服务部门/担心/精神 establish family obligations; 认出戏本/曾想上台/基本动作/参加/支持/克服害怕 explain joining. 谁管家务/反问/命令/游戏/分工 give the sister an active response. 集合/吸气/走两步/台中间/安静/几乎/糟了/节目故事/随手花束/另一方式/漂亮表演/录下/变化/未来/呀 complete the rehearsal and return to work. |
| revision-120 — 最后一班车 | A driver's last shift becomes a community thank-you. 班/醒/梦/未来 establish his uncertainty and future wishes; 控制喝水 and careful driving are work details. A passenger who received help with 治病 brings 点心 with a remembered 味道. Students 考司机, invite him to 讲 and 录/收集 his memories. 小区变化/漂花/造房/往前/每一步 connect road and time. A 简易台子/支起/一块白布/弹乐器/流行歌/唱 are the actual send-off; 威风 contrasts with his awkwardness, 差点认错/什么戏/呀 are his response. 小组投票/比较不同故事, 计划/结束, 吸气/静/容不容易/超过想象/轻轻/拍/倒/连/极 all serve the gathering and his reconsideration of his contribution. No new characters are introduced. |

## Contextual readings and boundaries

I authored occurrence syllables directly. Examples deliberately distinguished: 乐器/音乐 yuè vs 快乐 lè; 曾 céng; 弹 tán for playing/flicking, not dàn; 计划/划分/划线 huà; 漂 piāo for floating vs 漂亮 piào liang; 数来数去 shǔ vs 分数 shù; 放倒 dǎo vs 倒把/倒在/dào as reversal or pouring; 答应 dā ying vs 回答 dá; 差点 chà; 睡着 zháo; 不得了 dé/liǎo; 从容 cóng róng; 恶意 è vs 恶心 ě xīn. 斯文 was normalized to the consulted lexical sī wén. Telephone 喂 is wéi; feeding or calling out is wèi. 一/不 follow the repository's contextual convention, including yí ge, yì shǒu, yí shù, yí kuài, yì zhǒng, bú yòng/bú yào/bú shì; ordinal 第一 retains yī. 试一试 uses neutral yi. Neutral choices such as 哥哥/弟弟/姐姐, 衣服, 点心, 味道, 什么, 故事, 夫人 follow the intended conversational reading, not an assertion that all their characters are intrinsically neutral.

Paragraphs group a stage of each situation. Sentence arrays are distinct complete sentences, including separate arrays for successive questions within one speaker's quotation. Punctuation is string data, every Hanzi occurrence is a single token with one authored syllable, and there are no token IDs/help flags/dictionary inference. The final checker accepts these boundaries. It cannot determine whether a line is idiomatic or a reading is right for its intended sense.

## Actual checks and help load

Ran each completed story individually with:

```sh
node authoring/scripts/authoring-batch.mjs check /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112 --worker worker-2 --lesson ID
```

I revised after hard failures, reran individual checks, and reran any affected individual checks after final language/pinyin edits. The final per-lesson logs are `check-learning-111.log` through `check-learning-120.log` and `check-revision-120.log`. Earlier short-named logs document intermediate passes/failures and are superseded by those final ID-named logs.

Finally ran:

```sh
node authoring/scripts/authoring-batch.mjs check /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112 --worker worker-2
```

Final result in `check-all.log`: `scoped-drafts-checked-not-publication`, zero errors. All eleven final individual checks also have zero errors. Each story covers all fifty supplied mandatory characters; allowed-bank/occurrence-reading/structure/global-metadata validation passes. Other workers' and baseline stories are not checked as authored stories by this scope. I did not run collect or claim a combined publication pass, app tests, typechecking, runtime/browser verification, or deployment.

| ID | Hanzi occurrences | Suggested range | Length result |
| --- | ---: | --- | --- |
| learning-111 | 288 | 186–311 | within range |
| learning-112 | 341 | 187–313 | warning: above |
| learning-113 | 315 | 189–316 | within range |
| learning-114 | 331 | 190–318 | warning: above |
| learning-115 | 351 | 191–320 | warning: above |
| learning-116 | 350 | 192–322 | warning: above |
| learning-117 | 333 | 194–324 | warning: above |
| learning-118 | 368 | 195–326 | warning: above |
| learning-119 | 376 | 196–328 | warning: above |
| learning-120 | 350 | 198–330 | warning: above |
| revision-120 | 840 | 990–1650 | warning: below |

Nine soft length warnings remain. I retained the learning-story space needed for transitions, dialogue and meaningful reuse, and did not add an extra episode to the completed bus-driver story merely to reach 990 characters. No length warning was treated as a hard failure or a coverage exemption.

Every story's final `permanentHelp` list is empty, and taught counts equal total Hanzi counts. That is useful mechanical evidence about the visible help load; it does not prove vocabulary familiarity. Compounds, formal expressions (是否、制度、从容), some names (兰、德、米杰、阿英、小维、罗夫人), and figurative lines can still be harder than their component characters. I reviewed these for the intended orally fluent reader. The performance/music/community settings recur; no uniqueness or inherited continuity is claimed. These are author-self-reviewed drafts, not independent Mandarin approval or learner-tested material. Mechanical success does not establish naturalness, meaningful reuse, complete dictionary scope, or teaching efficacy.
