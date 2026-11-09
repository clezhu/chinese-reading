# Hanzi Garden — approved UI handoff

The user approved the latest artwork and screen mockups on 9 November 2026.
Implement this as **one coordinated UI update**, with the GitHub issue as the
authoritative implementation specification. No working application changes were
made during the design interview.

## Start here

- [Main screen overview](mockups/contact-sheet.png)
- [Reader and flashcards](mockups/learning-contact-sheet.png)
- [Lesson completion](mockups/flow-contact-sheet.png)
- [Desktop login/signup](mockups/auth-contact-sheet.png)
- [Mobile login/signup](mockups/auth-mobile-contact-sheet.png)
- [Validation states](mockups/auth-validation-contact-sheet.png)
- [Main mockup index and responsive/navigation details](mockups/NOTES.md)
- [Remaining screen index, learning-state mapping and auth rules](mockups/LEARNING-AND-AUTH.md)
- [Artwork assets, dimensions, transparency and known production cleanup](artwork/MANIFEST.md)

The `.drawio` files and individual `.drawio.png` previews are editable references.
Contact sheets are overview images. Generated sample JSON is design evidence,
not a replacement runtime curriculum or data source. Asset paths in the manifest
are relative to `artwork/`; preview paths in mockup indexes are relative to
`mockups/`.

## Approval and limitations

The older documents' “review only”, “not approved”, and “tickets wait” wording
describes their generation stage. **Visual direction and the latest v3 mockups
are now approved.** They remain static design artifacts, not implemented or
functionally verified features. Read the GitHub issue for the final combined
requirements; it takes precedence over earlier proposals and historical notes.

The user approved the soft painterly artwork **as shown**. Do not replace it
with a crisper, more cartoonish or photographic style. The homepage mockup uses
the flattened concept for visual approval; the production requirement is still
separate scenic layers with slowly moving pink fog between them. Layer alignment,
halos, opacity, overscan and seamless motion need implementation-time cleanup.
Do not treat the rough composite as finished production artwork or silently
substitute a wholly static homepage. Login and lesson-list scenery stay static.

The original user screenshots and watermarked inspiration were local temporary
files. They are not required implementation dependencies: approved generated
assets, editable layouts, previews and notes are all preserved here. Do not copy
stock-reference pixels or TypingClub branding into the app.

Only design artifacts are included in this handoff. No app changes, dependency
updates, database migrations, test claims or deployments are implied.
