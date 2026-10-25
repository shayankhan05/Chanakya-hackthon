# Round-two engineering guide

## What changed

ComplianceCopilot now contains independent deterministic decision-support modules, not LLM-generated schedules. Existing authentication, persistent SQLite records, screening, tasks, evidence, history and Gemini integration remain. No existing business database was reset, migrated to another driver or reseeded.

The six primary sections are preserved. Smart compliance planning is inside Tasks & deadlines. Workforce/law changes and Financial impact are inside Growth planner. Resource shortfalls appear in Risks & alerts. Saved algorithm snapshots can be explained in Ask Copilot. New audit data fits the existing workspace JSON payload; older events remain readable.

## Mathematical model

Let each task t have integer duration h(t), preparation cost c(t) in integer paise, optional importance v(t), allowed people P(t), prerequisites D(t), and a required finish window d(t) where known. Inputs include budget B, total available hours H, the planning horizon, and each person's declared working slots.

The binary variable z(t) selects a task. A candidate assignment y(t,p,s) chooses one person and a consecutive block in that person's declared working slots. A block may span overnight or unavailable days; it cannot jump over another assigned task in that person's available slots. This is a discrete preparation model, not a calendar appointment service.

Constraints:

- Mandatory obligations and their recursive prerequisites have z(t)=1.
- Each selected task has exactly one allowed person and one valid block.
- Sum c(t)z(t) <= B; sum h(t)z(t) <= H.
- Each person can occupy at most one task in each declared working slot.
- Selecting a dependent requires every prerequisite, and each prerequisite finishes before the dependent starts.
- Selected tasks finish within their declared required windows and the planning horizon. Verified deadlines from actual workspace records are enforced server-side. Past verified dates cannot be repaired by a new future schedule.

Objective: maximize the sum of user-entered importance points for optional tasks. Points are preferences, not AI scores, legal risk scores or statutory amounts. Mandatory prerequisite closure is excluded from the optional objective. Ties use deterministic task/candidate traversal; minimum cost and minimum makespan are not extra objectives.

## Solver

The implementation performs exact branch-and-bound over task inclusion, responsible-person assignment and start blocks, in dependency order. It prunes insufficient mandatory budget/hours, unavailable staff/finish windows, and branches whose best possible remaining advisory value cannot improve the incumbent.

Budget/hours demand bounds can prove infeasibility before search. Otherwise an exhausted complete search proves infeasibility within the stated model. It never returns a partial schedule as a feasible complete plan if mandatory work is missing.

Limits: 12 tasks, 3 people, 14 calendar days with declared working hours, whole-hour durations, 50,000 nodes. An exact search limit returns either a feasible but not proven optimal incumbent or unknown feasibility. It never claims an infeasibility proof from a timeout/limit. The conflicting task set in an infeasibility explanation is not promised to be a minimum unsatisfiable core. More complex/multi-person tasks, continuous time and large production schedules would need another solver backend; no OR-Tools runtime was added to this Next.js deployment.

## Required owner inputs

Preparation planning: budget, total work hours, staff availability by day, per-task hours and cost estimates, responsible people, dependencies, optional importance and planning horizon. Actual business task IDs and verified dates are resolved from the authenticated workspace. Unknown legal dates are not promoted into statutory deadlines. A fictional example uses explicit demonstration finish windows.

Financial planning: saved current headcount/state/workplaces/registrations, planned headcount, explicitly entered gross wage per new hire, hiring phases, start date, projection horizon and available expansion budget. Preparation budget and expansion budget are separate concepts.

## Financial arithmetic

Additional employees = planned - current, restricted to hiring in this financial module. Existing reduction screening is retained separately.

Steady monthly gross increase = additional employees x gross monthly wage per new hire. Annual steady gross increase = monthly increase x 12. Projection cost sums the actual active new-hire counts in each month, so later hires incur fewer projected payroll months. All money is integer paise, never binary floating-point arithmetic.

Employer contributions are optional reviewed cohorts with explicit eligibility, coverage, statutory wage bases, date and scheme parameters. They reuse the existing dated payroll calculator per employee before multiplying the cohort count. Gross salary is never substituted for statutory wages. Unsupported future periods, unconfirmed coverage and omitted employees remain visible unknowns. Additional contributions for existing employees newly brought under coverage are not included without their reviewed data. Known expansion cost is not a complete affordability conclusion: recruitment, equipment, benefits, EDLI, administration, unknown contributions and other charges are excluded.

