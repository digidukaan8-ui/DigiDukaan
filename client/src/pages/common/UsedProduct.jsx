import { useSearchParams } from "react-router-dom";
import { UsedProductDetails, Location } from "../../components/index";

function UsedProduct() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  return (
    <>
      <Location />
      <UsedProductDetails id={productId} />
    </>
  );
}

export default UsedProduct;