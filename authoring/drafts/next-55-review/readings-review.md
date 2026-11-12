# Pronunciation metadata review — next-55

## Status and exact scope

Completed source review of **250/250 new characters** for the **50 learning lessons learning-51–learning-100**, plus the five character-free revision checkpoints revision-60/70/80/90/100. Lesson scope was extracted exclusively from `manifest.workers[].lessonIds`; only those lessons' `newCharacters` were exposed to reference reviewers. Baseline story text was not opened, displayed, or used to construct content. No stories were authored. The run remains **unsealed and unlaunched**; no publication, shared-code change, integration or deployment.

`readings-map.json` is the compact authored inventory, in planned introduction order. It was applied programmatically using **apply_patch** to **only** the selected lessons' `newCharacters[].pinyin`. The preserved original manifest was compared structurally after replacing those arrays back with their original values; all other fields, baseline lessons, IDs, revisions, ordering, worker allocation and baseline hash must remain identical. Byte-format round-trip was checked before patching; final verification results are recorded below.

## Sources, attribution and reproducibility

Primary: **CC-CEDICT contributors**, published by **MDBG**, https://www.mdbg.net/chinese/dictionary?page=cedict ; rolling download https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz . Consulted cached archive `/tmp/chinese-reading-cedict-next44.gz`, compressed **SHA-256 `2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`**. Header checked directly:

```text
# CC-CEDICT
# Community maintained free Chinese-English dictionary.
# Published by MDBG
#! version=1
#! subversion=0
#! format=ts
#! charset=UTF-8
#! entries=125397
#! publisher=MDBG
#! license=https://creativecommons.org/licenses/by-sa/4.0/
#! date=2026-11-09T04:23:50Z
#! time=1794198230
```

Secondary comparison: `/tmp/chinese-reading-cedict.gz`, compressed **SHA-256 `85a742880b294197546c5c48b716a2811d7790367d98cc3ef814df8095fe991e`**. Same version/subversion/format/charset/publisher/license; header `entries=125394`, `date=2026-11-08T08:49:26Z`, `time=1794127766`. It was checked for gaps in 员、且、父、嗨、呃; it did not resolve them. Header dates identify the consulted artifacts, not immutable dates of the rolling URL.

**CC BY-SA 4.0:** https://creativecommons.org/licenses/by-sa/4.0/ . The authored reading lists and CC-CEDICT-derived evidence in this review adapt the contributors' numbered pinyin to lowercase, NFC, tone-marked spelling, merging duplicate simplified-field readings and omitting neutral-tone digit 5. Preserve this attribution, identify modifications, and retain these share-alike terms for the adapted pronunciation material and `readings-map.json`. No complete dictionary is checked in, imported into the app, or queried at runtime. Frequency attribution/licensing is separate in `authoring/data/README.md`.

Supplemental references: **汉典**, exact simplified headwords at https://www.zdic.net/hans/ (individual links below), and **Taiwan Ministry of Education Revised Mandarin Dictionary via 萌典** JSON mirror https://www.moedict.tw/uni/ . Reviewed during this run (2026-11-12 UTC). Only authored pronunciation facts and links are retained from supplements; no supplemental database, definitions or literary quotations are copied, and no licence to redistribute those databases is assumed. Initial 汉典 attempts by one reference reviewer failed; subsequent coordinator/supplemental-review requests succeeded. All 250 汉典 headword pages were checked in windows of at most 15 for additional reading candidates; titles alone were not accepted as evidence.

## Reading scope and author decisions

- “Complete” means the lexical Mandarin inventory established by the consulted single-character records, relevant compounds and explicit pronunciation notes, with the documented supplements below. It is not an assertion about every dictionary, dialect, historical transcription or Unicode variant. The review covered every target, not just familiar/polyphonic candidates.
- Exact **simplified** fields govern CC-CEDICT matching. Traditional variants mapping explicitly to a target may supply readings; a reading of a different glyph is not automatically transferred. Explicit literary/historical homograph uses documented under the exact simplified headword in a supplement are retained and labelled below. Archaeological-only manuscript readings and reconstructed fanqie are not inferred.
- Include named/literary/colloquial uses, proper names, explicit Taiwan **Mandarin** alternatives, and dictionary-attested lexical neutral readings. Surname capitalization is collapsed, not duplicated. Beijing 主意 zhú is explicitly lexical; it is not general third-tone sandhi.
- Neutral forms in listed compounds (including fixed reduplicated expressions) do not authorize neutralization everywhere. Keep normal third-tone spelling. No productive verb-reduplication generator, per-context dictionary inference, 一/不 surface-sandhi expansion, or one-most-common-reading shortcut was used.
- **Excluded:** 工口 [ei1 luo2] is a visual katakana loanword, not evidence for 口 luó. 劐弄 [huo1 leng5] is explicitly dialectal, so does not add 弄 leng. 告送 [gao4 song5] is likewise explicitly dialect-labelled without establishing the requested Mandarin scope, so the coordinator excluded 送 song (an initial reference proposal retained it). Cantonese gei1 under 基 is not Mandarin. 蘤's alternate wěi is not independently established for standard 花. No r5 from an erhua suffix becomes another reading of the preceding character.
- Source quality: 不可数集 [bu4 ke3 shuo4 ji2] looks anomalous for mathematical countability; it is not contextual guidance. 数 shuò is independently supported by its single entry and 数见不鲜. 拜拜's unspecified “etc” does not license guessed tones. 噢 òu, 玩 wàn, 识 shì, 息 xí, 期 qí, 度 duò, 击 jí, 亚 yǎ and 血 xuě include explicit source-note alternatives; they are not inferred from ordinary headword alignment.
- Remaining bounded-source caveat: 呃 has **è** in CC-CEDICT, 汉典 and the successful 萌典 record. No neutral **e** was established; do not silently add one or assume every hesitating interjection is è. Story authors must check intended context separately. Rare readings on these cards are not claims that every reading is common or appropriate in a new story.

