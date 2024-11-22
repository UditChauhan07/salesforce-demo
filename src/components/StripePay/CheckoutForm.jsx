import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { originAPi } from '../../lib/store';


const CheckoutForm = ({clientSecret}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    // Get the client secret from your backend
    const { data: { clientSecret } } = await axios.post(originAPi+'/stripe/create-payment-intent', {
      amount: 2000, // Example: $20.00, must be in cents
    });

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setError(error.message);
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      setSuccess(true);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={{
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': { color: '#aab7c4' },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      }} />
      {error && <div>{error}</div>}
      <button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay $20'}
      </button>
      {success && <div>Payment Successful!</div>}
    </form>
  );
};

export default CheckoutForm;
