// Compatibility entry point for `npm run authoring:check:drafts`.
// #7's three checked candidates were promoted to app/content at revision 3.
// Do not re-export published lessons as stale candidate replacements.
// See README.md and REVIEW-7.md; there are currently no pending drafts.
export const drafts = [] as const;
