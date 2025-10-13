import AboutUsCard from "./AboutUsCard";
import "../css/aboutus.css";

function AboutUsPartition({
  title,
  contentArray,
  extraSetting,
  padding,
  customClass,
  widthSettings
}) {
  return (
    <>
      <article className="container mb-5">
        <h2 className="mb-5 fw-semibold display-6 about-underline">{title}</h2>
        <div
          className={`row row-cols-1 row-cols-md-2 ${extraSetting} g-5 justify-content-center`}
        >
          {contentArray.map(
            ({ imageSourceName, heading, paragraphContent }, index) => {
              return (
                <AboutUsCard
                  key={index}
                  imageSourceName={imageSourceName}
                  heading={heading}
                  paragraphContent={paragraphContent}
                  padding={padding}
                  customClass={customClass}
                  widthSettings={widthSettings}
                ></AboutUsCard>
              );
            },
          )}
        </div>
      </article>
    </>
  );
}

export default AboutUsPartition;
