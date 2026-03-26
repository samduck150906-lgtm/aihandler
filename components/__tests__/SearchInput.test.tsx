import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../search-input";

describe("SearchInput", () => {
  it("does not submit when input is empty", () => {
    const onSubmit = vi.fn();
    render(<SearchInput onSubmit={onSubmit} isLoading={false} />);
    const textarea = screen.getByRole("textbox", { name: /검색어 입력/i });
    fireEvent.change(textarea, { target: { value: "   " } });
    const btn = screen.getByRole("button", { name: /제출/i });
    fireEvent.click(btn);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits when input has content and is not loading", () => {
    const onSubmit = vi.fn();
    render(<SearchInput onSubmit={onSubmit} isLoading={false} />);
    const textarea = screen.getByRole("textbox", { name: /검색어 입력/i });
    fireEvent.change(textarea, { target: { value: "넷플릭스 일본 애니" } });
    const btn = screen.getByRole("button", { name: /제출/i });
    fireEvent.click(btn);
    expect(onSubmit).toHaveBeenCalledWith("넷플릭스 일본 애니");
  });

  it("submit button is disabled when loading", () => {
    render(<SearchInput onSubmit={() => {}} isLoading={true} />);
    const btn = screen.getByRole("button", { name: /제출/i });
    expect(btn).toBeDisabled();
  });
});
