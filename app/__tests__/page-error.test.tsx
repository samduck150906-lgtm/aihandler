import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../page";

describe("HomePage error UI", () => {
  it("renders idle state with search and example chips", () => {
    render(<HomePage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/기억나는 대로 설명해보세요/i)
    ).toBeInTheDocument();
  });
});
