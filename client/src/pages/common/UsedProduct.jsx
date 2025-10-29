import { useSearchParams } from "react-router-dom";
import { UsedProductDetails, Location, RecommendUsedProduct } from "../../components/index";

function UsedProduct() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  return (
    <>
      <Location />
      <UsedProductDetails id={productId} />
      <RecommendUsedProduct id={productId} />
    </>
  );
}

export default UsedProduct;