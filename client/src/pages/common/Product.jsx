import { useSearchParams } from "react-router-dom";
import { ProductDetails, Review } from "../../components/index";

function Product() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  return (
    <>
      <ProductDetails id={productId} />
      <Review id={productId} />
    </>
  );
}

export default Product;