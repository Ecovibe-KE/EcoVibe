import Button from "../utils/Button";
import calendarIcon from "../assets/Calendar.png";
import userIcon from "../assets/User.png";
import placeholderImage from "../assets/placeholder.png";

function BlogCard({
  id,
  title = "Untitled",
  imageUrl,
  description = "",
  createdAt,
  author = "Unknown",
  onReadMore,
}) {
  const preview =
    description.length > 100
      ? description.slice(0, 100).replace(/\s+\S*$/, "") + "..."
      : description;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "Unknown date";

  return (
    <div className="blog-card">
      <img
        src={imageUrl || placeholderImage}
        alt={title}
        className="blog-card-image"
        style={{
          width: "100%",
          aspectRatio: "16/9",
          objectFit: "cover",
          borderRadius: "0.5rem",
        }}
      />

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
  );
}

export default BlogCard;
