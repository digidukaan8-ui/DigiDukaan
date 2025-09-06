import { useSearchParams } from "react-router-dom";
import { UsedProductDetails } from "../../components";

function UsedProduct() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  return (
    <>
      <UsedProductDetails id={productId} />
    </>
  );
}

export default UsedProduct;