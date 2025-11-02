import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RequireRole from "../../src/wrappers/RequireRole.jsx";

// Mock AuthContext
vi.mock("../../src/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from "../../src/context/AuthContext.jsx";

describe("RequireRole", () => {
  it("renders null while hydrating", () => {
    useAuth.mockReturnValue({ user: null, isHydrating: true });
    const { container } = render(
      <MemoryRouter>
        <RequireRole allowedRoles={["admin"]}>
          <div>Protected</div>
        </RequireRole>
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("redirects to /login if no user", () => {
    useAuth.mockReturnValue({ user: null, isHydrating: false });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RequireRole allowedRoles={["admin"]}>
          <div>Protected</div>
        </RequireRole>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("redirects to /unauthorized if user has wrong role", () => {
    useAuth.mockReturnValue({ user: { role: "client" }, isHydrating: false });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RequireRole allowedRoles={["admin"]}>
          <div>Protected</div>
        </RequireRole>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders children if user has allowed role", () => {
    useAuth.mockReturnValue({ user: { role: "admin" }, isHydrating: false });
    render(
      <MemoryRouter>
        <RequireRole allowedRoles={["admin"]}>
          <div>Protected</div>
        </RequireRole>
      </MemoryRouter>
    );
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });
});
