# Worker 3 author review

Completed 2026-11-10. All eleven assigned lessons are authored in `lessons.json`, in assigned order: learning-31 through learning-40, then revision-40. Only titles, descriptions and stories were authored. IDs, kinds, revision 1 and every introduction object/reading list are unchanged. A direct comparison with this worker's briefs confirmed exact introduction equality for all eleven lessons. No frozen-metadata blocker was found.

I read the assignment first, followed the worker workflow, and used my own briefs and draft. I did not read previous published stories, the shared manifest, or other workers' drafts. The scoped checker reads the sealed global metadata internally as designed. I modified files only in this worker directory; no publication, deployment, commit or integration was performed.

## Pronunciation sources and authoring method

Primary reference actually consulted: CC-CEDICT, CC-CEDICT contributors, published through [MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict), using the supplied `/tmp/chinese-reading-cedict-next44.gz`. Cache header: `2026-11-09T04:23:50Z`, 125397 entries. Compressed SHA-256: `2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`. This is the supplied cache's identity; it differs from the historical archive identity in `authoring/PRONUNCIATION.md`.

CC-CEDICT pronunciation reference material is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Credit remains with the CC-CEDICT contributors; preserve attribution and share-alike terms when reusing adapted pronunciation material. The stories are newly authored, not copied dictionary examples. Source-frequency attribution and licence remain those documented in `authoring/data/README.md`: Cai and Brysbaert (2010), SUBTLEX-CH, CC BY 4.0.

I consulted small, explicitly selected reference windows for 喜欢, 认识, 克, 克服, 爸爸, 地方, 应该, 无关, 无比, 手机, 分钟, 特别, 相机, 杀死, 需要, 美好, 终于, 工作, 同年, 长大, 亲自, 作者, 明白, 学习, 安, 尔, 道理, 点头, 时候, 告诉, 常常, 放下 and 同学. A second focused pass checked 认得, 一动不动, 哪, 那个, 有名, 打车, 安心, 出发, 开关, 用力, 东西, 白, 什么 and 一点 alongside the relevant repeated compounds. Some consulted words were not retained because their characters are not allowed at that lesson. I did not re-author or claim a fresh exhaustive review of the coordinator's sealed reading lists.

I explicitly wrote the contextual Chinese and matching pinyin syllables in the local authoring scripts. `author.py` only packages those authored pairs into the paragraph → sentence → token structure and checks alignment; it never consults a dictionary or selects a reading. The dictionary extraction was reference consultation, not programmatic story-reading inference.

Conventions reviewed against `authoring/PRONUNCIATION.md`: lowercase tone-marked pinyin; ordinary underlying third tones; contextual 一/不 sandhi; neutral syllables in 爸爸, 妈妈, 孩子, 喜欢, 告诉, 时候, 认得, 地方, 明白 and 道理; light reduplication where intended. I manually inspected every 一/不 occurrence in its authored context. This caught and corrected 不信 to **bú xìn**. Neutral potential complements remain **bu**, including 想不到, 找不到, 看不出来, 说不出 and 用不上. A-not-A constructions use neutral **bu** where appropriate.

## Actual language self-review

I read all eleven complete Chinese drafts after the initial mechanical pass and revisited their authored pinyin. I checked what every mandatory target contributes, referents and speakers, event order, sentence boundaries and the allowed bank. Source checks and mechanical passes do not establish independent Mandarin approval or learner testing.

