import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Page from "../app/(unauthenticated)/sign-in/[[...sign-in]]/page";

vi.mock("@repo/auth/components/sign-in", () => ({
  SignIn: () => <div data-testid="clerk-sign-in" />,
}));

test("sign-in page renders the auth sign-in component", async () => {
  render(<Page />);

  expect(await screen.findByTestId("clerk-sign-in")).toBeDefined();
});
