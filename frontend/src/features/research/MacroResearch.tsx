/**
 * Program v3.0 — NP-08 / D08 MACRO: read-only Macro Research surface (IRR side).
 *
 * The one Macro view authorized by the D89 UI-disclosure implementation gate. It mounts the
 * governed D89 source disclosure (DT-1 … DT-8, DT-13) adjacent to the observations it describes
 * and renders only what the existing `/api/macro` chain returned.
 *
 * GOVERNANCE — carried, not expanded:
 *   - D08 boundary: NAS / CPI / IIP only. No other dataset is addressable from this surface.
 *   - MoSPI is designated for the governed NAS/CPI/IIP Macro scope. Provider designation grants
 *     no entitlement, commercial-use, redistribution, caching or retention right; entitlement
 *     remains `B — PARTIALLY ESTABLISHED`.
 *   - Formal Category-A attribution remains NOT DETERMINED and GODL applicability is NOT
 *     ESTABLISHED. Per DT-12/DT-13 this surface shows no licence name and no rights language.
 *   - M-3 is NOT established. Upstream `provenance` carries CANDIDATE implementation dimensions
 *     only, so it is deliberately not rendered as an established fact here.
 *   - DT-8: no data period, base year, freshness, "last evaluated" timestamp, licence status or
 *     source citation is invented. Cells show returned values; an absent value is shown as absent.
 *   - DT-6: no IIPS-generated interpretation, trend, score or recommendation is presented, so
 *     nothing derived can be read as a MoSPI finding.
 *   - DT-7: no MoSPI emblem, seal, logo or other branding is used; the provider line is plain text.
 *
 * LIVE-ONLY / FAIL-CLOSED: a failed, partial or unreadable retrieval is rendered as a truthful
 * failure. There is no snapshot, no cache fallback and no synthetic observation in this file.
 *
 * Authorized by: CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01
 * (scope limited to UI presentation surfaces; transport, source adapters, API clients and
 * `MacroContext.tsx` are consumed unchanged and remain untouched by this gate).
 */
import { MacroProvider, useMacro, type MacroSlice } from './MacroContext';
import { MacroSourceDisclosure, type MacroDisclosureDataset } from './MacroSourceDisclosure';
import type { CpiRecord, IipRecord, NasRecord } from '../../../server/macro/mospi-source.js';

/** One displayed field of a returned observation. Absent values are rendered as absent. */
type Column<T> = {
  readonly label: string;
  readonly value: (record: T) => string | null | undefined;
};

const NAS_COLUMNS: readonly Column<NasRecord>[] = [
  { label: 'Indicator', value: (r) => r.indicator },
  { label: 'Year', value: (r) => r.year },
  { label: 'Series', value: (r) => r.series },
  { label: 'Base year', value: (r) => r.base_year },
  { label: 'Current price', value: (r) => r.current_price },
  { label: 'Constant price', value: (r) => r.constant_price },
  { label: 'Unit', value: (r) => r.unit },
];

const CPI_COLUMNS: readonly Column<CpiRecord>[] = [
  { label: 'Group', value: (r) => r.group },
  { label: 'Sub-group', value: (r) => r.sub_group },
  { label: 'Year', value: (r) => r.year },
  { label: 'Month', value: (r) => r.month },
  { label: 'Base year', value: (r) => r.base_year },
  { label: 'Index', value: (r) => r.index },
  { label: 'Inflation rate', value: (r) => r.inflation_rate },
];

const IIP_COLUMNS: readonly Column<IipRecord>[] = [
  { label: 'Sub-category', value: (r) => r.sub_category },
  { label: 'Year', value: (r) => r.year },
  { label: 'Base year', value: (r) => r.base_year },
  { label: 'Index', value: (r) => r.index },
  { label: 'Growth rate', value: (r) => r.growth_rate },
];

interface ObservationShape<T> {
  readonly records?: readonly T[];
}

function observationsOf<T>(data: ObservationShape<T> | null): readonly T[] | null {
  if (data === null) return null;
  return Array.isArray(data.records) ? data.records : null;
}

