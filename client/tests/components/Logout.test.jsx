import { render, screen, fireEvent } from "@testing-library/react";
import Logout from "../../src/pages/Logout";

describe("Logout Component", () => {
  test("renders logout confirmation message", () => {
    render(<Logout onLogout={vi.fn()} />);
    expect(screen.getByText(/are you sure you want to logout/i)).toBeInTheDocument();
  });

  test("calls onLogout callback when yes button is clicked", () => {
    const mockLogout = vi.fn();
    render(<Logout onLogout={mockLogout} />);
    const yesButton = screen.getByRole("button", { name: /yes/i });
    fireEvent.click(yesButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
