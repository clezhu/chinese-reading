# Initial story drafts — awaiting #7

The source of truth is [`initial-stories.ts`](initial-stories.ts). It exports
`drafts`, each `{ status: "draft", title, lesson }`, with a complete replacement
lesson and proposed content revision 3 (over current runtime revision 2).
It imports the existing introductions,
so changing an introduction requires rechecking all candidates together.

| Target lesson | Working story title | Story / deliberate reuse |
| --- | --- | --- |
| first-characters | 一张旧照片 | A childhood photo is mistaken for a younger brother; repeats 的, 一, 是, 不, 了. |
| people-and-places | 门口的客人 | Waiting for a friend, two people receive his book from a visitor; uses all five introductions and earlier 是/不/的/一/了. |
| everyday-connections | 桌上的盒子 | A note and a box turn out to have been left in the wrong place; uses 有/这/个/上/中 and reuses people/location characters. |

These are new authored story drafts, not renamed disposable prototype text.
Their introductions intentionally preserve the three existing fixture sets;
frequency ranks support broad commonness, not this exact teaching order. Early
texts still need substantial permanent help. Reviewer should assess that load
and revise for naturalness rather than force a dictionary-free story from five
characters or pad it to a target length.

Validation does not change status or publish anything:

```sh
npm run authoring:check:drafts
npm run authoring:bank -- people-and-places --draft authoring/drafts/initial-stories.ts
```

Final Mandarin review, approval, promotion and hosted release are owned by #7.
Record the actual reviewer/date and any outstanding questions in that issue;
there is no final approval recorded for these drafts yet. Follow the promotion
checklist in [`../README.md`](../README.md).