- **learning-31 — 先下车再说.** A car-exit misunderstanding resolves when the child comes out and the family agrees to walk next time. 关/进/车 are physical actions, 年 frames the visit, and 喜 appears naturally in 喜欢. The car does not drive away while the child is supposedly exiting: I replaced an ambiguous “车开了” with the driver letting the child out. 西西 and 斯斯 are participants with actual roles, providing contextual reuse of 西 and 斯. 明年, 时间 and 时候 fit the timing and ending. Pinyin uses chē, xǐ huan and explicit 一定/一起 sandhi; 哪里 avoids an unnecessary erhua representation issue.
- **learning-32 — 电话那一头.** A father calls an old acquaintance and recognizes him through a shared toy-car memory. 认得, 大克, 爸爸, 谁 and 对方 carry the new targets. The past joint activity, present taxi arrival, recollection and mother's question support the due targets. I replaced the awkward telephone ending “关了电话” with the more meaningful 关心, and clarified that the caller doubts whether the old car can still run. Actual readings include rèn de, bà ba, shéi, gàn for past activity and ó for recognition.
- **learning-33 — 不是你的错.** The daughter thinks she damaged her beloved toy car; the power switch explains its failure. 老 in 老是, 应该, comparison 比, practical 帮 and 和你无关 all contribute to that problem. I made the inspection refer to the underside and its switch, and changed the father's admission to explain that he had previously turned it off. 女儿, 西西, 大克, 谁, 进去, 喜欢 and 时间 occur within the help-seeking scene. Readings distinguish yīng in 应该, wú in 无关, fǎ zi and neutral potential bu in 开不起来.
- **learning-34 — 晚一点再发.** A child notices that the mother is about to send to the wrong person. The mother stays the speaker throughout: I corrected leftover 他 pronouns to 她. I also corrected “无关的人可不能发” to “不能发给无关的人” and made the instruction about separating the two recipients' messages explicit. 晚, 一动不动, 点点头, 手机 and 分开 have concrete roles. 分 is fēn; 不动 uses bú; 谢谢 and 告诉 have neutral final syllables.
- **learning-35 — 先看看家里的人.** The father's attention is captured by a chase on his phone while the family waits to leave. The killing is a brief screen event, without graphic detail. 特别, 相信, 全家, 杀死 and 需要 belong to the conflict and decision. 我们/而不是, 无关, 电, 法子 and the child's insistence on action are meaningful reuse. I made switching off the phone explicit and removed an unclear comparison to the people on the screen. 相信 is xiāng xìn, distinct from the later camera word; 杀死 is shā sǐ.
- **learning-36 — 相机前的女儿.** A staged camera moment goes wrong when the daughter copies a dying gesture her father previously performed. She asks for ordinary time together instead. This is pretend action, not an actual death. 放好, 常常, 一直, 才 and 美好 connect to setup, delay and the father's change of plan. I retained the explanation of her imitation so the action is not a disconnected coverage sentence. 相机 uses xiàng jī; 女儿 is nǚ ér; 分点时间 uses fēn. The evening-to-tomorrow transition, westward walk and request to leave the camera give 晚/明/西/分 specific contexts.
- **learning-37 — 给他一个帮人的机会.** Visitors question a writer's proposed motivation; staying to help other people makes the fictional character's return understandable. 老于's surname, 带着, 今天, 能力 and 工作 introduce the new group through the visit and discussion. I rejected an earlier draft with an unnatural self-directed “kill” metaphor and changed the premise. The retained 杀 is a fictional threat motivating the discussion. The writer puts down an actual phone rather than an unexplained raised hand. 于 is yú, 带 is dài, 工作 is gōng zuò; 不一定 and potential 看不出来 were reviewed in context.
- **learning-38 — 先回家，再说工作.** A well-known writer realizes that his child wants him home, not working indefinitely on her behalf. 许东 is the named protagonist; 有名, 同事 and 长时间 develop his situation. I changed the arrival to the workplace so the coworker's presence and the distant family message agree. 放下, 心里一动, 之后, 分点时间 and the offer from 老于 support the decision. 长时间 is cháng; 告诉 is gào su; 许东 is xǔ dōng. The phone is put away for departure, not used as an unexplained scene prop.
- **learning-39 — 作者也要听.** Children challenge a writer's proposed ending because it conflicts with his character's earlier behavior. 亲自, 这种, 作者, 嘿 and 白出力 support the visit, criticism and thanks. The killing remains a proposed fictional ending that the children question. The long acquaintance uses 一同长大, with zhǎng dà. I reviewed speaker changes and the rhetorical question “不听人说，怎么能成？”; the author's response acknowledges listening rather than claiming the children automatically know every answer. 明白 has neutral bai; 白出力 has lexical bái; 种 is zhǒng and 亲 is qīn.
- **learning-40 — 先听同学的想法.** A hesitant aspiring author gets room to explain an idea. 同学/学, 安心, 小尔, 叫 and 有道理 are meaningful parts of the invitation and reassurance. The writer's old phone illustrates that his previous work was imperfect; the child's phone call tells her mother what changed. I removed a leftover interruption verb that was outside the bank and replaced it with the positive action 让她说下去. 尔 is the name syllable ěr; 道理 is dào li; 当作者 uses dāng. “没有白学” refers to learning, not a new introduction or runtime claim.
- **revision-40 — 相机后面的一家人.** A family makes a camera message for a worker who cannot return for the new year. An overcomplicated fictional assassin premise is abandoned in favor of the children's real news. Everyone's camera shyness then relaxes into ordinary conversation. I checked all latest-50 targets in the complete situation: family and names; work and invitation; staged idea and rejection; toy car and switch; growth and learning; camera setup, reassurance and final call. I replaced an unnatural head movement with the father walking out from behind the camera. 相机 is xiàng jī, 相信 elsewhere is xiāng xìn; 长时间 is cháng and 长大 is zhǎng; 种 uses zhǒng and 应该 uses yīng. This checkpoint introduces no characters.

