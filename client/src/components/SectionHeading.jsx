import PropTypes from "prop-types";

const SectionHeading = ({
  eyebrow,
  title,
  intro,
  align = "center",
  titleClassName = "",
}) => {
  return (
    <div className={`text-${align} mb-5`}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2 className={`fw-bold mb-3 ${titleClassName}`}>{title}</h2>
      {intro && <p className="section-intro mx-auto">{intro}</p>}
    </div>
  );
};

SectionHeading.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  intro: PropTypes.string,
  align: PropTypes.oneOf(["start", "center", "end"]),
  titleClassName: PropTypes.string,
};

export default SectionHeading;
