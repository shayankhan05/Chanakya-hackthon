# SME Compliance Copilot Complete Guide

User manual and implementation reference

Version 1.0 | 24 October 2026

This guide explains the application as implemented: what each screen shows, what every user control does, how the compliance rules work, where information is saved, and what needs further development. It is written for SME owners, hackathon presenters, and developers who will extend the application.

The application is a working prototype and full-stack foundation. It provides compliance visibility and task workflows. It does not verify legal compliance, submit government filings, or guarantee that a business will avoid notices or penalties.

## 1 Understanding the application

### Purpose and everyday use

SME Compliance Copilot brings business details, potential compliance obligations, tasks, risk indicators, and deadlines into one workspace. Instead of expecting an owner to understand every regulation first, it starts with a business profile and highlights matters that need review.

The basic journey is: describe your business, review potentially applicable laws, investigate open risks, prepare the required documents, perform the real action through the appropriate channel, and record completion in the app. The assistant can explain the next step in plain language.

An owner can use the Overview screen as a daily starting point. A finance team member might focus on GST and professional tax tasks. An HR or operations team member might review EPF, ESI, and POSH-related obligations. These are suggested ways to use the product; separate team roles and staff accounts are not implemented.

### Ten core modules in the current build

| Module | Current behavior |
| --- | --- |
| SME onboarding | Editable business profile with employee, turnover, state, branch, export, and registration details. No separate onboarding wizard. |
| Applicability engine | Deterministic rules flag potential obligations and explain why they were flagged. |
| Compliance monitoring | Task list, statuses, dates, registration declarations, and sample renewal display. |
| Event monitoring | Compares manually saved business profiles to detect selected changes. |
| Rule engine | TypeScript rules power the screen; enabled database rules power profile-save evaluation outside demo mode. |
| Risk and notice prevention | Open task priorities highlight issues to investigate. No predictive notice model or government notice integration. |
| Impact assessment | Task details show explanation, law label, documents, sample date, effort, and qualitative potential impact. |
| AI assistant | Chat panel with mock replies or an optional live OpenAI response. |
| Action plan generator | Every task opens a predefined four-step plan with task-specific documents. Live AI can suggest additional steps in chat. |
| Alerts | In-app task-based notifications and risk indicators. No email, SMS, push delivery, or background scheduler. |

### Demo mode and connected mode

In demo mode, the app loads Acme Technologies and six sample tasks. Profile edits, task completion, and business events are saved in the current browser's local storage. The API acknowledges demo saves without writing them to PostgreSQL. The assistant uses sample replies even if an OpenAI key is present.

In connected mode, the dashboard requires authentication. Profiles, registration declarations, applicable-law records, and task updates use PostgreSQL through Prisma. Connected mode needs a configured database, NextAuth secret, and GitHub OAuth credentials. A live assistant also needs an OpenAI API key. Chat remains mock if that key is missing.

Several visual elements still use sample content in both modes. The owner name and initials, greeting, license summary, historical score improvement, and Overview coverage labels are examples. They should not be interpreted as account-verified or live regulatory data.

## 2 Navigating the workspace

### Sidebar and shared controls

| Control | What happens when you use it |
| --- | --- |
| ComplianceCopilot logo | Returns to Overview. It is a navigation link, not a compliance refresh action. |
| Business workspace card | Opens the business profile editor with the current values. The up/down icon does not open a multi-company switcher. |
| Overview | Shows the summary dashboard, priority issues, action list, deadlines, assistant prompt, sample license summary, and coverage tiles. |
| Applicable laws | Opens the rule-based applicability cards and official reference links. |
| Tasks & action plans | Opens the complete task list with search and a status filter. |
| Deadlines | Opens the interactive monthly calendar and date-filtered task list. |
| Registrations & licenses | Opens the declared-registration list and a button to edit those declarations. |
| Risk & alerts | Shows all unfinished tasks as risk cards and a business-event list. Its red badge counts unfinished High-priority tasks only. |
| AI assistant BETA | Opens the assistant side panel without sending a question. BETA is a label, not a button. |
| Review your risks | Opens Risk & alerts from the sidebar information card. |
| Business settings | Opens the same business profile editor. There is no separate settings page. |
| Help & support | Opens the assistant and fills in “How do I get started?” You still need to send it. It does not contact a support agent. |
| Aarav Sharma account area | Opens /login. The name, initials, and Business owner role are sample display text. There is no account menu or sign-out control here. |
| Mobile menu icon | Shows or hides the sidebar on smaller screens. Choosing a sidebar destination closes it. |

