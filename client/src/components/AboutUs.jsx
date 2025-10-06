import AboutUsPartition from "../components/AboutUsPartition";
import "../css/aboutus.css";

function AboutUs() {
  // const missionText =
  //   "To empower businesses with innovative digital solutions that drive growth, enhance efficiency, and create meaningful connections with their audiences.We strive to understand our clients' unique challenges and opportunities, delivering tailored strategies that produce measurable results.";

  // Bootstrap screen setting for core values and meet our team section
  const screenSetting = "row-cols-lg-3";

  const missionVisionContent = [
    {
      imageSourceName: "Target.png",
      heading: "Our Mission",
      paragraphContent:
        "To drive Agenda 2063 by environmental and social change through expert consultancy services, empowering organizations with sustainable practices and strategies that create lasting positive impact for businesses, communities, and the environment.",
    },
    {
      imageSourceName: "Eye.png",
      heading: "Our Vision",
      paragraphContent:
        "To be the premier catalyst for sustainable transformation in Kenya and Africa as a whole. We use global guidelines to accelerate the vision. Currently, Agenda 2030 is fueling our strategic analysis. Aim being to drive business excellence and community prosperity.",
    },
  ];

  const coreValueContent = [
    {
      imageSourceName: "Target.png",
      heading: "Impact & Accountability",
      paragraphContent:
        "We measure success by the tangible positive impact our work creates, holding ourselves accountable for delivering measurable results that advance sustainability goals.",
    },
    {
      imageSourceName: "Target.png",
      heading: "Integrity & Transparency ",
      paragraphContent:
        "We maintain the highest ethical standards in all our engagements, providing honest assessments and transparent reporting that builds trust and accountability.",
    },
    {
      imageSourceName: "Target.png",
      heading: "Innovation & Excellence",
      paragraphContent:
        "We continuously evolve our methodologies and stay ahead of industry trends, delivering innovative solutions that exceed client expectations and drive meaningful change.",
    },
    {
      imageSourceName: "Target.png",
      heading: "Collaboration & Partnership",
      paragraphContent:
        "We believe in the power of partnerships, working closely with clients, stakeholders, and communities to co-create sustainable solutions that benefit all parties.",
    },
  ];

  const meetOurTeamContent = [
    {
      imageSourceName: "Sharon.jpeg",
      heading: "Sharon Maina",
      paragraphContent: "CEO & Founder",
    },
    // {
    //   imageSourceName: "creativeDirector.png",
    //   heading: "Sarah Williams",
    //   paragraphContent: "Creative Director",
    // },
    // {
    //   imageSourceName: "leadDeveloper.png",
    //   heading: "Joseph David",
    //   paragraphContent: "Lead Developer",
    // },
  ];

  const missionVision = "Mission & Vision";
  const coreValues = "Our Core Values";
  const meetOurTeam = "Meet Our Team";

  function displayPage(
    title,
    contentArray,
    extraSetting = "",
    padding = "p-4",
    customClass = "icon-sm mx-auto",
  ) {
    return (
      <>
        <AboutUsPartition
          key={title}
          title={title}
          contentArray={contentArray}
          extraSetting={extraSetting}
          padding={padding}
          customClass={customClass}
        ></AboutUsPartition>
      </>
    );
  }

  return (
    <>
      <section>
        <div className="container-fluid p-lg-5">
          <div className="row g-0 align-items-center">
            <h1 className="mb-5 fw-semibold display-6 text-center about-underline">
              About Us
            </h1>
            <div className="col-lg-6">
              <div className="col-lg-8 mx-auto text-center">
                <h2 className="fw-bold">Empowering Sustainable Solutions</h2>
                <p className="lead">
                  Ecovibe Kenya provides consultancy services and keeps up to
                  date with evolving ESG landscape. We lead the way in offering
                  cutting-edge solutions for sustainable development. Join us as
                  we work towards a greener and more socially responsible world.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="my-5 mt-lg-0 text-md-center text-lg-start">
                <img alt="" className="img-fluid" src="/chairs.png" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="text-bg-light text-center p-4">
        {displayPage(missionVision, missionVisionContent)}
        {displayPage(coreValues, coreValueContent, screenSetting)}
        {displayPage(
          meetOurTeam,
          meetOurTeamContent,
          screenSetting,
          "",
          "card-img-top rounded-top-5 image-fixed-height",
        )}
      </section>
    </>
  );
}

export default AboutUs;
