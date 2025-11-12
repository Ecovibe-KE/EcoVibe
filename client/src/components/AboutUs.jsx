import AboutUsPartition from "../components/AboutUsPartition";
import "../css/aboutus.css";

function AboutUs() {
  // Bootstrap screen setting for core values and meet our team section
  const screenSetting = "row-cols-lg-4";
  const extraSettings = "text-start";

  const missionVisionContent = [
    {
      imageSourceName: "Target.png",
      heading: "Our Mission",
      paragraphContent:
        "To drive sustainable development by empowering inclusive participation of communities, corporations, and stakeholders in advancing the global Sustainable Development Goals.",
    },
    {
      imageSourceName: "Eye.png",
      heading: "Our Vision",
      paragraphContent:
        "A regenerative, inclusive circular economy where people, nature, and enterprises thrive through sustainable prosperity for all.",
    },
  ];

  const coreValueContent = [
    {
      imageSourceName: "Target.png",
      heading: "Impact & Accountability",
      paragraphContent:
        "We believe true impact is achieved through inclusivity, ensuring every voice, from grassroots communities to corporate partners, contributes meaningfully to accountable and sustainable transformation.",
    },
    {
      imageSourceName: "Target.png",
      heading: "Integrity & Transparency ",
      paragraphContent:
        "We maintain the highest ethical standards in all our engagements, providing honest assessments and transparent reporting that builds trust and accountability.",
    },
    {
      imageSourceName: "Target.png",
      heading: "Sustainability Inclusion",
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
  /*
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
*/
  const WhoWeServeContent = [
    {
      imageSourceName: "account_balance.svg",
      heading: "Banks",
      paragraphContent:
        "<b>Climate Finance Mobilization:</b>  Mapping and connecting your bank to global Development Finance Institutions (DFIs), green funds, and climate investors. \n <b>ESG Integration:</b> Aligning lending portfolios with Central Bank of Kenya’s (CBK) Prudential Guidelines, ESG frameworks, and disclosure requirements. \n <b>Regulatory Capacity Building:</b> Training staff and leadership on risk disclosure, ESG due diligence, and impact reporting to ensure readiness ahead of the 2026 CBK compliance deadline. \n <b>Investment Pitch Preparation:</b> Crafting investor-ready documentation and proposals that resonate with international finance institutions.\n <b> Metrics & Evaluation Systems:</b> Establishing robust tools to track and showcase progress on environment and social performance indicators.",
    },
    {
      imageSourceName: "wallet.svg",
      heading: "Saccos",
      paragraphContent:
        "<b>Green Loan Product Design:</b> Introducing savings and loan options tailored to renewable energy, sustainable farming, and eco-friendly enterprises.\n <b>DFI & Impact Fund Access:</b> Linking SACCOs with concessional funding opportunities for climate-smart lending.\n <b>ESG & Governance Training:</b> Enhancing transparency, governance, and compliance to meet investor and regulatory expectations.\n <b>Reporting & Impact Measurement:</b> Creating simple yet credible systems for environment and social impact reporting, boosting investor trust and membership growth.",
    },
    {
      imageSourceName: "diversity.svg",
      heading: "Chamas (Investment Groups)",
      paragraphContent:
        "<b>Project Structuring:</b> Helping chamas identify viable environment-friendly business ventures \n <b> Funding Pathways:</b> Connecting them with micro-investment platforms, SACCO partnerships, and blended finance opportunities. \n <b> Financial Literacy & Governance Training:</b> Building capacity for sound management, accountability, and long-term sustainability.\n <b>Impact Storytelling:</b> Developing visibility tools that attract co-investors and grant makers by showcasing measurable local impact.",
    },
    {
      imageSourceName: "store.png",
      heading: "MSMEs",
      paragraphContent:
        "<b>Green Business Readiness:</b> Guiding MSMEs to align with ESG principles and access affordable financing.\n <b>Sustainability Certification Support:</b> Assisting in certification for sustainable production, waste reduction, and energy efficiency.\n <b>Access to Finance:</b> Linking MSMEs to concessional loans, credit guarantees, and DFI-backed facilities through banks and SACCOs.\n <b>Capacity Development:</b>. Training entrepreneurs in climate risk management, digital recordkeeping, and impact-driven operations.",
    },
  ];

  const missionVision = "Mission & Vision";
  const coreValues = "Our Core Values";
  //const meetOurTeam = "Meet Our Team";
  const WhoWeServe = "Who We Serve";
  const wsh_subheading = "Ecovibe Kenya (ECK) empowers financial institutions and community enterprises to transition toward sustainable, inclusive, and climate-resilient growth. We act as the link between compliance readiness, investor engagement, and measurable impact,  transforming sustainability into bankable opportunities."

  function displayPage(
    title,
    subheading="",
    contentArray,
    extraSetting = "",
    padding = "p-4",
    customClass = "icon-sm mx-auto",
    widthSettings = "",
  ) {
    return (
      <>
        <AboutUsPartition
          key={title}
          title={title}
          subheading={subheading}
          contentArray={contentArray}
          extraSetting={extraSetting}
          padding={padding}
          customClass={customClass}
          widthSettings={widthSettings}
        ></AboutUsPartition>
      </>
    );
  }

  return (
    <>
      <section>
        <div className="container-fluid p-lg-1">
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
        {displayPage(missionVision, "",missionVisionContent)}
        {displayPage(coreValues,"", coreValueContent, screenSetting)}
        {/*displayPage(
          meetOurTeam,
          meetOurTeamContent,
          "",
          "",
          "card-img-top rounded-top-5 image-fixed-height",
          "w-100",
        )*/}
      </section>
      <section className="text-bg-light text-center p-4">
        {displayPage(WhoWeServe, wsh_subheading, WhoWeServeContent, extraSettings)}
      </section>
      <section className="py-5 text-center bg-light">
        <div className="container">
          <h2 className="mb-5 fw-semibold display-6 about-underline">
            The ECK Advantage
          </h2>
          <p
            className="text-muted mx-auto fw-bold fw-bold lead"
            style={{ maxWidth: "800px" }}
          >
            At <b>Ecovibe Kenya (ECK)</b>, we offer an integrated model that
            bridges <b>policy, finance, and impact</b> — helping institutions
            move confidently from <b>compliance to capital</b>.
          </p>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="text-success mb-3">
                  <i
                    className="bi bi-bank fs-1"
                    style={{ color: "#37b137" }}
                  ></i>
                </div>
                <h5>Regulatory Meets Finance</h5>
                <p>
                  We blend regulatory insight with practical financing expertise
                  — aligning your institution with global sustainability and
                  compliance standards.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="text-success mb-3">
                  <i
                    className="bi bi-globe fs-1"
                    style={{ color: "#37b137" }}
                  ></i>
                </div>
                <h5>Local Experience, Global Reach</h5>
                <p>
                  Our deep understanding of Kenya’s market connects your
                  organization to international climate finance and investment
                  opportunities.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="text-success mb-3">
                  <i
                    className="bi bi-diagram-3 fs-1 "
                    style={{ color: "#37b137" }}
                  ></i>
                </div>
                <h5>Tailored Client Pathways</h5>
                <p>
                  Whether you operate in agriculture, manufacturing, energy, construction, technology, or any other sector, we design a clear, actionable roadmap from compliance to capital and sustainable growth.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="fw-semibold text-muted">
              <b>Outcome:</b> We help institutions and communities unlock green
              finance, strengthen governance, and embed climate resilience at
              every level of economic growth.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutUs;
