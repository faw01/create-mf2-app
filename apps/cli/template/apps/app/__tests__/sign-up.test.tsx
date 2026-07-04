import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Page from "../app/(unauthenticated)/sign-up/[[...sign-up]]/page";

vi.mock("@repo/auth/components/sign-up", () => ({
  SignUp: () => <div data-testid="clerk-sign-up" />,
}));

test("sign-up page renders the auth sign-up component", async () => {
  render(<Page />);

  expect(await screen.findByTestId("clerk-sign-up")).toBeDefined();
});
