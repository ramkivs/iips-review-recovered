/**
 * Program v3.0 — NP-08 / D08 MACRO: D91 §1 data-mode notice.
 *
 * Authorized by: NP-08-D08-MACRO-V-C5-D91-NOTICE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01
 * (D91 §1). Presentation only: this notice states the live-only, fail-closed behaviour of the
 * Macro research surface. It adds no state, storage, preference key, setting, toggle, selector
 * or data-mode control, and it does not imply that LIVE, SNAPSHOT or PIT is user-selectable.
 *
 * The wording is fixed by the authority act and is rendered verbatim.
 */
export const MACRO_DATA_MODE_NOTICE_TEXT =
  'This page retrieves data live from MoSPI. No user setting switches this view to snapshot or point-in-time data. If live retrieval fails, the page reports the failure rather than substituting snapshot or synthetic data.';

export function MacroDataModeNotice() {
  return (
    <aside
      data-testid="macro-data-mode-notice"
      role="note"
      aria-label="Macro data mode notice"
      style={{
        border: '1px solid var(--color-border, #D0D5DD)',
        borderRadius: '6px',
        padding: '8px 12px',
        background: 'var(--color-surface-subtle, #F9FAFB)',
      }}
    >
      <p style={{ margin: 0 }}>{MACRO_DATA_MODE_NOTICE_TEXT}</p>
    </aside>
  );
}

export default MacroDataModeNotice;
