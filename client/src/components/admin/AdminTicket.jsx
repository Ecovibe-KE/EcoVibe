import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";

// Import your API service
// import { getTickets, getTicketStats, updateTicket } from '../services/tickets';

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchTicketsAndStats();
  }, [statusFilter, searchQuery]);

  const fetchTicketsAndStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Uncomment and use your actual API calls
      // const [ticketsData, statsData] = await Promise.all([
      //   getTickets({ status: statusFilter !== 'all' ? statusFilter : null, search: searchQuery }),
      //   getTicketStats()
      // ]);
      
      // Mock data for demonstration
      const ticketsData = {
        tickets: [
          {
            id: 1,
            ticket_id: "TK-001",
            subject: "ESG Report Generation Issue",
            client_name: "John Doe",
            client_company: "GreenTech Solutions Ltd",
            category: "Technical",
            priority: "high",
            status: "open",
            admin_name: "Dr. Sarah Mwangi",
            created_at: "2025-03-15T10:32:00Z",
          },
          {
            id: 2,
            ticket_id: "TK-002",
            subject: "Request for Additional Consultation",
            client_name: "John Doe",
            client_company: "GreenTech Solutions Ltd",
            category: "General",
            priority: "medium",
            status: "in_progress",
            admin_name: "James Kariuki",
            created_at: "2025-03-14T09:15:00Z",
          },
          {
            id: 3,
            ticket_id: "TK-003",
            subject: "Compliance Documentation Request",
            client_name: "John Doe",
            client_company: "GreenTech Solutions Ltd",
            category: "Documentation",
            priority: "low",
            status: "resolved",
            admin_name: "Mary Wanjiku",
            created_at: "2025-03-12T11:00:00Z",
          },
          {
            id: 4,
            ticket_id: "TK-004",
            subject: "Billing Inquiry",
            client_name: "Michael Ochieng",
            client_company: "EcoManufacturing Inc.",
            category: "Billing",
            priority: "medium",
            status: "open",
            admin_name: "Unassigned",
            created_at: "2025-03-13T14:00:00Z",
          },
          {
            id: 5,
            ticket_id: "TK-005",
            subject: "Training Session Request",
            client_name: "Grace Wanjiku",
            client_company: "Clean Energy Corp.",
            category: "Consultation",
            priority: "low",
            status: "closed",
            admin_name: "James Kariuki",
            created_at: "2025-03-10T08:30:00Z",
          },
        ],
      };

      const statsData = {
        total: 5,
        open: 2,
        in_progress: 1,
        resolved: 1,
        closed: 1,
      };

      setTickets(ticketsData.tickets);
      setStats(statsData);
    } catch (err) {
      setError("Failed to fetch tickets. Please try again.");
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      // Uncomment to use your actual API
      // await updateTicket(selectedTicket.id, { status: newStatus });
      
      // Update local state
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, status: newStatus } : t
      ));
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      
      // Refresh stats
      fetchTicketsAndStats();
    } catch (err) {
      console.error("Error updating ticket:", err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { bg: "danger", icon: "⊗", text: "Open" },
      in_progress: { bg: "warning", icon: "⟳", text: "In Progress" },
      resolved: { bg: "success", icon: "✓", text: "Resolved" },
      closed: { bg: "secondary", icon: "🗑", text: "Closed" },
    };
    const config = statusConfig[status] || statusConfig.open;
    return (
      <Badge bg={config.bg} className="d-flex align-items-center gap-1">
        <span>{config.icon}</span> {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "danger",
      medium: "warning",
      low: "success",
    };
    return <Badge bg={colors[priority] || "secondary"}>{priority}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">Tickets Management</h2>
          <p className="text-muted">Manage customer support tickets and track resolutions</p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} lg={2}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                  <span style={{ fontSize: "1.5rem" }}>📋</span>
                </div>
                <div>
                  <div className="text-muted small">Total</div>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={2}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-2 rounded me-3">
                  <span style={{ fontSize: "1.5rem" }}>⊗</span>
                </div>
                <div>
                  <div className="text-muted small">Open</div>
                  <h3 className="mb-0">{stats.open}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={2}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-2 rounded me-3">
                  <span style={{ fontSize: "1.5rem" }}>⟳</span>
                </div>
                <div>
                  <div className="text-muted small">In Progress</div>
                  <h3 className="mb-0">{stats.in_progress}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={2}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                  <span style={{ fontSize: "1.5rem" }}>✓</span>
                </div>
                <div>
                  <div className="text-muted small">Resolved</div>
                  <h3 className="mb-0">{stats.resolved}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={2}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-secondary bg-opacity-10 p-2 rounded me-3">
                  <span style={{ fontSize: "1.5rem" }}>🗑</span>
                </div>
                <div>
                  <div className="text-muted small">Closed</div>
                  <h3 className="mb-0">{stats.closed}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col xs={12} md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search tickets, customers, or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={3} className="mt-2 mt-md-0">
          <InputGroup>
            <InputGroup.Text>⚑</InputGroup.Text>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Form.Select>
          </InputGroup>
        </Col>
        <Col xs={12} md={3} className="mt-2 mt-md-0">
          <InputGroup>
            <InputGroup.Text>⚠</InputGroup.Text>
            <Form.Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* Tickets Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Support Tickets</h5>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading tickets...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
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
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No tickets found
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <div>
                            <strong>{ticket.subject}</strong>
                            <div className="text-muted small">{ticket.ticket_id}</div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{ticket.client_name}</div>
                            <div className="text-muted small">{ticket.client_company}</div>
                          </div>
                        </td>
                        <td>{ticket.category}</td>
                        <td>{getPriorityBadge(ticket.priority)}</td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-success rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: "24px", height: "24px", fontSize: "0.75rem" }}
                            >
                              {ticket.admin_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </div>
                            <span className="small">{ticket.admin_name}</span>
                          </div>
                        </td>
                        <td className="small">{formatDate(ticket.created_at)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleViewTicket(ticket)}
                              title="View ticket"
                            >
                              👁
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewTicket(ticket)}
                              title="Edit ticket"
                            >
                              ✏
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Ticket Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Ticket ID:</strong>
                    <div>{selectedTicket.ticket_id}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Subject:</strong>
                    <div>{selectedTicket.subject}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Customer:</strong>
                    <div>
                      {selectedTicket.client_name}
                      <div className="text-muted small">{selectedTicket.client_company}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Category:</strong>
                    <div>{selectedTicket.category}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Priority:</strong>
                    <div>{getPriorityBadge(selectedTicket.priority)}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Assigned To:</strong>
                    <div>{selectedTicket.admin_name}</div>
                  </div>
                </Col>
              </Row>

              <hr />

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Update Status</strong>
                </Form.Label>
                <Form.Select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Add Comment</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Type your message here..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary">Send Message</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminTickets;