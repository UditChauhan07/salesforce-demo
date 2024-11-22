import AppLayout from "../components/AppLayout"
import Newsletter from "../components/EmailBlasts/Newsletter";
import { getPermissions } from "../lib/permission";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
const EmailSetting = () => {

    const navigate = useNavigate()
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userPermissions = await getPermissions()
                if (userPermissions?.modules?.emailBlast?.view === false) { PermissionDenied();navigate('/dashboard'); }
            } catch (error) {
                console.log("Permission Error", error)
            }
        }
        fetchData()
    }, [])
    return (<AppLayout
    >
        <div className="emailContainer">
            <Newsletter />
        </div>
    </AppLayout>)
}
export default EmailSetting