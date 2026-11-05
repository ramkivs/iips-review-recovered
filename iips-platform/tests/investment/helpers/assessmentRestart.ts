/**
 * IID-2 — one assessment run in a fresh process (AC-2.11 "byte-identical across restarts").
 *
 * The digest is printed rather than the payload so the assertion is about the bytes, not about how a
 * particular loader serialises a `Map` or a prototype.
 */
import { createHash } from 'node:crypto';
import { assessCompany } from '../../../src/investment/assessment/engine';
import { bankAssessmentInput, techAssessmentInput, thinAssessmentInput } from '../assessmentFixtures';

const inputs = { tech: techAssessmentInput(), bank: bankAssessmentInput(), thin: thinAssessmentInput() } as const;
const which = process.argv[2] as keyof typeof inputs;
const { payload, inputDigest } = assessCompany(inputs[which]);
const serialised = JSON.stringify(payload);
process.stdout.write(
  `${which} ${inputDigest} ${createHash('sha256').update(serialised).digest('hex')} ${serialised.length}\n`,
);
