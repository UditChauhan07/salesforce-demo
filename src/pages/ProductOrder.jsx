import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import LoginHeader from "../components/All Headers/loginHeader/LoginHeader";
import HelpSection from "./HelpSection";
import Footer from "../components/Footer/Footer";
import Loading from "../components/Loading";

const ProductOrder = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get('productId');
    useEffect(() => {
        localStorage.setItem("ppc", productId);
        window.location.href = window.location.origin;
    }, [productId])

    return (<>
        <LoginHeader />
        <Loading height={'50vh'} />
        <Footer readOnly />
    </>);
}
export default ProductOrder;