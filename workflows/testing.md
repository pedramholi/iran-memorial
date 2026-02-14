# Workflow: Testing

## Objective
Run, extend, and maintain the Vitest test suite to ensure code quality and prevent regressions.

---

## Prerequisites
- Node.js 18+ installed
- `npm install` completed (devDependencies include vitest, @testing-library/react, etc.)

---

## Running Tests

### Full Suite
```bash
npm test                    # Run all tests once
npm run test:watch          # Watch mode (re-run on file changes)
npm run test:coverage       # Run with v8 coverage report
```

### Specific Tests
```bash
npx vitest run __tests__/lib/          # Only lib tests
npx vitest run __tests__/api/          # Only API route tests
npx vitest run __tests__/components/   # Only component tests
npx vitest run __tests__/lib/utils     # Single test file
```

---

## Test Structure

```
__tests__/
├── setup.ts                      # jest-dom matchers
├── tsconfig.json                 # vitest/globals types
├── helpers/
│   ├── fixtures.ts               # Shared test data (mockVictimRow, validSubmission)
│   ├── mock-next-intl.ts         # next-intl mock pattern docs
│   └── mock-navigation.ts       # i18n/navigation mock factory
├── lib/                          # Tier 1: Pure functions (no mocks)
│   ├── utils.test.ts             # formatDate, formatNumber, etc.
│   ├── queries.test.ts           # localized(), mapRawVictims()
│   └── rate-limit.test.ts        # In-memory rate limiter
├── api/                          # Tier 2+3: Schema + API routes
│   ├── submit-schema.test.ts     # Zod schema validation
│   ├── search-route.test.ts      # GET /api/search
│   └── submit-route.test.ts      # POST /api/submit
└── components/                   # Tier 4: React components
    ├── VictimCard.test.tsx        # Card rendering, locales, photo/fallback
    ├── SearchBar.test.tsx         # Form submit, encoding, styling
    ├── LanguageSwitcher.test.tsx  # Locale switching, active state
    ├── Header.test.tsx           # Nav items, mobile menu
    └── FilterBar.test.tsx        # Dropdowns, gender buttons, URL params
```

---

## Writing New Tests

### Step 1: Choose the Right Tier

| Tier | What to Test | Mocks Needed | Example |
|------|-------------|--------------|---------|
| 1 | Pure functions | None | `lib/utils.ts` |
| 2 | Zod schemas | None (inline schema) | Submit validation |
| 3 | API routes | `vi.mock("@/lib/db")`, `vi.mock("@/lib/rate-limit")` | Route handlers |
| 4 | Components | `vi.mock("next-intl")`, `vi.mock("@/i18n/navigation")` | React components |

### Step 2: Follow Existing Patterns

**Pure function test:**
```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "@/lib/myModule";

describe("myFunction", () => {
  it("handles normal input", () => {
    expect(myFunction("input")).toBe("expected");
  });
});
```

**API route test (mock DB + rate limiter):**
```typescript
vi.mock("@/lib/db", () => ({ prisma: { model: { method: vi.fn() } } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn() }));

import { GET } from "@/app/api/myroute/route";
// ... set up mocks in beforeEach, create NextRequest, assert response
```

**Component test (mock next-intl + navigation):**
```typescript
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));
vi.mock("@/i18n/navigation", () => {
  const React = require("react");
  return {
    Link: ({ href, children, ...props }: any) =>
      React.createElement("a", { href, ...props }, children),
    useRouter: vi.fn(),
    usePathname: vi.fn(),
  };
});
```

### Step 3: Verify

```bash
npx vitest run __tests__/path/to/new.test.ts
npm test   # Ensure no regressions
```

---

## Coverage Goals

| Area | Target |
|------|--------|
| Pure Functions (`lib/`) | 100% |
| Zod Schemas | 100% |
| API Routes | 95% |
| Components | 90% |
| **Overall Threshold** | **70% statements, 60% branches** |

Check coverage:
```bash
npm run test:coverage
# Reports: coverage/index.html (visual), terminal summary
```

---

## Common Pitfalls

1. **vi.mock hoisting**: `vi.mock()` is hoisted above imports. Use `vi.fn()` in factories and `vi.mocked()` after import to set up return values.
2. **JSX in vi.mock**: Use `require("react").createElement()` instead of JSX inside `vi.mock()` factories.
3. **Prisma client**: Always mock `@/lib/db` when testing modules that import from it — prevents real DB connections.
4. **Fake timers**: Use `vi.useFakeTimers()` / `vi.useRealTimers()` for time-dependent tests (rate-limit). Always restore in `afterEach`.
5. **next/image**: Mock as simple `<img>` element via `vi.mock("next/image")`.

---

## Evaluation Checklist (after test runs)

- [ ] All tests pass (`npm test`)
- [ ] No skipped tests without documented reason
- [ ] Coverage meets thresholds (`npm run test:coverage`)
- [ ] New code has corresponding tests
- [ ] `test-results.json` generated (for CI/reporting)

---

## TODOs for Future Testing

- [ ] Integration tests: Full page render with mocked DB data
- [ ] E2E tests: Playwright/Cypress for critical user flows (search, submit, navigate)
- [ ] CI pipeline: GitHub Actions workflow running `npm test` on push/PR
- [ ] Visual regression: Screenshot testing for VictimCard, Header
- [ ] Accessibility: axe-core integration for a11y checks
- [ ] Performance: Lighthouse CI for page load budgets
