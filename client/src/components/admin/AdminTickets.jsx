import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Modal,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import {
  getTickets,
  getTicketStats,
  getTicketById,
  updateTicket,
  deleteTicket,
  addTicketMessage,
} from "../../api/services/tickets";
import { toast } from "react-toastify";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(assignedToFilter && { assigned_to: assignedToFilter }),
      };

      const response = await getTickets(params);
      if (response.status === "success") {
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || "Failed to fetch tickets");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, assignedToFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getTicketStats();
      if (response.status === "success") {
        setStats(response.data);
      } else {
        toast.error(response.message || "Failed to fetch ticket stats");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch ticket stats");
    }
  }, []);

  useEffect(() => {
    if (searchTerm) return;
    fetchTickets();
    fetchStats();
  }, [currentPage, statusFilter, assignedToFilter, fetchTickets, fetchStats]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchTickets();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchTickets, currentPage]);

  const handleViewTicket = async (ticketId) => {
    try {
      const response = await getTicketById(ticketId);
      if (response.status === "success") {
        setSelectedTicket(response.data);
        setShowDetailsModal(true);
      } else {
        toast.error(response.message || "Failed to fetch ticket details");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch ticket details");
    }
  };

  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      const response = await updateTicket(ticketId, updateData);
      if (response.status === "success") {
        toast.success("Ticket updated successfully");
        fetchTickets();
        fetchStats();
        if (selectedTicket && selectedTicket.id === ticketId) {
          const updatedTicket = await getTicketById(ticketId);
          if (updatedTicket.status === "success") {
            setSelectedTicket(updatedTicket.data);
          }
        }
      } else {
        toast.error(response.message || "Failed to update ticket");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update ticket");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const response = await deleteTicket(ticketId);
      if (response.status === "success") {
        toast.success("Ticket deleted successfully");
        fetchTickets();
        fetchStats();
        if (showDetailsModal) {
          setShowDetailsModal(false);
          setSelectedTicket(null);
        }
      } else {
        toast.error(response.message || "Failed to delete ticket");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete ticket");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { bg: "danger", icon: "●" },
      in_progress: { bg: "warning", icon: "●" },
      closed: { bg: "secondary", icon: "●" },
    };
    const info = statusMap[status] || { bg: "secondary", icon: "●" };
    return (
      <Badge bg={info.bg} className="me-1">
        {info.icon}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: "danger",
      medium: "warning",
      low: "success",
    };
    const value = (priority && String(priority)) || "medium";
    return (
      <Badge bg={priorityMap[value] || "secondary"} className="text-capitalize">
        {value}
      </Badge>
    );
  };

  const getInitials = (name) => {
    if (!name || name === "Unassigned") return "A";
    return (
      name
        .split(" ")
        .filter((n) => n.length > 0)
        .map((n) => n[0].toUpperCase())
        .join("")
        .slice(0, 2) || "A"
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">Tickets Management</h2>
          <p className="text-muted">
            Manage customer support tickets and track resolutions
          </p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <div className="fs-2 text-primary mb-2">📊</div>
              <h5 className="mb-0">{stats.total || 0}</h5>
              <small className="text-muted">Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <div className="fs-2 text-danger mb-2">
                <i className="bi bi-exclamation-circle"></i>
              </div>
              <h5 className="mb-0">{stats.open || 0}</h5>
              <small className="text-muted">Open</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center">
            <Card.Body>
              <div className="fs-2 text-warning mb-2">
                <i className="bi bi-clock"></i>
              </div>
              <h5 className="mb-0">{stats.in_progress || 0}</h5>
              <small className="text-muted">In Progress</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="fs-2 text-success mb-2">
                <i className="bi bi-check-circle"></i>
              </div>
              <h5 className="mb-0">{stats.resolved || 0}</h5>
              <small className="text-muted">Resolved</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="fs-2 text-secondary mb-2">
                <i className="bi bi-archive"></i>
              </div>
              <h5 className="mb-0">{stats.closed || 0}</h5>
              <small className="text-muted">Closed</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search tickets, customers, or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Admin ID"
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
          />
        </Col>
      </Row>

      {/* Tickets Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <>
          <Card>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ticket</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="fw-bold">{ticket.subject}</div>
                        <small className="text-muted">
                          {ticket.ticket_id || `#${ticket.id}`}
                        </small>
                      </td>
                      <td>
                        <div>{ticket.client_name}</div>
                        <small className="text-muted">
                          {ticket.client_company || "N/A"}
                        </small>
                      </td>
                      <td>
                        <Badge
                          bg="light"
                          text="dark"
                          className="text-capitalize"
                        >
                          {ticket.category || "General"}
                        </Badge>
                      </td>
                      <td>{getPriorityBadge(ticket.priority)}</td>
                      <td>
                        {getStatusBadge(ticket.status)}
                        <span className="text-capitalize">
                          {ticket.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        {ticket.admin_name !== "Unassigned" ? (
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-success bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-2"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <small className="text-success fw-bold">
                                {getInitials(ticket.admin_name)}
                              </small>
                            </div>
                            <small>{ticket.admin_name}</small>
                          </div>
                        ) : (
                          <small className="text-muted">Unassigned</small>
                        )}
                      </td>
                      <td>
                        <div>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        <small className="text-muted">
                          {new Date(ticket.created_at).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Card className="mt-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing {(currentPage - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(
                      currentPage * pagination.per_page,
                      pagination.total,
                    )}{" "}
                    of {pagination.total} results
                  </small>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={!pagination.has_prev}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="align-self-center px-3">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={!pagination.has_next}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          show={showDetailsModal}
          onHide={() => {
            setShowDetailsModal(false);
            setSelectedTicket(null);
          }}
          onUpdate={handleUpdateTicket}
          onDelete={handleDeleteTicket}
          getStatusBadge={getStatusBadge}
          getPriorityBadge={getPriorityBadge}
          onRefreshTicket={(data) => setSelectedTicket(data)}
        />
      )}
    </Container>
  );
};

// Ticket Details Modal Component
const TicketDetailsModal = ({
  ticket,
  show,
  onHide,
  onUpdate,
  onDelete,
  getStatusBadge,
  getPriorityBadge,
  onRefreshTicket = () => {},
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    status: ticket.status,
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await addTicketMessage(ticket.id, { body: newMessage });
      if (response.status === "success") {
        toast.success("Message sent successfully");
        setNewMessage("");

        const refreshed = await getTicketById(ticket.id);
        if (refreshed.status === "success") {
          // Expose a prop like onRefreshTicket to push the new data up
          onRefreshTicket(refreshed.data);
        }
      } else {
        toast.error(response.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await onUpdate(ticket.id, editData);
      setEditMode(false);
    } catch (error) {
      // Error handled in parent
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {ticket.subject}
          <small className="text-muted ms-2">{ticket.ticket_id}</small>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {/* Ticket Info */}
        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-2">
              <strong className="text-muted small">Status:</strong>
              {editMode ? (
                <Form.Select
                  size="sm"
                  value={editData.status}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mt-1"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              ) : (
                <div className="mt-1">
                  {getStatusBadge(ticket.status)}
                  <span className="text-capitalize">
                    {ticket.status?.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
            <div className="mb-2">
              <strong className="text-muted small">Priority:</strong>
              <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
            </div>
            <div className="mb-2">
              <strong className="text-muted small">Category:</strong>
              <div className="mt-1 text-capitalize">
                {ticket.category || "General"}
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <strong className="text-muted small">Client:</strong>
              <div className="mt-1">{ticket.client_name}</div>
              <small className="text-muted">{ticket.client_email}</small>
            </div>
            <div className="mb-2">
              <strong className="text-muted small">Assigned:</strong>
              <div className="mt-1">{ticket.admin_name}</div>
            </div>
            <div className="mb-2">
              <strong className="text-muted small">Created:</strong>
              <div className="mt-1">
                <small>{new Date(ticket.created_at).toLocaleString()}</small>
              </div>
            </div>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="mb-3 d-flex gap-2">
          {editMode ? (
            <>
              <Button variant="success" size="sm" onClick={handleUpdate}>
                Save Changes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                Edit Ticket
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(ticket.id)}
              >
                Delete Ticket
              </Button>
            </>
          )}
        </div>

        <hr />

        {/* Messages */}
        <div className="mb-3">
          {ticket.messages &&
            ticket.messages.map((message) => (
              <Card
                key={message.id}
                className={`mb-2 ${message.sender_role !== "client" ? "ms-auto bg-success text-white" : "me-auto"}`}
                style={{ maxWidth: "75%" }}
              >
                <Card.Body className="py-2 px-3">
                  <div className="d-flex justify-content-between mb-1">
                    <strong className="small">{message.sender_name}</strong>
                    <small
                      className={
                        message.sender_role !== "client"
                          ? "text-white-50"
                          : "text-muted"
                      }
                    >
                      {new Date(message.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{message.body}</div>
                </Card.Body>
              </Card>
            ))}
        </div>

        {/* Reply Form */}
        <Form onSubmit={handleSendMessage}>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end mt-2">
            <Button
              variant="success"
              type="submit"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AdminTickets;