The main modules are views inside the root dashboard page, not separate URLs. Choosing a module resets task search and status filters. Refreshing the page returns to Overview. The browser Back button is not an in-app history of module selections.

### Header and controls available on every module

| Control or display | Behavior |
| --- | --- |
| Workspace breadcrumb and module name | Show your location. They are text, not separate navigation links. |
| Demo workspace or Business workspace indicator | Describes the configured operating mode. The green dot does not verify regulatory feeds or service health. |
| Notification bell | Toggles a small Recent notifications panel listing the first three unfinished tasks in their current order. |
| Notification row | Opens that task's action-plan dialog and closes the notification panel. |
| Red notification dot | A fixed visual indicator; it is not an unread counter. There is no mark-as-read action. |
| Top-right AS avatar | Decorative account identity. Clicking it does not open a menu. |
| Export report | Downloads a plain-text file named compliance-report.txt. It includes the business name, state, employee count, score, every task's title/status/date/priority, and a guidance note. It exports all tasks even when a view is filtered. |
| Ask Copilot | Opens the assistant side panel. It does not automatically send a message or run a full business audit. |

Successful profile saves, task completion, and downloads show a temporary message near the bottom of the screen. Save failures show an error message instead. These messages disappear after about 4.5 seconds.

## 3 Reading the Overview dashboard

### Business summary and attention banner

The business summary displays the profile's name, state, employee count, and industry. The screen appends “Pvt. Ltd.” to the name for presentation; the profile has no legal-entity-type field, so that suffix is not a verified company classification. View business profile opens the editor.

The indigo attention banner displays the number of unfinished High-priority tasks. Review now opens Risk & alerts. The banner is a shortcut, not a separate assessment engine.

### Four main dashboard metrics

| Widget | Exact current meaning |
| --- | --- |
| Compliance health | A score derived only from task completion. Formula: round(72 + 28 × completed tasks / max(total tasks, 1)). |
| Applicable laws | Number of matched TypeScript rules for the current business profile. This can increase to seven when the export flag triggers IEC review. |
| Pending tasks | Every task whose status is not Completed. In progress is included in this number. |
| Critical risks | Unfinished tasks whose priority is High. It is a task-priority count, not a legal penalty calculation. |

With six sample tasks and none completed, health is 72. Completing one gives 77; two give 81; three give 86; four give 91; five give 95; all six give 100. An empty task list also produces 72 because the denominator is protected against zero.

The labels “Looking good” and “+8 pts this month” are fixed sample text. There is no stored score history or weighted legal assessment behind them. A score of 100 means the listed tasks are marked complete; it does not certify legal compliance.

### Panels and shortcuts

Needs your attention displays up to three unfinished High-priority tasks. Clicking a task row or its chevron opens its details. View all opens Risk & alerts. The short Overview descriptions are sample text selected by row position; the task dialog is the better place to read the task's actual stored description.

Your action list previews the first four tasks in their current order, including completed tasks. The task title and right chevron open details. View all opens Tasks & action plans. The small square beside a task looks like a checkbox but is part of the task-opening button; it does not mark the task complete directly.

Upcoming deadlines shows the first three unfinished tasks whose date is on or after the fixed demo cutoff of 24 October 2026. It does not sort them chronologically or refresh that cutoff to today's date. Selecting an item opens details. View compliance calendar opens Deadlines. The small month label is fixed as OCT, so this panel should be replaced with live date formatting before operational use.

Big questions Simple answers provides two entry points. The suggested “What should I prioritize this week?” button opens chat and prefills that question. Start a conversation opens chat without sending anything.

