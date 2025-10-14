import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import Button from "../utils/Button";
import { getBlogById } from "../api/services/blog";
import CalendarIcon from "../assets/Calendar.png";
import UserIcon from "../assets/User.png";
import { RichTextEditor } from "./RichTextEditor";
import "../css/BlogPost.css"; // <-- add new styling

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchBlog = async () => {
      try {
        const data = await getBlogById(id);
        setBlog(data.data);
      } catch (error) {
        toast.error("Failed to load blog");
        console.error("Error fetching blog:", error);
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="success" />
      </div>
    );

  if (!blog) return <p className="text-center mt-5">Blog not found.</p>;

  const formattedDate = new Date(blog.date_created).toLocaleDateString();

  return (
    <Container className="blogpost-container py-5">
      <Button
        onClick={() => navigate(-1)}
        size="sm"
        color="#37b137"
        hoverColor="#f5a030"
      >
        ← Back
      </Button>

      <Row className="justify-content-center mt-4">
        <Col lg={8} md={10} sm={12}>
          <h1 className="fw-bold text-center mb-3">{blog.title}</h1>
          <h5 className="text-center text-muted mb-4">{blog.category}</h5>

          {/* Meta info */}
          <div className="d-flex justify-content-center align-items-center gap-3 text-muted small mb-4 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <img src={CalendarIcon} alt="Calendar" className="meta-icon" />
              <time dateTime={blog.date_created}>{formattedDate}</time>
            </div>
            <div className="d-flex align-items-center gap-2">
              <img src={UserIcon} alt="Author" className="meta-icon" />
              <span>{blog.author_name}</span>
            </div>
          </div>

          {/* Blog excerpt */}
          <p className="lead text-center fst-italic mb-4 px-2">
            {blog.excerpt}
          </p>

          {/* Blog image */}
          {blog.image && (
            <div className="text-center mb-5">
              <Image
                src={blog.image}
                alt={blog.title}
                className="img-fluid blogpost-image shadow-sm rounded-4"
              />
            </div>
          )}

          {/* Blog content */}
          <div className="blog-content text-start px-1">
            <RichTextEditor
              value={(() => {
                try {
                  return JSON.parse(blog.content || "{}");
                } catch (error) {
                  console.error("Failed to parse blog content:", error);
                  return [{ type: "paragraph", children: [{ text: "" }] }];
                }
              })()}
              readOnly={true}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogPost;
