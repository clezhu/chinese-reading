# #7 — Fundamentals author self-review and publication record

Scope: exactly three learning stories; stable lesson IDs; revision 3 for all
three, because both stories and the preceding taught banks change. One module:
`foundations`, displayed as **Fundamentals**. No fourth lesson or early revision.
“Published” here means promoted into local runtime content, not a hosted deploy.

## Author self-review before candidate checks

Reviewed by the authoring AI assistant on 2026-11-09. This is **self-review**,
not independent Mandarin review, human approval, learner testing or a fluency
claim. The owner explicitly permits this workflow for #7.

Used the CLI's exact top-100 window (`authoring:frequency -- --limit 100`) and
static bank briefs, not a full dataset or previous stories. Rechecked the bank
with all three replacement introductions. References and the exceptional
reading-list scope are recorded in `../PRONUNCIATION.md`.

### first-characters — Our mother

我回到家，看见你和妈妈在一起。

你说：“这是我的妈妈，不是你的！”我说：“也是我的妈妈。”

你看看我，不说话了。妈妈说：“你们都是我的儿子啊！”你说：“好吧，我们的妈妈！”

A younger sibling claims exclusive ownership of their mother; her explanation
resolves the misunderstanding. The second-person sibling and narrator are sons,
as explicitly established by 儿子. 我/你 identify the siblings; 的 carries the
ownership contrast; 是 identifies the shared mother; 了 marks becoming silent.
These are meaningful uses, not a target-character string.

Checked 妈妈 mā ma, 儿子 ér zi, 看看 kàn kan, 在一起 zài yì qǐ,
不是 bú shì, 不说话了 bù shuō huà le, and 好吧 hǎo ba. Other tokens use their
ordinary contextual readings. Sentence and paragraph boundaries follow the
narration and individual dialogue turns.

### people-and-places — A quiet storyteller

我们在说家里的事，只有他不说话。

我说：“你不想和我们一起吗？”他说：“我想说，可是我说不好。”

你说：“没事，我们都想听你的。”他看了看我们。这下，他也说起了家里的事。

A hesitant member joins a group conversation after encouragement. 不 expresses
his silence/hesitation; 们 is the group; 这下 signals the change after reassurance;
一 occurs meaningfully in 一起; 他 is the hesitant storyteller. All five first
lesson characters recur: 我/你/的 in dialogue, 是 in 可是, 了 in the final action.
No introduction is inferred from an earlier permanent-help appearance.

Checked 不想 bù xiǎng versus the neutral potential-complement 不 in
说不好 shuō bu hǎo, 一起 yì qǐ, 没事 méi shì, 看了看 kàn le kàn,
家里 jiā lǐ, and 说起了 shuō qǐ le. During pre-check self-review, rejected an
earlier 小时候 phrase because 候 is outside the top 100; made the hesitation
clause 可是 so 是 is meaningfully reused rather than absent.

### everyday-connections — One for each of us

你走过来：“你在做什么？”我说：“点心。这个是你的。”

他也来了：“我想要一个。”你说：“不，这个是我的！”

我说：“你们看，这里还有一个。”你把那一个给他：“这个是你的，我们都有了！”他说：“太好了！”

One child initially protects a pastry, then discovers another and gives it to
the newcomer. The making → competing claims → sharing sequence completes the
scene. New 么 is in 什么, 在 marks ongoing making, 有 establishes enough for
both, 个 counts the pastries, and 好 expresses the happy resolution. All ten
earlier introductions carry ordinary dialogue, possession, negation, counting
or participant meanings; both due groups are covered at offsets 1 and 2.

Checked 点心 diǎn xin (neutral 心, not the isolated noun 心 xīn), 什么 shén me,
走过来 zǒu guò lái, 一个 yí ge, 那一个 nà yí ge, 还有 hái yǒu, neutral 个 in
这个, and 好了 hǎo le. “点心。这个是你的。” is two sentence arrays in one
paragraph; its quotation deliberately spans the two sentences.

## Help load and limits

All three are tiny complete scenes rather than lists or previous-fixture
rewrites. Substantial permanent pinyin is intentional at only 5/10/15 taught
characters. It supports useful words (妈妈, 儿子, 点心) rather than pretending
that a five-character inventory permits dictionary-free beginner prose.
Measured help load after publication:

| Lesson | Hanzi | Taught occurrences | Permanent-help occurrences | Distinct help Hanzi |
| --- | ---: | ---: | ---: | ---: |
| first-characters | 62 | 23 | 39 | 22 |
| people-and-places | 64 | 29 | 35 | 20 |
| everyday-connections | 68 | 45 | 23 | 19 |

This remains a substantial lexical/comprehension load, not a claim that knowing
the taught characters means understanding every word. No training-help flags,
word grouping, dictionary inference or extra runtime curriculum are introduced.

## Validation / post-change review

The first candidate check rejected 己 in 自己 (outside the top 100). Replaced
自己的事 with 家里的事 and **self-reviewed again before rechecking**: 家里
jiā lǐ is a natural reference back to the group's conversation about home;
the resolution and every mandatory target are preserved. Rechecked the full
Chinese/pinyin alignment, not merely the two changed tokens. No padding or
new introduction was used to evade the pool restriction.

After that edit, all three real revision-3 candidates passed
`npm run authoring:check:drafts` together: zero errors/warnings, 62/64/68 Hanzi.
Promoted those exact token arrays into `app/content/fundamentals-stories.ts`;
retired executable candidates with an empty compatibility export. The previous
photo/visitor/box drafts remain only in tracked history, not active runtime or
replaceable candidates.

**Post-promotion self-review:** printed and reread every saved Chinese sentence
and aligned pinyin line from the actual runtime export. Rechecked the three
scene resolutions, meaningful new/due use, neutral tones, 一/不 sandhi,
quotation-spanning sentence boundary, and help load. No further language or
pinyin changes were needed after promotion. Assertions confirmed the single
Fundamentals module, exact ordered introduction groups, three stable lesson
IDs, all revisions 3, and the absence of stale pending candidates.

Executed checks:

- `npm run authoring:check`: **pass**, published policy, zero errors/warnings;
  separate structural revision fixture also checked. Future obligations are
  pending rather than a reason to add a fourth lesson.
- `npm run authoring:check:drafts`: **pass** after retirement; empty replacement
  set over the published baseline, not a claim that active drafts remain.
- `npm run authoring:typecheck`: **pass**.
- `npm run typecheck`: **pass**.
- `npx tsc --noEmit -p tests/tsconfig.json`: **pass**.
- `npm run test:revision:check`: **pass**; illustrative revision files unchanged
  by the content owner.
- `npm run build`: **pass**, including the publication-policy prebuild gate.
- `git diff --check`: **pass**.
- `npm run authoring:test`: final integrated result **28/28 pass** after adapting
  three old multi-module/paragraph test assumptions to explicit fixtures and
  adding explicit full-pool training-wheel fade-out coverage.

Browser/hosted release evidence is recorded separately in `docs/release-7.md`.
No unresolved contextual
pronunciation choice was identified in self-review. The remaining reference
caveat is the rare/variant scope of the 么 reading list, documented in
`../PRONUNCIATION.md`; this does not change its story reading **me**.
