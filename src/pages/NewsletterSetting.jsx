import { useEffect } from "react"
import AppLayout from "../components/AppLayout"
import SettingNotify from "../components/EmailBlasts/SettingNotify"
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied"
import { getPermissions } from "../lib/permission"
import { useNavigate } from "react-router-dom"

const NewsletterSetting = ()=>{
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
    return(<AppLayout><SettingNotify /></AppLayout>)
}
export default NewsletterSetting