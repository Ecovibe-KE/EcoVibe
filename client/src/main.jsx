import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import routes from './routes.jsx'
import './css/index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

const router = createBrowserRouter(routes)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
