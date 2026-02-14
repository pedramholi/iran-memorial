import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

import { useRouter, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const mockUseRouter = vi.mocked(useRouter);
const mockUsePathname = vi.mocked(usePathname);
const mockReplace = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockUseRouter.mockReturnValue({ replace: mockReplace } as any);
  mockUsePathname.mockReturnValue("/victims");
});

describe("LanguageSwitcher", () => {
  it("renders 3 language buttons", () => {
    render(<LanguageSwitcher locale="en" />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("shows correct locale names", () => {
    render(<LanguageSwitcher locale="en" />);
    expect(screen.getByText("فارسی")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
  });

  it("highlights active locale", () => {
    render(<LanguageSwitcher locale="en" />);
    const enButton = screen.getByText("English");
    expect(enButton.className).toContain("text-gold-400");
  });

  it("does not highlight inactive locales", () => {
    render(<LanguageSwitcher locale="en" />);
    const faButton = screen.getByText("فارسی");
    expect(faButton.className).not.toContain("text-gold-400");
    expect(faButton.className).toContain("text-memorial-400");
  });

  it("calls router.replace on language click", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher locale="en" />);
    await user.click(screen.getByText("Deutsch"));
    expect(mockReplace).toHaveBeenCalledWith("/victims", { locale: "de" });
  });

  it("passes current pathname to router.replace", async () => {
    mockUsePathname.mockReturnValue("/timeline");
    const user = userEvent.setup();
    render(<LanguageSwitcher locale="en" />);
    await user.click(screen.getByText("فارسی"));
    expect(mockReplace).toHaveBeenCalledWith("/timeline", { locale: "fa" });
  });
});
