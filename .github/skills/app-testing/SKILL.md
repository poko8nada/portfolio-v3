---
name: app-testing
description: >
  Testing implementation guidance for this project.
  Load when writing new tests, deciding what to test, setting up Vitest,
  or implementing E2E tests with Playwright.
  Covers unit testing with Vitest, component testing, integration testing,
  and the decision tree for choosing the right approach.
---

# Application Testing

## Decision Tree

```
What needs testing?
├─ Pure logic / domain functions → Vitest unit test
├─ Result<T,E> error paths → Vitest unit test (required for every error path)
├─ API integration → Vitest + mock (success and failure cases both)
├─ Component behavior → Vitest + @testing-library (use sparingly)
└─ Critical user flows → Playwright E2E (use sparingly)
```

## Vitest Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { calculateTotal } from "./math";

describe("calculateTotal", () => {
  it("returns 0 for empty cart", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("applies discount correctly", () => {
    expect(calculateTotal([{ price: 100 }], 0.1)).toBe(90);
  });

  it("returns error Result when price is negative", () => {
    const result = calculateTotal([{ price: -10 }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Invalid price");
  });
});
```

## Component Tests (use sparingly)

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole("button").click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

## Playwright E2E (use sparingly)

For critical user flows that must work end-to-end:

```typescript
import { test, expect } from "@playwright/test";

test("completes checkout flow", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page.getByText("Order Complete")).toBeVisible();
});
```

## Running Tests

```bash
pnpm test               # run all
pnpm test -- --watch    # watch mode
pnpm test -- --coverage
pnpm test:e2e           # Playwright E2E
```

## Rules

- Mock external dependencies (APIs, timers, file system)
- No shared mutable state between tests
- One assertion concept per test
- Descriptive names: `"returns error when input is empty"` not `"test func1"`
