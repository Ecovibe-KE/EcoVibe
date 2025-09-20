import { render, screen, fireEvent } from "@testing-library/react";
import Logout from "../../pages/Logout";

describe("Logout Component", () => {
  test("renders logout confirmation message", () => {
    render(<Logout onLogout={jest.fn()} />);

    expect(screen.getByText(/are you sure you want to logout/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("calls onLogout callback when yes button is clicked", () => {
    const mockLogout = jest.fn();
    render(<Logout onLogout={mockLogout} />);

    fireEvent.click(screen.getByRole("button", { name: /yes/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
