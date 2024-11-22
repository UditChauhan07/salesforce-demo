import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { originAPi } from '../../lib/store';
import Loading from '../Loading';

const StripePay = ({ PK_KEY, SK_KEY, amount = 100 }) => {
    const stripePromise = loadStripe(PK_KEY);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        if (PK_KEY && SK_KEY) {
            // Fetch the client secret from your backend
            fetch(originAPi + '/stripe/wdfefrfrgrf4t', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: amount * 100, paymentId: SK_KEY }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setClientSecret(data.clientSecret)

                })
                .catch((error) => console.error('Error fetching client secret:', error));
        }
    }, [amount]);
    if (!PK_KEY || !SK_KEY){
        return null
    }else{

    const options = {
        clientSecret, // Pass the clientSecret to the Elements provider
        appearance: {
            theme: 'stripe', // You can customize this theme or leave it default
        },
    };

    return clientSecret ? (
        <Elements stripe={stripePromise}>
            <CheckoutForm clientSecret={SK_KEY}/>
        </Elements>
    ) : (
        <Loading height={'50vh'} />
        // Loading state while fetching clientSecret
    );
}
};

export default StripePay;