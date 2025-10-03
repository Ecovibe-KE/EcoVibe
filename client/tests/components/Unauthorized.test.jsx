import { render, screen } from "@testing-library/react";
import Unauthorized from "../../src/wrappers/Unauthorized.jsx";

describe("Unauthorized", () => {
  it("renders access denied message", () => {
    render(<Unauthorized />);
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(
      screen.getByText(/don’t have permission to view this page/i)
    ).toBeInTheDocument();
  });
});
