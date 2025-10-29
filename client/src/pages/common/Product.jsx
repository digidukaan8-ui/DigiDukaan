import { useSearchParams } from "react-router-dom";
import { ProductDetails, Review, RecommendProduct, Location } from "../../components/index";

function Product() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  return (
    <>
      <Location />
      <ProductDetails id={productId} />
      <RecommendProduct id={productId} />
      <Review id={productId} />
    </>
  );
}

export default Product;