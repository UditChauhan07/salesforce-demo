import React, {useState } from "react";
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import Swal from 'sweetalert2';
import './style.css';
import visa from './Images/visa.svg'
import amex from'./Images/amex.svg'
import mastercard from './Images/mastercard.svg'


function CheckoutForm({ clientSecret, orderData, amount  , productData}) {
    const [email, setEmail] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [reload, setReload] = useState(false);
   

const [isBtnLoading , setIsBtnLoading] = useState(false)
    const stripe = useStripe();
    const elements = useElements();


    const handleSubmit = async (event) => {
        setIsBtnLoading(true)
        event.preventDefault();
        if (!stripe || !elements) return;
    
        try {
    
  
    
           
            const cardNumberElement = elements.getElement(CardNumberElement);
    
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardNumberElement,
                    billing_details: {
                        name: cardholderName,
                        email: email,
                    },
                },
            });
    
            if (error) {
                
                if(error.message === "A processing error occurred."){
                    Swal.fire({
                        title: 'Payment Already Completed!',
                        text: 'This order has already been paid.',
                        icon: 'info',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        window.location.href = window.location.origin + "/";
                    });
                }
            } else {
                setReload(true);
                Swal.fire({
                    title: 'Payment Successful!',
                    text: 'Your payment is successful for this order',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    window.location.href = "https://retailer.beautyfashionsales.com/thank-you";
                });
                
                console.log({paymentIntent})
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
        }
    };


  

 

    return (
        <div class="stripeCard">



        <div className="full-section">

            <div className="detail-section">
            <div className="pay-button totpara  "><p className="totpara1">Pay</p> <p className="totpara2"> ${amount}</p></div>       


         <div className="GridSperata">
                <div className="detailed-sub-section">
              
                
                <div>
        {productData.map((item) => (
            <>

            <div className="NamePrice">
              <p key={item.Id}>{item.Product2.Name}</p>

              <p key={item.Id}>${item?.TotalPrice}</p>
                
            </div>

            <div className="QuantySmall">
              <p key={item.Id}>Qty {item?.Quantity}</p>
              
              <p key={item.Id}>${item?.UnitPrice} Each</p>

              </div>
            </>

        
        ))}
      </div>
         
  </div>
    <div class="detailed-sub-section">

                    <p className="NamePrice"><span>Order Shipment Cost via [ {orderData?.Shipping_method__c}]</span> <strong> ${orderData?.Shipment_cost__c ? orderData?.Shipment_cost__c : 0}</strong> </p>
                
                </div>
                </div>

            </div>
 
           
            <div className="  payment-section">

<p className="accountNAME">{orderData?.Account.Name} </p>


            <p className="NamePrice "> <p>Manufacturer</p><p>{orderData?.ManufacturerName__c}</p> </p>
                    <p className="NamePrice  "> <p>PO Number</p><p>{orderData?.PO_Number__c}</p> </p>

                    <p className="NamePrice">
        <p>Shipping Address</p> 
        <p>{orderData?.Shipping_Street__c}, {orderData?.Shipping_City__c}, {orderData?.Shipping_State__c} {orderData?.Shipping_Country__c} {orderData?.Shipping_Zip__c}</p>  </p>


 <div class="Divider"><hr></hr><p class="Divider-Text Text Text-color--gray400 Text-fontSize--14 Text-fontWeight--400"></p></div>
               
               
<h5 className="paymentDetel">Payment Details</h5>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4 paymentL">

                        <label className="block text-gray-600 mb-0 labeREl">Card information
                        <CardNumberElement className="w-full p-2  carBor1 " options={{
                            disabled :false,
                            autocomplete :'off'
                        }} /> 
                    <div className="imgControl"> 
                    <img src={visa}/><img src={amex}/><img src={mastercard}/>
                    </div>
                    </label>
                    
                        <div className="CardElem">
                       
                            <CardExpiryElement className="w-100 p-2 carBor" />
                            
                       
                       
                            <CardCvcElement className="w-100 p-2 carBor2" />
                       
                            </div>
                            
                        
                   

                  
                    <p className="PerINfo"> Personal information</p>

                    

                    <label class="Card Holder Name"> Card Holder Name
                    <input style={{height:"40px"}} 
                        type="text" 
                        placeholder="Card Holder name" 
                        className="w-full px-4 py-2 border rounded-lg" 
                        value={cardholderName} 
                        onChange={(e) => setCardholderName(e.target.value)} 
                        required 
                    />
                    </label>


                   
                    
                    <button 
                        type="submit" 
                        disabled={!stripe} 
                        className={`w-full ${!stripe ? 'bg-gray-400' : 'bg-blue-600'} text-white py-2 rounded-lg payBtn`}
                    >
                       {isBtnLoading ? "Processing...."  : "Pay" } 
                    </button>
                </form>
            </div>

          

        </div>
        </div>
    );
}

export default CheckoutForm;

