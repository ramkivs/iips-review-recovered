/**
 * IID WI-1 (P5) — scroll to the section a URL fragment names, after that section actually exists.
 *
 * THE PROBLEM THIS SOLVES. `Change history →` links to `/investment/company/:issuerId#change-timeline`, but the
 * timeline is rendered by an asynchronously loaded read model: at the moment the router finishes navigating, the
 * anchor target does not exist yet. React Router v6 does not scroll to fragments on its own, so the link landed at
 * the top of the page and the reader had to hunt for the section. A one-shot `scrollIntoView` on mount is not enough
 * either — it runs before the assessment resolves and silently does nothing.
 *
 * HOW IT WORKS. On every location change that carries a fragment, look for the target immediately (the common case
 * for an already-rendered page) and then keep observing the DOM for a bounded window. Observing *after* the first
 * scroll is deliberate: a link that also changes the query (for example one that pins `reportId`) makes the page
 * re-read and re-mount the section, so the node scrolled to on the first paint is about to be detached. When the
 * element behind the id is replaced, scroll to the replacement. The observer is bounded by a timeout and torn down
 * on the next location change or unmount, so a fragment that never resolves cannot leak an observer or scroll a
 * later page by accident.
 *
 * IT ONLY SCROLLS. It never navigates, never rewrites the URL and never touches the query string, so the company,
 * assessment and holding context are exactly what the router put there. Back/forward is therefore coherent: a POP
 * to a fragment URL scrolls to that fragment, and a POP to a fragment-less URL does not scroll.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Upper bound on waiting for an asynchronously rendered anchor target. */
const ANCHOR_WAIT_MS = 10_000;

/**
 * Resolve a fragment to an element id. `decodeURIComponent` mirrors how the router stores the hash, and a malformed
 * escape is treated as "no target" rather than throwing during navigation.
 */
function fragmentId(hash: string): string | null {
  if (hash.length <= 1) return null;
  try {
    const id = decodeURIComponent(hash.slice(1)).trim();
    return id.length === 0 ? null : id;
  } catch {
    return null;
  }
}

/** jsdom and some embedded browsers do not implement scrollIntoView; absence is not an error. */
function scrollTo(element: HTMLElement): void {
  if (typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
}

export function useHashScroll(): void {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const id = fragmentId(hash);
    if (id === null) return;

    // `lastTarget` makes the scroll idempotent per element: an unrelated re-render must not re-scroll and fight
    // the reader, but a REPLACEMENT element (the read model re-mounted the section) must be scrolled to.
    let lastTarget: HTMLElement | null = null;
    let stopped = false;

    const attempt = (): void => {
      if (stopped) return;
      const target = document.getElementById(id);
      if (target === null || target === lastTarget) return;
      lastTarget = target;
      scrollTo(target);
    };

    const stop = (): void => {
      stopped = true;
      observer.disconnect();
      window.clearTimeout(timer);
    };

    const observer = new MutationObserver(() => {
      attempt();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setTimeout(stop, ANCHOR_WAIT_MS);

    // Covers both "already rendered" and "rendered between the lookup and the observer attaching".
    attempt();

    return () => {
      if (!stopped) stop();
    };
    // `pathname` and `search` are included deliberately: navigating to the same fragment on a different
    // company/version must scroll again, not be swallowed as an unchanged dependency.
  }, [pathname, search, hash]);
}

export default useHashScroll;
