# GTM Selector Audit

## Summary
- **Inputs mapping & layout:** PASS
- **Motion library & scoring:** FAIL
- **Explanation engine usage:** PASS
- **Recommended motions behavior:** PASS
- **Selected GTM Path behavior:** PASS
- **Saved GTM Plans layout:** FAIL
- **Type/logic issues:** FAIL

## Findings

1) **ACV mapping bypasses user selection**
- **Location:** `components/compass/tabs/gtm-selector-tab.tsx` → `selectorInputs` construction uses `mapAcvToScoring(acvBand)`; `lib/gtm-scoring.ts` → `mapAcvToScoring`.
- **Issue:** `mapAcvToScoring` only maps size-like keys (`smb`, `mid-market`, `enterprise`, `strategic`). UI values are `"low" | "mid" | "high"`, so every selection defaults to `"mid"`. ACV-driven scoring is effectively ignored, distorting ACV fit, effort, impact, and match percentages across both Recommended Motions and Selected GTM Path.
- **Impact:** Logic / scoring correctness.
- **Suggested fix:** Expand `mapAcvToScoring` to recognize `low`, `mid`, and `high` values and fall back to `mid` only when unknown.

2) **Saved plan cards omit required context**
- **Location:** `components/compass/tabs/gtm-selector-tab.tsx` → Saved GTM Plans grid.
- **Issue:** Cards show name, motion, date, and Active badge, but omit the requested segment summary (industry, size) and effort/impact mini-summary. Status is only implied by Active badge (no Draft/Archived handling).
- **Impact:** UX clarity / completeness for saved plans section.
- **Suggested fix:** Add segment and effort/impact summaries (e.g., chips or small text rows) and render an explicit status badge for non-active plans.

3) **SelectorInputs omits optional fields from scoring change detection**
- **Location:** `components/compass/tabs/gtm-selector-tab.tsx` → `selectorInputs` useMemo dependencies.
- **Issue:** `selectorInputs` only depends on ACV, size, objective, personas, and time horizon. Adjusting ICP/industry/region fields or optional enhancers does not trigger recomputation, even if future scoring hooks need them. While not currently used by the scoring engine, this makes future additions easy to forget and can lead to stale recommendations.
- **Impact:** Robustness / maintainability.
- **Suggested fix:** If new fields will influence scoring, include them in `selectorInputs` (and dependency array) when wiring them up; otherwise, document that they are intentionally excluded from scoring.

## Final verdict
Requires fixes before being considered production-ready — ACV selection currently has no effect on scoring, and Saved Plans lack required context/status presentation.
