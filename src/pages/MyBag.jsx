import React , {useState , useEffect} from "react";
import AppLayout from "../components/AppLayout";
import MyBagFinal from "../components/MyBagFinal";
import { GetAuthData } from "../lib/store";
import { getPermissions } from "../lib/permission";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";

const MyBag = () => {
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [showOrderFor,setShowOrderFor] = useState(false)
  const navigate = useNavigate()
      // Fetch user data and permissions
      useEffect(() => {
        const fetchData = async () => {
          try {
            const user = await GetAuthData();
    
            if (!selectedSalesRepId) {
              setSelectedSalesRepId(user.Sales_Rep__c);
            }
    
            const userPermissions = await getPermissions();
            setShowOrderFor(userPermissions?.modules?.godLevel)
            
            // If no permission, redirect to dashboard
            if (userPermissions?.modules?.order?.create === false) {
              PermissionDenied();
              navigate("/dashboard");
            }
            
          } catch (error) {
            console.log({ error });
          }
        };
        
        fetchData();
      }, [ selectedSalesRepId]);
    
  return (
    <AppLayout>
      <MyBagFinal showOrderFor={showOrderFor}/>
    </AppLayout>
  );
};

export default MyBag;