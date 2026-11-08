# Issue tracker: GitHub

Issues and specs (PRDs) live in GitHub Issues for
`clezhu/chinese-reading`. Use the `gh` CLI.

## Operations

Infer the repository from the Git remote.

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels`
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."`
- Remove a label: `gh issue edit <number> --remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Use heredocs for multiline issue bodies.

When a skill says "publish to the issue tracker", create a GitHub
issue. When it says "fetch the relevant ticket", read that issue
and its comments.

## Pull requests as a triage surface

**PRs as a request surface: no.**

Pull requests are not treated as incoming feature requests.
This flag can be changed to `yes` later.

## Wayfinding

For exploratory work managed by `/wayfinder`:

- Keep the map in one issue labelled `wayfinder:map`.
- Link child tickets as GitHub sub-issues, or use a task list
  if sub-issues are unavailable.
- Label children `wayfinder:research`, `wayfinder:prototype`,
  `wayfinder:grilling`, or `wayfinder:task`.
- Record blockers using native issue dependencies, falling back
  to a `Blocked by: #<number>` line.
- Pick the first open, unblocked, unassigned child in map order.
- Claim it by assigning yourself before starting work.
- Resolve it by commenting with the answer, closing the issue,
  and adding a summary and link to the map.
