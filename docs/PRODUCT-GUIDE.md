# ComplianceCopilot — feature and button guide

Updated 25 October 2026. This describes the refined application. Existing accounts and records remain in place.

## Purpose

The app helps an SME owner spot requirements that may change as the business grows. It connects saved business facts, versioned legal screening, tasks, deadlines, certificates, warnings, simulations and guidance. It does not file returns, pay tax, obtain government registration, certify legal compliance or guarantee that no notice will be issued.

## Getting started

Open http://127.0.0.1:3001. Sign up or sign in for a private business workspace. Complete the four short profile steps. Unknown legal eligibility answers can stay Unknown; the app then shows what needs checking instead of guessing. For a public demonstration, choose the sample business at `/demo`; sample changes are saved only in that browser.

The sample starts with Phoenix Tech Solutions, Bengaluru, 8 employees and ₹18 lakh turnover. Its certificate is explicitly fictional. Other sample businesses remain available. A real account never inherits these sample records.

## Navigation and account controls

There are exactly six primary sidebar buttons. The active section is highlighted. On small screens, the menu button opens navigation and the backdrop closes it.

The top-right initials button opens the account menu:

| Control | What it does |
| --- | --- |
| Business Profile & Settings | Opens the existing business profile editor. Save changes reevaluates rules and records actual business changes. |
| Business change history | Shows saved changes and their legal-screening impact, plus completion history. |
| Download PDF report | Downloads a report derived from the current saved workspace. It does not submit anything to a regulator. |
| Export business data | Downloads the structured JSON report. Keep exported business information private. |
| Account & security | Opens the existing authenticated account settings and recovery features. |
| Sign out | Ends the current login session. Saved business records remain. |
| Create a real account | In the sample workspace, opens signup. |

The bell opens notices. Mark read/Mark all read changes read state only. It never closes a legal requirement. Selecting a task-linked notice opens the task. Other notices lead to Important Warnings.

## 1. Overview

Shows the business name, state/city, employee count, annual turnover, unfinished task count, important reviews, next verified future legal due date and latest saved change. There are no certification scores or unnecessary charts.

- **Review what I need to do:** opens the action list.
- **Review task:** opens the selected task's progress, documents and completion controls.
- **Open calendar:** opens the calendar within What I Need to Do.
- **Try a growth plan:** opens read-only planning.
- **View history:** opens the saved business-change history.
- **Review and resolve:** appears when the automatic deadline monitor identifies an unresolved deadline issue. It opens that task; simply clicking does not resolve it.
- **Ask Copilot:** opens Ask AI.

An overdue banner appears when there is an appropriately verified unresolved legal date. Missing proof alone is not treated as a legal breach. An internal preparation target is not displayed as a government due date.

## 2. Laws for My Business

Each law card explains the concept, why it matters for the saved business, its first recommended action and missing information.

| Label | Meaning |
| --- | --- |
| Applies | Supported screening conditions are established on the supplied facts; remaining employee/process details may still need review. |
| May apply | A trigger or exception needs checking before a final conclusion. |
| Does not currently apply | The supported trigger is not established; special or continuing duties may remain. |
| More information needed | Important facts or the applicable state/current legal provision are not sufficiently verified. |

**Recheck current facts** reruns the deterministic screening. **Explain this result** opens Ask AI with that legal topic. Expand **Legal basis and conditions** to see rule version, effective/review dates, jurisdiction, exceptions, deadline caveats and the official source.

Supported domains include GST, EPF, ESI, POSH, Professional Tax, workplace registration, Udyam/MSME classification, IEC/export review and actual license expiry. POSH is an organizational requirement, not a government registration. Coverage does not depend solely on employee count. Continuing EPF/ESI coverage is retained for review when headcount falls.

Karnataka PT and workplace cards use Karnataka/India Code sources. Unverified jurisdictions display a source gap rather than a Maharashtra obligation. Branches in other states still need separate jurisdiction checks.

## 3. What I Need to Do

Three tabs combine useful existing features:

### Action list

Search by task or law. Filter by recorded task state. An owner cannot select Overdue as a progress state. The list shows the task, reason, progress and centrally calculated timing. **Track a dated obligation** creates an obligation record with a proposed date/reference; an owner-entered date is not automatically a verified legal deadline.

### Task details

- **Your progress:** choose Not started or In progress.
- **More details:** optionally edit responsible person, internal preparation target, proposed legal due date/reference and progress note. Changing a proposed date requires another source review.
- **Save progress:** saves progress only. It does not represent filing or completion.
- **Submit completion:** opens a separate completion form.
- **Actual action completion date:** record when the action happened, not when a file was uploaded. Future completion dates are rejected.
- **Completion declaration:** describe the action truthfully; supporting documents are not compulsory for every requirement.
- **Upload proof:** attaches PDF, PNG, JPEG, WebP or text up to 2 MB. The server validates file type/signature and business/task ownership. Uploaded files are private and require authorization to download.
- **Record completion declaration:** saves the actual action date, declaration, optional remarks and selected proof. It does not claim a government portal accepted a filing.
- **Reopen for further work:** requires a reason and preserves previous completion history.
- **Acknowledge for review:** records awareness of an overdue issue. The issue remains open.
- **More details: possible fine or extra charges:** shows any supported estimate, assumptions and source. Unsupported amounts remain unestimated.
- **Action and deadline history:** shows progress, dates, declarations, review and reopening history.
- **Explain with Copilot:** opens contextual guidance for this task.
- **Close:** closes the task dialog.