Expiring licenses shows one fixed sample: Shops & Establishment, expiry 12 November 2026, and 19 days left. Review renewal opens the sample task with ID shop. This widget is not populated from the database License model; outside the demo dataset, that task may not exist and the shortcut may do nothing.

Your compliance coverage displays six fixed tiles. GST, Professional Tax, and Shops & Establishment say Registered; POSH and ESI say Review required; EPF says Action required. Those Overview labels do not update from your registration selections. Every tile navigates to Applicable laws rather than opening a law-specific screen. IEC has no Overview tile.

## 4 Setting up and editing your business

### Opening the editor

Use the business workspace card, View business profile, Business settings, or Update registrations. All four open the same form. There is no separate first-run wizard, branch editor, document-upload form, or license certificate editor.

| Field | What to enter and how the app uses it |
| --- | --- |
| Business name | Your business's display name. Required; maximum 120 characters. |
| Industry | A required text description such as IT & Services. It is not a controlled industry classification and does not currently change rule selection. |
| State | A required text value shown across the app. It does not currently select a state-specific rule table. |
| Employee count | A non-negative integer. Drives POSH, ESI, and EPF review rules. |
| Annual turnover | Annual turnover in rupees, not lakhs. For example, enter 8500000 for Rs 85 lakh. Drives the sample GST rule. |
| Branches | An integer of at least one. Flags establishment and professional-tax review and helps detect branch additions. There are no separate branch addresses or branch states. |
| GST registered | A business-profile flag saved independently of the registration checklist. It does not turn off the GST applicability rule. |
| Received a first export order | A boolean flag. Switching it on triggers the sample IEC review rule and can record a first-export event. |
| Existing registrations & licenses | Six checkboxes for GST, POSH, ESI, EPF, Professional Tax, and Shops & Establishment. These control registration labels on the registration screen. They do not verify certificates. |

The API rejects invalid profiles. Its upper limits include one million employees, 10,000 branches, and turnover of 100 trillion rupees. These are technical validation bounds, not SME eligibility definitions.

### Buttons in the editor

Save & review applicability validates and submits the form. In demo mode, it updates browser state, recalculates displayed applicability, and records supported business-change events. Existing sample tasks are not regenerated or removed, so the task list can disagree with a changed profile.

In connected mode, saving upserts the user's profile, replaces applicable-law records and registration declarations, and creates or updates a task for each matching enabled database rule. A new task receives an illustrative date seven days after creation. Existing matching tasks retain their status and due date; their description is updated. Tasks for laws that stop matching are not automatically removed. The page reloads after saving.

Cancel and the top-right X close the form without saving the current edits. Clicking the shaded background does not close this editor. There is no explicit unsaved-changes warning or Escape-key handler.

The GST registered checkbox and the GST checkbox in Existing registrations are independent. They can disagree. For a consistent demo, keep them aligned manually.

## 5 Reviewing applicable laws and rules

The Applicable laws screen shows one card for each matching rule. Every card contains the law name, a reason, a Review required label, and Ask about this law. That button opens the assistant and prefills an explanation request; press Send to submit it.

Official references opens external government reference pages for GST, EPF, and ESI in a new tab. These are reading links, not authenticated filing integrations or an automated legal-update feed.

### Implemented screening conditions

| Rule | Trigger in the application | Intended review |
| --- | --- | --- |
| POSH | Employee count >= 10 | Review Internal Committee requirements. |
| ESI | Employee count >= 10 | Confirm establishment type, notified area, and wage-related coverage. |
| EPF | Employee count >= 20 | Review establishment and employee coverage. |
| GST | Annual turnover > Rs 20 lakh | Illustrative services-registration review. Exactly Rs 20 lakh does not match this rule. |
| IEC Registration | First export flag is true | Review requirements and exemptions for the export activity. |
| Professional Tax | Branch count >= 1 | State-specific review. As every valid profile has at least one branch, this always appears. |
| Shops & Establishment | Branch count >= 1 | Establishment-registration review. This also always appears for a valid profile. |

