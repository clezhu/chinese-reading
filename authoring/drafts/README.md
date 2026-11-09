# Story drafts and #7 promotion

#7's three original, author-self-reviewed candidates are now published locally
in [`app/content/fundamentals-stories.ts`](../../app/content/fundamentals-stories.ts),
under the single **Fundamentals** module. All three are revision 3 and retain
stable lesson IDs. See [`REVIEW-7.md`](REVIEW-7.md) for the Chinese texts,
self-review, source scope, tool-forced edit and actual validation results.
No independent Mandarin reviewer or human approval is claimed.

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

New work belongs in a separately named candidate module, exporting `draft` or
`drafts` with complete replacement lessons, revision greater than the current
publication, and the existing stable IDs. Do not bump to revision 4 merely to
keep an already-promoted draft active. Follow [`../README.md`](../README.md).
