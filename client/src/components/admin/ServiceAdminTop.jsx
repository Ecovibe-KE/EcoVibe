import { Col } from "react-bootstrap";
import "../../css/ServiceAdmin.css";

function ServiceAdminTop({
  imageSource,
  number,
  text,
  imageSetting,
  colSetting,
}) {
  return (
    <Col className={`p-0 ${colSetting}`}>
      <aside className="shadow p-3 rounded-2 bg-white d-flex align-items-center">
        <img
          src={imageSource}
          className={`bg-${imageSetting}-subtle rounded-2 me-3 object-fit-contain`}
          alt="service summary icon"
        />
        <section>
          <h5 className="mb-0">{number}</h5>
          <p className="m-0">{text}</p>
        </section>
      </aside>
    </Col>
  );
}

export default ServiceAdminTop;
