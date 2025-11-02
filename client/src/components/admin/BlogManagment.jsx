import React, { useState, useCallback, useEffect } from "react";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FilterListIcon from "@mui/icons-material/FilterList";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import Input from "../../utils/Input";
import Button from "../../utils/Button";
import PostCreationModal from "./BlogModal.jsx";
import { fetchAdminBlogs, deleteBlog } from "../../api/services/blog.js";
import { toast } from "react-toastify";

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
    <div className="card p-4 rounded-3 border-start border-4 border-light d-flex flex-row align-items-center">
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

  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadBlogsTrigger, setLoadBlogsTrigger] = useState(0); // To trigger re-fetching blogs

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const openModal = useCallback(
    (postId) => {
      if (postId && typeof postId !== "object") {
        const postToEdit = blogs.find((p) => p.id === postId);
        setEditingPost(postToEdit);
      } else {
        setEditingPost(null);
      }
      setIsModalOpen(true);
    },
    [blogs],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingPost(null);
    setLoadBlogsTrigger(loadBlogsTrigger + 1);
  }, [loadBlogsTrigger]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAdminBlogs();
        setBlogs(response.data);
        setFilteredBlogs(response.data);
      } catch (err) {
        setError("Failed to fetch blogs. Please try again later.");
        if (import.meta.env.MODE !== "production") {
          console.error("Error fetching blogs:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [loadBlogsTrigger]);

  const filterBlogs = useCallback(() => {
    let updatedBlogs = [...blogs];

    if (selectedCategory !== "All Categories") {
      updatedBlogs = updatedBlogs.filter(
        (blog) => blog.category === selectedCategory,
      );
    }

    if (selectedStatus !== "All Status") {
      updatedBlogs = updatedBlogs.filter((blog) => {
        if (selectedStatus === "Published") return blog.status === "Published";
        if (selectedStatus === "Drafts") return blog.status === "Draft";
        if (selectedStatus === "Archived") return blog.status === "Archived";
        return true;
      });
    }

    setFilteredBlogs(updatedBlogs);
  }, [blogs, selectedCategory, selectedStatus]);

  useEffect(() => {
    filterBlogs();
  }, [filterBlogs]);

  const categoryOptions = new Set(blogs.map((blog) => blog.category));

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(
    (blog) => blog.status === "published",
  ).length;
  const draftBlogs = blogs.filter((blog) => blog.status === "draft").length;
  const newsletterBlogs = blogs.filter(
    (blog) => blog.type === "newsletter",
  ).length;

  const statusOptions = ["All Status", "Published", "Drafts", "Archived"];

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
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<LibraryBooksIcon fontSize="large" color="primary" />}
              value={totalBlogs}
              label="Total Posts"
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<CardMembershipIcon fontSize="large" color="success" />}
              value={publishedBlogs}
              label="Published"
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<EditNoteIcon fontSize="large" color="warning" />}
              value={draftBlogs}
              label="Drafts"
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <StatCard
              icon={<NewspaperIcon fontSize="large" color="danger" />}
              value={newsletterBlogs}
              label="Newsletters"
            />
          </div>
        </div>

        {/* Search and Filter Section - Uses Card and Form classes */}
        <div className="card border-0 p-3 mb-5 rounded-3">
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
                    {[...categoryOptions].map((option) => (
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
                        className={`dropdown-item small ${option.toLocaleLowerCase() === selectedStatus.toLocaleLowerCase() ? "bg-primary-subtle text-primary fw-medium" : "text-dark"}`}
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

        {/* Post Creation Modal */}

        <div className="d-flex mb-4 row md-col gap-4">
          <PostCreationModal
            isOpen={isModalOpen}
            onClose={closeModal}
            post={editingPost}
          />
          {isLoading && <div className="text-secondary">Loading posts...</div>}
          {error && <div className="text-danger">{error}</div>}
          {!isLoading && filteredBlogs.length === 0 && (
            <div className="text-secondary">No posts found.</div>
          )}
          <div className="d-flex flex-column gap-4">
            {!isLoading &&
              filteredBlogs.map((post) => (
                <BlogPostItem
                  key={post.id}
                  post={post}
                  onEdit={openModal}
                  onDelete={async (postId) => {
                    if (
                      confirm(
                        "Are you sure you want to delete this post? This action cannot be undone.",
                      )
                    ) {
                      // Call delete API here
                      try {
                        setIsLoading(true);
                        await deleteBlog(postId);
                        toast.success("Post deleted successfully.");
                      } catch (err) {
                        toast.error(
                          "Failed to delete post. Please try again later.",
                        );
                        if (import.meta.env.MODE !== "production") {
                          console.error("Error deleting post:", err);
                        }
                      } finally {
                        setIsLoading(false);
                      }
                      // After deletion, refresh the blog list
                      setLoadBlogsTrigger(loadBlogsTrigger + 1);
                    }
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogPostItem = ({ post, onEdit, onDelete }) => {
  return (
    <div className="card border-0 p-4 rounded-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
      <div className="flex-grow-1 min-w-0 me-md-4">
        {/* Tags/Badges */}
        <div className="mb-2">
          <PostBadge
            text={post.category}
            colorClass="text-primary"
            bgColorClass="bg-primary-subtle"
            hasIcon={false}
          />

          <PostBadge
            text={post.reading_duration}
            colorClass="text-secondary"
            bgColorClass="bg-secondary-subtle"
          />

          <PostBadge
            text={post.status}
            colorClass={
              post.status === "published"
                ? "text-success"
                : post.status === "draft"
                  ? "text-warning"
                  : "text-secondary"
            }
            bgColorClass={
              post.status === "published"
                ? "bg-success-subtle"
                : post.status === "draft"
                  ? "bg-warning-subtle"
                  : "bg-secondary-subtle"
            }
          />

          <PostBadge
            text={post.type}
            colorClass="text-secondary"
            bgColorClass="bg-secondary-subtle"
            hasIcon={true}
          />
        </div>

        {/* Title and Description */}
        <h2 className="fs-5 fw-semibold text-dark mb-1 lh-sm">{post.title}</h2>
        <p className="small text-secondary mb-3 text-truncate">
          {post.excerpt}
        </p>

        {/* Metadata and Tags */}
        <div className="d-flex flex-wrap align-items-center small text-secondary">
          <div className="d-flex align-items-center me-3">
            {/* Secondary Tags/Categories */}
            {post.category.split(",").map((tag) => (
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
            <span className="fw-medium">{post.author_name}</span>
          </div>
          <div className="d-flex align-items-center mt-2 mt-sm-0">
            <Calendar
              className="text-secondary me-1"
              style={{ width: "1rem", height: "1rem" }}
            />
            <span>{post.date_created}</span>
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
          onClick={() => onEdit(post.id)}
        />
        <Button
          action="delete"
          label="Delete Post"
          outline
          hoverColor={"#FFF"}
          hoverTextColor={"#000"}
          onClick={() => onDelete(post.id)}
        />
      </div>
    </div>
  );
};

export default BlogManagementUi;
