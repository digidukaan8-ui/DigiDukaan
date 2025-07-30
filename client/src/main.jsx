import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { Home, About, Contact, Login, Register } from './pages/index.js'
import { BuyerRoute, SellerRoute, AdminRoute } from './components/index.js'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='' element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='contact' element={<Contact />} />
      <Route path='login' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path='buyer' element={
        <BuyerRoute>

        </BuyerRoute>
      } />
      <Route path='seller' element={
        <SellerRoute>

        </SellerRoute>
      } />
      <Route path='admin' element={
        <AdminRoute>

        </AdminRoute>
      } />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
