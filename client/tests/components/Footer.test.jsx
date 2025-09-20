import { render, screen } from "@testing-library/react";
import Footer from "../../../src/components/Footer";

describe("Footer component", () => {
  test("renders landing page footer content", () => {
    render(<Footer pageType="landing" />);

    // Footer text check
    expect(screen.getByText(/EcoVibe Kenya/i)).toBeInTheDocument();

    // Find Instagram link by href
    const instagramLink = screen.getAllByRole("link").find((link) =>
      link.getAttribute("href")?.includes("instagram")
    );
    expect(instagramLink).toBeInTheDocument();

    // Find LinkedIn link by href
    const linkedInLink = screen.getAllByRole("link").find((link) =>
      link.getAttribute("href")?.includes("linkedin")
    );
    expect(linkedInLink).toBeInTheDocument();
  });

  test("does not render footer for unknown pageType", () => {
    render(<Footer pageType="client" />);
    expect(screen.queryByText(/EcoVibe Kenya/i)).not.toBeInTheDocument();
  });

  test('does not render footer for pageType="unknown"', () => {
    render(<Footer pageType="unknown" />);
    expect(screen.queryByText(/EcoVibe Kenya/i)).not.toBeInTheDocument();
  });
});
