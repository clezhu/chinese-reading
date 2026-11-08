# Domain docs

## Layout

This repository uses a single context:

- `CONTEXT.md` — domain terminology and model.
- `docs/adr/` — architectural decision records.

## Before exploring

Read root `CONTEXT.md` and any ADRs relevant to the work.

If these files do not exist, proceed silently. Do not suggest
creating them upfront. The domain-modeling skill creates them
as terminology and decisions are resolved.

If `CONTEXT-MAP.md` is introduced later, follow its links to
relevant context documents and context-specific ADRs.

## Vocabulary

Use the terms defined in `CONTEXT.md` in issues, code proposals,
and tests. Avoid synonyms the glossary explicitly rejects.

If a needed concept is missing, reconsider the term or note the
gap for domain-modeling.

## Decision conflicts

Explicitly flag proposals that contradict an existing ADR.
Identify the ADR and explain why its decision may need revisiting.
