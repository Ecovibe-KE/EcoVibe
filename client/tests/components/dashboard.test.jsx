import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Dashboard from "../../src/components/admin/Dashboard.jsx"; 
import * as DashboardService from "../../src/api/services/dashboard";
import * as AuthContext from "../../src/context/AuthContext.jsx";
import { MemoryRouter } from "react-router-dom";

// Mock dependencies
vi.mock("../../src/api/services/dashboard", () => ({
  // make it a promise-mock by default so `.mockResolvedValue(...)` exists
  getDashboard: vi.fn().mockResolvedValue({ status: "success", data: {} }),
}));

vi.mock("../../src/context/AuthContext.jsx", async (importOriginal) => {
  const actual = await importOriginal(); // import the real module
  return {
    ...actual,        // keep the rest of the module
    useAuth: vi.fn(), // override only useAuth
  };
});

describe("Dashboard Component", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders client dashboard stats", async () => {
    AuthContext.useAuth.mockReturnValue({
      user: { role: "client" },
      token: "mock-token",
    });

    DashboardService.getDashboard.mockResolvedValue({
      status: "success",
      data: {
        name: "Test Client",
        stats: {
          totalBookings: 2,
          paidInvoices: 1,
          ticketsRaised: 3,
          documentsDownloaded: 5,
        },
        upcomingAppointments: [],
        documents: [],
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Test Client/i)).toBeInTheDocument();
      expect(screen.getByText("Total Bookings")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("renders admin dashboard stats", async () => {
    AuthContext.useAuth.mockReturnValue({
      user: { role: "admin" },
      token: "mock-token",
    });

    DashboardService.getDashboard.mockResolvedValue({
      status: "success",
      data: {
        name: "Admin User",
        role: "admin",
        stats: {
          totalBookings: 10,
          registeredUsers: 5,
          blogPosts: 2,
          paymentRecords: 7,
        },
        recentBookings: [],
        recentPayments: [],
        documents: [],
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Admin User/i)).toBeInTheDocument();
      expect(screen.getByText("Registered Users")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("renders client document downloads stats", async () => {
    AuthContext.useAuth.mockReturnValue({
      user: { role: "client" },
      token: "mock-token",
    });

    DashboardService.getDashboard.mockResolvedValue({
      status: "success",
      data: {
        name: "Test Client",
        stats: {
          totalBookings: 4,
          paidInvoices: 2,
          ticketsRaised: 1,
          documentsDownloaded: 6,
        },
        upcomingAppointments: [],
        documents: [],
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    

    await waitFor(() => {
      expect(screen.getByText(/Available Documents/i)).toBeInTheDocument();
      expect(screen.getByText("6")).toBeInTheDocument();
    });
  });

  it("renders admin downloads stats (if provided)", async () => {
    AuthContext.useAuth.mockReturnValue({
      user: { role: "admin" },
      token: "mock-token",
    });

    DashboardService.getDashboard.mockResolvedValue({
      status: "success",
      data: {
        name: "Admin User",
        role: "admin",
        stats: {
          totalBookings: 12,
          registeredUsers: 8,
          blogPosts: 3,
          paymentRecords: 9,
          documentsDownloaded: 15,
        },
        recentBookings: [],
        recentPayments: [],
        documents: [],
      },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    


  });

});