## Complete authored inventory

| Planned lesson | Characters and lexical readings |
| --- | --- |
| learning-51 | 位 **wèi**; 表 **biǎo**; 刚 **gāng / gang**; 希 **xī**; 查 **chá / zhā** |
| learning-52 | 拉 **lā / lá / lǎ / là / la**; 边 **biān / bian**; 或 **huò**; 将 **jiāng / jiàng / qiāng**; 男 **nán** |
| learning-53 | 准 **zhǔn**; 变 **biàn**; 证 **zhèng**; 物 **wù / wu**; 员 **yuán / yún / yùn** |
| learning-54 | 总 **zǒng**; 噢 **ō / òu**; 系 **xì / jì / xi**; 几 **jī / jǐ**; 管 **guǎn** |
| learning-55 | 玩 **wán / wàn**; 处 **chǔ / chù / chu**; 办 **bàn**; 主 **zhǔ / zhú**; 气 **qì / qi** |
| learning-56 | 每 **měi**; 少 **shǎo / shào / shao**; 切 **qiē / qiè**; 失 **shī / shi**; 算 **suàn** |
| learning-57 | 性 **xìng / xing**; 此 **cǐ**; 必 **bì**; 备 **bèi**; 合 **hé / gě / he** |
| learning-58 | 德 **dé**; 队 **duì**; 试 **shì**; 抱 **bào**; 医 **yī** |
| learning-59 | 通 **tōng / tòng / tong**; 体 **tǐ / tī**; 乐 **lè / yuè / lào / yào**; 并 **bìng / bīng**; 三 **sān** |
| learning-60 | 早 **zǎo**; 门 **mén / men**; 害 **hài / hai**; 歉 **qiàn**; 选 **xuǎn** |
| learning-61 | 嗨 **hāi / hēi**; 房 **fáng / fang / páng**; 命 **mìng**; 且 **qiě / jū**; 向 **xiàng** |
| learning-62 | 兴 **xīng / xìng**; 球 **qiú**; 服 **fú / fù / fu**; 入 **rù**; 照 **zhào** |
| learning-63 | 提 **tí / dī / dǐ**; 掉 **diào**; 夫 **fū / fú / fu**; 路 **lù / lu**; 演 **yǎn** |
| learning-64 | 够 **gòu**; 日 **rì / mì**; 案 **àn**; 舞 **wǔ**; 决 **jué** |
| learning-65 | 求 **qiú**; 约 **yuē / yāo**; 字 **zì / zi**; 呃 **è**; 肯 **kěn** |
| learning-66 | 目 **mù / mu**; 笑 **xiào**; 伤 **shāng**; 神 **shén / shen**; 父 **fù / fǔ / fu** |
| learning-67 | 指 **zhǐ / zhi**; 报 **bào**; 留 **liú**; 水 **shuǐ / shui**; 教 **jiāo / jiào** |
| learning-68 | 枪 **qiāng**; 清 **qīng**; 色 **sè / shǎi**; 号 **hào / háo / hao**; 世 **shì** |
| learning-69 | 远 **yuǎn / yuàn**; 片 **piàn / piān**; 官 **guān**; 口 **kǒu / kou**; 师 **shī** |
| learning-70 | 原 **yuán**; 酒 **jiǔ**; 周 **zhōu**; 星 **xīng / xing**; 识 **shí / zhì / shi / shì** |
| learning-71 | 赛 **sài**; 救 **jiù**; 底 **dǐ / de**; 棒 **bàng**; 须 **xū** |
| learning-72 | 收 **shōu**; 交 **jiāo**; 坐 **zuò**; 停 **tíng**; 卡 **kǎ / qiǎ** |
| learning-73 | 尼 **ní**; 婚 **hūn**; 格 **gé / gē / ge**; 眼 **yǎn / yan**; 金 **jīn** |
| learning-74 | 蛋 **dàn**; 息 **xī / xí / xi**; 室 **shì**; 内 **nèi / nei / nà**; 运 **yùn** |
| learning-75 | 根 **gēn**; 单 **dān / chán / shàn**; 宝 **bǎo / bao**; 哥 **gē / ge**; 张 **zhāng** |
| learning-76 | 搞 **gǎo**; 战 **zhàn / zhan**; 火 **huǒ / huo**; 罗 **luó / luō / luo**; 至 **zhì** |
| learning-77 | 万 **wàn / mò**; 声 **shēng / sheng**; 布 **bù / bu**; 音 **yīn / yin**; 期 **qī / qí / jī** |
| learning-78 | 条 **tiáo / tiao / tiāo**; 消 **xiāo**; 买 **mǎi**; 病 **bìng / bing**; 整 **zhěng** |
| learning-79 | 奇 **qí / jī**; 弟 **dì / tì / di / tuí**; 犯 **fàn**; 装 **zhuāng / zhuang**; 贝 **bèi** |
| learning-80 | 您 **nín**; 送 **sòng**; 怕 **pà**; 护 **hù**; 度 **dù / duó / duò / du** |
| learning-81 | 花 **huā / hua**; 节 **jié / jiē / jie**; 近 **jìn**; 怪 **guài**; 持 **chí / chi** |
| learning-82 | 光 **guāng**; 与 **yǔ / yù / yú**; 穿 **chuān**; 愿 **yuàn**; 象 **xiàng** |
| learning-83 | 影 **yǐng**; 击 **jī / jí**; 使 **shǐ / shi**; 二 **èr**; 喝 **hē / hè / he / yè** |
| learning-84 | 月 **yuè**; 器 **qì**; 察 **chá**; 制 **zhì**; 嘛 **ma / má** |
| learning-85 | 哈 **hā / hǎ / hà / ha**; 助 **zhù / chú**; 达 **dá / da**; 海 **hǎi**; 待 **dài / dāi** |
| learning-86 | 托 **tuō**; 除 **chú**; 写 **xiě / xiè**; 绝 **jué**; 界 **jiè / gà** |
| learning-87 | 帝 **dì**; 姐 **jiě / jie**; 反 **fǎn**; 担 **dān / dàn / dan / dǎn**; 司 **sī / si** |
| learning-88 | 强 **qiáng / qiǎng / jiàng**; 由 **yóu**; 论 **lùn / lún**; 飞 **fēi**; 亚 **yà / yǎ** |
| learning-89 | 续 **xù**; 视 **shì**; 母 **mǔ**; 空 **kōng / kòng / kǒng**; 军 **jūn** |
| learning-90 | 跑 **pǎo / páo**; 阿 **ā / ē**; 尽 **jìn / jǐn**; 注 **zhù**; 弄 **nòng / lòng / nong** |
| learning-91 | 密 **mì / mi**; 线 **xiàn**; 代 **dài**; 忙 **máng / mang**; 坏 **huài / pī / pēi / péi** |
| learning-92 | 久 **jiǔ**; 议 **yì**; 衣 **yī / yì / yi**; 血 **xuè / xiě / xuě**; 钟 **zhōng / zhong** |
| learning-93 | 继 **jì**; 礼 **lǐ**; 数 **shù / shǔ / shuò / shu**; 份 **fèn / bīn**; 疯 **fēng / feng** |
| learning-94 | 平 **píng / pián**; 止 **zhǐ**; 十 **shí**; 拜 **bài / bái / bāi / bai**; 鬼 **guǐ** |
| learning-95 | 睡 **shuì**; 啦 **lā / la**; 调 **diào / tiáo / zhōu**; 巴 **bā / ba**; 兄 **xiōng / xiong** |
| learning-96 | 紧 **jǐn**; 站 **zhàn**; 品 **pǐn**; 英 **yīng**; 罪 **zuì / zui** |
| learning-97 | 文 **wén**; 亮 **liàng / liang**; 抓 **zhuā**; 跳 **tiào / táo**; 联 **lián** |
| learning-98 | 混 **hùn / hún / hun**; 便 **biàn / pián / bian**; 狗 **gǒu / gōu**; 脑 **nǎo**; 业 **yè** |
| learning-99 | 歌 **gē / ge**; 精 **jīng / jing**; 包 **bāo**; 转 **zhuǎn / zhuàn / zhuǎi / zhuan**; 却 **què** |
| learning-100 | 参 **cān / cēn / shēn / sān**; 院 **yuàn**; 务 **wù / wu**; 基 **jī**; 台 **tái / tāi / yí** |

