import React, { useState, useCallback } from "react";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FilterListIcon from "@mui/icons-material/FilterList";
import Input from "../../utils/Input";
import Button from "../../utils/Button";
import PostCreationModal from "./BlogModal.jsx";

const ChevronDown = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const Calendar = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);
const User = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/**
 * Main application component. Replicates the Blog Management UI.
 */
const StatCard = ({ icon, value, label }) => {
  return (
    // Uses Bootstrap classes: card, p-4, rounded-3, shadow-sm, border-start
    <div className="card shadow-sm p-4 rounded-3 border-start border-4 border-light d-flex flex-row align-items-center">
      <div className="flex-shrink-0 me-3">{icon}</div>
      <div>
        <div className="fs-3 fw-semibold text-dark">{value}</div>
        <div className="fs-5 fw-medium text-secondary small">{label}</div>
      </div>
    </div>
  );
};

/**
 * Reusable component for the tag badges (like "published", "featured").
 */
const PostBadge = ({ text, colorClass, bgColorClass, hasIcon = false }) => {
  return (
    // Uses Bootstrap Badge/Pill structure
    <span
      className={`badge rounded-pill ${bgColorClass} ${colorClass} py-1 px-2 me-1`}
    >
      {hasIcon && (
        <span
          className="d-inline-block me-1 rounded-circle"
          style={{
            width: "0.5rem",
            height: "0.5rem",
            backgroundColor: colorClass.includes("green")
              ? "var(--bs-green)"
              : "var(--bs-yellow)",
          }}
        ></span>
      )}
      <small className="fw-medium">{text}</small>
    </span>
  );
};

/**
 * Main application component. Replicates the Blog Management UI.
 */
