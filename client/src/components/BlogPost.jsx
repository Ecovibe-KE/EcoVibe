import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../utils/Button";
import { getBlogById } from "../api/services/blog";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await getBlogById(id);
        setBlog(data);
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

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found.</p>;

  const formattedDate = new Date(blog.date_created).toLocaleDateString();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button
        onClick={() => navigate(-1)}
        size="sm"
        color="#6c757d"
        hoverColor="#5a6268"
      >
        ← Back
      </Button>

      <h1 className="text-3xl font-bold my-4">{blog.title}</h1>

      <div className="flex items-center text-sm text-gray-500 mb-4 gap-4">
        <div className="flex items-center gap-1">
          <img src="/assets/Calendar.png" alt="calendar" className="w-4 h-4" />
          <time dateTime={blog.date_created}>{formattedDate}</time>
        </div>
        <div className="flex items-center gap-1">
          <img src="/assets/User.png" alt="author" className="w-4 h-4" />
          <span>{blog.author_name}</span>
        </div>
      </div>

      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full rounded-lg mb-4"
        />
      )}

      <p className="text-gray-800 leading-relaxed">{blog.content}</p>
    </div>
  );
};

export default BlogPost;
