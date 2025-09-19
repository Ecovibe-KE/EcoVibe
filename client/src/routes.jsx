import AboutUs from "./pages/AboutUs"
import Playground from "./components/Playground"
import App from "./components/App"

const routes = [
    { path: "/", element: <App></App> },
    { path: "/playground", element: <Playground></Playground> },
    { path: "/about", element: <AboutUs></AboutUs> }
]

export default routes