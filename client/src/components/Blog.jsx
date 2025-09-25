import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBlogs } from "../api/services/blog";
import BlogCard from "./BlogCard";
import BlogSideBar from "./BlogSideBar";
import style from "../css/Blog.module.css";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogs();
        if (response.status === "success") {
          setBlogs(response.data);
        } else {
          console.error("Error fetching blogs:", response.message);
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
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          ) : filteredBlogs.length === 0 ? (
            <p>No blogs match your search or selected category.</p>
          ) : (
            <div className="d-grid gap-4">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  id={blog.id}
                  title={blog.title}
                  imageUrl={blog.image}
                  description={blog.preview}
                  createdAt={blog.date_created}
                  author={blog.author_name}
                  onReadMore={(id) => navigate(`/blog/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- Toggle button (mobile only) --- */}
        <button
          className="btn d-lg-none mb-3 border-0"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
        >
          <i
            className={`bi bi-arrow-left-circle fs-3 ${style.toggleButtonIcon}`}
          ></i>
        </button>

        {/* --- Sidebar (desktop) --- */}
        <div
          className={`d-none d-lg-flex flex-column align-items-center justify-content-between w-50 gap-4 ${style.blogContainer}`}
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
