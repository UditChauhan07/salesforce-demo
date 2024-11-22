import OwlCarousel from "react-owl-carousel";
import Styles from "./index.module.css";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { GetAuthData, ShareDrive, brandDetails, getProductImageAll, originAPi, topProduct } from "../../lib/store";
import LoaderV2 from "../loader/v2";
import { Link } from "react-router-dom";
import ContentLoader from "react-content-loader";
import ProductDetails from "../../pages/productDetails";

const BrandDetailCard = ({ brandId }) => {
    const brand = brandDetails[brandId];
    const [topProducts, setTopProduct] = useState({ isLoaded: false, data: [] })
    const [productImages, setProductImages] = useState({ isLoaded: false, images: {} });
    const [productId, setProductId] = useState()
    const d = new Date();
    let monthIndex = d.getMonth();
    useEffect(() => {
        let data = ShareDrive();
        if (!data) {
            data = {};
        }
        if (brandId) {
            if (!data[brandId]) {
                data[brandId] = {};
            }
            if (Object.values(data[brandId]).length > 0) {
                setProductImages({ isLoaded: true, images: data[brandId] })
            } else {
                setProductImages({ isLoaded: false, images: {} })
            }
        }
        GetAuthData().then((user) => {
            topProduct({ manufacturerId: brandId }).then((products) => {
                setTopProduct({ isLoaded: true, data: products.data })
                let productCode = "";
                products.data?.map((product, index) => {
                    productCode += `'${product.ProductCode}'`
                    if (products.data.length - 1 != index) productCode += ', ';
                })
                getProductImageAll({ rawData: { codes: productCode } }).then((res) => {
                    console.log({ res });
                    if (res) {
                        if (data[brandId]) {
                            data[brandId] = { ...data[brandId], ...res }
                        } else {
                            data[brandId] = res
                        }
                        ShareDrive(data)
                    }
                    setProductImages({ isLoaded: true, images: res ?? {} });
                }).catch((err) => {
                    console.log({ aaa111: err });
                })
            }).catch((productErr) => {
                console.log({ productErr });
            })
        }).catch((userErr) => {
            console.log({ userErr });
        })
        console.log("booooo");
    }, [])
    const options = {
        loop: true,
        margin: 50,
        nav: true,
        dots: false,
        navText: [
            '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="13" viewBox="0 0 42 13" fill="none">' +
            '<path d="M0.357289 6.71437L9.62174 12.273C10.155 12.593 10.8333 12.2089 10.8333 11.587L10.8333 1.41296C10.8333 0.79112 10.155 0.407029 9.62174 0.72696L0.357289 6.28563C0.195455 6.38273 0.195455 6.61727 0.357289 6.71437Z" fill="#7F7F7F"/>' +
            '<path d="M10.8333 6.5L41.1667 6.5" stroke="#7F7F7F" stroke-linecap="round" stroke-linejoin="round"/>' +
            "</svg>",
            '<svg xmlns="http://www.w3.org/2000/svg" width="43" height="13" viewBox="0 0 43 13" fill="none">' +
            '<path d="M41.8093 6.28563L32.5449 0.726957C32.0117 0.407025 31.3333 0.791116 31.3333 1.41295L31.3333 11.587C31.3333 12.2089 32.0117 12.593 32.5449 12.273L41.8093 6.71437C41.9712 6.61727 41.9712 6.38273 41.8093 6.28563Z" fill="#7F7F7F"/>' +
            '<path d="M31.3333 6.5L0.999975 6.5" stroke="#7F7F7F" stroke-linecap="round" stroke-linejoin="round"/>' +
            "</svg>",
        ],
        responsive: {
            0: {
                items: 1,
            },
            767: {
                items: 2,
            },
            1000: {
                items: 3,
            },
        },
    };
    // console.log({ topProducts });


    return (
        <section>
            <div className="container">
                <div className="mt-5 mb-5"></div>
                <div className="row">
                    <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12 m-auto">
                        <div className={`${Styles.BnadLogo} w-100`}>
                            <img className={`img-fluid ${Styles.brandLogoHolder}`} src={brand?.img?.src || "/assets/images/dummy.png"} />
                        </div>
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12 m-auto ">
                        <div className="row">
                            <div className={`col-xl-7 col-lg-6 col-md-12 col-sm-12 ${brand?.tagLine ? Styles.borderRight : null}`}>
                                <img className={`img-fluid ${Styles.brandLogoHolder}`} src={`${originAPi}/brandImage/${brandId}.png`} />
                            </div>
                            {brand?.tagLine ?
                                <div className="col-xl-5 col-lg-6 col-md-12 col-sm-12 m-auto ">
                                    <h1 className={Styles.titleWithLogo}>
                                        {brand.tagLine}
                                    </h1>
                                </div> : null}
                        </div>
                        <div className={Styles.autoHeight} id="ScrollRight" dangerouslySetInnerHTML={{ __html: brand?.desc ?? 'NA' }} />
                    </div>
                </div>

                {(topProducts.isLoaded && topProducts?.data.length)||(!topProducts.isLoaded) ?
                    <div className={`${Styles.TopProducts} ${Styles.NewArriavalsList}`}>
                        <h3 className="mt-5">Popular selling products</h3>
                        <OwlCarousel className="owl-theme" {...options}>
                            {topProducts.isLoaded ?
                                topProducts?.data?.map((item) => {

                                    return (<div class="item">
                                        <div>
                                            <div className={Styles.ArriavalsInnerContent}>
                                                <h4 onClick={() => setProductId(item.Id)}>{item.Name}</h4>
                                                <p>{item.Description ?? 'NA'}</p>

                                                <Link to={'/my-retailers?manufacturerId=' + brandId}>
                                                    Shop The Collection
                                                </Link>
                                                <div className="fitContent" onClick={() => setProductId(item.Id)}>
                                                    {(productImages?.isLoaded || item.ProductImage) ? (
                                                        <img className="zoomInEffect"
                                                            style={{ maxHeight: '320px', width: 'auto', margin: '10px auto' }}
                                                            src={item.ProductImage ? item.ProductImage : productImages?.images?.[item.ProductCode]?.ContentDownloadUrl ?? "\\assets\\images\\dummy.png"}
                                                        />
                                                    ) : (
                                                        <div className="d-grid place-content-center" style={{ height: '300px', margin: 'auto' }}>
                                                            <LoaderV2 mods={{ height: '150px', width: '150px' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>)
                                }) : <>
                                    <div class="item" style={{ width: '24vw', border: '1px solid #ccc', padding: '10px', borderRadius: '10px' }}>
                                        <ContentLoader />
                                    </div>
                                    <div class="item" style={{ width: '24vw', border: '1px solid #ccc', padding: '10px', borderRadius: '10px' }}>
                                        <ContentLoader />
                                    </div>
                                    <div class="item" style={{ width: '24vw', border: '1px solid #ccc', padding: '10px', borderRadius: '10px', margin: '0 10px' }}>
                                        <ContentLoader />
                                    </div>
                                </>}
                        </OwlCarousel>
                    </div> : null}
            </div>
            <ProductDetails productId={productId} setProductDetailId={setProductId} />
        </section>
    );
}
export default BrandDetailCard