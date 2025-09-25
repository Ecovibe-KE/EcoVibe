import React from "react";
import Button from "../utils/Button";

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
          />
          <button
            type="submit"
            className={`border-0 bg-transparent p-0 me-3 ${style.searchButton}`}
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
        <div
          className={`d-flex justify-content-between category-row ${
            !selectedCategory ? "fw-bold" : ""
          }`}
          role="button"
          onClick={() => setSelectedCategory(null)}
        >
          <span>All</span>
          <span>({totalCount})</span>
        </div>

        {/* Other categories */}
        {Object.entries(categoryCounts).map(([category, count]) => (
          <div
            key={category}
            className={`d-flex justify-content-between mt-2 category-row ${
              selectedCategory === category ? "fw-bold" : ""
            }`}
            role="button"
            onClick={() => setSelectedCategory(category)}
          >
            <span>{category}</span>
            <span>({count})</span>
          </div>
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
          onSubmit={(e) => e.preventDefault()}
          className="d-flex flex-column align-items-start"
        >
          <input
            type="email"
            placeholder="Your email address"
            className="form-control mb-3"
            style={{ maxWidth: "250px" }}
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </>
  );
};

export default BlogSideBar;
