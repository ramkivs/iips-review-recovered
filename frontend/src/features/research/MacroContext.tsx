/**
 * Program v3.0 — NP-08 / D08 MACRO: MacroContext (IRR consumer surface).
 *
 * Governed transport chain:
 *   MacroContext -> /api/macro -> guarded read -> MoSPI route
 *
 * NOTE ON `authFetch`: the authorized chain was documented as
 * `MacroContext -> authFetch -> /api/macro`. The repository has NO `authFetch`
 * primitive — every `src/api/*.ts` client uses plain `fetch`. Introducing an
 * authFetch wrapper here would (a) create authentication infrastructure and
 * (b) contradict the authorized NO-AUTH posture (D3 Option A). This is the
 * minimal correction the current repository requires, recorded explicitly.
 *
 * GOVERNANCE — carried, not expanded:
 *   - D08 boundary: NAS / CPI / IIP only.
 *   - MoSPI is NOT designated. No entitlement, commercial use, redistribution,
 *     caching or retention right is granted or implied.
 *   - M-3 is NOT established; provenance returned upstream carries CANDIDATE
 *     implementation dimensions only.
 *
 * LIVE-ONLY / FAIL-CLOSED: a failed or partial retrieval leaves `data` null and
 * surfaces `error`. There is no snapshot, no cached fallback, and no synthetic
 * observation anywhere in this file.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchMacroCpi,
  fetchMacroIip,
  fetchMacroNas,
  type CpiRequest,
  type IipRequest,
  type MacroIipResponse,
  type MacroResponse,
  type NasRequest,
} from '../../api/macro';
import type { CpiRecord, NasRecord } from '../../../server/macro/mospi-source.js';

export interface MacroSlice<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export interface MacroContextValue {
  readonly nas: MacroSlice<MacroResponse<NasRecord>>;
  readonly iip: MacroSlice<MacroIipResponse>;
  readonly cpi: MacroSlice<MacroResponse<CpiRecord>>;
  readonly reload: () => void;
}

/** Injectable for tests; defaults to the real governed clients. */
export interface MacroFetchers {
  readonly nas?: typeof fetchMacroNas;
  readonly iip?: typeof fetchMacroIip;
  readonly cpi?: typeof fetchMacroCpi;
}

export interface MacroProviderProps {
  readonly nasRequest?: NasRequest;
  readonly iipRequest?: IipRequest;
  readonly cpiRequest?: CpiRequest;
  readonly baseUrl?: string;
  readonly fetchers?: MacroFetchers;
  readonly children: ReactNode;
}

const EMPTY: Pick<MacroSlice<never>, 'loading' | 'error'> = { loading: false, error: null };

const MacroContext = createContext<MacroContextValue | null>(null);

export function MacroProvider({
  nasRequest,
  iipRequest,
  cpiRequest,
  baseUrl = '',
  fetchers = {},
  children,
}: MacroProviderProps) {
  const [nas, setNas] = useState<MacroSlice<MacroResponse<NasRecord>>>({
    data: null,
    ...EMPTY,
  });
  const [iip, setIip] = useState<MacroSlice<MacroIipResponse>>({ data: null, ...EMPTY });
  const [cpi, setCpi] = useState<MacroSlice<MacroResponse<CpiRecord>>>({
    data: null,
    ...EMPTY,
  });
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  // Serialized request keys keep the effects stable when a caller passes an
  // inline object literal (a new identity each render would otherwise loop).
  const nasKey = nasRequest ? JSON.stringify(nasRequest) : null;
  const iipKey = iipRequest ? JSON.stringify(iipRequest) : null;
  const cpiKey = cpiRequest ? JSON.stringify(cpiRequest) : null;

  // NAS — indicator must be explicitly governed by the caller.
  useEffect(() => {
    if (!nasRequest) return;
    let cancelled = false;
    setNas((prev) => ({ ...prev, loading: true, error: null }));
    const load = fetchers.nas ?? fetchMacroNas;
    void load(nasRequest, baseUrl)
      .then((data) => {
        if (!cancelled) setNas({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        // FAIL CLOSED: no stale/synthetic fallback is retained or shown.
        if (!cancelled) {
          setNas({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nasKey, baseUrl, fetchers.nas, nonce]);

  // IIP — NIC-2 selection is resolved by the transport at runtime.
  useEffect(() => {
    if (!iipRequest) return;
    let cancelled = false;
    setIip((prev) => ({ ...prev, loading: true, error: null }));
    const load = fetchers.iip ?? fetchMacroIip;
    void load(iipRequest, baseUrl)
      .then((data) => {
        if (!cancelled) setIip({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setIip({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iipKey, baseUrl, fetchers.iip, nonce]);

  // CPI — own base-year enumeration.
  useEffect(() => {
    if (!cpiRequest) return;
    let cancelled = false;
    setCpi((prev) => ({ ...prev, loading: true, error: null }));
    const load = fetchers.cpi ?? fetchMacroCpi;
    void load(cpiRequest, baseUrl)
      .then((data) => {
        if (!cancelled) setCpi({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setCpi({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpiKey, baseUrl, fetchers.cpi, nonce]);

  return (
    <MacroContext.Provider value={{ nas, iip, cpi, reload }}>{children}</MacroContext.Provider>
  );
}

export function useMacro(): MacroContextValue {
  const value = useContext(MacroContext);
  if (value === null) {
    throw new Error('useMacro must be used within a MacroProvider');
  }
  return value;
}
