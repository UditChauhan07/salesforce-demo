
import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { originAPi } from '../../lib/store';
import Loading from '../Loading';

const StripePay = ({ PK_KEY, SK_KEY, amount  , PO_Number , description , uniqueId , order , AccountName , AccountNumber }) => {
    const stripePromise = loadStripe(PK_KEY);
    const [clientSecret, setClientSecret] = useState('');
    const [orderDes , setOrderDes] = useState(description)
    const [PO_num , setPO_num] = useState(PO_Number)
 
    useEffect(() => {
        if (PK_KEY && SK_KEY) {
            fetch(`${originAPi}/stripe/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: amount , paymentId: SK_KEY , 

                    accountName :AccountName, 
                    PoNumber: PO_num  , 
                    accountNumber : AccountNumber
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setClientSecret(data.clientSecret);
                })
                .catch((error) => console.error('Error fetching client secret:', error));
        }
    }, [PK_KEY, SK_KEY, amount]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
        },
    };

    return !PK_KEY || !SK_KEY ? (
        <div>Missing Stripe keys</div>
    ) : clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm clientSecretkKey={clientSecret} orderDes = {orderDes} PONumber = {PO_num} 
            amount = {amount}
            uniqueId = {uniqueId} order = {order} />
        </Elements>
    ) : (
        <Loading height={'50vh'} />
    );
};

export default StripePay;
