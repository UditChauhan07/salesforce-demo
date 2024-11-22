import React from 'react';
import AppLayout from "../AppLayout";
import ProductDetails from '../../pages/productDetails';
import { useParams } from 'react-router-dom';
import './ProductPage.css'; // Import CSS for styling

function ProductPage() {
  const params = useParams();
  let productId = params.id;

  return (
    <AppLayout>
      <div className="product-page-container">
        <ProductDetails productId={productId} isPopUp={false} />
      </div>
    </AppLayout>
  );
}

export default ProductPage;
