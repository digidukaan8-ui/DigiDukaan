import { useSearchParams } from "react-router-dom";
import { ProductDetails } from "../../components/index";

function Product() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");

  return (
    <>
      <ProductDetails id={productId} />
    </>
  );
}

export default Product;