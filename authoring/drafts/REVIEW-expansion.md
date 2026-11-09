# Extended Fundamentals — author self-review

## Scope and status

Implemented eight **new** authored lessons in
`app/content/extended-fundamentals.ts`, exported as
`extendedFundamentalsLessons` (`as const satisfies readonly Lesson[]`, with a
type-only `Lesson` import). Every lesson has `contentRevision: 1`.

The user's explicit expansion authorization supersedes the three-lesson cap.
The eight lessons are now appended in `curriculum.ts` within the existing
Fundamentals module; no unit logic was added. The first three lessons and their
revision-3 stories remain unchanged. No previous story texts were read to author
these stories. Existing content was imported programmatically for combined
validation, not used as writing material.

The initial isolated authoring check found that the syllable allowlist omitted
**bia**, needed for CC-CEDICT's **biā** reading of 吧. Integration adds this
syllable, preserves the complete reading list, and adds tone-position regression
coverage. The full publication check now passes with no errors or warnings.

## Final integrated validation

- `npm run authoring:check`: 11 lessons, zero errors and warnings.
- `npm run authoring:test`: 29 passed, including exact introduction groups,
  actual Fibonacci-due coverage and the all-50 revision checkpoint.
- `npm run authoring:typecheck`, `npm run typecheck`, and
  `npx tsc --noEmit -p tests/tsconfig.json`: passed.
- `npm test`: 80 passed, including the UI-only journey through all 11 lessons,
  final revision direct-story entry and all 50 taught characters rendered.
- `npm run test:revision`: 3 passed in the isolated four-lesson fixture build.
- `git diff --check`: passed. No hosted deployment was performed.

The sections below retain the initial authoring observations and checks as a
historical snapshot, before registration and the syllable-validator fix.

## Brief, schedule, and lengths

Read `authoring/AGENTS.md`, `authoring/README.md`,
`authoring/PRONUNCIATION.md`, `authoring/data/README.md`, and
`app/content/README.md` before authoring. Queried only the frequency ranks 1–100
with `authoring:frequency -- --start 1 --limit 100`; did not load the full
frequency table into the writing context. Frequency provenance/licence remains
in `authoring/data/README.md` (Cai and Brysbaert, SUBTLEX-CH, CC BY 4.0).

Used a temporary offline proposed sequence (existing introductions followed by
seven exact five-character groups and a zero-introduction revision) with
`authoringPlan`. This derived allowed/mandatory sets and lengths before
writing, without previous story text. Re-derived each finished lesson's brief
using `authoringBrief` on the dynamically combined curriculum. Temporary
creation/check files and the dictionary archive are outside the repository.

The Fibonacci offsets are **1, 2, 4, 7, 12, 20…**, counted in learning lessons
only. Offset 12 cannot become due within lessons 4–10; its obligations remain
pending, not waived. Revision neither introduces characters nor advances or
resets the clock.

| Learning # / kind | Stable ID | Exact introductions | Due targets | Hanzi |
| --- | --- | --- | --- | ---: |
| 4 | `an-extra-pair-of-hands` | 来人那要会 | 不们这一他么在有个好 | 66 |
| 5 | `an-unspoken-invitation` | 就什没到说 | 我的你是了么在有个好来人那要会 | 73 |
| 6 | `more-than-a-thank-you` | 吗为想能上 | 不们这一他来人那要会就什没到说 | 66 |
| 7 | `a-welcome-visit` | 去道她很看 | 么在有个好就什没到说吗为想能上 | 67 |
| 8 | `more-than-the-pastries` | 可知得过吧 | 我的你是了来人那要会吗为想能上去道她很看 | 67 |
| 9 | `seeing-for-herself` | 还对里以都 | 不们这一他就什没到说去道她很看可知得过吧 | 71 |
| 10 | `a-birthday-change` | 事子生时样 | 么在有个好吗为想能上可知得过吧还对里以都 | 74 |
| revision after 50 | `the-birthday-surprise` | none | all 50 introductions; no additional Fibonacci targets | 394 |

All new and due targets occur in each learning story. The revision covers
**all 50** characters from 我的你是了 through 事子生时样. All story Hanzi are
within the fixed top 100; all introductions are within the top 50. Learning
lengths are 66–74, around the requested 65–75. The revision is 394, against target
375 and range **281–469**. There are no length warnings.

The actual combined policy report leaves 50 next character obligations pending:
20 at learning 11, 10 at 12, 10 at 13, 5 at 14, and 5 at 15. The next revision
checkpoint is after learning 20, not an extra checkpoint after this revision.

## Meaningful reuse and situation review

I reviewed the Chinese and pinyin sentence by sentence, including the use of
every mandatory character. This is **author self-review**, not independent
Mandarin approval or learner testing.

