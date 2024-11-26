import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import OrderStatusFormSection from "../components/OrderStatusFormSection";
import CustomerSupportLayout from "../components/customerSupportLayout";
import { getPermissions } from "../lib/permission";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
import { useNavigate } from "react-router-dom";

const OrderStatusForm = () => {
  const [submitLoad,setSubmitLoad] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchData = async () => {
        try {
            const userPermissions = await getPermissions();
            setPermissions(userPermissions);
            if (userPermissions?.modules?.customerSupport?.childModules
                ?.order_Status?.create === false) { PermissionDenied(); navigate('/dashboard'); }
        } catch (error) {
            console.log("Permission Error", error)
        }
    }
    fetchData()
}, [])

// Memoize permissions to avoid unnecessary re-calculations
const memoizedPermissions = useMemo(() => permissions, [permissions]);
  if(submitLoad) return <AppLayout><Loading height={'80vh'} /></AppLayout>
  return (
    <CustomerSupportLayout permissions={permissions}>
      <OrderStatusFormSection setSubmitLoad={setSubmitLoad}/>
    </CustomerSupportLayout>
  );
};
export default OrderStatusForm;
