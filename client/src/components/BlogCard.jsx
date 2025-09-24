import Button from "../utils/Button";
import calendarIcon from "../assets/Calendar.png";
import userIcon from "../assets/User.png";

function BlogCard({
  id,
  title,
  imageUrl,
  description,
  createdAt,
  author,
  onReadMore,
}) {
  const preview =
    description.length > 100
      ? description.slice(0, 100).replace(/\s+\S*$/, "") + "..."
      : description;

  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className="blog-card">
      <img src={imageUrl} alt={title} className="blog-card-image" />
      <div className="blog-card-meta">
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
