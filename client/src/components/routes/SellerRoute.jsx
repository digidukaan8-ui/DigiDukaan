import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../../store/auth"; 

function SellerRoute() {
  const { user } = useAuthStore(); 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/seller/store" replace />;
  }

  return <Outlet />;
}

export default SellerRoute;
