/**
 * IID-4 — disposition engine surface.
 *
 * Pure: no I/O, no clock, no network, no persistence. Persistence and transport live in the IRR
 * composition layer, which reuses the IID-3 artifact mechanism unchanged.
 */
export * from './types';
export * from './policy';
export * from './limits';
export * from './subject';
export * from './gates';
export * from './verbs';
export * from './portfolioImplication';
export * from './rationale';
export * from './engine';
