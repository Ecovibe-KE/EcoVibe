import React ,{ useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { getTickets, createTicket, getTicketById, addTicketMessage } from "../api/services/tickets";
import { toast } from "react-toastify";

function ClientTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Form state for creating ticket
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
  });

  // Message state
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
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
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchTickets();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createTicket(formData);
      if (response.status === "success") {
        toast.success("Ticket created successfully");
        setShowCreateModal(false);
        setFormData({
          subject: "",
          description: "",
          category: "general",
          priority: "medium",
        });
        fetchTickets();
      } else {
        toast.error(response.message || "Failed to create ticket");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await addTicketMessage(selectedTicket.id, {
        body: newMessage,
      });
      if (response.status === "success") {
        toast.success("Message sent successfully");
        setNewMessage("");
        // Refresh ticket details
        const updatedTicket = await getTicketById(selectedTicket.id);
        if (updatedTicket.status === "success") {
          setSelectedTicket(updatedTicket.data);
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { bg: "danger", text: "Open" },
      in_progress: { bg: "warning", text: "In Progress" },
      closed: { bg: "secondary", text: "Closed" },
    };
    const statusInfo = statusMap[status] || { bg: "secondary", text: status };
    return (
      <Badge bg={statusInfo.bg} className="rounded-circle me-2">
        ●
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: "danger",
      medium: "warning",
      low: "success",
    };
    return (
      <Badge bg={priorityMap[priority] || "secondary"} className="text-capitalize">
        {priority}
      </Badge>
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Support Tickets</h2>
              <p className="text-muted">
                Manage your support requests and track their progress
              </p>
            </div>
            <Button
              variant="success"
              className="d-flex align-items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="bi bi-plus-lg"></i>
              Create Ticket
            </Button>
          </div>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
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
      </Row>

      {/* Tickets List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row>
          <Col>
            {tickets.length === 0 ? (
              <Card className="text-center py-5">
                <Card.Body>
                  <p className="text-muted">No tickets found</p>
                </Card.Body>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="mb-3 shadow-sm">
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <div className="d-flex align-items-start mb-2">
                          <h5 className="mb-0 me-3">{ticket.subject}</h5>
                          {getStatusBadge(ticket.status)}
                          <span className="text-capitalize">
                            {ticket.status.replace("_", " ")}
                          </span>
                          {ticket.priority && (
                            <span className="ms-3">
                              {getPriorityBadge(ticket.priority)}
                            </span>
                          )}
                        </div>
                        <div className="d-flex gap-3 text-muted small">
                          <span>
                            <strong>{ticket.ticket_id}</strong>
                          </span>
                          {ticket.category && (
                            <span className="text-capitalize">
                              {ticket.category}
                            </span>
                          )}
                          <span>Assigned to: {ticket.admin_name}</span>
                          {ticket.message_count > 0 && (
                            <span>
                              <i className="bi bi-chat-dots me-1"></i>
                              {ticket.message_count} message
                              {ticket.message_count !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div className="text-muted small mt-2">
                          Created: {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </Col>
                      <Col
                        md={4}
                        className="d-flex align-items-center justify-content-end"
                      >
                        <Button
                          variant="outline-primary"
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          <i className="bi bi-eye me-2"></i>
                          View Details
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Card className="mt-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Showing {((currentPage - 1) * pagination.per_page) + 1} to{" "}
                      {Math.min(currentPage * pagination.per_page, pagination.total)} of{" "}
                      {pagination.total} results
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
          </Col>
        </Row>
      )}

      {/* Create Ticket Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Support Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">
            Submit a new support request and our team will assist you promptly.
          </p>
          <Form onSubmit={handleCreateTicket} role="form">
            <Form.Group className="mb-3">
              <Form.Label>
                Subject <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="documentation">Documentation</option>
                    <option value="consultation">Consultation</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Please provide detailed information about your issue"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => {
          setShowDetailsModal(false);
          setSelectedTicket(null);
        }}
        size="lg"
        centered
      >
        {selectedTicket && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedTicket.subject}
                <small className="text-muted ms-2">
                  {selectedTicket.ticket_id}
                </small>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <div className="d-flex gap-2 mb-3">
                {getStatusBadge(selectedTicket.status)}
                <span className="text-capitalize">
                  {selectedTicket.status.replace("_", " ")}
                </span>
                {selectedTicket.priority && (
                  <span className="ms-2">
                    {getPriorityBadge(selectedTicket.priority)}
                  </span>
                )}
              </div>

              <div className="mb-3 text-muted small">
                <div>Assigned to: {selectedTicket.admin_name}</div>
                <div>
                  Created: {new Date(selectedTicket.created_at).toLocaleString()}
                </div>
              </div>

              <hr />

              {/* Messages */}
              <div className="mb-3">
                {selectedTicket.messages &&
                  selectedTicket.messages.map((message) => (
                    <Card
                      key={message.id}
                      className={`mb-2 ${
                        message.sender_role === "client"
                          ? "ms-auto bg-success text-white"
                          : "me-auto bg-light"
                      }`}
                      style={{ maxWidth: "75%" }}
                    >
                      <Card.Body className="py-2 px-3">
                        <div className="d-flex justify-content-between mb-1">
                          <strong className="small">{message.sender_name}</strong>
                          <small
                            className={
                              message.sender_role === "client"
                                ? "text-white-50"
                                : "text-muted"
                            }
                          >
                            {new Date(message.created_at).toLocaleString()}
                          </small>
                        </div>
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {message.body}
                        </div>
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
          </>
        )}
      </Modal>
    </Container>
  );
}

export default ClientTickets;