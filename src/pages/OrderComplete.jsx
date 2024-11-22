import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const OrderComplete = ()=>{
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const payment_intent = queryParams.get('payment_intent')
    const redirect_status = queryParams.get('redirect_status')
    console.log({redirect_status,payment_intent});
 useEffect(()=>{

 },[])   
    return(null)
}
export default OrderComplete