- **4 — A child joins pastry-making.** The adult starts alone (一个人在家),
  the son asks to participate (来了 / 让我来 / 要做), watches because he cannot
  yet do it (不会 / 怎么做), then makes his own. 那 contrasts the finished
  pastries rather than being an isolated demonstration word. The due groups
  supply the participants (他 / 我们), counting and comparison (一个 / 这个),
  ability negation, location, possession (有大有小), and the final compliment.
- **5 — An invitation was never passed on.** The first paragraph establishes
  the intended visit and delay (要…来 / 好一会 / 没有人到). 什么 is the son's
  genuine misunderstanding; 说 recurs in the failed handoff, not a vocabulary
  list. 以为…会说 explains the mistake. 那…就…只好 advances the response, and
  the narrator visits Mum with the pastry. The due characters support the
  actual invitation, waiting, question, and gift recipient.
- **6 — The child's answer is more generous than expected.** 看上 means taking
  a liking to the pastry; 能…吗 is a permission request; 想 marks deliberation;
  为 in 以为 names the adult's mistaken assumption. The question naturally
  needs 做点心的人 / 说什么. 不知道 / 就说谢谢 and 没想到 set up the reversal:
  the child wants the others to have one too (你们也来一个), not merely to take.
- **7 — A visit needs no special excuse.** 上回 establishes the missed visit;
  很想去 supplies the motivation. The visitor does not know what to say
  (不知道说什么), and the narrator asks about an actual obstacle (有事吗 /
  为什么不去). She arrives, sees Mum making a pastry, and is welcomed.
  The due 在 / 一个 / 好 belong to that arrival; 以为…不能来 explains Mum's
  pleased surprise. 她 and 妈妈 remain distinguishable in the exchanges.
- **8 — A misshapen pastry need not prevent a visit.** 做得不好看 describes a
  concrete result; 做过一回 is real prior experience, not a redundant tense
  marker. 可是 and 知道 introduce the mother's correction; 吧 is her invitation.
  能给人吗 expresses the narrator's insecurity. 为什么要你来 and 是想我了
  establish that the visit, not pastry quality, matters; 那…就去 resolves it.
  The remaining due characters describe the earlier attempt and expected joy.
- **9 — Someone checks the group's opinion for herself.** 都 sets up the group
  verdict; 还 marks persistence; 那里 identifies the disputed destination;
  以为…只是说说 is the narrator's mistaken expectation. 得去看看吧 is a
  motivated decision. 过去 is actual movement, not an artificial experience
  marker. 她 goes, returns, and 对我们 reports what she saw; the others decide
  to join her. The place is deliberately unnamed under the restricted bank,
  but the disagreement, action, result, and changed plan are complete.
- **10 — Company matters more than a birthday treat.** 儿子 is the participant;
  过生 names the occasion; 时 anchors the scheduling conflict; 有事 / 得出去
  explain it; 这样 describes celebrating together. The son's 什么 question
  asks the parent to understand what he wants. 上回你不在 contrasts the earlier
  absence with 能在吗 now. 以为…点心就好 / 还想…在家里 exposes the mistaken
  substitution of a gift for presence; 对我说 / 我们一起过 / 大家都开心 and
  好吧 resolve the request. This is a brief conversation, not a claim that
  every outside obligation can always be cancelled.
- **Revision — Three generations share a surprise.** Preparation creates a
  real large/small-pastry disagreement (一样 / 有大有小). The son cannot decide
  what to tell Grandma; the narrator remembers learning that she values the
  thought rather than appearance. Her arrival reveals the surprise without
  an exposition speech. Their mutual difficulty saying it leads to 这还用说
  and 会做点心就好. Returning pastries to the makers (还给) makes her wish for
  company concrete. The final 怎么能开心 question and 这样就很好 resolve it.
  All 50 targets have narrative, grammatical, or dialogue functions.

Several stories use a family/pastry setting because it supports real requests,
misunderstandings, generosity, and reassurance within the permitted pool. They
are separate new situations, not continuations of or copies from earlier
published texts. There is no imposed continuity or minimum repetition count.

### Help load

| Lesson # / revision | Permanently helped occurrences | Distinct helped Hanzi |
| --- | ---: | ---: |
| 4 | 31 / 66 | 18 |
| 5 | 33 / 73 | 22 |
| 6 | 19 / 66 | 14 |
| 7 | 17 / 67 | 11 |
| 8 | 15 / 67 | 11 |
| 9 | 5 / 71 | 5 |
| 10 | 15 / 74 | 11 |
| revision | 115 / 394 | 29 |

