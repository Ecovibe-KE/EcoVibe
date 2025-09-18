import AboutUs from "./pages/AboutUs"
import App from "./components/App"

const routes = [
    { path: "/", element: <App></App> },
    { path: "/about", element: <AboutUs></AboutUs> }
]

export default routes