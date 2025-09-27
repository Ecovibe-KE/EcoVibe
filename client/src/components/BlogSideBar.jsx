import React, { useState } from "react";
import Button from "../utils/Button";
import { subscribeNewsletter } from "../api/services/newsletter";
import { toast } from "react-toastify";

const BlogSideBar = ({
  style,
  blogs,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
}) => {
  // Compute category counts
  const categoryCounts = blogs.reduce((acc, blog) => {
    acc[blog.category] = (acc[blog.category] || 0) + 1;
    return acc;
  }, {});

  const [subscribeNewsletterState, setSubscribeNewsletterState] = useState({
    email: "",
    isLoading: false,
    error: null,
    success: null,
  });

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    setSubscribeNewsletterState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      success: null,
    }));

    try {
      const response = await subscribeNewsletter(
        subscribeNewsletterState.email,
      );
      if (response.status === "success") {
        setSubscribeNewsletterState((prev) => ({
          ...prev,
          success: response.message,
          email: "", // Clear email on success
        }));
        toast.success(response.message);
      } else {
        // The error message is in response.message
        const errorMessage = response.message;
        setSubscribeNewsletterState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error.message || "Failed to subscribe. Please try again later.";
      setSubscribeNewsletterState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    } finally {
      setSubscribeNewsletterState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const totalCount = blogs.length;

  return (
    <>
      {/* --- Search Box --- */}
      <div
        className={`p-4 text-center rounded-5 w-100 position-relative ${style.sidebarBox}`}
      >
        <h5 className={`text-start fs-4 ${style.searchTitle}`}>Search</h5>
        <form
          className={`position-relative d-flex rounded-4 overflow-hidden mb-3 ${style.searchForm}`}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`form-control border-0 w-100 fs-6 ${style.searchInput}`}
            placeholder="☰ Search articles"
            aria-label="Search articles"
          />
          <button
            type="submit"
            className={`border-0 bg-transparent p-0 me-3 ${style.searchButton}`}
            aria-label="Execute search"
          >
            <i className="bi bi-search border-0"></i>
          </button>
        </form>
      </div>

      {/* --- Categories --- */}
      <div
        className={`p-4 text-start border rounded-5 w-100 ${style.sidebarBox}`}
      >
        <h5 className="mb-3">Categories</h5>
        <hr />

        {/* All */}
        <button
          type="button"
          className={`d-flex justify-content-between w-100 border-0 bg-transparent p-0 category-row ${
            !selectedCategory ? "fw-bold" : ""
          }`}
          onClick={() => setSelectedCategory(null)}
          aria-pressed={!selectedCategory}
        >
          <span>All</span>
          <span>({totalCount})</span>
        </button>

        {/* Other categories */}
        {Object.entries(categoryCounts).map(([category, count]) => (
          <button
            type="button"
            key={category}
            className={`d-flex justify-content-between mt-2 category-row ${
              selectedCategory === category ? "fw-bold" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
          >
            <span>{category}</span>
            <span>({count})</span>
          </button>
        ))}

        <hr />
      </div>

      {/* --- Newsletter --- */}
      <div
        className={`p-4 text-start border rounded-5 w-100 ${style.sidebarBox}`}
      >
        <h5 className="mb-3">Newsletter</h5>
        <hr />
        <p className="fs-6 mb-4">
          Subscribe to our newsletter for the latest updates on sustainable
          business practices.
        </p>
        <form
          onSubmit={handleNewsletterSubscribe}
          className="d-flex flex-column align-items-start"
        >
          <input
            type="email"
            placeholder="Your email address"
            className="form-control mb-3"
            style={{ maxWidth: "250px" }}
            aria-label="Enter your email address"
            value={subscribeNewsletterState.email}
            onChange={(e) =>
              setSubscribeNewsletterState((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />

          {!subscribeNewsletterState.isLoading && (
            <Button type="submit" disabled={subscribeNewsletterState.isLoading}>
              Subscribe
            </Button>
          )}

          {subscribeNewsletterState.isLoading && (
            <div className="spinner-border text-success" role="status">
              <span className="sr-only"></span>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default BlogSideBar;
