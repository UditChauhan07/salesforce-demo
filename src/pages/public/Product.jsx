import { useEffect, useState } from "react";
import LoginHeader from "../../components/All Headers/loginHeader/LoginHeader"
import { useNavigate, useParams } from "react-router-dom";
import { publicProductDetails } from "../../lib/store";
import ProductDetailCard from "../../components/ProductDetailCard";
import Loading from "../../components/Loading";
import ModalPage from "../../components/Modal UI";
import HelpSection from "../../components/Footer/HelpSection";
import Footer from "../../components/Footer/Footer";

const PublicProduct = () => {
    const { id, token } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({ isloaded: false, data: {} });
    const [alert, setAlert] = useState(false);
    useEffect(() => {
        if (id && token) {
            publicProductDetails({ id, token }).then((productRes) => {
                console.log({ productRes });
                if (!productRes?.data?.Id && productRes.message != "") {
                    if (product.message?.message) {
                        setAlert(productRes?.message?.code)
                    } else {
                        setAlert(productRes.message)
                    }
                } else {
                    setProduct({ isloaded: true, data: productRes.data });
                }
            }).catch((productErr) => {
                console.log({ productErr });
            })
        }
    }, [])
    if (!id && !token) return navigate("/");
    return (
        <section>
            <LoginHeader />
            {alert ? <ModalPage
                open
                content={
                    <div className="d-flex flex-column gap-3">
                        <h2 style={{ textDecoration: 'underline' }}>Warning</h2>
                        <p>
                            {alert}
                            <br />
                            Rediecting to home page.
                        </p>
                        <div className="d-flex justify-content-around ">
                            <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '150px' }} onClick={() => {
                                setAlert(false);
                                // navigate("/");
                                window.location.href = "/"
                            }}>
                                Go to Home
                            </button>
                        </div>
                    </div>
                }
                onClose={() => {
                    setAlert(false);
                    window.location.href = "/"
                    navigate("/");
                }}
            /> :
                product.isloaded ?
                    <div className="productDetailContainer" style={{margin:'1rem auto 4rem'}}>
                        {product.data?.Id ?
                            <ProductDetailCard product={product} orders={{}} isAddtoCart={false} /> : null}
                    </div> : <Loading height={'70vh'} />}
                    <HelpSection />
                    <Footer  readOnly/>
        </section>
    )
}
export default PublicProduct