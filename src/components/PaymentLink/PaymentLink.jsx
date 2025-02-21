import React, { useEffect, useState } from 'react';
import {  useParams } from 'react-router-dom';
import { getBrandPaymentDetails,   originAPi , getPaymentLinkDetails} from '../../lib/store';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'; 
import Loading from '../Loading';
import Swal from 'sweetalert2';
function PaymentLink() {
    const [keys, setKeys] = useState({ pk: null, sk: null });
    const [clientSecret, setClientSecret] = useState(null);
    const [orderData , setOrderData] = useState()
     const [token , setToken ] = useState()
     const { order_Id, randomToken } = useParams()
     const [isPageLoad ,  setIsPageLoad] = useState(true)
     const [productData , setProductData] = useState()
        
     const fullUrl = window.location.href;
 
    
    // const checkUrl =  () => {
    //     if(orderData){
    //         if (fullUrl !== orderData?.PBL_Status__c?.trim()) {
    //             Swal.fire({
    //                 title: 'Error',
    //                 text: `The URL you are trying to reach does not contains any payment details`,
    //                 icon: 'warning',
    //                 confirmButtonText: 'OK',
    //                 customClass: {
    //                     confirmButton: 'swal2-confirm'
    //                 }
    //             }).then(() => {
                    
    //                 window.location.href = window.location.origin + "/";
    //         });  
              
    //         } else {
             
    //           setIsPageLoad(true)
    //         }
    //     }
    //     else{
    //         console.error("OrderData not retrieved")
    //     }
      
    //   };
      
    //  useEffect(()=>{
    //  checkUrl()

    //  }, [orderData])
     
  
    const fetchBrandDetails = async () => {
        try {
          
          
            const brandRes = await getBrandPaymentDetails({
                key: token,
                Id: orderData?.ManufacturerId__c,
                AccountId: orderData?.Account_ID__c,
            });

            const pk = brandRes?.brandDetails?.Stripe_Publishable_key_test__c;
            const sk = brandRes?.brandDetails?.Stripe_Secret_key_test__c;
          
            setKeys({ pk, sk });

            if (pk) {
                loadPaymentIntent(pk, sk);
            }
        } catch (error) {
            console.error("Error fetching brand details:", error);
        }
    };
    const getOrderDetails = async ()=>{
       
        let res = await getPaymentLinkDetails({ Id : order_Id  })
        // console.log({res})
        setToken(res.access_token)
        if(res?.success === false){
            Swal.fire({
                title: 'Error',
                text: 'Either Payment has already been made for this order. Or  This order does not exist.',
                icon: 'warning',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'swal2-confirm'
                }
            }).then(() => {

                
                window.location.href = window.location.origin + "/";
        });

        }
        setProductData(res.data2)
     
        setOrderData(res.data?.[0])
        
    }
  
    useEffect(()=>{
        getOrderDetails()
    }, [])
    const shipping_cost = orderData?.Shipment_cost__c ? JSON.parse(orderData?.Shipment_cost__c) : 0 
    const totalAmount = Number((orderData?.Amount + shipping_cost).toFixed(2));
   
    const loadPaymentIntent = async (pk, sk) => {
        try {
            const response = await fetch(`${originAPi}/stripe/tJByBO16LO`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
            paymentId: sk,
            orderId : order_Id , 
            PoNumber :orderData?.PO_Number__c , 
            accountNumber : orderData?.Account_Number__c , 
            accountName : orderData?.Account?.Name, 
            access_token : token
                }),
            });

            const data = await response.json();
          
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            }
        } catch (error) {
            console.error("Error loading payment intent:", error);
        }
    };
   
    const stripePromise = keys.pk ? loadStripe(keys.pk) : null;
 
   
    useEffect(() => {
        if (orderData) {
            fetchBrandDetails();
            
        }
    }, [orderData]);
    return (
        <div>
            
            {stripePromise && clientSecret && isPageLoad ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret = {clientSecret} orderData = {orderData} amount = {totalAmount} productData = {productData}/>
                </Elements>
            ) : (
                <div style={{
                    display: "flex",
                    height : "100vh",
                    alignItems : "center",
                    justifyContent : "center"
                }}>
                    <Loading/>
                </div>
                
            )}
        </div>
    );
}


export default PaymentLink;