These are software screening rules, not a statement that each law definitely applies. State, sector, wage, supply type, prior coverage, notifications, and exemptions are not fully modeled. The current rules do not use industry, state, or declared registrations as matching conditions.

The UI uses rules in lib/rules.ts. Connected profile saves evaluate enabled ComplianceRule records in PostgreSQL. If developers edit only the database rules, the stored result and the screen can diverge. A production version should use one authoritative evaluation service and versioned, reviewed rule content.

## 6 Managing tasks and action plans

### Finding a task

Tasks & action plans lists all current tasks. Search tasks or laws filters by text appearing in the task title or law name, without case sensitivity. It does not search descriptions or document names.

The status dropdown offers All tasks, Pending, In progress, and Completed. Search and status filters work together. If nothing matches, the page says “No tasks match your filters.” Navigating to another sidebar module resets both filters.

Each row shows the task title, law, date, and status. Click the title, square indicator, or right chevron to open the same details dialog. There is no task-creation button, assignment control, bulk action, due-date editor, or direct status-edit dropdown in this build.

### Reading task details

The dialog shows a priority and law badge, title, applicability explanation, Sample deadline, Estimated effort, document tags, and Potential impact. It does not calculate a precise monetary penalty. The effort estimate describes the sample workflow, not a guaranteed government processing time.

Every task displays the same four action-plan steps: confirm applicability and registration details; gather documents; submit through the official government portal; save the acknowledgement and set the next reminder. These numbered rows are explanatory text, not individually checkable steps. The app does not open or submit to a filing portal, upload documents, store acknowledgement evidence, or create a reminder from those steps.

Required document tags are a preparation checklist only. Clicking them has no effect. There is no document repository, download, or upload behind the tags.

### Dialog controls

| Control | Result |
| --- | --- |
| Explain with AI | Closes the task dialog, opens chat, and prefills “Help me with” plus the task title. The question is not sent until you submit it. |
| Mark complete | Sends a task-status update. On success, changes the task to Completed, closes the dialog, updates counts and score, and shows a confirmation. |
| Completed | Replaces Mark complete for a completed task and is disabled. |
| Top-right X | Closes the dialog without changing the task. |
| Shaded background | Also closes the task dialog. Clicking inside the dialog keeps it open. |

Mark complete is a self-reported record. It does not validate a registration, make a payment, or file a return. Completed tasks remain in the full task list and calendar, but leave unfinished-task alerts and risk counts. The UI currently has no reopen action and cannot set a task to In progress, although the API accepts those statuses.

## 7 Using the deadline calendar

Deadlines starts at October 2026 on every fresh dashboard mount. It has a month grid on the left and a task list on the right. Previous month and Next month move across months and years. Changing months clears the selected day.

A small indigo dot beneath a date means at least one task has that date. The dot is not a count. Clicking any numbered day selects it and filters the side list to tasks on that day. Before a day is selected, the list shows all tasks for the displayed month.

Clicking a task in the side list opens its action-plan dialog. Completed tasks still appear because the calendar is a record of all task dates, not only pending work.

There is no Today button, day-reset button, calendar subscription, external-calendar sync, date drag-and-drop, recurring-filing generator, or reminder scheduling. If a selected day has no task, the list contains no task entries. To clear the date filter, change months or reload the dashboard; reloading also returns to Overview.

Calendar dates are illustrative unless they have been independently checked. The app does not retrieve filing extensions or state holiday adjustments.

## 8 Tracking registrations risks and business events

### Registrations and licenses

The registration screen shows the six fixed categories, your profile's state and business name, and a status for each. A checked profile declaration produces Registered; an unchecked category produces Review registration. These are user declarations and are not confirmed against a government register.

Update registrations opens the shared profile editor. The right chevron beside a category opens the first task whose law matches that category. If there is no matching task, the chevron does nothing. IEC is not listed in this fixed six-category screen even when its applicability rule matches.

