import React, { useEffect } from 'react';
import AppLayout from "../AppLayout";
import ProductDetails from '../../pages/productDetails';
import { useNavigate, useParams } from 'react-router-dom';
import './ProductPage.css'; // Import CSS for styling
import { GetAuthData } from '../../lib/store';
import PermissionDenied from '../PermissionDeniedPopUp/PermissionDenied';

function ProductPage() {
  const navigate = useNavigate();
  const params = useParams();
  let productId = params.id;
  useEffect(() => {
      const fetchPermission = async () => {
          let user = await GetAuthData();
          if (user.permission) {
              let permission = JSON.parse(user.permission);
              
              if (permission?.modules?.order?.view === false) {
                  PermissionDenied()
                  navigate("/dashboard");
              }
          }

      }
      fetchPermission();
  }, [])
  return (
    <AppLayout>
      <div className="product-page-container">
        <ProductDetails productId={productId} isPopUp={false} />
      </div>
    </AppLayout>
  );
}

export default ProductPage;
