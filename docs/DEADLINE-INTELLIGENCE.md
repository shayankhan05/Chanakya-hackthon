# Automatic deadline and completion intelligence

Implemented in the existing ComplianceCopilot application on 25 October 2026. The accounts, SQLite business database, profiles, calculators, source catalogue, simulator, uploads and reports are preserved. New workspace fields are additive; no reset or destructive migration is required.

## What changed

The old task editor let an owner select Completed or Overdue and used the save timestamp as completion time. The monitor trusted any entered legal date. Those behaviors are replaced by separate owner progress, actual action completion, evidence submission, independent review and automatically calculated deadline status.

Owners can select only **Not started** or **In progress**. **Submit completion** opens a separate flow for the actual action date, a suitable completion declaration, optional remarks and selected supporting documents. Direct API requests attempting to set Overdue, Completed or Needs review as owner progress are rejected.

The read-only task status filter still contains automatic/system statuses; filtering does not change an obligation.

## Deadline service and source verification

`lib/deadlines.ts` validates calendar dates, calculates calendar-day differences and determines deadline status. All monitoring uses **Asia/Kolkata**, including the UTC-to-local date boundary. Invalid dates such as 30 February are rejected.

`lib/deadline-monitor.ts` applies the calculation to all tasks and generates lifecycle notifications. `lib/engine.ts` delegates monitoring to it. `refreshWorkspace` persists necessary updates on dashboard access and authorized API reads, with optimistic-concurrency retries. A user does not need to visit task details to trigger monitoring.

A verified deadline carries the reviewed date, applicable rule, business jurisdiction, law, provision, official HTTPS source, review date, review-valid-through date, reviewer, source version, applicability confirmation and extension check. Existing owner-entered dates are preserved as **proposed/unverified**, not promoted into verified statutory obligations. Editing a date/reference invalidates its previous review. Relevant business changes invalidate applicability for unfinished tasks.

This release does **not** automatically synchronize government filing calendars or invent recurring dates from initial setup tasks. An owner can use **Tasks & action plans → Track a dated obligation** to record a filing/payment period and proposed dates. A trusted local reviewer must confirm the actual case-specific deadline, jurisdiction, exemptions and extensions before legal overdue classification begins.

When a review expires or applicability changes, an unresolved previously flagged risk remains visible as a **verification review required** warning. It is not silently treated as resolved, and no new exact overdue duration or fee is asserted from an expired review.

## Status behavior

| Situation | Result |
| --- | --- |
| Verified deadline five days away | 5 days remaining |
| One day away | Due tomorrow |
| Due today | Due today |
| Verified deadline passed, no completion record | Overdue by N days; check actual completion status |
| Completed before/on verified date | Completed on time — subject to verification |
| Completed after verified date | Completed late; historical delay retained |
| Completion declared, no current verified legal date | Completion recorded — legal timing unverified |
| No current verified deadline | Legal deadline needs confirmation |
| Only an internal target passed | Preparation target missed; no legal fee inferred |

Actual completion date and declaration submission timestamp are separate. Each evidence document also retains its own upload timestamp. A later upload cannot move an earlier actual action date or turn an on-time action into a late one.

Legacy Completed records retain their recorded dates as owner declarations, without fabricated proof or independent review. Legacy records with no actual completion date request confirmation rather than declaring a legal breach.

## Completion and evidence

The four stages are stored separately:

1. **Declared by owner**: suitable declaration and actual action date recorded.
2. **Proof submitted**: supporting document is associated with the task.
3. **Proof reviewed**: a trusted reviewer has reviewed the supporting material/declaration.
4. **Obligation confirmed fulfilled**: a distinct reviewer decision after proof/declaration review.

A PDF upload does not automatically advance to reviewed or fulfilled. Where no government document exists, a suitable internal record or declaration can be reviewed. This application does not authenticate documents against government portals.

Uploads support PDF, PNG, JPEG, WebP and plain-text declarations, with type/signature checks, a 2 MB maximum, sanitized display names, random storage names, authenticated business authorization and private attachment downloads. SVG/executables, mismatched types and cross-task evidence references are rejected. Existing text evidence remains accessible.

Amendments and reopening preserve prior declarations and action history. Reopening requires a reason. Changes to compliance requirements reopen the relevant review without erasing past recorded completion. History is available in task details, Growth Impact History and reports.