There is no UI for certificate numbers, uploads, expiry-date editing, multiple license records, branch-level registration details, or renewal submission. License and Registration database models exist, but the screen's richer license-management workflow is not implemented.

### Risks and alerts

Risk & alerts shows each unfinished task as a card. The card displays a title, description, and its task priority as High, Medium, or Low risk. Selecting anywhere on it opens task details. There is no separate risk-dismiss, snooze, assign, or resolve button. Completing the related task removes it from this view.

Red denotes High, amber denotes Medium, and green denotes Low in risk-priority badges. Task status uses a different convention: Pending is amber, In progress is indigo, and Completed is green. A green Low-risk badge does not mean a task has been completed.

Risk labels currently come from assigned task priorities. The app does not calculate financial exposure, notice probability, or severity from a statutory penalty formula. The RiskAlert database model is not the source of these cards.

### Business event monitoring

The app compares the previous and newly saved profile. It records Employee count changed for any employee-count change, Annual turnover changed for any turnover change, New branch added when branch count increases, and First export recorded when the export flag changes from false to true.

Each event appears with “Applicability reviewed.” This means a profile comparison and rule review occurred; it does not mean a professional or regulator reviewed the business. Saving identical values creates no event.

Branch reductions and switching export status off do not create events. Changing industry, state, name, or registration declarations also does not create events. License expiry and missed filing are represented by sample tasks; no scheduled watcher detects new occurrences.

In demo mode, event history is saved in local storage. In connected mode, the save handler immediately reloads the page, so the in-memory event list is lost. Persistent business-event storage and a background event pipeline have not been implemented.

## 9 Talking to the AI assistant

### Opening and sending messages

The assistant opens from Ask Copilot, AI assistant, Start a conversation, Help & support, law-card prompts, the weekly-priority prompt, or Explain with AI. The opening greeting is sample text addressed to Aarav, even in connected mode.

Type in “Ask a compliance question” and use the paper-plane Send button or press Enter. The input accepts up to 2,000 characters. Send is disabled while a response is pending or the input is blank. “Copilot is thinking” appears during the request.

The suggestion chips Explain EPF and What is my biggest risk send immediately when clicked. This differs from context buttons such as Explain with AI, which only fill the input. If a request is already running, a new send attempt is ignored.

The X closes chat. Clicking the shaded background also closes it. The conversation stays available while the dashboard component remains mounted, including when navigating between modules, but is not saved to local storage or PostgreSQL. A refresh loses it. There is no New chat, clear-history, attachment, message-edit, voice, or copy button.

### Mock replies and live AI

The mock assistant checks the most recent message. If it contains “epf,” it returns the EPF sample explanation. Otherwise, if it contains “gst,” it returns the GST sample explanation. All other questions receive a general priority checklist about GST, EPF, and POSH. If both terms occur, EPF wins because it is checked first.

Mock replies are fixed examples; they do not inspect task completion or tailor the answer to a changed profile. Asking a detailed ESI, export, or state-specific question can therefore return the generic checklist. This is expected demo behavior.

Live mode sends the current conversation and business profile to OpenAI from the server. It uses OPENAI_MODEL, defaulting to gpt-4.1-mini, with a 20-second request timeout, one retry, and a 700-token completion limit. The server instructs the model to explain conditions, avoid unverified current-law assertions, and never claim it filed documents.

The live request does not include the actual task list, risk alerts, license records, registration certificates, or government documents. It has no retrieval system or live legal search. An assistant reply is not guaranteed to reflect the user's most important open task.

The API accepts at most 30 messages, including assistant messages. The current UI has no automatic history trimming. A sufficiently long conversation may show the generic unavailable message; reloading starts a fresh conversation but loses the existing chat.

### Data and error behavior

No OpenAI request is made in demo mode or when the key is missing. With live AI enabled, the business profile and chat messages are transmitted to OpenAI. The key remains on the server and is not placed in the browser bundle.

If the request fails or validation rejects it, the panel adds “The assistant is temporarily unavailable” and keeps other dashboard workflows usable. It does not automatically retry from the browser or provide live support escalation.