Earlier help load is substantial, particularly household words such as 家、妈、
做、点心 and 儿子 before 子 is introduced. These carry the situations rather
than padding target counts. Later help includes useful actions and connections
such as 把、给、回、开、后、但. All remain top-100-only. No permanent-help flags,
cumulative banks, dictionaries, or scheduling data are stored in the lessons.

## Pronunciation references and reading-list review

Primary source: **CC-CEDICT contributors**, distributed by
[MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict),
[download](https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz).
Fetched and inspected outside the repo during this task. Archive header:
`2026-11-08T08:49:26Z`; compressed SHA-256:
`85a742880b294197546c5c48b716a2811d7790367d98cc3ef814df8095fe991e`.
This matches the source recorded in `authoring/PRONUNCIATION.md`; it is not an
assertion that the rolling URL is immutable.

The authored lexical reading lists adapt CC-CEDICT numbered pinyin into
lowercase tone-marked pinyin and merge surname capitalization with the same
syllable. The adapted pronunciation material is attributed to the CC-CEDICT
contributors and remains available under **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**,
including its attribution/share-alike requirements. No full dictionary or
copied definitions/examples are shipped. The stories are newly authored.

Checked all 35 single-character entries, their embedded pronunciation notes,
and relevant compounds. Completeness follows the lexical-Mandarin scope in
`authoring/PRONUNCIATION.md`: include listed colloquial/literary and proper-name
readings, not every historical alternate-glyph mapping or dialect inventory.
Predictable surface neutralizations are occurrence choices, not additional
card readings unless explicitly lexical entries (e.g. 子 zi and 过 guo).

| Group | Authored lexical readings |
| --- | --- |
| 4 | 来 lái; 人 rén; 那 nà / nèi / nǎ / nā / nuó; 要 yào / yāo; 会 huì / huǐ / kuài |
| 5 | 就 jiù; 什 shén / shí; 没 méi / mò; 到 dào; 说 shuō / shuì |
| 6 | 吗 ma / má / mǎ; 为 wéi / wèi; 想 xiǎng; 能 néng; 上 shàng / shǎng |
| 7 | 去 qù; 道 dào; 她 tā; 很 hěn; 看 kàn / kān |
| 8 | 可 kě / kè; 知 zhī; 得 de / dé / děi / dè; 过 guò / guo / guō; 吧 ba / bā / biā |
| 9 | 还 hái / huán; 对 duì; 里 lǐ; 以 yǐ; 都 dōu / dū |
| 10 | 事 shì; 子 zǐ / zi; 生 shēng; 时 shí; 样 yàng |

Specific source checks:

- 那 includes the embedded colloquial **nèi** note, surname **nā / nuó**, and
  the listed **nǎ** variant. 会 includes the embedded Taiwan **huǐ** note,
  also attested in 一会 / 一会儿, as well as accounting **kuài**.
- Retained less common lexical readings rather than just story readings:
  要 yāo, 什 shí, 没 mò, 说 shuì, 吗 má / mǎ, 上 shǎng, 看 kān,
  可 kè, 得 dè, 过 guō, 吧 bā / biā, and 都 dū.
- Compound checks included 什么、怎么、为什么、以为、知道、可以、上回、
  一会、一样、点心、大家、说话、说说、看看、回来、后来、过去、过来、
  过生、看上、会计、得瑟、可汗 and 吗啡. **过生 guò shēng** is a documented
  colloquial birthday expression, not a workaround using an invented meaning
  for 生. It avoids the out-of-pool 日 while retaining a natural spoken usage.
