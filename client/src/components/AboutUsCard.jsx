import "../css/aboutus.css";

function AboutUsCard({
  imageSourceName,
  heading,
  paragraphContent,
  padding,
  customClass,
  widthSettings = "",
}) {
  return (
    <>
      <div className={`col d-flex justify-content-center ${widthSettings}`}>
        <div className={`card rounded-5 ${padding}`}>
          <img
            src={`/${imageSourceName}`}
            className={customClass}
            alt="target icon"
          />
          <div className="card-body">
            <h5 className="card-title text-center fw-bold">{heading}</h5>
            <p
              className="card-text"
              style={{ whiteSpace: "pre-line" }}
              dangerouslySetInnerHTML={{ __html: paragraphContent }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUsCard;
