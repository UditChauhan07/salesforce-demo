import AppLayout from "../components/AppLayout"
import { useNavigate, useParams } from "react-router-dom";
import BrandDetailCard from "../components/BrandDetail";
import { useEffect } from "react";
import { GetAuthData } from "../lib/store";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
const BrandDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchPermission = async () => {
            let user = await GetAuthData();
            if (user.permission) {
                let permission = JSON.parse(user.permission);
                if (permission?.modules?.brands?.view === false) {
                    PermissionDenied()
                    navigate("/dashboard");
                }
            }

        }
        fetchPermission();
    }, [])
    return (<AppLayout>
        <BrandDetailCard brandId={id} />
    </AppLayout>)
}
export default BrandDetails