## Supplemental and inline-note evidence

These additions are explicit source facts, not invented placeholders. Ordinary CC-CEDICT inventory and compound gaps are separately auditable in the next section.

| Character / reading | Evidence and caveat |
| --- | --- |
| 员 yún / yùn | [萌典 員](https://www.moedict.tw/uni/%E5%93%A1) heteronyms; yún in [伍員](https://www.moedict.tw/uni/%E4%BC%8D%E5%93%A1), yùn surname exemplified by 員半千 in the 員 entry. Exact CC-CEDICT 員→员 mapping establishes the simplified target. |
| 且 jū | [萌典 且](https://www.moedict.tw/uni/%E4%B8%94), explicit literary heteronym; do not misread 且末 as jū. |
| 父 fǔ | [萌典 父](https://www.moedict.tw/uni/%E7%88%B6), old male honorific; [漁父](https://www.moedict.tw/uni/%E6%BC%81%E7%88%B6) yú fǔ and [尼父](https://www.moedict.tw/uni/%E5%B0%BC%E7%88%B6) ní fǔ. |
| 乐 yào | [汉典 乐](https://www.zdic.net/hans/%E4%B9%90), explicit literary reading block (乐水/乐山 usage). |
| 嗨 hēi | [汉典 嗨](https://www.zdic.net/hans/%E5%97%A8), basic and detailed reading blocks; supplements CC-CEDICT/MOE hāi, not an inference from 嘿. |
| 提 dǐ | [汉典 提](https://www.zdic.net/hans/%E6%8F%90), explicit literary reading block, distinct from dī in 提防. |
| 内 nà | [汉典 内](https://www.zdic.net/hans/%E5%86%85), explicit literary verb reading under the exact headword, not automatic 纳 glyph-merging. |
| 日 mì | [汉典 日](https://www.zdic.net/hans/%E6%97%A5), 國語辭典 section explicitly identifies the personal-name usage 金日磾. |
| 期 jī | [汉典 期](https://www.zdic.net/hans/%E6%9C%9F), explicitly listed for 期年/期月/期服; distinct from Taiwan qí. |
| 条 tiāo | [汉典 条](https://www.zdic.net/hans/%E6%9D%A1), explicit literary reading block. |
| 弟 tuí | [汉典 弟](https://www.zdic.net/hans/%E5%BC%9F), explicitly assigned to 弟靡; rare, not ordinary younger-brother usage. |
| 喝 yè | [汉典 喝](https://www.zdic.net/hans/%E5%96%9D), explicit literary voice-related reading block. |
| 助 chú | [汉典 助](https://www.zdic.net/hans/%E5%8A%A9), explicit literary reading block. |
| 担 dǎn | [汉典 担](https://www.zdic.net/hans/%E6%8B%85), explicit historical homograph use under the exact headword. |
| 空 kǒng | [汉典 空](https://www.zdic.net/hans/%E7%A9%BA), explicit literary homograph reading block. |
| 坏 pī / pēi / péi | [汉典 坏](https://www.zdic.net/hans/%E5%9D%8F), basic pī, detail explicit original-glyph pēi, 國語辭典 péi with brick/earth senses. These are documented historical homograph uses of exact 坏, not modern 壞 “bad”; regional/source spellings differ. |
| 份 bīn | [汉典 份](https://www.zdic.net/hans/%E4%BB%BD), explicit historical homograph reading block. |
| 平 pián | [汉典 平](https://www.zdic.net/hans/%E5%B9%B3), 國語辭典 section explicitly documents literary 平章百姓. |
| 调 zhōu | [汉典 调](https://www.zdic.net/hans/%E8%B0%83), explicit literary morning usage, including 调饥. |
| 跳 táo | [汉典 跳](https://www.zdic.net/hans/%E8%B7%B3), explicit literary homograph reading block. |
| 参 sān | [汉典 参](https://www.zdic.net/hans/%E5%8F%82), explicit historical numerical use under exact simplified headword; not an unreferenced inference from 叁. |
| 台 yí | [汉典 台](https://www.zdic.net/hans/%E5%8F%B0), detail explicitly spells the original-glyph reading; not normal 臺/颱 uses. |
| 主 zhú | CC-CEDICT 主意 [zhu3 yi5] explicitly notes Beijing [zhu2 yi5]; source-note evidence, not third-tone surface conversion. |
| 拜 bāi | CC-CEDICT 拜拜 [bai2 bai2] explicitly also pr. [bai1 bai1]. The separate 拜拜 [bai4 bai5] supports neutral bai. No further tones are inferred from “etc”. |
| 噢 òu | CC-CEDICT 噢 [o1] explicitly also pr. [ou4]. |
| 玩 wàn | CC-CEDICT 玩/翫 exact simplified 玩 entries explicitly note Taiwan [wan4] (curio sense). |
| 识 shì; 息 xí; 期 qí; 度 duò; 击 jí; 亚 yǎ | Explicit CC-CEDICT Taiwan-Mandarin notes. 击缶 [ji2 fou3] and 威亚 [wei1 ya3] independently attest jí and yǎ in compound headwords. |
| 血 xuě | CC-CEDICT exact single entry explicitly gives colloquial [xie3] or [xue3] alongside [xue4]. |

### Supplemental candidates deliberately not promoted

汉典 title candidates 气 qǐ、医 yì、体 bèn/cuì、早 zào、且 cù、清 qìng、号 xiāo、运 yǔn、火 huō、月 ròu、担 jiē、母 mú/wǔ/wú、平 bìng/bēng、兄 kuàng、台 sì had no corresponding explicit lexical pinyin evidence established in the inspected basic/detail/國語 sections; a page title alone is insufficient. 选 xiān is explicitly tied to excavated Warring States manuscript usage rather than established standard/literary Mandarin, so excluded within this scope. 万 page's mò qí includes the second character 俟; qí does not belong to 万. Its isolated detail Mǒ conflicts with its basic mò; no extra mǒ was inferred. These exclusions do not claim the historical readings never existed.

## Per-character primary evidence

All exact simplified single-character entries were inspected. The table records their numbered pronunciations (including capitalized surname duplicates) plus representative actual compound checks. When a selected reading is absent from the single entry, its compound or inline-note/supplement evidence is required; every compound-only inventory addition was reviewed, not automatically accepted. Aligned source spellings below are audit evidence, not story-pinyin prescriptions. Reviewers used windows of at most 15 characters; the final inventory excludes three primary aligned candidates by the explicit scope decisions above: 工口 luó, 劐弄 leng and 告送 song. No full dictionary or full frequency table was loaded into conversational context.

| Target | Exact simplified single-character pinyin | Relevant compound evidence (numbered source pinyin) |
| --- | --- | --- |
| 位 | [wei4] | C位 [C wei4] |
| 表 | [biao3], [biao3] | 代表 [dai4 biao3] |
| 刚 | [gang1] | 刚一 [gang1 yi1]; 刚刚 [gang1 gang5] |
| 希 | [xi1] | 乔希 [Qiao2 xi1] |
| 查 | [Zha1], [cha2], [zha1] | 严查 [yan2 cha2] |
| 拉 | [la1], [la2], [la4] | 乌拉 [wu4 la5]; 半拉 [ban4 la3] |
| 边 | [bian1], [bian5] | 一边 [yi1 bian1] |
| 或 | [huo4] | 亦或 [yi4 huo4] |
| 将 | [jiang1], [jiang4], [qiang1] | 上将 [shang4 jiang4] |
| 男 | [nan2] | 剩男 [sheng4 nan2] |
| 准 | [zhun3], [zhun3] | 一准 [yi1 zhun3] |
| 变 | [bian4] | 不变 [bu4 bian4] |
| 证 | [zheng4], [zheng4] | 上证 [Shang4 Zheng4] |
| 物 | [wu4] | 万物 [wan4 wu4]; 怪物 [guai4 wu5] |
| 员 | [yuan2] | 一员 [yi1 yuan2] |
| 总 | [zong3] | 一总 [yi1 zong3] |
| 噢 | [o1] | 噢买嘎 [o1 mai3 ga1] |
| 系 | [xi4], [xi4], [ji4], [xi4] | 世系 [shi4 xi4]; 关系 [guan1 xi5] |
| 几 | [ji1], [ji1], [ji3] | 几丁 [ji1 ding1] |
| 管 | [guan3], [Guan3], [guan3] | 不管 [bu4 guan3] |
| 玩 | [wan2], [wan2] | 古玩 [gu3 wan2] |
| 处 | [chu3], [chu4] | 住处 [zhu4 chu4]; 坏处 [huai4 chu5] |
| 办 | [ban4] | 中办 [Zhong1 ban4] |
| 主 | [zhu3] | 业主 [ye4 zhu3] |
| 气 | [qi4] | 一气 [yi1 qi4]; 丧气 [sang4 qi5] |
| 每 | [mei3] | 每个 [mei3 ge5] |
| 少 | [shao3], [shao4] | 不少 [bu4 shao3]; 多少 [duo1 shao5] |
| 切 | [qie1], [qie4] | 一切 [yi1 qie4] |
| 失 | [shi1] | 不失 [bu4 shi1]; 冒失 [mao4 shi5] |
| 算 | [suan4] | 上算 [shang4 suan4] |
| 性 | [xing4] | 两性 [liang3 xing4]; 德性 [de2 xing5] |
| 此 | [ci3] | 为此 [wei4 ci3] |
| 必 | [bi4] | 不必 [bu4 bi4] |
| 备 | [bei4], [bei4] | 不备 [bu4 bei4] |
| 合 | [ge3], [he2], [he2] | 上合 [Shang4 He2]; 凑合 [cou4 he5] |
| 德 | [De2], [de2], [de2], [de2] | 东德 [Dong1 De2] |
| 队 | [dui4] | 主队 [zhu3 dui4] |
| 试 | [shi4] | 中试 [zhong1 shi4] |
| 抱 | [bao4] | 合抱 [he2 bao4] |
| 医 | [yi1] | 中医 [zhong1 yi1] |
| 通 | [tong1], [tong4] | 三通 [san1 tong1]; 开通 [kai1 tong5] |
| 体 | [ti1], [ti3] | 一体 [yi1 ti3] |
| 乐 | [Le4], [Yue4], [lao4], [le4], [yue4] | 乐业 [Le4 ye4] |
| 并 | [bing4], [bing4], [Bing1], [bing4] | 一并 [yi1 bing4] |
| 三 | [San1], [san1] | 三C [san1 C] |
| 早 | [zao3] | 一早 [yi1 zao3] |
| 门 | [Men2], [men2] | 三门 [San1 men2]; 衙门 [ya2 men5] |
| 害 | [hai4] | 为害 [wei2 hai4]; 利害 [li4 hai5] |
| 歉 | [qian4] | 抱歉 [bao4 qian4] |
| 选 | [xuan3] | 中选 [zhong4 xuan3] |
| 嗨 | [hai1] | 口嗨 [kou3 hai1] |
| 房 | [Fang2], [fang2] | K房 [K fang2]; 私房 [si1 fang5]; 阿房宫 [E1 pang2 Gong1] |
| 命 | [ming4] | 丢命 [diu1 ming4] |
| 且 | [qie3] | 且休 [qie3 xiu1] |
| 向 | [Xiang4], [xiang4], [xiang4], [xiang4] | 一向 [yi1 xiang4] |
| 兴 | [Xing1], [xing1], [xing4] | 不兴 [bu4 xing1] |
| 球 | [qiu2], [qiu2] | 主球 [zhu3 qiu2] |
| 服 | [fu2], [fu4] | 不服 [bu4 fu2]; 服服 [fu2 fu5] |
| 入 | [ru4] | 买入 [mai3 ru4] |
| 照 | [zhao4], [zhao4] | L照 [L zhao4] |
| 提 | [di1], [ti2] | 免提 [mian3 ti2] |
| 掉 | [diao4] | 丢掉 [diu1 diao4] |
| 夫 | [fu1], [fu2] | 丁夫 [ding1 fu1]; 丈夫 [zhang4 fu5] |
| 路 | [Lu4], [lu4] | 一路 [yi1 lu4]; 活路 [huo2 lu5] |
| 演 | [yan3] | 上演 [shang4 yan3] |
| 够 | [gou4] | 不够 [bu4 gou4] |
| 日 | [ri4] | 不日 [bu4 ri4] |
| 案 | [an4] | 专案 [zhuan1 an4] |
| 舞 | [wu3] | 伴舞 [ban4 wu3] |
| 决 | [jue2] | 先决 [xian1 jue2] |
| 求 | [qiu2] | 乞求 [qi3 qiu2] |
| 约 | [yao1], [yue1] | 书约 [shu1 yue1] |
| 字 | [zi4] | 一字 [yi1 zi4]; 名字 [ming2 zi5] |
| 呃 | [e4] | 呃逆 [e4 ni4] |
| 肯 | [ken3], [ken3] | 中肯 [zhong4 ken3] |
| 目 | [mu4] | 举目 [ju3 mu4]; 眉目 [mei2 mu5] |
| 笑 | [xiao4], [xiao4] | 偷笑 [tou1 xiao4] |
| 伤 | [shang1] | 中伤 [zhong4 shang1] |
| 神 | [Shen2], [shen2] | 传神 [chuan2 shen2]; 精神 [jing1 shen5] |
| 父 | [fu4] | 严父 [yan2 fu4]; 姑父 [gu1 fu5] |
| 指 | [zhi3] | 中指 [zhong1 zhi3]; 戒指 [jie4 zhi5] |
| 报 | [bao4] | 上报 [shang4 bao4] |
| 留 | [liu2], [liu2], [liu2] | 久留 [jiu3 liu2] |
| 水 | [Shui3], [shui3] | 㵐水 [Jue2 Shui3]; 下水 [xia4 shui5] |
| 教 | [Jiao4], [jiao1], [jiao4] | 三教 [San1 Jiao4] |
| 枪 | [Qiang1], [qiang1], [qiang1] | 中枪 [zhong4 qiang1] |
| 清 | [Qing1], [qing1] | 不清 [bu4 qing1] |
| 色 | [se4], [shai3] | 上色 [shang4 se4] |
| 号 | [hao2], [hao4] | 一号 [yi1 hao4]; 字号 [zi4 hao5] |
| 世 | [Shi4], [shi4] | 一世 [yi1 shi4] |
| 远 | [yuan3], [yuan4] | 中远 [Zhong1 yuan3] |
| 片 | [pian1], [pian4] | A片 [A pian4] |
| 官 | [Guan1], [guan1] | 上官 [Shang4 guan1] |
| 口 | [kou3] | 一口 [yi1 kou3]; 牙口 [ya2 kou5] |
| 师 | [Shi1], [shi1] | 业师 [ye4 shi1] |
| 原 | [Yuan2], [yuan2] | 三原 [San1 yuan2] |
| 酒 | [jiu3] | 下酒 [xia4 jiu3] |
| 周 | [Zhou1], [zhou1], [zhou1] | 一周 [yi1 zhou1] |
| 星 | [xing1] | 七星 [Qi1 xing1]; 星星 [xing1 xing5] |
| 识 | [shi2], [zhi4] | 共识 [gong4 shi2]; 熟识 [shu2 shi5] |
| 赛 | [sai4] | 仿赛 [fang3 sai4] |
| 救 | [jiu4], [jiu4] | 呼救 [hu1 jiu4] |
| 底 | [de5], [di3] | 交底 [jiao1 di3] |
| 棒 | [bang4] | 丧棒 [sang1 bang4] |
| 须 | [xu1], [xu1] | 何须 [he2 xu1] |
| 收 | [shou1] | 丰收 [feng1 shou1] |
| 交 | [jiao1] | 上交 [shang4 jiao1] |
| 坐 | [Zuo4], [zuo4] | 乘坐 [cheng2 zuo4] |
| 停 | [ting2] | 不停 [bu4 ting2] |
| 卡 | [ka3], [qia3] | 关卡 [guan1 qia3] |
| 尼 | [ni2] | 中尼 [Zhong1 Ni2] |
| 婚 | [hun1] | 二婚 [er4 hun1] |
| 格 | [ge1], [ge2] | B格 [bi1 ge2]; 格格 [ge2 ge5] |
| 眼 | [yan3] | 一眼 [yi1 yan3]; 针眼 [zhen1 yan5] |
| 金 | [Jin1], [jin1] | K金 [K jin1] |
| 蛋 | [Dan4], [dan4] | 下蛋 [xia4 dan4] |
| 息 | [xi1] | 不息 [bu4 xi1]; 休息 [xiu1 xi5] |
| 室 | [Shi4], [shi4] | 云室 [yun2 shi4] |
| 内 | [nei4] | 业内 [ye4 nei4]; 内内 [nei4 nei5] |
| 运 | [yun4] | 世运 [Shi4 yun4] |
| 根 | [gen1] | 业根 [ye4 gen1] |
| 单 | [Shan4], [chan2], [dan1] | 下单 [xia4 dan1] |
| 宝 | [bao3], [bao3] | 三宝 [san1 bao3]; 宝宝 [bao3 bao5] |
| 哥 | [ge1] | 一哥 [yi1 ge1]; 八哥 [ba1 ge5] |
| 张 | [Zhang1], [zhang1] | 主张 [zhu3 zhang1] |
| 搞 | [gao3] | 乱搞 [luan4 gao3] |
| 战 | [zhan4] | 一战 [Yi1 zhan4]; 冷战 [leng3 zhan5] |
| 火 | [Huo3], [huo3] | 上火 [shang4 huo3]; 柴火 [chai2 huo5] |
| 罗 | [Luo2], [luo2] | C罗 [C Luo2]; 克仑特罗 [ke4 lun2 te4 luo1]; 喽罗 [lou2 luo5] |
| 至 | [zhi4] | 东至 [Dong1 zhi4] |
| 万 | [mo4], [Wan4], [wan4] | 万一 [wan4 yi1] |
| 声 | [sheng1] | 一声 [yi1 sheng1]; 相声 [xiang4 sheng5] |
| 布 | [bu4], [bu4] | 仁布 [Ren2 bu4]; 拉布布 [La1 bu4 bu5] |
| 音 | [yin1] | 三音 [san1 yin1]; 口音 [kou3 yin5] |
| 期 | [qi1], [qi1] | 上期 [shang4 qi1] |
| 条 | [tiao2] | 三条 [san1 tiao2]; 苗条 [miao2 tiao5] |
| 消 | [xiao1] | 不消 [bu4 xiao1] |
| 买 | [mai3] | 买下 [mai3 xia4] |
| 病 | [bing4] | 久病 [jiu3 bing4]; 病病歪歪 [bing4 bing5 wai1 wai1] |
| 整 | [zheng3] | 严整 [yan2 zheng3] |
| 奇 | [ji1], [qi2] | 传奇 [chuan2 qi2] |
| 弟 | [di4], [ti4] | 仁弟 [ren2 di4]; 弟弟 [di4 di5] |
| 犯 | [fan4] | 主犯 [zhu3 fan4] |
| 装 | [zhuang1] | 上装 [shang4 zhuang1]; 嫁装 [jia4 zhuang5] |
| 贝 | [Bei4], [bei4] | 丹贝 [dan1 bei4] |
| 您 | [nin2] | No aligned compound headword; exact single entry checked |
| 送 | [song4] | 不送 [bu4 song4] |
| 怕 | [Pa4], [pa4] | 不怕 [bu4 pa4] |
| 护 | [hu4] | 个护 [ge4 hu4] |
| 度 | [du4], [duo2] | 一度 [yi1 du4]; 态度 [tai4 du5] |
| 花 | [Hua1], [hua1], [hua1], [hua1] | 乱花 [luan4 hua1]; 棉花 [mian2 hua5] |
| 节 | [jie1], [jie2] | 令节 [ling4 jie2]; 箍节儿 [gu1 jie5 r5] |
| 近 | [jin4] | 临近 [lin2 jin4] |
| 怪 | [guai4], [guai4] | 丑怪 [chou3 guai4] |
| 持 | [chi2] | 主持 [zhu3 chi2]; 操持 [cao1 chi5] |
| 光 | [guang1] | X光 [X guang1] |
| 与 | [yu2], [yu3], [yu4] | 与会 [yu4 hui4] |
| 穿 | [chuan1] | 冻穿 [dong4 chuan1] |
| 愿 | [yuan4], [yuan4] | 不愿 [bu4 yuan4] |
| 象 | [xiang4] | 万象 [Wan4 xiang4] |
| 影 | [ying3] | 人影 [ren2 ying3] |
| 击 | [ji1] | 伏击 [fu2 ji1]; 击缶 [ji2 fou3] |
| 使 | [shi3] | 主使 [zhu3 shi3]; 差使 [chai1 shi5] |
| 二 | [er4] | 一二 [yi1 er4] |
| 喝 | [he1], [he4] | 叱喝 [chi4 he4]; 吆喝 [yao1 he5] |
| 月 | [yue4] | 一月 [Yi1 yue4] |
| 器 | [qi4] | 乐器 [yue4 qi4] |
| 察 | [Cha2], [cha2], [cha2] | 体察 [ti3 cha2] |
| 制 | [zhi4], [zhi4] | 专制 [zhuan1 zhi4] |
| 嘛 | [ma2], [ma5] | 喇嘛 [la3 ma5] |
| 哈 | [Ha1], [ha1], [ha3] | 二哈 [er4 ha1]; 哈士蟆 [ha4 shi5 ma2]; 打哈哈 [da3 ha1 ha5] |
| 助 | [zhu4] | 互助 [Hu4 zhu4] |
| 达 | [Da2], [da2] | 上达 [shang4 da2]; 溜达 [liu1 da5] |
| 海 | [Hai3], [hai3] | 上海 [Shang4 hai3] |
| 待 | [dai1], [dai4] | 亏待 [kui1 dai4] |
| 托 | [tuo1], [tuo1] | 交托 [jiao1 tuo1] |
| 除 | [chu2] | 乘除 [cheng2 chu2] |
| 写 | [xie3], [xie4] | 临写 [lin2 xie3] |
| 绝 | [jue2], [jue2] | 不绝 [bu4 jue2] |
| 界 | [jie4] | 上界 [shang4 jie4]; 半间不界 [ban4 gan1 bu4 ga4] |
| 帝 | [di4] | 上帝 [Shang4 di4] |
| 姐 | [jie3] | 一姐 [yi1 jie3]; 姐姐 [jie3 jie5] |
| 反 | [fan3] | 三反 [San1 fan3] |
| 担 | [dan1], [dan4] | 公担 [gong1 dan4]; 扁担 [bian3 dan5] |
| 司 | [Si1], [si1] | 上司 [shang4 si5] |
| 强 | [Qiang2], [jiang4], [qiang2], [qiang3], [jiang4], [qiang2], [qiang3] | 倔强 [jue2 jiang4] |
| 由 | [you2] | 不由 [bu4 you2] |
| 论 | [Lun2], [lun4] | 不论 [bu4 lun4] |
| 飞 | [fei1] | 停飞 [ting2 fei1] |
| 亚 | [Ya4], [ya4] | 三亚 [San1 ya4]; 威亚 [wei1 ya3] |
| 续 | [xu4] | 后续 [hou4 xu4] |
| 视 | [shi4], [shi4], [shi4] | 下视 [xia4 shi4] |
| 母 | [mu3] | 丈母 [zhang4 mu3] |
| 空 | [kong1], [kong4] | 一空 [yi1 kong1] |
| 军 | [jun1] | 三军 [san1 jun1] |
| 跑 | [pao2], [pao3] | 乱跑 [luan4 pao3] |
| 阿 | [a1], [e1] | 东阿 [Dong1 e1] |
| 尽 | [jin3], [jin4] | 不尽 [bu4 jin4] |
| 注 | [zhu4], [zhu4] | 下注 [xia4 zhu4] |
| 弄 | [long4], [nong4], [nong4], [long4] | 作弄 [zuo4 nong4]; 倒弄 [dao3 nong5] |
| 密 | [Mi4], [mi4] | 东密 [Dong1 mi4]; 密密匝匝 [mi4 mi5 za1 za1] |
| 线 | [xian4], [xian4] | K线 [K xian4] |
| 代 | [dai4] | 一代 [yi1 dai4] |
| 忙 | [mang2] | 不忙 [bu4 mang2]; 忙忙叨叨 [mang2 mang5 dao1 dao1] |
| 坏 | [huai4] | 使坏 [shi3 huai4] |
| 久 | [jiu3] | N久 [N jiu3] |
| 议 | [yi4] | 争议 [zheng1 yi4] |
| 衣 | [yi1], [yi4] | 上衣 [shang4 yi1]; 估衣 [gu4 yi5] |
| 血 | [xue4] | 一血 [yi1 xue4]; 便血 [bian4 xie3] |
| 钟 | [Zhong1], [zhong1], [zhong1] | 上钟 [shang4 zhong1]; 空钟 [kong1 zhong5] |
| 继 | [ji4] | 中继 [zhong1 ji4] |
| 礼 | [Li3], [li3] | 丧礼 [sang1 li3] |
| 数 | [shu3], [shu4], [shuo4] | 个数 [ge4 shu4]; 寿数 [shou4 shu5] |
| 份 | [fen4] | 九份 [Jiu3 fen4] |
| 疯 | [feng1] | 发疯 [fa1 feng1]; 疯疯癫癫 [feng1 feng5 dian1 dian1] |
| 平 | [Ping2], [ping2] | 不平 [bu4 ping2] |
| 止 | [zhi3] | 不止 [bu4 zhi3] |
| 十 | [shi2] | 七十 [qi1 shi2] |
| 拜 | [bai4] | 下拜 [xia4 bai4]; 拜拜 [bai2 bai2]; 拜拜 [bai4 bai5] |
| 鬼 | [gui3] | 五鬼 [wu3 gui3] |
| 睡 | [shui4] | 入睡 [ru4 shui4] |
| 啦 | [la1], [la5] | 卡啦 [ka3 la1] |
| 调 | [diao4], [tiao2] | 上调 [shang4 tiao2] |
| 巴 | [Ba1], [ba1] | 下巴 [xia4 ba5] |
| 兄 | [xiong1] | 仁兄 [ren2 xiong1]; 弟兄 [di4 xiong5] |
| 紧 | [jin3] | 严紧 [yan2 jin3] |
| 站 | [zhan4] | B站 [B zhan4] |
| 品 | [pin3] | 一品 [yi1 pin3] |
| 英 | [Ying1], [ying1] | 中英 [Zhong1 Ying1] |
| 罪 | [zui4], [zui4] | 代罪 [dai4 zui4]; 得罪 [de2 zui5] |
| 文 | [Wen2], [wen2] | 上文 [shang4 wen2] |
| 亮 | [liang4] | 乌亮 [wu1 liang4]; 月亮 [yue4 liang5] |
| 抓 | [zhua1] | 主抓 [zhu3 zhua1] |
| 跳 | [tiao4] | 乱跳 [luan4 tiao4] |
| 联 | [lian2] | 串联 [chuan4 lian2] |
| 混 | [hun2], [hun4] | 厮混 [si1 hun4]; 搅混 [jiao3 hun5] |
| 便 | [bian4], [pian2] | 不便 [bu4 bian4]; 便便 [bian4 bian5] |
| 狗 | [gou3] | 刍狗 [chu2 gou3]; 狗狗 [gou3 gou1] |
| 脑 | [nao3] | 丘脑 [qiu1 nao3] |
| 业 | [Ye4], [ye4] | 专业 [zhuan1 ye4] |
| 歌 | [ge1], [ge1] | K歌 [K ge1]; 秧歌 [yang1 ge5] |
| 精 | [jing1] | 人精 [ren2 jing1]; 妖精 [yao1 jing5] |
| 包 | [Bao1], [bao1] | 三包 [san1 bao1] |
| 转 | [zhuai3], [zhuan3], [zhuan4] | 中转 [zhong1 zhuan3]; 转转 [zhuan4 zhuan5] |
| 却 | [que4], [que4] | 了却 [liao3 que4] |
| 参 | [can1], [can1], [cen1], [shen1], [can1], [shen1], [shen1] | 丹参 [dan1 shen1] |
| 院 | [yuan4] | 下院 [xia4 yuan4] |
| 务 | [wu4] | 世务 [shi4 wu4]; 任务 [ren4 wu5] |
| 基 | [ji1] | 丁基 [ding1 ji1] |
| 台 | [Tai2], [tai1], [tai2], [tai2], [Tai2], [tai2], [tai2] | T台 [T tai2] |

## Verification and coordinator handoff

- **250 characters / 432 authored readings**, exactly 50 new learning lessons and five empty-introduction revision lessons. Every list is nonempty, duplicate-free, NFC, lowercase, and accepted by the existing `validPinyin()` checker.
- **Preservation PASS:** restoring only the 250 selected pinyin arrays to their original empty arrays makes the entire parsed manifest deeply identical to the preserved input. All 55 baseline lessons are deeply unchanged; baseline hash, IDs, revisions, lesson/character order, titles, descriptions and worker allocation are unchanged. Original two-space JSON round-trip matched before editing, so unrelated text formatting was not normalized.
- Original manifest file SHA-256: `310c137b85afff34623442af7e0523a251f51291f2636e2e77f39cdaa090531f`.
- Updated manifest file SHA-256: `f3c25ee270aeb0e38680bd01705edac5387cdcc1d9ab756188b4e2ea50052395`.
- Authored map file SHA-256: `f4f0867213d56c1bd92644406ce44c16af79c18c086833cba35a50fb891138ea`.
- Reconstructed baseline content hash matches the manifest's unchanged `baselineHash`. This is preservation evidence against the supplied plan, not a claim that a later live publication cannot change.
- Existing **`validatePlannedLessons(content, [])` metadata-only validation: PASS**, zero errors, zero warnings. All 110 lesson reports are returned, with unselected stories explicitly not checked.
- Existing **`validatePlannedLessons(content, baselineLessonIds)` compatibility check: PASS**, zero errors, 36 baseline soft warnings. The warning arrays were compared with the preserved original plan and are exactly unchanged. The checker consumed baseline content internally without exposing story text to reference reviewers; no new stories were selected or written. These baseline warnings are not new-story failures or a language-quality verdict.
- Independent source-inventory audit: all 432 selected readings have exact primary single/compound evidence or documented explicit-note/supplemental evidence. The primary candidate scan is discovery only: the visual-glyph and dialect exclusions above were deliberate authored decisions.
- Only `manifest.json` plus the two new review/map files in this run directory were changed. No worker artifacts, seal, launch journal, candidate, shared-code edit, runtime content edit or published output was created. No story/content-authoring or full-publication claim; the new stories remain absent. No test-suite execution was needed or claimed for this metadata-only change.

Reproduce the non-mutating validation from the repository root (prints only counts, not baseline story text):

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
import { validatePlannedLessons } from './authoring/scripts/content-tools.mjs';
const m = JSON.parse(fs.readFileSync('.authoring-runs/next-55/manifest.json', 'utf8'));
const assigned = new Set(m.workers.flatMap(w => w.lessonIds));
const baselineIds = m.content.modules.flatMap(mod => mod.lessons)
  .filter(l => !assigned.has(l.id)).map(l => l.id);
for (const ids of [[], baselineIds]) {
  const result = validatePlannedLessons(m.content, ids);
  console.log({ selected: ids.length, errors: result.errors.length,
    warnings: result.warnings.length });
  if (result.errors.length) process.exitCode = 1;
}
JS
```

**Coordinator concerns:** preserve the documented regional-Mandarin, lexical-neutral and rare literary/historical scope when freezing these definitions; do not silently reduce cards to their most common reading. In particular, 坏 pī/pēi/péi, 台 yí, 参 sān and similar explicit homograph supplements are historical, not readings for ordinary modern story senses. 呃 neutral e remains unestablished by consulted sources. The source anomaly 不可数集 must not be copied into contextual pinyin. No structural metadata blocker remains; the plan is intentionally **unsealed**, and sealing/launching requires the coordinator's separate authorization and normal baseline checks.