## Explainable change service

The delta service compares previous/new profiles and findings. It distinguishes new potential requirements, newly confirmed screening requirements, continuing coverage, resolved screening conditions, missing data and unchanged results. Each entry retains rule ID/version, effective/review dates, jurisdiction, reason, triggering facts and official reference. New preparation proposals use the same deduplication keys as the existing engine.

Simulations return a read-only delta. Saved profile events now retain a versioned delta alongside existing before/after profiles and rule versions. Unchanged updates do not generate duplicate business events or notices. A screening result is not a government coverage decision, and the local rule catalogue is not proof that every later amendment was checked.

## AI boundary and saved snapshots

The algorithms do not import or require an AI provider. They expose their own explanation traces. A saved analysis stores the server-computed result, assumptions, timestamp and a business/task basis used to flag stale snapshots. It does not mark tasks complete or save a simulated profile. PDF/JSON reports include the saved snapshot.

Gemini receives the owned result through a read-only tool; it is instructed to explain those facts, not invent scores, fees, fines or legal conclusions. A provider outage does not disable the calculator or planner. Sample chat defaults to the configured live provider. When Offline judge mode is explicitly selected, explanations are labeled deterministic local explanations, not online AI responses. User-supplied result objects are ignored; saved results are recomputed server-side.

## Benchmark and accuracy

Run `npm run benchmark:round-two`. Outputs: `docs/ROUND-TWO-BENCHMARK.md`, full JSON, and `/round-two-benchmark.html` in the running app. The fixtures are fictional and disclose costs/deadlines. The deadline-order comparator respects resources/dependencies but can choose optional work before required work. Its inability to construct a schedule is not an infeasibility proof.

The production solver is compared with an independent exhaustive oracle on all 25 benchmark fixtures and 30 additional seeded small problems. Eleven separately specified business-screening transitions cover boundaries, missing facts, continuing coverage and an inactive rule date. These test agreement and logic, not a percentage of legal correctness. No business-outcome improvements or cost-saving percentages are fabricated.

## Difference from a chatbot with plugins

The owned computation produces a constrained schedule with a measurable objective, constraint verification, resource shortfalls and scoped proof/limit status. The LLM does not choose task inclusion, waive a mandatory obligation, compute payroll or create a benchmark result. Any interface, including a chatbot, can explain or call the engine; the engineering contribution is the auditable engine and its correctness evidence, not the wording of its answers.

## Verification commands

`npm test` · `npm run typecheck` · `npm run lint` · `npm run build` · `npm run benchmark:round-two` · `npx tsx scripts/test-round-two-http.mts`.

`EXPECT_OFFLINE=true` on the HTTP test requires the running server to report no live provider key. `RUN_LIVE_EXPLANATION=true` adds a real metered Gemini explanation check and is optional; all mathematical checks are independent of it. The test uses isolated synthetic accounts and preserves existing owners' profiles and records.

Browser visual verification remains blocked by the saved localhost origin policy. No alternate browser or policy workaround was used. Build and backend verification do not substitute for a desktop/mobile interaction review.

## Recorded verification

125 automated tests passed, including an independent-oracle comparison on 25 benchmark fixtures and 30 seeded tiny problems, mandatory constraints, conflicting windows, invalid data, payroll arithmetic, missing contribution information, effective dates, continuing coverage, data isolation and non-destructive simulations. TypeScript, lint and the production build passed (23 generated static pages). The production server was then run with process-only empty Gemini/OpenRouter keys; its actual HTTP status reported liveConfigured=false and all authenticated round-two mathematical/API checks passed. The normal private configuration was restored afterward. No credential file was edited for the offline test. Browser rendering and interactive visual QA remain unverified because the saved browser-origin policy still blocks access.

A real authenticated Gemini explanation of a saved solver result also returned HTTP 200 in live mode. Plan explanation requests expose only the read-only saved-plan tool. A deterministic scope label identifies fictional costs/dates or stale snapshots; model prose cannot remove that label. The first provider attempt during verification returned transient HTTP 503, so external AI availability is not guaranteed; it is not required by the core.

Final verification: the final production rebuild passed with 23 generated pages after the scope-label and input changes. A subsequent authenticated live explanation passed with its fictional-example label present. The app was restored to normal development mode on port 3001. The private .env.local file remains Git-ignored and was not edited during the round-two upgrade.
