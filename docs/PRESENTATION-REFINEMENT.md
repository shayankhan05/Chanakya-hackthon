# Presentation-driven product refinement

Reference: C:/Users/Hp/Desktop/Surjana 2026 presentation2.pdf (eight slides, visually reviewed as rendered PDF pages).

## Product intent

The Growth Trap: changes in employees, turnover, workplaces and exports can trigger new compliance reviews. The app should connect business facts to applicability, risks and dates, action tasks, understandable AI guidance, and progress reports. The presentation is a product reference, not an authoritative legal source. Its architecture illustrations do not establish specific legal thresholds or mandatory deadlines.

## Implemented changes

- A redesigned business overview presents task progress, laws to review, priority actions and certificate renewals within 30 days. Progress is explicitly owner-recorded, not a legal compliance certificate.
- Action rows connect priorities to document counts, tasks and next steps. Calendar previews use only verified deadlines. Unverified preparation targets are not presented as statutory dates.
- Growth Radar generates hiring, branch and export previews from the existing deterministic simulator. Example hiring targets are planning milestones, not universal legal thresholds. Multiple workplaces require explicit staff allocation. Preview calculations never save a business change.
- Explore buttons prefill the existing planner with the selected employee target, export activity or branch state. The owner reviews and compares the plan before any separate business-profile update.
- Recent saved business events and active warnings appear together. Profile changes, findings, tasks, documents and reports remain connected to the existing workspace.
- Direct navigation exposes the calendar, registrations/licenses and change history. A six-step workflow reflects the presentation: profile, law check, risks/dates, tasks/documents, AI guidance, progress/reporting.
- Landing, dashboard, shared buttons, chat typography and authentication branding now use a restrained navy/blue visual system, consistent spacing and responsive CSS. No external font service or image dependency was added.
- Live Gemini chat, profile privacy, source metadata, authenticated workspace checks, bounded retries and explicit live errors are preserved.

## Features retained

Onboarding, conditional state-specific rule evaluation, deadlines and consequences, evidence uploads, owner completion declarations, registered certificates, read-only growth simulations, deterministic tax/payroll calculations, official legal-source retrieval, live AI, conversations and PDF/JSON reports continue using existing services and persistent SQLite business records.

## Limits shown honestly

The app monitors recorded facts and dates on access or update. It does not ingest employer payroll or government portal data automatically. Email/WhatsApp delivery and a background scheduler are not enabled by this change. Certificate details are user recorded. Legal-source freshness, applicability exceptions, unconfirmed facts and unverified dates remain visible. No legal notice or penalty avoidance guarantee is made.

## Verification

108 automated tests passed, including simulator consistency, read-only previews, multi-workplace clarification, privacy, account isolation, deadlines, calculators and chat regressions. TypeScript, lint and the production build passed (all 21 generated static pages). The application was restarted on port 3001.

Browser visual review was requested and approved by the user, but the browser tool rejected access to http://127.0.0.1:3001 under a saved origin-permission policy. No alternate browser or policy workaround was used. Desktop/mobile layouts are implemented but have not been visually verified in a browser in this run.
