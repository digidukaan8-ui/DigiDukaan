import { Outlet } from "react-router-dom"
import { Header, Footer } from "./components/index.js"
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Header />
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
      <Footer />
    </>
  )
}

export default App