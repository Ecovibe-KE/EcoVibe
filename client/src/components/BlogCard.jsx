import Button from "../utils/Button";
import calendarIcon from "../assets/Calendar.png";
import userIcon from "../assets/User.png";
import placeholderImage from "../assets/placeholder.png";
import { Card, Image } from "react-bootstrap";

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
    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden blog-card">
      <div className="ratio" style={{ aspectRatio: "21/9" }}>
        <Image
          src={imageUrl || placeholderImage}
          alt={title}
          style={{ objectFit: "cover" }}
          fluid
        />
      </div>

      <Card.Body className="p-3 p-md-4">
        <div className="d-flex flex-wrap align-items-center gap-2 text-muted small mb-3">
          <span className="d-flex align-items-center gap-1">
            <Image src={calendarIcon} alt="calendar" width={16} height={16} />
            <time dateTime={createdAt}>{formattedDate}</time>
          </span>
          <span className="d-flex align-items-center gap-1">
            <Image src={userIcon} alt="author" width={16} height={16} />
            <span>{author}</span>
          </span>
        </div>

        <Card.Title
          as="h3"
          className="fs-5 fw-semibold text-truncate text-md-wrap mb-2"
        >
          {title}
        </Card.Title>

        <Card.Text className="text-muted mb-3">{preview}</Card.Text>

        <div className="mt-auto">
          <Button
            onClick={() => onReadMore(id)}
            size="md"
            color="#37b137"
            hoverColor="#f5a030"
          >
            Read More →
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default BlogCard;
