import PropTypes from "prop-types";

const ImpactCard = ({ image, title, description, alt }) => {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <article className="impact-card h-100">
        <img src={image} className="impact-card__image" alt={alt || title} />
        <div className="impact-card__body">
          <h3 className="fw-bold mb-3">{title}</h3>
          <p className="mb-0">{description}</p>
        </div>
      </article>
    </div>
  );
};

ImpactCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

export default ImpactCard;
