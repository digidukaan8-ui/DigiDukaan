import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { Home, About, Contact, Login, Register, Faq, TermsOfService, PrivacyPolicy, Support, UsedProduct, AddProduct, StoreForm } from './pages/index.js'
import { BuyerRoute, SellerRoute, AdminRoute } from './components/index.js'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='' element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='contact' element={<Contact />} />
      <Route path='login' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path='faq' element={<Faq />} />
      <Route path='termsofservice' element={<TermsOfService />} />
      <Route path='privacypolicy' element={<PrivacyPolicy />} />
      <Route path='support' element={<Support />} />
      <Route path='add-product' element={<AddProduct />} />
      <Route path='store' element={<StoreForm />} />
      <Route path='used-product' element={<UsedProduct />} />

      <Route path='buyer' element={<BuyerRoute />} >

      </Route>

      <Route path='seller' element={<SellerRoute />} >
        <Route path='used-product' element={<UsedProduct />} />
      </Route>

      <Route path='admin' element={<AdminRoute />} >

      </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
