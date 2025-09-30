import Button from "../utils/Button";
import calendarIcon from "../assets/Calendar.png";
import userIcon from "../assets/User.png";
import placeholderImage from "../assets/placeholder.png";

function BlogCard({
  id,
  title = "Untitled",
  imageUrl,
  createdAt,
  author = "Unknown",
  onReadMore,
  preview,
}) {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "Unknown date";

  return (
    <div className="blog-card card bg-white shadow-sm border-0 rounded-5">
      <img
        src={imageUrl || placeholderImage}
        alt={title}
        className="blog-card-image"
        style={{
          width: "100%",
          aspectRatio: "16/9",
          objectFit: "cover",
          borderRadius: "1rem 1rem 0 0",
        }}
      />

      <div className="p-3 p-md-4">
        <div className="blog-card-meta mt-2 mb-2 d-flex align-items-center gap-2">
          <img src={calendarIcon} alt="calendar icon" />
          <time dateTime={createdAt}>{formattedDate}</time>
          <img src={userIcon} alt="user icon" />
          <span>{author}</span>
        </div>
        <h3 className="blog-card-title">{title}</h3>
        <p className="blog-card-preview">{preview}</p>

        <Button
          onClick={() => onReadMore(id)}
          size="md"
          color="#28a745"
          hoverColor="#218838"
        >
          Read More →
        </Button>
      </div>
    </div>
  );
}

export default BlogCard;