- Supplemental scope check: Wiktionary's [說](https://en.wiktionary.org/wiki/說),
  [知](https://en.wiktionary.org/wiki/知), [能](https://en.wiktionary.org/wiki/能),
  and [那](https://en.wiktionary.org/wiki/那) raw entries distinguish further
  obsolete alternate-glyph uses. These were not merged into the standard
  simplified-character cards, consistently with the existing reference scope;
  no definitions from those pages are redistributed.

### Per-occurrence review

- 一 is **yí** before 个 / 会 / 看 / 到 / 样 / 定, **yì** before 回 / 起 / 点.
  个 is neutral **ge** in the measure phrases. These are authored choices,
  not runtime sandhi rules.
- 不 is **bú** before 会 / 去 / 是 / 在 / 用, otherwise **bù** in these stories
  (e.g. 不好看、不能、不知道). Underlying third tones are preserved.
- 为 is **wéi** in 以为, **wèi** in 为什么 and purpose phrases such as 为我做.
  得 is neutral **de** in 做得…, **děi** in 得去 / 得出去.
- Experiential 做过 uses **guo**; movement/celebration/time-passing uses **guò**.
  In lesson 9, standalone 过去 uses **guò qù**. Directional 出去 / 回来 / 过来
  use neutral **qu / lai** where appropriate; 后来 retains **lái**.
- 还 is **hái** for persistence/addition, but **huán** in the revision's
  怎么还给我们 (giving the gift back). 都 is **dōu** throughout the stories.
- 看上 uses **kàn shàng**; 看看 uses **kàn kan**; 看了看 uses **kàn le kàn**.
  说说 uses **shuō shuo**. 妈妈、儿子、谢谢 and 点心 use **mā ma / ér zi /
  xiè xie / diǎn xin**. 知道 uses the source-attested colloquial **zhī dao**.
  Standalone 心 in 开心 / 心意 is **xīn**, not neutral.
- Used the dictionary-attested 一会 without 儿 for time spans; 儿 occurs only
  as **ér** in 儿子, avoiding a misleading separate full syllable for erhua.
- Every occurrence has its own literal pinyin. Sentence-ending punctuation
  belongs to that sentence array. Longer quoted speech spans separate sentence
  arrays, with the opening and closing quotes in their proper positions.

## Edits and re-review

Initial small-window checks caught out-of-pool 己 in 自己, 日 in 生日, and 思
in 意思. Replaced these with a concrete visit, the sourced colloquial 过生,
and a question about being happy alone. Missing due targets were incorporated
in actual actions or thoughts (e.g. 就 in the invitation's resolution, 在 in
watching Mum bake, 很 in the firsthand report). After revising the checkpoint's
ending, 什 no longer occurred; changed the son's uncertainty to 该说什么,
which expresses the real problem rather than adding an unrelated token.
Rechecked meanings, pinyin, coverage, and lengths after these edits.

A temporary offline helper aligned **manually authored per-sentence syllable
lists** positionally with the authored Hanzi and punctuation and emitted literal
arrays. It did not select readings, infer sandhi, tokenize words, or choose
sentence boundaries. No helper is imported or committed. The final runtime
file has only literal nested data and a type-only import.

## Checks actually run

- **Actual combined curriculum, dynamically imported:** called
  `validatePublishedCurriculum` after appending the eight lessons to the existing
  module in memory. It reports exactly one hard error:
  `modules[0].lessons[7].newCharacters[4]: complete nonempty authored reading list with valid pinyin required`.
  That position is 吧; `validPinyin("biā")` is false because `bia` is absent.
  No length warnings. **This is a failing publication check, not approval.**
- **Actual combined publication policy:** `validateAuthoringPolicy(combined)`
  returns zero errors: exact groups, top-100 restriction, every new/due/revision
  target, checkpoint placement, and future obligations all checked.
- **Diagnostic isolation, not the authored data:** removed biā only from an
  in-memory clone of the 吧 card. `validatePublishedCurriculum` then returned
  zero errors and zero warnings. This confirms there is no second hidden API
  error after its structural gate. The actual file still retains biā and still
  has the documented hard error.
- Checked all **878** new Hanzi occurrences with `validateOccurrenceReference`,
  and confirmed punctuation references are rejected. A TypeScript AST inspection
  found zero runtime call expressions and only the type-only `Lesson` import. Verified eight lessons, seven
  exact introduction groups, all revisions 1, and the pending checkpoint after
  learning 20. This is temporary offline checking, not new unit/runtime logic.
- `npm run authoring:test`: **28 passed**.
- `npm run authoring:typecheck`: **passed**.
- `npx tsc --noEmit`: **passed** (without running source-generating typegen).
- `npm run authoring:check`: **passed** for the unchanged three-lesson baseline
  and its structural revision fixture; this CLI result does **not** validate
  the unregistered expansion.
- `npm test`: **80 passed**, existing Chromium/mobile/SSR regression suite.
  This exercises the currently integrated three lessons, not browser rendering
  of these unregistered lessons. No hosted deployment or new-lesson browser
  acceptance is claimed.

Reproduce the integrated publication check from the repo root:

```sh
node --input-type=module <<'NODE'
import { loadContent } from './authoring/scripts/load-content.mjs';
import { validatePublishedCurriculum, validPinyin } from './authoring/scripts/content-tools.mjs';
import { validateAuthoringPolicy } from './authoring/scripts/authoring-policy.mjs';
const { curriculum } = await loadContent('app/content/curriculum.ts');
const combined = curriculum;
const result = validatePublishedCurriculum(combined);
console.log({ errors: result.errors, warnings: result.warnings, bia: validPinyin('biā') });
console.log({ policyErrors: validateAuthoringPolicy(combined).errors });
if (result.errors.length) process.exitCode = 1;
NODE
```

The expected exit is zero, with `bia: true` and no errors/warnings. No claim is made
that mechanical checks prove Mandarin quality, meaningful reuse, pronunciation
list completeness, or learning efficacy.
