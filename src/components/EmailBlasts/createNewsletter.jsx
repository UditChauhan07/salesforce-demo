import { useNavigate } from "react-router-dom";
import React , {useState , useEffect} from 'react'
import AppLayout from "../AppLayout"
import MultiStepForm from "./Custom"
import { BackArrow } from "../../lib/svg";
import { getPermissions } from "../../lib/permission";
import PermissionDenied from "../PermissionDeniedPopUp/PermissionDenied";
const CreateNewsletter = () => {
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
    return (<AppLayout>
        <div className="emailContainer">
            <div style={{
                marginBottom: '0px', borderBottom: '1px dashed #000',
                paddingBottom:'10px',
                margin: '27px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 className="d-flex justify-content-start align-items-center" style={{ color: '#000', fontFamily: "Montserrat-400", fontSize: '20px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal', letterSpacing: '2px'}}><span style={{ cursor: 'pointer' }} onClick={() => { navigate('/newsletter') }}><BackArrow /></span><p style={{margin:0}}>&nbsp;Create Newsletter</p></h2>
            </div>
            <MultiStepForm />
        </div>
    </AppLayout>)
}
export default CreateNewsletter