## Alerts and consistency

Significant unresolved deadlines appear in a prominent dashboard warning with the obligation, reviewed due date, duration, law, possible consequences and **Review and resolve** action. The warning is inline, not a repeated modal on every navigation.

Notifications cover approaching dates, unresolved missed dates, completed-late exposure, completion awaiting review and expired verification of an unresolved risk. Keys are stable and deduplicated. Superseded lifecycle notices become historical; they are not deleted. Marking a notification read or acknowledging a task for review does **not** complete or close the obligation.

The same calculation feeds dashboard rows, task details, calendar summaries, Risk & Alerts, notifications, assistant business context and deadline answers, JSON/PDF reports and the task action-history panel. Reports distinguish declaration, proof and review status and include action/upload timestamps.

The readiness score continues to measure recorded organizational progress, not government-certified legal compliance.

## Supported legal consequence formula

`lib/consequences.ts` contains a versioned, deliberately narrow rule:

**GST-NIL-CENTRAL-2021, version 1** — central component of GSTR-3B late fee, where central tax payable in the return is confirmed nil, for tax periods June 2021 onward, subject to confirmed applicability and relief review.

- Daily central fee: ₹10.
- Central cap: ₹250.
- Formula: `min(days of filing delay × ₹10, ₹250)`.
- The separately reviewed deadline and actual declared filing date determine the delay. Upload date does not.
- Source review date: 25 October 2026. Normal live calculation does not extrapolate this review to later unresolved accrual dates.
- State/UT fees, other tax principal, interest, special relief and discretionary penalties are not inferred. No generic penalty rate is applied to other laws.

Official sources checked:

- [Notification 76/2018–Central Tax, 31 December 2018](https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-76-central-tax-english-2018.pdf): nil-central-tax daily fee; this superseded the earlier 64/2017 notification.
- [Notification 19/2021–Central Tax, 1 June 2021](https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-19-central-tax-english-2021.pdf): cap for June 2021 onward, with separate historical relief provisions.

This rule does not itself supply a statutory deadline. It requires an expressly reviewed GSTR-3B obligation, matching formula version, period, registration status and relief conditions. Unknown or unsupported cases display **“Potential legal consequences — amount needs verification.”** Nothing implies that an authority has imposed a demand or discretionary penalty. No general interest estimator was added in this release.

## Trusted review workflow

Review is a local administrative operation, not a new owner-editable verification checkbox or public endpoint. Use `scripts/review-obligation.mts` after examining the source and business facts:

```powershell
node node_modules/tsx/dist/cli.mjs scripts/review-obligation.mts reviewed-obligation.json
```

For a date review, the JSON has this structure. Replace every placeholder with reviewed real values; these placeholders are intentionally not valid dates or IDs:

```json
{
  "action": "verify-deadline",
  "ownerId": "<authorized-owner-id>",
  "businessId": "<business-id>",
  "taskId": "<task-id>",
  "reviewer": "<reviewer-name>",
  "note": "<case-specific source and extension review notes>",
  "verification": {
    "dueDate": "<YYYY-MM-DD>",
    "ruleId": "GST",
    "jurisdiction": "India",
    "law": "<applicable law>",
    "provision": "<actual deadline provision/notification>",
    "sourceUrl": "<official HTTPS URL>",
    "verifiedAt": "<YYYY-MM-DD>",
    "reviewedThrough": "<YYYY-MM-DD>",
    "version": "<reviewed source/version>",
    "applicabilityConfirmed": true,
    "extensionsChecked": true
  }
}
```

Do not claim review coverage for future notifications that have not been checked. Re-review expired information. Optional consequence fields are `consequenceRuleId`, `consequenceVersion`, `obligationType`, `nilReturn`, `taxPeriod` and `reliefChecked`. The supported fee requires `GST-NIL-CENTRAL-2021`, version `1`, obligation type `GSTR-3B` and all relevant conditions. Do not apply it to a generic GST setup review.

For proof/declaration review use the same owner/business/task/reviewer/note fields with `action: "review-proof"`. A separate subsequent `action: "confirm-fulfilled"` records fulfillment. Confirmation without the proof/declaration review stage is rejected. Both operations leave audit history. This CLI is for a trusted reviewer with local server access; a web-based professional review service is not included.