## 10 Working through the sample business

### Starting profile and tasks

The initial business is Acme Technologies, IT & Services, Maharashtra, with 24 employees, annual turnover Rs 85 lakh, one branch, GST marked true, and no first export. The declared registrations are GST, Shops & Establishment, and Professional Tax.

| Sample task | Date in 2026 | Priority | Initial status | Effort |
| --- | --- | --- | --- | --- |
| Complete EPF registration | 28 October | High | Pending | 3 to 5 working days |
| File GSTR-3B for September | 20 October | High | Pending | 1 to 2 hours |
| Constitute your Internal Committee | 30 October | High | In progress | 2 to 3 working days |
| Professional Tax payment | 31 October | Medium | Pending | 30 minutes |
| Verify ESI employee eligibility | 5 November | Medium | Pending | 1 working day |
| Renew Shops & Establishment license | 12 November | Low | Pending | 1 to 2 working days |

The sample task documents vary: EPF lists company PAN, incorporation certificate, employee register, and bank proof; GST lists sales and purchase registers and ITC reconciliation; POSH lists a policy and appointment/consent documents; Professional Tax lists payroll summary and PTRC certificate; ESI lists wage and attendance registers and address proof; the license renewal lists the existing certificate, address proof, and employee details.

### A practical demonstration sequence

1. Start on Overview. Explain the sample counts: 72 health, six applicable laws, six unfinished tasks, and three High-priority risks.
2. Open View business profile. Show the employee count, turnover units, registration declarations, and first-export flag. Cancel if you want to preserve the initial dataset.
3. Open Applicable laws. Show how a matching rule explains its trigger and how official reference links support further review.
4. Open the EPF task. Walk through its explanation, date, effort, four steps, documents, and potential impact. Explain with AI fills a question; press Send to get the mock EPF response.
5. After demonstrating the workflow, mark the EPF task complete. The unfinished count becomes five, High-priority risks become two, and health becomes 77. This demonstrates tracking, not proof of a real filing.
6. Open Deadlines and select 30 October to see the Internal Committee task. Move to November to show ESI and the sample license renewal date.
7. Save a changed profile with 30 employees, two branches, and first export enabled. Applicable laws gains IEC review; the event list records the supported changes. In demo mode the six existing tasks remain unchanged.
8. Export report to download a text snapshot. Explain that the export contains all current tasks and is generated locally in the browser.

To demonstrate threshold boundaries, try 9, 10, 19, and 20 employees. POSH and ESI screening start at 10; EPF starts at 20. Changing the sample count does not rewrite existing demo task explanations.

### Resetting the demo

There is no Reset demo button. A developer can open browser developer tools and run localStorage.removeItem('copilot-v1'), then reload the page. This removes the saved demo profile, tasks, and event history for that browser origin. It does not delete PostgreSQL data.

Local storage belongs to a specific browser profile and origin. A change from port 3000 to port 3001 creates a separate demo storage area. Private browsing, cleared site data, or another device will not share the same saved state.

## 11 Technical architecture and setup

### Stack and request flow

The UI uses Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Lucide icons, and a shadcn-style Button built with Radix Slot, CVA, and class utilities. It is a custom dashboard, not a full installation of every shadcn component.

The root page is server-rendered dynamically. In demo mode it supplies the sample profile and tasks. Otherwise it resolves the signed-in user's email, loads that user's profile and tasks through Prisma, and supplies them to the interactive Dashboard client component. Root-page middleware requires a JWT outside demo mode. Each protected API also checks the server session separately.

GitHub OAuth uses NextAuth with JWT sessions. The User model stores the email and optional name; no NextAuth Prisma adapter or separate Account/Session tables are configured. The business profile is created when the authenticated user saves it. The UI currently supports one business per user.

### Project map

