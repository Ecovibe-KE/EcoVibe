import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pagination } from "react-bootstrap";
import { getBlogs } from "../api/services/blog";
import BlogCard from "./BlogCard";
import BlogSideBar from "./BlogSideBar";
import style from "../css/Blog.module.css";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // ✅ pagination state
  const blogsPerPage = 3; // ✅ number of blogs per page

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogs();
        if (response.status === "success") {
          setBlogs(response.data);
        } else {
          toast.error(`Error: ${response.message}`);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to fetch blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // --- Filter blogs by category and search ---
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      !selectedCategory || blog.category === selectedCategory;

    const title = (blog.title ?? "").toLowerCase();
    const author = (blog.author_name ?? "").toLowerCase();
    const content = (blog.content ?? "").toLowerCase();

    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      author.includes(searchTerm.toLowerCase()) ||
      content.includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, startIndex + blogsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top when changing page
  };

  // --- Reset to page 1 when filters/search change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  return (
    <div>
      <div className="text-center">
        <h1 className={`fw-bold d-block ${style.sustainabilityUnderline}`}>
          Sustainability Insights
        </h1>
      </div>
      <p className="p-4 text-center">
        Explore our latest articles on eco-friendly living, green technologies,
        and environmental conservation. Stay informed and inspired to make a
        positive impact on the planet.
      </p>

      <div
        className={`d-flex border-0 rounded p-4 gap-4 ${style.blogContainer}`}
      >
        <div className="p-4 text-start w-100">
          {loading ? (
            <p>Loading blogs...</p>
          ) : currentBlogs.length === 0 ? (
            <p>No blogs match your search or selected category.</p>
          ) : (
            <>
              <div className="d-grid gap-4">
                {currentBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    id={blog.id}
                    title={blog.title}
                    imageUrl={blog.image}
                    description={blog.preview}
                    createdAt={blog.date_created}
                    author={blog.author_name}
                    preview={blog.excerpt}
                    onReadMore={(id) => navigate(`/blog/${id}`)}
                  />
                ))}
              </div>

              {/* ✅ Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination className="customPagination justify-content-center mt-4">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </Pagination>


                </div>
              )}

            </>
          )}
        </div>

        {/* --- Sidebar (desktop) --- */}
        <div
          className={`d-none d-lg-flex flex-column align-items-center w-50 gap-4 ${style.blogContainer}`}
        >
          <BlogSideBar
            style={style}
            blogs={blogs}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {/* --- Offcanvas sidebar --- */}
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="sidebarOffcanvas"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Blog</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
            ></button>
          </div>
          <div
            className={`offcanvas-body d-flex flex-column align-items-center justify-content-center w-100 gap-4 ${style.blogContainer}`}
          >
            <BlogSideBar
              style={style}
              blogs={blogs}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
