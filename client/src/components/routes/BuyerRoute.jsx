import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../../store/auth"; 

function SellerRoute() {
  const { user } = useAuthStore(); 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "buyer") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default SellerRoute;