All stories have zero permanent-help occurrences in the final reports. Every occurrence is taught by its lesson. Recurring names and several writer/camera premises are intentional choices within the small bank; these are not claims of unique themes across the batch. The longer learning stories also contain abstract discussion, especially 37–40, which remains a pedagogical limitation of these drafts.

## Validation and length warnings

Early individual checks were run before the rest were complete, beginning with learning-31. They caught illegal bank characters, missing due targets and sentence-array boundaries. I revised the actual writing and pinyin, without changing definitions or checker code. Final individual checks were then rerun for every assigned ID and each exited 0. Their final reports are `check-learning-31.json` through `check-learning-40.json` and `check-revision-40.json`.

Final combined command, exit 0:

```sh
node authoring/scripts/authoring-batch.mjs check .authoring-runs/next-44-20261109 --worker worker-3
```

Result in `check-all.json`: `scoped-drafts-checked-not-publication`, **0 hard errors, 9 soft length warnings**. All eleven worker stories are required and checked. Other lessons are outside this scope; this is not a combined publication pass.

| Lesson | Hanzi | Suggested range | Final result |
| --- | ---: | ---: | --- |
| learning-31 | 167 | 82–138 | pass; overlength warning |
| learning-32 | 155 | 84–140 | pass; overlength warning |
| learning-33 | 197 | 85–143 | pass; overlength warning |
| learning-34 | 145 | 86–145 | pass |
| learning-35 | 206 | 88–147 | pass; overlength warning |
| learning-36 | 230 | 89–150 | pass; overlength warning |
| learning-37 | 263 | 90–152 | pass; overlength warning |
| learning-38 | 236 | 92–154 | pass; overlength warning |
| learning-39 | 254 | 93–157 | pass; overlength warning |
| learning-40 | 246 | 95–159 | pass; overlength warning |
| revision-40 | 683 | 474–792 | pass |

I retained the nine length warnings. The additional text supplies motivation, dialogue and resolution; it does not add introductions or exempt any target. Length remains a soft authoring limitation, not a mechanical failure.

Repository checks also completed: `npm run authoring:test` exited 0 (**79 passed, 0 failed**) and `npm run authoring:typecheck` exited 0. Logs are `authoring-test.log` and `authoring-typecheck.log`. No browser, runtime, publication or deployment validation was claimed or required for this isolated worker delivery.

Final `lessons.json` SHA-256: `53d0d4b344c1ab1c6e0dc23a8f70932bfe0fb36df9f7926f98452eabd3e93929`.