## Demonstration for the professor

Open **[Deadline demonstration](http://127.0.0.1:3001/demo#deadline-demo)** from the sidebar:

1. Select the fictional GSTR-3B nil-central-tax fixture.
2. Keep deadline **30 October 2026** and simulated current date **2 November 2026**.
3. Click **Run deadline evaluation**. Result: **Overdue by 3 days**, illustrative **central** fee **₹30**.
4. Keep actual completion **28 October 2026**, with mock acknowledgement selected.
5. Click **Submit mock completion**. Result: **Completed on time — subject to verification**, **Proof submitted**; mock upload remains dated 2 November.
6. For a late-completion case, set actual completion to 1 November and submit again. The recorded filing delay is two days, rather than three days to the upload date.
7. Select the fictional POSH action to demonstrate qualitative consequences without an invented numeric fine.

The demo creates an isolated in-memory workspace. It never writes real business data, changes actual statutory dates, uploads a real document or changes the computer clock. Future simulation dates use a bounded rule fixture, not a claim that future law was verified. No real date is supplied by the fee notification.

Browser screenshots: `docs/deadline-overdue-demo.png` and `docs/deadline-completed-demo.png`.

## Monitoring in deployment

By default, monitoring runs when the owner opens the dashboard and when authorized APIs return current workspace data. This is **not a claim of continuous 24/7 monitoring**.

A genuine scheduled server endpoint is available at **POST `/api/jobs/deadlines`**. Configure `DEADLINE_JOB_SECRET` with at least 32 random characters and have deployment infrastructure invoke it with `Authorization: Bearer <secret>`. Missing configuration returns 503; unauthorized requests are rejected. The job monitors workspaces server-side and reports checked/failed counts. It is not automatically scheduled by this code change. No email alert or email-delivery claim is included.

No OpenAI key is required for deadline calculations, local deadline guidance or the demonstration. Live model connectivity remains unverified because the user elected to continue without a key.

## Executed verification

- **77 unit/repository tests passed**, including all 20 requested deadline scenarios, upload validation and review-expiry risk preservation.
- TypeScript checking passed.
- Final production compilation, type checking and page generation passed with `node node_modules/next/dist/bin/next build`; the development server was restored on port 3001 afterward.
- `scripts/test-deadline-e2e.mts`: authenticated tests passed for proposed-date uncertainty, warning on a fresh login/dashboard access, automatic overdue status, no duplicate notices, rejection of manual status flags, report/chat consistency, acknowledgements, on-time declaration, late proof upload, private downloads, unsafe-format rejection, scheduler protection, trusted proof review and separate fulfillment confirmation. Only synthetic records were changed.
- Existing **16 application HTTP checks passed**.
- Existing **32 authenticated assistant checks passed** after updating the deadline assertion to the new explicit confirmation wording.
- Existing calculator endpoints and **12 tax-chat checks passed**.
- Browser confirmed the two-option progress editor, separate completion form, three-day-overdue demo and on-time completion despite later proof submission.

## Files

New services: `lib/deadlines.ts`, `lib/deadline-monitor.ts`, `lib/consequences.ts`, `lib/deadline-guidance.ts`, `lib/evidence-validation.ts`, `lib/deadline-demo.ts`.

New UI: `components/deadline-summary.tsx`, `components/deadline-demo.tsx`, `components/new-obligation.tsx`.

New operations/tests: `app/api/jobs/deadlines/route.ts`, `scripts/review-obligation.mts`, `scripts/test-deadline-e2e.mts`, `tests/deadlines.test.ts` and this guide.

Updated: domain models, central engine, mutations, repository refresh, authorization helper, dashboard page/components, task editor, evidence upload endpoint, workspace list endpoint, reports, assistant context/guidance/provider instructions, calculator-intent separation, `.env.example`, growth test and the existing HTTP/assistant test scripts. The prior task editor is archived under `docs/archive/v1/`.

The remaining limits are explicit: reviewed deadline data must be supplied; government filing status is not synchronized; source reviews expire; professional review currently uses a trusted local CLI; fee support is narrow; interest and discretionary fines are not quantified; and no scheduler or email delivery is activated automatically.
