import { Outlet } from "react-router-dom"
import { Header, Footer } from "./components/index.js"
import { Toaster } from 'react-hot-toast';
import useThemeStore from "./store/theme.js";
import { useEffect } from "react";
import Loader from "./components/Loader.jsx";

function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <>
      <Header />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: isDark ? "#0a0a0a" : "#f3f4f6",
            color: isDark ? "#ffffff" : "#000000",
          },
        }}
      />
      <Loader />
      <Outlet />
      <Footer />
    </>
  )
}

export default App