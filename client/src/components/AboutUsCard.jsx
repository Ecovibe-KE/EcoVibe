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
            <h5 className="card-title">{heading}</h5>
            <p className="card-text">{paragraphContent}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUsCard;
