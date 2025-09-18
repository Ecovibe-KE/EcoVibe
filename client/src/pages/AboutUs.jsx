import NavBar from "../components/Navbar"

function AboutUs() {
    return (
        <>
            <NavBar></NavBar>
            <section className="py-3">
                <div className="container-fluid p-lg-0">
                    <div className="row g-0 align-items-center">
                        <h1 className="fw-semibold display-6 text-center about-underline">About Us</h1>
                        <div className="col-lg-6">
                            <div className="col-lg-8 mx-auto">
                                <h2 className="fw-bold">Empowering Sustainable Solutions</h2>
                                <p className="lead">Ecovibe Kenya provides consultancy services and keeps up to date with evolving ESG landscape. We lead the way in offering cutting-edge solutions for sustainable development. Join us as we work towards a greener and more socially responsible world.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="mt-5 mt-lg-0"><img alt="" className="img-fluid" src="/chairs.png" /></div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AboutUs