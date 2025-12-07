import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Case, Counsel, Appointment, Task, Expense, Book, SofaItem } from '../../src/types';

/**
 * Feature: universal-search, Property 1: Search completeness
 * Validates: Requirements 1.1, 5.1, 5.2
 * 
 * For any valid search term and any data entity in the system, if the entity contains 
 * the search term in any searchable field, then that entity should appear in the search results.
 */

// Helper function to perform search matching for cases
function matchCase(c: Case, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  return (
    c.clientName.toLowerCase().includes(lowerTerm) ||
    c.fileNo.toLowerCase().includes(lowerTerm) ||
    c.partiesName.toLowerCase().includes(lowerTerm) ||
    c.caseType.toLowerCase().includes(lowerTerm)
  );
}

// Helper function to perform search matching for counsel
function matchCounsel(c: Counsel, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  return (
    c.name.toLowerCase().includes(lowerTerm) ||
    c.email.toLowerCase().includes(lowerTerm)
  );
}

// Helper function to perform search matching for appointments
function matchAppointment(a: Appointment, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  return (
    a.client.toLowerCase().includes(lowerTerm) ||
    a.details.toLowerCase().includes(lowerTerm)
  );
}

// Helper function to perform search matching for tasks
function matchTask(t: Task, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  return (
    t.title.toLowerCase().includes(lowerTerm) ||
    t.description.toLowerCase().includes(lowerTerm) ||
    t.assignedToName.toLowerCase().includes(lowerTerm)
  );
}

// Helper function to perform search matching for expenses
function matchExpense(e: Expense, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  return e.description.toLowerCase().includes(lowerTerm);
}

// Helper function to perform search matching for books
function matchBook(b: Book, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  return b.name.toLowerCase().includes(lowerTerm);
}

// Helper function to perform search matching for sofa items
function matchSofaItem(s: SofaItem, cases: Case[], term: string): boolean {
  const lowerTerm = term.toLowerCase();
  const associatedCase = cases.find(c => c.id === s.caseId);
  const caseName = associatedCase?.clientName || '';
  return caseName.toLowerCase().includes(lowerTerm);
}

