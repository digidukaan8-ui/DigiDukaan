import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { Home, About, Contact, Login, Register, Faq, TermsOfService, PrivacyPolicy, Support, Logout, Store, Product, UsedProduct, Profile, Cart,Category } from './pages/index.js'
import { BuyerRoute, SellerRoute, AdminRoute, StoreForm, NewProductForm, UsedProductForm, ReviewForm, DeliveryForm } from './components/index.js'
import Dashboard from './pages/admin/Dashboard.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<Home />} />
      <Route path='about' element={<About />} />
      <Route path='contact' element={<Contact />} />
      <Route path='login' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path='faq' element={<Faq />} />
      <Route path='termsofservice' element={<TermsOfService />} />
      <Route path='privacypolicy' element={<PrivacyPolicy />} />
      <Route path='support' element={<Support />} />
      <Route path='logout' element={<Logout />} />
      <Route path='product' element={<Product />} />
      <Route path='used-product' element={<UsedProduct />} />
      <Route path='category-product' element={<Category />} />

      <Route path='buyer' element={<BuyerRoute />} >
        <Route path='profile' element={<Profile />} />
        <Route path='cart' element={<Cart />} />
        <Route path='dashboard' element={<Dashboard />} />
      </Route>

      <Route path='seller' element={<SellerRoute />} >
        <Route path='used-product' element={<UsedProductForm />} />
        <Route path='new-product' element={<NewProductForm />} />
        <Route path='store' element={<Store />} />
        <Route path='store-details' element={<StoreForm />} />
        <Route path='delivery-zone' element={<DeliveryForm />} />
      </Route>

      <Route path='admin' element={<AdminRoute />} >

      </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
