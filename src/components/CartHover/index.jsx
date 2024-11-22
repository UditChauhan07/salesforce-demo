import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import { AuthCheck, GetAuthData } from "../../lib/store";

const CartHover = () => {
    const { order } = useCart();
    const navigate = useNavigate();
    const path = window.location.pathname;
    const [ isShow,setIsShow] = useState(false);

    useEffect(()=>{
        GetAuthData().then((user)=>{

            if(user){
                setIsShow(true);
            }
       }).catch((e)=>console.error({e}))
        
    },[path])
    
    if (!order?.items?.length||!isShow) return null;
    const addMoreHandler = () => {
        localStorage.setItem("manufacturer", order.Manufacturer.name);
        localStorage.setItem("ManufacturerId__c", order.Manufacturer.id);
        localStorage.setItem("Sales_Rep__c", order.Account.SalesRepId);
        localStorage.setItem("shippingMethod", JSON.stringify({ number: order.Account.shippingMethod, method: order.Account.shippingMethod }));
        localStorage.setItem("Account", order.Account.name);
        localStorage.setItem("AccountId__c", order.Account.id);
        localStorage.setItem("address", JSON.stringify(order.Account.address));
        navigate("/product");
    }
    if(path == '/'||path == '/login'||path == '/logout') return null;
    return (
        <div className={styles.holder}>
            {path != "/my-bag" ?
                <Link to={'/my-bag'} className={styles.button}>
                    Go to My Bag
                </Link> : null}
            {path != "/product" ?
                <button className={styles.button} onClick={addMoreHandler}>
                    Add More
                </button> : null}
        </div>
    )
}
export default CartHover;