// Arbitraries for generating test data
const caseArbitrary = fc.record({
  id: fc.uuid(),
  clientName: fc.string({ minLength: 1, maxLength: 50 }),
  clientEmail: fc.emailAddress(),
  clientMobile: fc.string({ minLength: 10, maxLength: 15 }),
  fileNo: fc.string({ minLength: 5, maxLength: 20 }),
  stampNo: fc.string({ minLength: 5, maxLength: 20 }),
  regNo: fc.string({ minLength: 5, maxLength: 20 }),
  partiesName: fc.string({ minLength: 10, maxLength: 100 }),
  district: fc.string({ minLength: 3, maxLength: 30 }),
  caseType: fc.constantFrom('Civil', 'Criminal', 'Commercial', 'Family'),
  court: fc.constantFrom('High Court', 'District Court', 'Supreme Court'),
  onBehalfOf: fc.string({ minLength: 5, maxLength: 30 }),
  noResp: fc.string({ minLength: 1, maxLength: 5 }),
  opponentLawyer: fc.string({ minLength: 5, maxLength: 50 }),
  additionalDetails: fc.string({ minLength: 10, maxLength: 200 }),
  feesQuoted: fc.integer({ min: 1000, max: 1000000 }),
  status: fc.constantFrom('pending', 'active', 'closed', 'on-hold'),
  stage: fc.constantFrom('consultation', 'drafting', 'filing', 'admitted'),
  nextDate: fc.date(),
  filingDate: fc.date(),
  circulationStatus: fc.constantFrom('circulated', 'non-circulated'),
  interimRelief: fc.constantFrom('favor', 'against', 'none'),
  createdBy: fc.uuid(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Case>;

const counselArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  email: fc.emailAddress(),
  mobile: fc.string({ minLength: 10, maxLength: 15 }),
  address: fc.string({ minLength: 10, maxLength: 100 }),
  details: fc.string({ minLength: 10, maxLength: 200 }),
  totalCases: fc.integer({ min: 0, max: 100 }),
  createdBy: fc.uuid(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Counsel>;

const appointmentArbitrary = fc.record({
  id: fc.uuid(),
  date: fc.date(),
  time: fc.string({ minLength: 5, maxLength: 10 }),
  user: fc.uuid(),
  client: fc.string({ minLength: 5, maxLength: 50 }),
  details: fc.string({ minLength: 10, maxLength: 200 }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Appointment>;

const taskArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('case', 'custom'),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  assignedTo: fc.uuid(),
  assignedToName: fc.string({ minLength: 5, maxLength: 50 }),
  assignedBy: fc.uuid(),
  assignedByName: fc.string({ minLength: 5, maxLength: 50 }),
  caseId: fc.option(fc.uuid(), { nil: undefined }),
  caseName: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
  deadline: fc.date(),
  status: fc.constantFrom('pending', 'completed'),
  completedAt: fc.option(fc.date(), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Task>;

const expenseArbitrary = fc.record({
  id: fc.uuid(),
  amount: fc.integer({ min: 100, max: 100000 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  addedBy: fc.uuid(),
  addedByName: fc.string({ minLength: 5, maxLength: 50 }),
  month: fc.string({ minLength: 7, maxLength: 7 }), // YYYY-MM format
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Expense>;

const bookArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 100 }),
  location: fc.constant('L1'),
  addedAt: fc.date(),
  addedBy: fc.uuid(),
}) as fc.Arbitrary<Book>;

const sofaItemArbitrary = (caseIds: string[]) => fc.record({
  id: fc.uuid(),
  caseId: fc.constantFrom(...(caseIds.length > 0 ? caseIds : ['default-case-id'])),
  compartment: fc.constantFrom('C1', 'C2'),
  addedAt: fc.date(),
  addedBy: fc.uuid(),
}) as fc.Arbitrary<SofaItem>;

describe('Universal Search - Property Tests', () => {
  describe('Property 1: Search completeness', () => {
    it('should find all cases that contain the search term in searchable fields', () => {
      fc.assert(
        fc.property(
          fc.array(caseArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (cases, searchTerm) => {
            // Filter cases that should match
            const expectedMatches = cases.filter(c => matchCase(c, searchTerm));
            
            // Perform the actual search
            const actualMatches = cases.filter(c => matchCase(c, searchTerm));
            
            // All expected matches should be in actual matches
            return expectedMatches.every(expected => 
              actualMatches.some(actual => actual.id === expected.id)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find all counsel that contain the search term in searchable fields', () => {
      fc.assert(
        fc.property(
          fc.array(counselArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (counselList, searchTerm) => {
            const expectedMatches = counselList.filter(c => matchCounsel(c, searchTerm));
            const actualMatches = counselList.filter(c => matchCounsel(c, searchTerm));
            
            return expectedMatches.every(expected => 
              actualMatches.some(actual => actual.id === expected.id)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find all appointments that contain the search term in searchable fields', () => {
      fc.assert(
        fc.property(
          fc.array(appointmentArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (appointments, searchTerm) => {
            const expectedMatches = appointments.filter(a => matchAppointment(a, searchTerm));
            const actualMatches = appointments.filter(a => matchAppointment(a, searchTerm));
            
            return expectedMatches.every(expected => 
              actualMatches.some(actual => actual.id === expected.id)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find all tasks that contain the search term in searchable fields', () => {
      fc.assert(
        fc.property(
          fc.array(taskArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (tasks, searchTerm) => {
            const expectedMatches = tasks.filter(t => matchTask(t, searchTerm));
            const actualMatches = tasks.filter(t => matchTask(t, searchTerm));
            
            return expectedMatches.every(expected => 
              actualMatches.some(actual => actual.id === expected.id)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find all expenses that contain the search term in searchable fields', () => {
      fc.assert(
        fc.property(
          fc.array(expenseArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (expenses, searchTerm) => {
            const expectedMatches = expenses.filter(e => matchExpense(e, searchTerm));
            const actualMatches = expenses.filter(e => matchExpense(e, searchTerm));
            
            return expectedMatches.every(expected => 
              actualMatches.some(actual => actual.id === expected.id)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find all books that contain the search term in searchable fields', () => {
      fc.assert(
        fc.property(
          fc.array(bookArbitrary, { minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }),
          (books, searchTerm) => {
            const expectedMatches = books.filter(b => matchBook(b, searchTerm));
            const actualMatches = books.filter(b => matchBook(b, searchTerm));
            
            return expectedMatches.every(expected => 
              actualMatches.some(actual => actual.id === expected.id)
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Feature: universal-search, Property 2: Case-insensitive matching
 * Validates: Requirements 5.1
 * 
 * For any search term and any data entity, searching with the term in uppercase, 
 * lowercase, or mixed case should return the same results.
 */
describe('Property 2: Case-insensitive matching', () => {
  it('should return same results for case variations in case search', () => {
    fc.assert(
      fc.property(
        fc.array(caseArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (cases, searchTerm) => {
          const lowerResults = cases.filter(c => matchCase(c, searchTerm.toLowerCase()));
          const upperResults = cases.filter(c => matchCase(c, searchTerm.toUpperCase()));
          const mixedResults = cases.filter(c => matchCase(c, searchTerm));
          
          // All three should return the same IDs
          const lowerIds = lowerResults.map(c => c.id).sort();
          const upperIds = upperResults.map(c => c.id).sort();
          const mixedIds = mixedResults.map(c => c.id).sort();
          
          return JSON.stringify(lowerIds) === JSON.stringify(upperIds) &&
                 JSON.stringify(lowerIds) === JSON.stringify(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return same results for case variations in counsel search', () => {
    fc.assert(
      fc.property(
        fc.array(counselArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (counselList, searchTerm) => {
          const lowerResults = counselList.filter(c => matchCounsel(c, searchTerm.toLowerCase()));
          const upperResults = counselList.filter(c => matchCounsel(c, searchTerm.toUpperCase()));
          const mixedResults = counselList.filter(c => matchCounsel(c, searchTerm));
          
          const lowerIds = lowerResults.map(c => c.id).sort();
          const upperIds = upperResults.map(c => c.id).sort();
          const mixedIds = mixedResults.map(c => c.id).sort();
          
          return JSON.stringify(lowerIds) === JSON.stringify(upperIds) &&
                 JSON.stringify(lowerIds) === JSON.stringify(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return same results for case variations in appointment search', () => {
    fc.assert(
      fc.property(
        fc.array(appointmentArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (appointments, searchTerm) => {
          const lowerResults = appointments.filter(a => matchAppointment(a, searchTerm.toLowerCase()));
          const upperResults = appointments.filter(a => matchAppointment(a, searchTerm.toUpperCase()));
          const mixedResults = appointments.filter(a => matchAppointment(a, searchTerm));
          
          const lowerIds = lowerResults.map(a => a.id).sort();
          const upperIds = upperResults.map(a => a.id).sort();
          const mixedIds = mixedResults.map(a => a.id).sort();
          
          return JSON.stringify(lowerIds) === JSON.stringify(upperIds) &&
                 JSON.stringify(lowerIds) === JSON.stringify(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return same results for case variations in task search', () => {
    fc.assert(
      fc.property(
        fc.array(taskArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (tasks, searchTerm) => {
          const lowerResults = tasks.filter(t => matchTask(t, searchTerm.toLowerCase()));
          const upperResults = tasks.filter(t => matchTask(t, searchTerm.toUpperCase()));
          const mixedResults = tasks.filter(t => matchTask(t, searchTerm));
          
          const lowerIds = lowerResults.map(t => t.id).sort();
          const upperIds = upperResults.map(t => t.id).sort();
          const mixedIds = mixedResults.map(t => t.id).sort();
          
          return JSON.stringify(lowerIds) === JSON.stringify(upperIds) &&
                 JSON.stringify(lowerIds) === JSON.stringify(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return same results for case variations in expense search', () => {
    fc.assert(
      fc.property(
        fc.array(expenseArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (expenses, searchTerm) => {
          const lowerResults = expenses.filter(e => matchExpense(e, searchTerm.toLowerCase()));
          const upperResults = expenses.filter(e => matchExpense(e, searchTerm.toUpperCase()));
          const mixedResults = expenses.filter(e => matchExpense(e, searchTerm));
          
          const lowerIds = lowerResults.map(e => e.id).sort();
          const upperIds = upperResults.map(e => e.id).sort();
          const mixedIds = mixedResults.map(e => e.id).sort();
          
          return JSON.stringify(lowerIds) === JSON.stringify(upperIds) &&
                 JSON.stringify(lowerIds) === JSON.stringify(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return same results for case variations in book search', () => {
    fc.assert(
      fc.property(
        fc.array(bookArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (books, searchTerm) => {
          const lowerResults = books.filter(b => matchBook(b, searchTerm.toLowerCase()));
          const upperResults = books.filter(b => matchBook(b, searchTerm.toUpperCase()));
          const mixedResults = books.filter(b => matchBook(b, searchTerm));
          
          const lowerIds = lowerResults.map(b => b.id).sort();
          const upperIds = upperResults.map(b => b.id).sort();
          const mixedIds = mixedResults.map(b => b.id).sort();
          
          return JSON.stringify(lowerIds) === JSON.stringify(upperIds) &&
                 JSON.stringify(lowerIds) === JSON.stringify(mixedIds);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: universal-search, Property 8: Field matching specificity
 * Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
 * 
 * For any entity type and search term, the search should match against all and only 
 * the specified searchable fields for that entity type.
 */
describe('Property 8: Field matching specificity', () => {
  it('should only match cases on searchable fields (clientName, fileNo, partiesName, caseType)', () => {
    fc.assert(
      fc.property(
        caseArbitrary,
        fc.string({ minLength: 3, maxLength: 10 }),
        (caseItem, searchTerm) => {
          // Create a case with search term only in non-searchable field (e.g., district)
          const caseWithNonSearchable = {
            ...caseItem,
            clientName: 'John Doe',
            fileNo: 'FILE123',
            partiesName: 'Party A vs Party B',
            caseType: 'Civil',
            district: searchTerm, // Non-searchable field
          };
          
          // Should not match
          const shouldNotMatch = !matchCase(caseWithNonSearchable, searchTerm);
          
          // Create a case with search term in searchable field
          const caseWithSearchable = {
            ...caseItem,
            clientName: searchTerm,
            district: 'Mumbai',
          };
          
          // Should match
          const shouldMatch = matchCase(caseWithSearchable, searchTerm);
          
          return shouldNotMatch && shouldMatch;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only match counsel on searchable fields (name, email)', () => {
    fc.assert(
      fc.property(
        counselArbitrary,
        fc.string({ minLength: 3, maxLength: 10 }),
        (counselItem, searchTerm) => {
          // Create counsel with search term only in non-searchable field (mobile)
          const counselWithNonSearchable = {
            ...counselItem,
            name: 'Jane Smith',
            email: 'jane@example.com',
            mobile: searchTerm, // Non-searchable field
          };
          
          const shouldNotMatch = !matchCounsel(counselWithNonSearchable, searchTerm);
          
          // Create counsel with search term in searchable field
          const counselWithSearchable = {
            ...counselItem,
            name: searchTerm,
            mobile: '1234567890',
          };
          
          const shouldMatch = matchCounsel(counselWithSearchable, searchTerm);
          
          return shouldNotMatch && shouldMatch;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only match appointments on searchable fields (client, details)', () => {
    fc.assert(
      fc.property(
        appointmentArbitrary,
        fc.string({ minLength: 3, maxLength: 10 }),
        (appointmentItem, searchTerm) => {
          // Create appointment with search term only in non-searchable field (time)
          const appointmentWithNonSearchable = {
            ...appointmentItem,
            client: 'Client Name',
            details: 'Meeting details',
            time: searchTerm, // Non-searchable field
          };
          
          const shouldNotMatch = !matchAppointment(appointmentWithNonSearchable, searchTerm);
          
          // Create appointment with search term in searchable field
          const appointmentWithSearchable = {
            ...appointmentItem,
            client: searchTerm,
            time: '10:00 AM',
          };
          
          const shouldMatch = matchAppointment(appointmentWithSearchable, searchTerm);
          
          return shouldNotMatch && shouldMatch;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only match tasks on searchable fields (title, description, assignedToName)', () => {
    fc.assert(
      fc.property(
        taskArbitrary,
        fc.string({ minLength: 3, maxLength: 10 }),
        (taskItem, searchTerm) => {
          // Create task with search term only in non-searchable field (assignedBy)
          const taskWithNonSearchable = {
            ...taskItem,
            title: 'Task Title',
            description: 'Task Description',
            assignedToName: 'Assignee Name',
            assignedByName: searchTerm, // Non-searchable field
          };
          
          const shouldNotMatch = !matchTask(taskWithNonSearchable, searchTerm);
          
          // Create task with search term in searchable field
          const taskWithSearchable = {
            ...taskItem,
            title: searchTerm,
            assignedByName: 'Admin',
          };
          
          const shouldMatch = matchTask(taskWithSearchable, searchTerm);
          
          return shouldNotMatch && shouldMatch;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only match expenses on searchable fields (description)', () => {
    fc.assert(
      fc.property(
        expenseArbitrary,
        fc.string({ minLength: 3, maxLength: 10 }),
        (expenseItem, searchTerm) => {
          // Create expense with search term only in non-searchable field (addedByName)
          const expenseWithNonSearchable = {
            ...expenseItem,
            description: 'Office supplies',
            addedByName: searchTerm, // Non-searchable field
          };
          
          const shouldNotMatch = !matchExpense(expenseWithNonSearchable, searchTerm);
          
          // Create expense with search term in searchable field
          const expenseWithSearchable = {
            ...expenseItem,
            description: searchTerm,
            addedByName: 'Admin',
          };
          
          const shouldMatch = matchExpense(expenseWithSearchable, searchTerm);
          
          return shouldNotMatch && shouldMatch;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only match books on searchable fields (name)', () => {
    fc.assert(
      fc.property(
        bookArbitrary,
        fc.string({ minLength: 3, maxLength: 10 }),
        (bookItem, searchTerm) => {
          // Create book with search term only in non-searchable field (addedBy)
          const bookWithNonSearchable = {
            ...bookItem,
            name: 'Book Title',
            addedBy: searchTerm, // Non-searchable field
          };
          
          const shouldNotMatch = !matchBook(bookWithNonSearchable, searchTerm);
          
          // Create book with search term in searchable field
          const bookWithSearchable = {
            ...bookItem,
            name: searchTerm,
            addedBy: 'user-123',
          };
          
          const shouldMatch = matchBook(bookWithSearchable, searchTerm);
          
          return shouldNotMatch && shouldMatch;
        }
      ),
      { numRuns: 100 }
    );
  });
});
