# THROWAWAY — reader interaction/layout, issue #2

Question: can per-occurrence pinyin remain aligned, independently revealable,
and comfortably wrapped without confusing permanent help with controls?

## Run

From the repository root, with Node.js 18+ (no install):

```sh
node prototype/reader/server.mjs
```

Open <http://127.0.0.1:4173/prototype/reader?variant=B>.
Stop with Ctrl+C. Localhost only; `NODE_ENV=production` refuses to start.

Three structural layout experiments on the same route:

- `?variant=A`: compact native ruby, continuous paragraphs.
- `?variant=B`: flowing independent two-row occurrence cells (default).
- `?variant=C`: labelled sentence bands with unbreakable authored word groups.

Use the floating arrows or Left/Right keys; variant URLs survive reloads.
Switching preserves reveals; reload or **New attempt** starts fresh. Tab to
dotted-underlined characters and use Enter/Space. Revealed controls retain focus
and expose `aria-disabled=true`; further activation is a no-op. Permanent help
is a non-button with a double underline and an explicit accessible description.
The author panel shows the complete current state, including hidden answers.

## Scope

This repository had no application or route to host the experiment. Plain DOM,
CSS and a dependency-free Node static server deliberately avoid establishing a
production framework or abstraction. **This does not replace the React Router /
React / TypeScript / Workers / D1 decisions in spec #1.** No backend mutation,
storage, accounts, flashcards, lesson completion or test suite. Do not merge.

## Checked illustrative fixture (not approved curriculum)

| Sentence | Authored pinyin | Meaning |
| --- | --- | --- |
| 今天我和妈妈去银行。 | jīn tiān wǒ hé mā ma qù yín háng | Today Mum and I go to the bank. |
| 银行门口有两行字。 | yín háng mén kǒu yǒu liǎng háng zì | There are two lines of writing at the bank entrance. |
| 我们慢慢行走，妈妈在我身后。 | wǒ men màn màn xíng zǒu, mā ma zài wǒ shēn hòu | We walk slowly; Mum is behind me. |
| 窗外的风很凉爽。 | chuāng wài de fēng hěn liáng shuǎng | The breeze outside the window is cool and refreshing. |

Language/pinyin desk-check: 行 is háng in 银行 and 两行字, xíng in 行走;
妈妈's second syllable, 们, and 的 use neutral tones. The last sentence stresses
long annotations `chuāng` / `shuǎng`. Training wheels are explicitly 今、银、窗、爽;
all other Han occurrences are revealable. The fixture is not frequency-graded
and is not a proposed lesson. A native-speaker curriculum review remains separate.

IDs are authored sentence IDs plus fixed fixture occurrence offsets. Fine for
this immutable experiment, **not** an ID strategy for editable production content.

See `FINDINGS.md` for observed results and limitations; issue #2 is the decision
record. Screenshots are local browser evidence, not a hosted release.
