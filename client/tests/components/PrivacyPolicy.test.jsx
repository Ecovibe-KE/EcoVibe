import { render, screen } from "@testing-library/react";
import PrivacyPolicy from "../../src/components/PrivacyPolicy.jsx";

describe("PrivacyPolicy", () => {
  it("renders the privacy policy placeholder text", () => {
    render(<PrivacyPolicy />);
    expect(
      screen.getByText(/Privacy Policy \(Placeholder\)/i)
    ).toBeInTheDocument();
  });

  it("applies the correct styling classes", () => {
    const { container } = render(<PrivacyPolicy />);
    expect(container.firstChild).toHaveClass("p-4", "text-center");
  });
});
