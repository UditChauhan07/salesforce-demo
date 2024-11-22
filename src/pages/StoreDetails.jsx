import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import {useParams} from "react-router-dom";
import { GetAuthData, getStoreDetails } from "../lib/store";
import { useNavigate } from "react-router-dom";
import StoreDetailCard from "../components/StoreDetail";
import LoaderV3 from "../components/loader/v3";
import { getPermissions } from "../lib/permission";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
const StoreDetails = ()=>{
    const navigate = useNavigate();
    const {id} = useParams();
    const [account,setAccount]=useState({isLoaded:false,data:{}});
    const [brandList,setBrandList] = useState([])
    const [userData, setUserData] = useState({});
    const [hasPermission, setHasPermission] = useState(null);
    const [memoizedPermissions, setMemoizedPermissions] = useState(null);
    const [selectedSalesRepId, setSelectedSalesRepId] = useState();
    useEffect(()=>{
        if(id){
            GetAuthData().then((user)=>{
                getStoreDetails({key: user.x_access_token,Id:id}).then((actDetails)=>{
                    let brands = []
                    actDetails.Brands.map((element)=>{
                        console.log({element});
                        if(element.Sales_Rep__c == user.Sales_Rep__c){
                            brands.push(element)
                        }
                    })
                    setBrandList(brands)
                    setAccount({isLoaded:true,data:actDetails})
                }).catch((actErr)=>{
                    console.log({actErr});
                })
            }).catch((userErr)=>{
                console.log({userErr});
            })
        }else{
            navigate("/");
        }
    },[id])
        // Fetch user data and permissions
        useEffect(() => {
            const fetchData = async () => {
              try {
                const user = await GetAuthData();
                setUserData(user);
        
                if (!selectedSalesRepId) {
                  setSelectedSalesRepId(user.Sales_Rep__c);
                }
        
                const userPermissions = await getPermissions();
                let m = {auditReport:userPermissions?.modules?.reports?.auditReport,order:userPermissions?.modules?.order}
                setMemoizedPermissions(m);
                setHasPermission(userPermissions?.modules?.store?.view);
        
                // If no permission, redirect to dashboard
                if (userPermissions?.modules?.store?.view === false) {
                    PermissionDenied()
                  navigate("/dashboard");
                }
                
              } catch (error) {
                console.log({ error });
              }
            };
            
            fetchData();
          }, [selectedSalesRepId]);
        
          // Check permission and handle redirection
          useEffect(() => {
            if (hasPermission === false) {
                PermissionDenied()
              navigate("/dashboard"); 

            }
          }, [hasPermission]);
    const {isLoaded,data} = account;
    return(<AppLayout>
        {isLoaded?<StoreDetailCard account={data} brandList={brandList} memoizedPermissions={memoizedPermissions}/>:<LoaderV3 text={"Please wait..."}/>}
    </AppLayout>)
}
export default StoreDetails;