| Location | Responsibility |
| --- | --- |
| app/page.tsx | Loads demo data or authenticated database data. |
| components/dashboard.tsx | Dashboard, module views, forms, dialogs, calendar, chat, and browser persistence. |
| components/ui/button.tsx | Reusable Button variants and styling. |
| app/globals.css | Global styles and Tailwind layers. |
| app/api/profile/route.ts | Profile retrieval and save, database rule evaluation, registration replacement, and task upserts. |
| app/api/tasks/route.ts | Validated task-status updates with ownership checks. |
| app/api/chat/route.ts | Request validation and mock or live assistant responses. |
| app/api/auth/[...nextauth]/route.ts | NextAuth authentication handlers. |
| app/login/page.tsx | Sign-in page and demo navigation link. |
| lib/data.ts | Typed sample business, tasks, law list, and reference URLs. |
| lib/rules.ts | TypeScript screening rules and profile-change detection. |
| lib/auth.ts and lib/db.ts | Authentication configuration, Prisma singleton, and mode selection. |
| lib/validation.ts | Profile request validation. |
| prisma/schema.prisma and prisma/seed.ts | Database structure and repeatable sample initialization. |
| tests/rules.test.ts | Employee/turnover threshold and event-detection tests. |

### Database models

| Model | Purpose and current integration |
| --- | --- |
| User | Email-based application identity; owns one optional SMEProfile. |
| SMEProfile | Business facts and parent record for compliance data. |
| ComplianceRule | Enabled rule definitions with code, field, operator, value, reason, and version. Used by connected profile saves. |
| ApplicableLaw | Stored matched law and reason for a profile. The UI still calculates its own matches. |
| ComplianceTask | Profile-owned task details, date, status, priority, documents, penalty text, and effort. Loaded by the connected dashboard. |
| RiskAlert | Stored alert structure with severity and resolved flag. Seeded, but not the source for the current risk screen. |
| Notification | Message, read state, and creation date. Seeded, but not used by the current notification bell. |
| License | License name, optional number, expiry, and status. Seeded, but not used by the fixed Overview license widget. |
| Registration | Declared registration name, optional number, and status. Used to load saved declarations. |
| ActionPlan | Stored title, JSON steps, priority, and estimated time. Seeded, but the current task dialog uses its own fixed four steps. |

The listed schema contains ten models. Profile-owned records use cascading relations, so deleting a profile at database level can delete its associated records. There is no profile-deletion button in the app.

### API behavior

