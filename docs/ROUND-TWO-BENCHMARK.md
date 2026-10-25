# Round-two deterministic benchmark

Generated 2026-10-25T15:46:40.376Z. All 25 scenarios use fictional costs, availability and finish windows. These are algorithm tests, not legal accuracy measurements or measured business outcomes.

| Measure | Deadline-order baseline | Constraint-aware optimizer |
|---|---:|---:|
| Valid complete schedules (out of 13 feasible inputs) | 8 | 13 |
| Mandatory finish windows satisfied (feasible inputs only) | 19/26 | 26/26 |
| Infeasible inputs flagged (12 total) | 12 greedy failures, not proofs | 12 mathematical infeasibility results |
| Feasible inputs rejected | 5 | 0 |
| Optional importance on the 8 inputs where both completed all required work | 25 | 37 |
| Dependency violations in returned schedules | 0 | 0 |
| Aggregate budget used (example rupees) | 730.00 | 610.00 |
| Aggregate hours scheduled | 71 | 62 |
| Total solver time on this run (ms) | 1.307 | 1.980 |

The baseline chooses earliest-deadline ready tasks, respects staff capacity, dependencies, budget and available hours, and can consume resources on optional work before mandatory work. A greedy failure is not proof that the input is infeasible. The optimizer takes mandatory tasks and prerequisite closure as hard constraints, then maximizes user-entered advisory importance. It returns no partial schedule as a feasible solution when mandatory work is impossible. Thus aggregate spending is not a like-for-like cost-saving measure: the baseline sometimes returns incomplete plans. Neither method has any dependency violations on this fixture set; no improvement is claimed on that metric.

All 25 cases agree with an independent tiny-dataset exhaustive oracle on feasibility and optimal advisory value. 11/11 separately specified screening transitions passed. Transition expectations were reviewed for consistency with the current local rules; they are not independent legal advice or a new source-freshness audit.

## Scenario results

| Scenario | Expected | Baseline complete | Optimizer | Nodes | ms |
|---|---|---|---|---:|---:|
| mandatory-budget-priority-0 | Feasible | No | feasible | 18 | 0.087 |
| mandatory-budget-priority-1 | Feasible | No | feasible | 18 | 0.086 |
| mandatory-budget-priority-2 | Feasible | No | feasible | 18 | 0.084 |
| mandatory-budget-priority-3 | Feasible | No | feasible | 18 | 0.138 |
| mandatory-budget-priority-4 | Feasible | No | feasible | 18 | 0.076 |
| budget-shortfall-0 | Infeasible | No | infeasible | 0 | 0.064 |
| budget-shortfall-1 | Infeasible | No | infeasible | 0 | 0.043 |
| budget-shortfall-2 | Infeasible | No | infeasible | 0 | 0.053 |
| budget-shortfall-3 | Infeasible | No | infeasible | 0 | 0.038 |
| budget-shortfall-4 | Infeasible | No | infeasible | 0 | 0.065 |
| deadline-overload-0 | Infeasible | No | infeasible | 0 | 0.089 |
| deadline-overload-1 | Infeasible | No | infeasible | 0 | 0.044 |
| deadline-overload-2 | Infeasible | No | infeasible | 0 | 0.036 |
| deadline-overload-3 | Infeasible | No | infeasible | 0 | 0.036 |
| deadline-overload-4 | Infeasible | No | infeasible | 0 | 0.042 |
| dependency-choice-0 | Feasible | Yes | feasible | 24 | 0.133 |
| dependency-choice-1 | Feasible | Yes | feasible | 24 | 0.129 |
| dependency-choice-2 | Feasible | Yes | feasible | 24 | 0.121 |
| dependency-choice-3 | Feasible | Yes | feasible | 22 | 0.158 |
| dependency-choice-4 | Feasible | Yes | feasible | 22 | 0.120 |
| staff-window-0 | Infeasible | No | infeasible | 0 | 0.054 |
| staff-window-1 | Infeasible | No | infeasible | 0 | 0.040 |
| staff-window-2 | Feasible | Yes | feasible | 3 | 0.097 |
| staff-window-3 | Feasible | Yes | feasible | 3 | 0.059 |
| staff-window-4 | Feasible | Yes | feasible | 3 | 0.088 |

## Limits

Exact discrete model: at most 12 tasks, 3 responsible people, 14 working days, whole-hour tasks and 50,000 search nodes. Tasks retain one person and consecutive declared working slots, pausing only outside their working hours. Larger sets are rejected, and a search-limit outcome is explicitly not an infeasibility proof. Equally valued schedules are resolved by deterministic traversal; minimum cost or minimum completion time is not a second optimization objective. Both methods were warmed up on all fixtures before timing. Timings vary with hardware and load. No LLM calls were made for this benchmark.
