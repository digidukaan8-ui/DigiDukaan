import { ProductDetails } from "../../components"
import { useLocation } from "react-router-dom"

function Product() {
    const location = useLocation();
    const { product } = location.state || {};
    return (
        <>
            <ProductDetails product={product} />
        </>
    )
}

export default Product