Completion stages stay distinct: owner declaration → proof submitted → proof reviewed → legal requirement confirmed fulfilled. The last two are a separate trusted-review workflow; owners cannot forge them through the ordinary API. An upload made late preserves an earlier actual completion date.

### Calendar

Previous/next month buttons move the calendar. Today returns to the current India-calendar month. Selecting a day filters recorded dates; selecting it again clears the day filter. Preparation targets and legal dates have separate labels. The timeline uses the same backend deadline/consequence assessment as reports and chat.

### Registrations & licenses

**Add certificate** opens certificate details. A recorded certificate includes kind, associated law, number, registration date, actual expiry if any, reminder preference and status. **Save certificate** stores the record and enables access-time reminders. Selecting an existing row edits it. **Update declarations** opens the business profile.

Certificates are owner-recorded, not government verified. Do not invent expiry dates; Udyam does not require renewal. No reminder email is sent.

## 4. Important Warnings

Lists unfinished issues by urgency, with the reason and next action. Task-linked notices are not repeated as separate warning cards. Open an issue to inspect its deadline, documents and any supported consequences. Other business notices remain available below the task issues and in the bell menu.

Risk levels use documented rule/task/deadline logic. AI does not randomly assign a financial penalty. A confirmed late filing, a missing registration review, an expiring certificate and missing legal facts mean different things.

## 5. Plan My Growth

The compact form asks for a new **total** employee count, planned annual turnover, an optional new branch state and whether exports are planned. It shows the difference from the current team. The branch city and staffing remain unknown until supplied; staff are not silently moved.

**Compare my growth plan** validates the proposal and calls the existing read-only simulation. It displays current/planned facts and affected rules. **More options** expands the full existing profile form for activity, investment, workplace allocation and other details. **Generate Growth Readiness Plan** displays source-backed preparation actions and missing facts. **Hide readiness plan** collapses it.

Simulation never updates actual employees, turnover, tasks, notices, registrations or growth history. To record a real change, use Business Profile & Settings and save it.

## 6. Ask AI

Two tabs: **Ask a question** and **Tax & contribution tools**.

The chat shows conversation history, a clearly labeled answer mode, loading state, retry on request failure, copy-response control and expandable sources. **New conversation** starts a fresh context while retaining older saved messages. **Clear history** asks for confirmation and removes chat history only. Quick prompts ask about POSH, EPF and a growth scenario. The text box and send button submit the question. **More details** expands full local guidance when the default answer is shortened. Source links show authority, jurisdiction and review limitations.

Authenticated requests read the owner's server-side workspace. Client-supplied fake business facts/history cannot substitute for saved data. Hypothetical discussion does not update the business. Follow-up context is retained within the active conversation.

### Online versus local guidance

The official Google Gemini SDK, typed authorized tools and configurable model are integrated server-side. This installation currently has **no GEMINI_API_KEY**, so live connectivity and model quality are unverified. Local answers are openly labeled and cover saved facts, common legal concepts, supported scenarios and calculations. They are a limited fallback, not a genuine unrestricted model conversation. Hindi conversational translation is blocked in local mode; the UI explains that limit.

With a valid server key and quota, tools can read the profile/findings/tasks/warnings/certificates/history, search official material, simulate growth, review a state move and run deterministic calculations or gross wage estimates. The model receives tool results before explaining them. It has no write tool. Missing wages, eligibility, rates or jurisdiction must be clarified.

### Calculators

These remain available beside chat and can be reached by legacy calculator links. They use validated backend arithmetic:

- GST: explicit rate, supply value, inclusive/exclusive pricing, place of supply and confirmed eligible credits. Profit is not automatically taxable supply value. Industry does not establish a rate.
- Ordinary firm/LLP income tax: only the supported financial year and assumptions shown by the form.
- EPF/ESI: explicit coverage/eligibility and contribution wage bases. No automatic ceiling is selected from an unverified old number.

Calculation breakdowns, assumptions, warnings and sources are shown. Unsupported schemes/years or uncertain eligibility do not produce invented liability. Gross hiring wage estimates exclude statutory employer contributions unless separately established.

## Profile editor and saved growth

Four steps: identity, size/locations, activities and existing registrations. Continue/Back navigates the steps; the last step saves. Optional legal-eligibility questions are under More details and may stay Unknown. Numbers are validated, state/city choices checked and workplace staffing cannot exceed total employees. Cancel closes an edit without saving.

An actual save detects changed facts, reevaluates affected rules, creates justified tasks/notices and records readable history. Repeating an identical save does not create duplicate events/tasks/notices. Stale concurrent writes are rejected rather than overwriting another tab's changes.

## Import, export and demonstrations

The footer retains JSON export, a business CSV template and CSV import. Import reads and validates the file, then opens a review form. Nothing is saved until **Confirm CSV update**. Reports use the same workspace, tasks and deadline calculations.

Sample controls switch sample business or reset only the selected browser-local sample. They do not reset a real account. **Open isolated deadline demo** navigates to `/demo/deadlines`. That demonstration has its own fictional clock and records; it never changes the computer clock, legal filing calendar or real workspace.

## Limits to explain to judges

Monitoring runs when the workspace is accessed or changed. The protected background endpoint needs an independently configured scheduler; this installation does not claim continuous monitoring or send email. Only a narrow reviewed central nil-tax GSTR-3B late-fee formula is supported under explicit conditions; other tax, interest, state amounts and discretionary penalties require verification. Official sources can change and jurisdiction gaps remain visible.
