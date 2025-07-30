import { Outlet } from "react-router-dom"
import { Header, Footer } from "./components/index.js"

function App() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default App