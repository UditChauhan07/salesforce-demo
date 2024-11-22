import AppLayout from "../components/AppLayout"
import {useParams} from "react-router-dom";
import BrandDetailCard from "../components/BrandDetail";
const BrandDetails = ()=>{
    const {id} = useParams();
    return(<AppLayout>
        <BrandDetailCard brandId={id}/>
    </AppLayout>)
}
export default BrandDetails