| Endpoint | Behavior |
| --- | --- |
| GET /api/profile | Demo returns a demo flag. Connected mode returns the authenticated user's profile and related records, or null if none exists. |
| POST /api/profile | Validates business data. Demo returns the profile and evaluated rules. Connected mode saves profile, declarations, applicability, and rule-derived tasks in a transaction. |
| PATCH /api/tasks | Accepts task ID and Pending, In progress, or Completed. Demo acknowledges without a database update. Connected mode updates only a task owned by the authenticated user's profile. |
| POST /api/chat | Validates messages and returns mock or live text. Requires a session outside demo mode. |
| /api/auth/* | Handles NextAuth provider sign-in, callbacks, and session requests. |

Invalid payloads generally receive HTTP 400. Unauthenticated connected API requests receive 401. An owned task that cannot be found returns 404. Chat service failure returns 503. Profile/task server failures return 500 with a generic error.

### Running locally

Install dependencies with npm install. Copy .env.example to .env. Run npx prisma generate, then npm run dev. The default development URL is http://127.0.0.1:3000. The earlier preview used port 3001; a preview URL works only while its server is running.

For connected mode, provision PostgreSQL, set DATABASE_URL, configure the GitHub OAuth application and callback, set GITHUB_ID and GITHUB_SECRET, generate NEXTAUTH_SECRET, and set NEXTAUTH_URL to the actual application URL. Set DEMO_MODE=false. Run npm run db:push and npm run db:seed for development. Production should use reviewed Prisma migrations rather than db push.

The seed creates its sample business under demo@example.com. Signing in with another email does not automatically attach that user's account to the seeded profile. Save a profile for your authenticated account to create its own records.

Live assistant use additionally requires OPENAI_API_KEY. OPENAI_MODEL is optional. Keep keys in environment configuration and do not commit a real .env file. If DEMO_MODE=true, it remains a demo even when database and AI credentials are set. If no DATABASE_URL exists in development, the app also defaults to demo mode; production requires explicit configuration.

Run npm run build for production preparation and npm start to serve it. npm run typecheck and npm run test provide the included checks. On Windows, stop running application processes before regenerating Prisma if its engine DLL is locked.

### Sign-in page buttons

Continue with GitHub starts the configured GitHub OAuth flow and returns to the dashboard after sign-in. It needs actual OAuth credentials; no email/password or signup form is present. Explore the demo workspace links to the root page. It does not switch DEMO_MODE on, so in connected mode an unauthenticated visitor may be redirected back to sign-in.

## 12 Limits troubleshooting and development priorities

### What the app does not yet do

The current app does not file returns, pay tax or contributions, register businesses with government systems, renew licenses, ingest legal notices, guarantee penalty estimates, pull verified business registrations, or verify that a completed task was actually performed.

It has no automated regulatory feed, document retrieval system, scheduled expiry/missed-filing watcher, email/SMS notification service, file uploads, audit trail, approval workflow, task assignees, recurring compliance schedule, billing, multi-company workspace switcher, or persistent chat history. The button and schema foundations do not imply those capabilities are active.

Connected-mode task creation uses database rules, but screen applicability still uses TypeScript rules. Several labels and license summaries remain fixed sample data. The connected-mode profile-save reload also clears business-event history. These are concrete integration gaps to address before presenting the application as a live compliance system.

### Common questions and remedies

| What you see | Explanation or next step |
| --- | --- |
| Changed business details but old task text remains | Demo tasks are fixed samples. In connected mode, existing task descriptions update on profile save but not every field is rebuilt. |
| IEC appears in Applicable laws but not registrations | IEC has a rule but is absent from the fixed six-category registration and coverage arrays. |
| Checked GST registered but registration row says Review | The GST flag and registration checklist are separate values. Align them in the editor. |
| Completed a task but calendar still shows it | The calendar deliberately includes all tasks. Use the status filter on the task screen to isolate unfinished work. |
| Clicking a registration arrow does nothing | There is no matching task. The screen has no separate registration detail view. |
| Same answer to different questions | You are likely using the mock assistant with its three response branches. |
| Chat becomes unavailable after many exchanges | The API permits at most 30 messages; history trimming is not implemented. Reload to begin a new conversation. |
| Demo changes disappeared | Check browser profile, host, port, private browsing, and whether site data was cleared. |
| Business events disappear after connected save | They are not stored in the database and the page reload discards them. |
| GitHub sign-in fails | Check provider credentials, callback URL, NEXTAUTH_URL, and NEXTAUTH_SECRET. |
| Cannot load connected data | Check PostgreSQL availability, DATABASE_URL, generated Prisma client, and applied schema. |
| Preview link does not open | Start the server and use its printed local URL. A local address is not a publicly hosted deployment. |

### Validation and production priorities

The initial implementation passed Next.js production compilation, TypeScript checking, three rule tests, a dashboard HTTP check, a mock assistant request, and a browser check that task details open. The dependency audit reported zero vulnerabilities after the dependency patches at that time. These checks do not constitute an accessibility audit, penetration test, legal validation, or a live PostgreSQL/OAuth/OpenAI integration test.

Before operational rollout, prioritize one authoritative and legally reviewed rule service; proper live deadlines and recurrence; complete license, registration, alert, and action-plan integration; durable event history; authenticated-user display and sign-out; removal of fixed sample statements; evidence and audit records; explicit reopen/edit task controls; and an end-to-end test suite against real infrastructure.

Public AI use also needs distributed rate limits, request-size controls, cost monitoring, and operational error tracking. Dialog focus management, keyboard dismissal, screen-reader behavior, small-screen layouts, and color contrast need a formal accessibility review. These are launch tasks, not capabilities that the current build already provides.

Use this application now to explain the proposed product, test the user journey, and organize illustrative compliance work. Treat actual legal applicability, official dates, and filing completion as matters requiring independent verification.

