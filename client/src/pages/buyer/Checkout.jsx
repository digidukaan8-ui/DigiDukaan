import { useState, useEffect } from "react";
import useCartStore from "../../store/cart";

function Checkout() {
  const { cart } = useCartStore();
  const [storeIds, setStoreIds] = useState([]);

  useEffect(() => {
    if (cart && cart.length > 0) {
      const ids = cart.map((product) => product.productId.storeId._id);
      const uniqueIds = [...new Set(ids)];
      setStoreIds(uniqueIds);
    } else {
      setStoreIds([]);
    }
  }, [cart]);

  return (
    <div className="min-h-screen pt-60">
      {storeIds.map((id) => (
        <div key={id}>{id}</div>
      ))}
    </div>
  )
}

export default Checkout;