import AboutUs from "./pages/AboutUs"
import Playground from "./components/Playground"
import App from "./components/App"
import Contact from "./components/Contact"

const routes = [
    { path: "/", element: <App></App> },
    { path: "/playground", element: <Playground></Playground> },
    { path: "/about", element: <AboutUs></AboutUs> },
    { path: "/contact", element: <Contact></Contact> },
]

export default routes