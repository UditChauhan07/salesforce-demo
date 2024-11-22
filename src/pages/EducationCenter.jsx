import React , {useState , useEffect} from "react";
import LogoHeader from "../components/All Headers/logoHeader/LogoHeader";
import TopNav from "../components/All Headers/topNav/TopNav";
import Header from "../components/All Headers/header/Header";
import HelpSection from "../components/Footer/HelpSection";
import Footer from "../components/Footer/Footer";
import Layout from "../components/Layout/Layout";
import AppLayout from "../components/AppLayout";
import { getPermissions } from "../lib/permission";
import { GetAuthData } from "../lib/store";
import { useNavigate } from "react-router-dom";
const EducationCenter = () => {
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [userData, setUserData] = useState({});
  const [hasPermission, setHasPermission] = useState(null);


  const navigate = useNavigate()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await GetAuthData();
        setUserData(user);

        if (!selectedSalesRepId) {
          setSelectedSalesRepId(user.Sales_Rep__c);
        }

        const userPermissions = await getPermissions();
        setHasPermission(userPermissions?.modules?.educationCenter?.view);

        // If no permission, redirect to dashboard
        if (userPermissions?.modules?.educationCenter?.view === false) {
          navigate("/dashboard");
        }
        
      } catch (error) {
        console.log({ error });
      }
    };
    
    fetchData();
  }, [navigate, selectedSalesRepId]);

  // Check permission and handle redirection
  useEffect(() => {
    if (hasPermission === false) {
      navigate("/dashboard");  // Redirect if no permission
    }
  }, [hasPermission, navigate]);

  return (
    <AppLayout>
      <div className="row d-flex flex-column justify-content-center align-items-center lg:min-h-[300px] xl:min-h-[400px]">
          <p className="m-0 fs-2 font-[Montserrat-400] text-center text-[14px] tracking-[2.20px]">
            Coming Soon...
          </p>
      </div>
      {/* <OrderStatusFormSection /> */}
    </AppLayout>
  );
};

export default EducationCenter;
