# Story drafts and promotion

#7's three original, author-self-reviewed candidates are now published locally
in [`app/content/fundamentals-stories.ts`](../../app/content/fundamentals-stories.ts),
under the single **Fundamentals** module. All three are revision 3 and retain
stable lesson IDs. See [`REVIEW-7.md`](REVIEW-7.md) for the Chinese texts,
self-review, source scope, tool-forced edit and actual validation results.
No independent Mandarin reviewer or human approval is claimed.

The user-requested expansion explicitly supersedes the former three-lesson
cap/fourth-lesson prohibition. Production now has 11 lessons in the existing
Fundamentals module, without unit logic: the unchanged first three at revision 3,
learning lessons 4–10 and an all-50 revision at revision 1. The eight new lessons
in [`extended-fundamentals.ts`](../../app/content/extended-fundamentals.ts) are
now integrated by `curriculum.ts`. See [`REVIEW-expansion.md`](REVIEW-expansion.md)
for sources and author self-review. Its pre-integration status/blocker notes are
historical: integration is complete and the validator accepts `bia` for **biā**.
This does not claim hosted deployment.

| Stable lesson ID | Story | Hanzi occurrences |
| --- | --- | --- |
| first-characters | Our mother | 62 |
| people-and-places | A quiet storyteller | 64 |
| everyday-connections | One for each of us | 68 |

The older photo/visitor/box candidates were superseded, not promoted. Their
tracked history is available in Git; no stale executable candidate remains
capable of replacing revision 3. The illustrative reader stories remain only
in `app/content/fixtures/`, separate from the actual published story module.

[`initial-stories.ts`](initial-stories.ts) is now an explicitly empty
compatibility entry point (`drafts = []`) so the existing package command
continues to work without package edits. It checks the published baseline with
no proposed replacements; it does **not** claim three pending drafts were tested.

```sh
npm run authoring:check
npm run authoring:check:drafts
npm run authoring:typecheck
```

Replacements belong in a separately named candidate module, exporting `draft` or
`drafts` with complete replacement lessons, revision greater than the current
publication, and the existing stable IDs. Do not bump to revision 4 merely to
keep an already-promoted draft active. Follow [`../README.md`](../README.md).

New lessons can be authored here, then manually appended to runtime content and
the whole publication checked. The replacement CLI does not append unknown IDs.
