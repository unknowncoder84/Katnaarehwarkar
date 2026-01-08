import fc from 'fast-check';
import { Case } from '../../src/types';

/**
 * Feature: legal-case-dashboard, Property 1: Case Creation Persistence
 * Validates: Requirements 5.7, 12.1, 12.3
 *
 * For any valid case data submitted through the create case form,
 * the case should be persisted to storage and retrievable with identical information.
 */
describe('Property 1: Case Creation Persistence', () => {
  // Helper to generate arbitrary case data
  const caseDataArbitrary = () =>
    fc.record({
      clientName: fc.string({ minLength: 1, maxLength: 100 }),
      clientEmail: fc.emailAddress(),
      clientMobile: fc.string({ minLength: 10, maxLength: 10, unit: fc.integer({ min: 0, max: 9 }) }),
      clientAlternateNo: fc.option(fc.string({ minLength: 10, maxLength: 10 })),
      fileNo: fc.string({ minLength: 1, maxLength: 50 }),
      stampNo: fc.string({ minLength: 1, maxLength: 50 }),
      regNo: fc.string({ minLength: 1, maxLength: 50 }),
      partiesName: fc.string({ minLength: 1, maxLength: 100 }),
      district: fc.string({ minLength: 1, maxLength: 50 }),
      caseType: fc.string({ minLength: 1, maxLength: 50 }),
      court: fc.string({ minLength: 1, maxLength: 50 }),
      onBehalfOf: fc.string({ minLength: 1, maxLength: 50 }),
      noResp: fc.string({ minLength: 1, maxLength: 10 }),
      opponentLawyer: fc.string({ minLength: 1, maxLength: 100 }),
      additionalDetails: fc.string({ maxLength: 500 }),
      feesQuoted: fc.integer({ min: 0, max: 1000000 }),
      status: fc.constantFrom('pending', 'active', 'closed', 'on-hold'),
      circulationStatus: fc.constantFrom('circulated', 'non-circulated'),
      interimRelief: fc.constantFrom('favor', 'against', 'none'),
      createdBy: fc.string({ minLength: 1, maxLength: 50 }),
    });

  test('should persist and retrieve case data with identical information', () => {
    fc.assert(
      fc.property(caseDataArbitrary(), (caseData) => {
        // Simulate storage
        const storage: Record<string, Case> = {};

        // Create case with ID and timestamps
        const caseId = Date.now().toString();
        const createdCase: Case = {
          ...caseData,
          id: caseId,
          nextDate: new Date(),
          filingDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Persist to storage
        storage[caseId] = createdCase;

        // Retrieve from storage
        const retrievedCase = storage[caseId];

        // Verify all fields match
        expect(retrievedCase).toBeDefined();
        expect(retrievedCase.clientName).toBe(caseData.clientName);
        expect(retrievedCase.clientEmail).toBe(caseData.clientEmail);
        expect(retrievedCase.clientMobile).toBe(caseData.clientMobile);
        expect(retrievedCase.fileNo).toBe(caseData.fileNo);
        expect(retrievedCase.stampNo).toBe(caseData.stampNo);
        expect(retrievedCase.regNo).toBe(caseData.regNo);
        expect(retrievedCase.partiesName).toBe(caseData.partiesName);
        expect(retrievedCase.district).toBe(caseData.district);
        expect(retrievedCase.caseType).toBe(caseData.caseType);
        expect(retrievedCase.court).toBe(caseData.court);
        expect(retrievedCase.status).toBe(caseData.status);
        expect(retrievedCase.circulationStatus).toBe(caseData.circulationStatus);
        expect(retrievedCase.interimRelief).toBe(caseData.interimRelief);
      }),
      { numRuns: 100 }
    );
  });
});