interface MacroDatasetPanelProps<T> {
  readonly dataset: MacroDisclosureDataset;
  readonly panelTitle: string;
  readonly columns: readonly Column<T>[];
  readonly slice: MacroSlice<ObservationShape<T>>;
}

/**
 * One governed dataset: title, then the D89 disclosure in the same content area (DT-4), then
 * either the returned observations or an honest refusal. Nothing is derived or substituted.
 */
function MacroDatasetPanel<T>({ dataset, panelTitle, columns, slice }: MacroDatasetPanelProps<T>) {
  return (
    <section
      aria-label={`${panelTitle} observations`}
      data-testid={`macro-panel-${dataset}`}
      style={{
        border: '1px solid var(--color-border, #D0D5DD)',
        borderRadius: '6px',
        padding: '12px 16px',
      }}
    >
      <h3 style={{ margin: '0 0 4px' }}>{panelTitle}</h3>
      <MacroSourceDisclosure dataset={dataset}>
        {slice.loading ? (
          <p data-testid={`macro-loading-${dataset}`} role="status">
            Retrieving governed observations…
          </p>
        ) : slice.error !== null ? (
          <div data-testid={`macro-refusal-${dataset}`} role="status">
            {/* The transport's own message is shown verbatim: upstream 502/400 reach the screen. */}
            <p style={{ margin: '4px 0' }}>{slice.error}</p>
            <p style={{ margin: '4px 0' }}>
              No observation is shown: the governed read did not complete, and no cached, partial
              or synthetic value is substituted.
            </p>
          </div>
        ) : (
          (() => {
            const records = observationsOf(slice.data);
            if (records === null) {
              return (
                <div data-testid={`macro-refusal-${dataset}`} role="status">
                  <p style={{ margin: '4px 0' }}>
                    The governed response did not carry a readable observation set.
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    No observation is shown: nothing is synthesized from an unreadable response.
                  </p>
                </div>
              );
            }
            return (
              <>
                <p data-testid={`macro-observations-count-${dataset}`} style={{ margin: '4px 0' }}>
                  Observations returned: {records.length}
                </p>
                {records.length === 0 ? (
                  <p data-testid={`macro-empty-${dataset}`} role="status">
                    No observations were returned for this governed selection.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table data-testid={`macro-observations-${dataset}`}>
                      <thead>
                        <tr>
                          {columns.map((column) => (
                            <th key={column.label} scope="col" style={{ textAlign: 'left' }}>
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record, index) => (
                          <tr key={index}>
                            {columns.map((column) => {
                              const value = column.value(record);
                              return (
                                <td key={column.label}>
                                  {value === null || value === undefined || value === ''
                                    ? '—'
                                    : value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()
        )}
      </MacroSourceDisclosure>
    </section>
  );
}

function MacroResearchSurface() {
  const { nas, iip, cpi } = useMacro();

  return (
    <div
      data-testid="macro-research"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px' }}
    >
      <header>
        <h2 style={{ margin: '0 0 4px' }}>Macro Research</h2>
        <p style={{ margin: 0, color: 'var(--color-ink-secondary, #475467)' }}>
          Governed MoSPI / e-Sankhyiki observations returned by the IIPS Macro read path (NAS,
          CPI, IIP only). This surface shows only what the governed read returned. It presents no
          IIPS-generated interpretation, trend, score or recommendation.
        </p>
      </header>
      <MacroDatasetPanel
        dataset="NAS"
        panelTitle="National Accounts Statistics"
        columns={NAS_COLUMNS}
        slice={nas}
      />
      <MacroDatasetPanel
        dataset="CPI"
        panelTitle="Consumer Price Index"
        columns={CPI_COLUMNS}
        slice={cpi}
      />
      <MacroDatasetPanel
        dataset="IIP"
        panelTitle="Index of Industrial Production"
        columns={IIP_COLUMNS}
        slice={iip}
      />
    </div>
  );
}

export function MacroResearch() {
  return (
    <MacroProvider nasRequest={{ indicator: 'GVA' }} iipRequest={{}} cpiRequest={{}}>
      <MacroResearchSurface />
    </MacroProvider>
  );
}

export default MacroResearch;