const BlogManagementUi = () => {
  // State for controlling dropdown visibility
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Mock data for dropdown options
  const categoryOptions = [
    "All Categories",
    "Compliance",
    "ESG",
    "Regulations",
    "Finance",
  ];
  const statusOptions = ["All Status", "Published", "Drafts", "Archived"];

  // Mock state for a single post item
  const mockPost = {
    title: "New ESG Regulations: What Your Business Needs to Know",
    description:
      "Kenya's updated ESG compliance requirements for 2024 and how they affect your sustainability strategy.",
    author: "Dr. Sarah Mwangi",
    date: "2024-03-10",
    status: "published",
    categories: ["ESG", "Regulations", "Compliance"],
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsCategoriesOpen(false);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsStatusOpen(false);
  };

  return (
    <div className="min-vh-100 bg-light py-4 py-sm-5 font-sans">
      <div className="container-fluid">
        {/* Post Creation Modal */}
        <PostCreationModal isOpen={isModalOpen} onClose={closeModal} />

        <header className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
          <div>
            <h1 className="fs-3 fw-semibold text-dark">Welcome to Blogs,</h1>
            <p className="text-secondary mt-1">
              Create and manage blog posts, announcements, and insights
            </p>
          </div>
          <Button
            action={"add"}
            variant="primary"
            label={"Create Post"}
            onClick={openModal}
          />
        </header>

        {/* Stat Cards Section - Uses Bootstrap Grid (Row/Col) */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-3">
            <StatCard
              icon={<LibraryBooksIcon fontSize="large" color="primary" />}
              value="5"
              label="Total Posts"
            />
          </div>
          <div className="col-12 col-md-3">
            <StatCard
              icon={<CardMembershipIcon fontSize="large" color="success" />}
              value="3"
              label="Published"
            />
          </div>
          <div className="col-12 col-md-3">
            <StatCard
              icon={<EditNoteIcon fontSize="large" color="warning" />}
              value="1"
              label="Drafts"
            />
          </div>
        </div>

        {/* Search and Filter Section - Uses Card and Form classes */}
        <div className="card shadow-sm border-0 p-3 mb-5 rounded-3">
          <div className="d-flex flex-column flex-md-row gap-3">
            {/* Search Input - Form Control and position utility */}
            <div className="flex-grow-1 position-relative">
              <Input
                type="text"
                placeholder="Search posts by title, content, or tags..."
                className="p-0 rounded-3  border-light-subtle"
              />
            </div>

            <div className="d-flex gap-3 flex-wrap">
              <FilterListIcon fontSize="large" color="success" />
            </div>

            {/* Dropdowns */}
            <div className="d-flex gap-3">
              {/* Category Dropdown Menu */}
              <div className="dropdown" style={{ width: "11rem" }}>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="btn btn-outline-secondary dropdown-toggle w-100 py-2 d-flex justify-content-between align-items-center"
                  type="button"
                >
                  <span className="small">{selectedCategory}</span>
                  <ChevronDown
                    className={`ms-2 small transition-transform ${isCategoriesOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                {isCategoriesOpen && (
                  <div
                    className="dropdown-menu show rounded-3 shadow-lg p-0"
                    style={{
                      minWidth: "100%",
                      border: "1px solid var(--bs-light-border-subtle)",
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <a
                        key={option}
                        className={`dropdown-item small ${option === selectedCategory ? "bg-primary-subtle text-primary fw-medium" : "text-dark"}`}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategorySelect(option);
                        }}
                      >
                        {option}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown Menu */}
              <div className="dropdown" style={{ width: "9rem" }}>
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="btn btn-outline-secondary dropdown-toggle w-100 py-2 d-flex justify-content-between align-items-center"
                  type="button"
                >
                  <span className="small">{selectedStatus}</span>
                  <ChevronDown
                    className={`ms-2 small transition-transform ${isStatusOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                {isStatusOpen && (
                  <div
                    className="dropdown-menu show rounded-3 shadow-lg p-0 end-0"
                    style={{
                      minWidth: "100%",
                      border: "1px solid var(--bs-light-border-subtle)",
                    }}
                  >
                    {statusOptions.map((option) => (
                      <a
                        key={option}
                        className={`dropdown-item small ${option === selectedStatus ? "bg-primary-subtle text-primary fw-medium" : "text-dark"}`}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleStatusSelect(option);
                        }}
                      >
                        {option}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Post Item Section - Uses Card structure for the list item */}
        <div className="card shadow-lg border-0 p-4 rounded-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div className="flex-grow-1 min-w-0 me-md-4">
            {/* Tags/Badges */}
            <div className="mb-2">
              <PostBadge
                text="published"
                colorClass="text-success"
                bgColorClass="bg-success-subtle"
                hasIcon={true}
              />
              <PostBadge
                text="Compliance"
                colorClass="text-primary"
                bgColorClass="bg-primary-subtle"
              />
              <PostBadge
                text="Featured"
                colorClass="text-warning"
                bgColorClass="bg-warning-subtle"
                hasIcon={true}
              />
            </div>

            {/* Title and Description */}
            <h2 className="fs-5 fw-semibold text-dark mb-1 lh-sm">
              {mockPost.title}
            </h2>
            <p className="small text-secondary mb-3 text-truncate">
              {mockPost.description}
            </p>

            {/* Metadata and Tags */}
            <div className="d-flex flex-wrap align-items-center small text-secondary">
              <div className="d-flex align-items-center me-3">
                {/* Secondary Tags/Categories */}
                {mockPost.categories.map((tag) => (
                  <span
                    key={tag}
                    className="badge bg-secondary-subtle text-dark-emphasis rounded-pill me-1"
                  >
                    {tag}
                  </span>
                ))}
                <span className="badge bg-secondary-subtle text-dark-emphasis rounded-pill border border-dashed border-secondary me-1">
                  +1
                </span>
              </div>

              <div className="d-flex align-items-center me-3 mt-2 mt-sm-0">
                <User
                  className="text-secondary me-1"
                  style={{ width: "1rem", height: "1rem" }}
                />
                <span className="fw-medium">{mockPost.author}</span>
              </div>
              <div className="d-flex align-items-center mt-2 mt-sm-0">
                <Calendar
                  className="text-secondary me-1"
                  style={{ width: "1rem", height: "1rem" }}
                />
                <span>{mockPost.date}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Uses standard Bootstrap Button styling for icons */}
          <div className="d-flex gap-2 mt-3 mt-md-0 flex-shrink-0">
            <Button
              action="update"
              label="Edit Post"
              outline
              hoverColor={"#FFF"}
              hoverTextColor={"#000"}
            />
            <Button action="delete" label="Delete Post" outline />
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogManagementUi;
