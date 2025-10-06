import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import DescriptionIcon from "@mui/icons-material/Description";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import PaymentsIcon from "@mui/icons-material/Payments";
import "../../../src/css/dashboard.css";
import Button from "../../utils/Button";
import { Feed, Star, AccessTime } from "@mui/icons-material";
import { getDashboard } from "../../api/services/dashboard";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import { downloadDocument } from "../../api/services/resourceCenter";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState({});
  const [, setLoading] = useState(true);
  const role = user?.role;

  useEffect(() => {
    if (!user || !token) return;

    const fetchDashboard = async () => {
      try {
        const response = await getDashboard(token);
        if (response?.status === "success") {
          setData(response.data);
        } else {
          toast.error(response?.message || "Failed to fetch dashboard data");
        }
      } catch {
        toast.error("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, token]);

  const clientCards = [
    {
      title: "Total Bookings",
      value: data.stats?.totalBookings,
      icon: (
        <EventAvailableIcon fontSize="large" className="eck-dashboard-icon" />
      ),
    },
    {
      title: "Paid Invoices",
      value: data.stats?.paidInvoices,
      icon: <ReceiptLongIcon fontSize="large" className="eck-dashboard-icon" />,
    },
    {
      title: "Tickets Raised",
      value: data.stats?.ticketsRaised,
      icon: (
        <SupportAgentIcon fontSize="large" className="eck-dashboard-icon" />
      ),
    },
    {
      title: "Available Documents",
      value: data.stats?.documentsDownloaded,
      icon: <DescriptionIcon fontSize="large" className="eck-dashboard-icon" />,
    },
  ];

  const adminCards = [
    {
      title: "Total Bookings",
      value: data.stats?.totalBookings,
      icon: <EventNoteIcon fontSize="large" className="eck-dashboard-icon" />,
    },
    {
      title: "Registered Users",
      value: data.stats?.registeredUsers,
      icon: <GroupIcon fontSize="large" className="eck-dashboard-icon" />,
    },
    {
      title: "Total Blog Posts",
      value: data.stats?.blogPosts,
      icon: <ArticleIcon fontSize="large" className="eck-dashboard-icon" />,
    },
    {
      title: "Payment Records",
      value: data.stats?.paymentRecords,
      icon: <PaymentsIcon className="eck-dashboard-icon" />,
    },
  ];

  const renderCards = (cards) =>
    cards.map((card, idx) => (
      <div key={idx} className="col-md-3 mb-3">
        <div className="card h-100 rounded-2 border-0 bg-white shadow-sm">
          <div className="card-body">
            <div className="d-flex align-items-center">
              {card.icon}
              <div className="ms-2 text-start">
                <h3 className="eck-dashboard-text-heading mb-0">
                  {card.value}
                </h3>
                <h5 className="eck-dashboard-text card-title mb-0">
                  {card.title}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));

  const handleDownload = async (doc) => {
    try {
      const fileRes = await downloadDocument(doc.id);
      const url = URL.createObjectURL(
        new Blob([fileRes.data], { type: doc.mimetype }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Welcome, {data.name}</h2>
      </div>
      <div className="row mb-4">
        {role === "client" ? renderCards(clientCards) : renderCards(adminCards)}
      </div>
      {role === "client" && (
        <div className="bg-white p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Upcoming Appointments</h4>
            <Link to={"/dashboard/bookings"}>
              <Button> Book now</Button>
            </Link>
          </div>
          <div className="row shadow-sm">
            {data.upcomingAppointments?.map((appt) => (
              <div key={appt.id} className="col-md-4 mb-3">
                <div className="card border-0 h-100 shadow-lg">
                  <div className="card-body ">
                    <div className="d-flex align-items-center justify-content-between border-bottom border-dark border-secondary-subtle mb-3 pb-2">
                      <h6 className="fw-bold fs-6">{appt.service_name}</h6>
                      <h6 className="fw-bold">Date: {appt.booking_date}</h6>
                    </div>
                    <div className="text-muted">
                      <div className="mb-2">
                        <p className="m-0">Start:</p>
                        <div className="">
                          {new Date(appt.start_time).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="">
                        <p className="m-0">End:</p>
                        <div className="">
                          {new Date(appt.end_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-start justify-content-end w-100">
                      <span
                        className={` py-1 px-2 rounded-5 ${
                          appt.status === "Confirmed"
                            ? "bg-success"
                            : appt.status === "Pending"
                              ? "bg-warning text-dark"
                              : appt.status === "Canceled"
                                ? "bg-danger"
                                : "bg-secondary"
                        } `}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(role === "admin" || role==="super_admin") && (
        <div className=" bg-white shadow-lg p-4 rounded-3">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle pb-3">
            <h4 className="fw-bold">Recent Bookings</h4>
            <div className="">
              <Link to={"/dashboard/bookings"}>
                <Button>Add Booking</Button>
              </Link>
              <Link to={"/dashboard/bookings"}>
                <Button>View all</Button>
              </Link>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead className="table-secondary">
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings?.map((b) => (
                  <tr key={b.id}>
                    <td>{b.client_name}</td>
                    <td>{b.service_title}</td>
                    <td>{b.booking_date}</td>
                    <td>
                      <span
                        className={` py-1 px-2 rounded-5 ${
                          b.status === "confirmed"
                            ? "status-confirmed fw-bold"
                            : b.status === "pending"
                              ? "status-pending fw-bold"
                              : b.status === "cancelled"
                                ? "status-cancelled fw-bold"
                                : "bg-secondary fw-bold"
                        } `}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {role === "client" && (
        <div className="mt-5  bg-white shadow-lg p-4 rounded-3">
          <div className="d-flex align-items-center justify-content-between">
            <h4>Documents</h4>
            <Link to={"/dashboard/resources"}>
              <Button>View all</Button>
            </Link>
          </div>

          <div className="row g-4">
            {data.documents?.map((doc, index) => (
              <div className="col-12 col-md-6 col-lg-4" key={index}>
                <div className="card h-100 shadow-lg border-0 p-4 text-start rounded-3">
                  <div
                    className="d-flex align-items-center gap-2 mb-2 justify-content-between"
                    style={{ height: "35px" }}
                  >
                    <div className="d-flex gap-2 document-header fw-bold px-3 py-1 rounded-5">
                      <Feed /> <p className="m-0">Document</p>
                    </div>
                    <Star className="star" />
                  </div>
                  <h5 className="fw-bold mb-1">{doc.title}</h5>
                  <p className="text-muted text-justify">{doc.description}</p>
                  <div className="d-flex gap-1 text-muted w-100 justify-content-end m-0">
                    <AccessTime className="m-0" />
                    <p className="m-0">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={() => handleDownload(doc)}>Download</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(role === "admin" || role==="super_admin") && (
        <div className="mt-5">
          <div className="my-5 shadow-lg bg-white p-4 ">
            <div className="d-flex align-items-center justify-content-between">
              <h4 className="fw-bold">Documents</h4>
              <Link to={"/dashboard/resources"}>
                <Button>View all</Button>
              </Link>
            </div>
            <div className="row g-4">
              {data.documents?.map((doc, index) => (
                <div className="col-12 col-md-6 col-lg-4" key={index}>
                  <div className="card h-100 shadow-lg border-0 p-4 text-start rounded-3">
                    <div
                      className="d-flex align-items-center gap-2 mb-2 justify-content-between"
                      style={{ height: "35px" }}
                    >
                      <div className="d-flex gap-2 document-header fw-bold px-3 py-1 rounded-5">
                        <Feed /> <p className="m-0">Document</p>
                      </div>
                      <Star className="star" />
                    </div>
                    <h5 className="fw-bold mb-1">{doc.title}</h5>
                    <p className="text-muted text-justify">{doc.description}</p>
                    <div className="d-flex gap-1 text-muted w-100 justify-content-end m-0">
                      <AccessTime className="m-0" />
                      <p className="m-0">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button onClick={() => handleDownload(doc)}>
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className=" bg-white shadow-lg p-4 rounded-3">
            <div className="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary-subtle pb-2 ">
              <h4 className="fw-bold m-0">Recent Payments</h4>
              <Link to={"/dashboard/payments"}>
                <Button>View all</Button>
              </Link>
            </div>
            <div className=" table-responsive">
              <table className="table table-hover">
                <thead className=" table-secondary">
                  <tr>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Amount (ksh)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments?.map((p) => (
                    <tr key={p.id}>
                      <td>{p.client_name}</td>
                      <td>{p.service_title}</td>
                      <td>{p.amount}</td>
                      <td>{p.payment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
