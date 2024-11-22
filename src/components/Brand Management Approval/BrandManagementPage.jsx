import { useState } from "react";
import BMAIHandler from "../IssuesHandler/BMAIHandler";
import { GetAuthData, postSupportAny } from "../../lib/store";
import { useNavigate } from "react-router-dom";
import AccountInfo from "../IssuesHandler/AccountInfo";


const BrandManagementPage = ({ accountList,setSubmitForm,salesRepId }) => {
    const navigate = useNavigate();
    const reasons = [{ name: "RTV Request", icon: '/assets/request.png', desc: "" }, { name: "Other", icon: '/assets/Other.png', desc: "" }];
    const [reason, setReason] = useState();

    const resetHandler = () => {
    }
    function sortingList(data) {
        data.sort(function (a, b) {
            return new Date(b.CreatedDate) - new Date(a.CreatedDate);
        });
        return data;
    }

    return (
        <section>
            <BMAIHandler reasons={reasons} reason={reason} setReason={setReason} resetHandler={resetHandler} />
            {reason && <AccountInfo reason={reason} Accounts={accountList} postSupportAny={postSupportAny} GetAuthData={GetAuthData} setSubmitForm={setSubmitForm} typeId={"0123b000000GfOEAA0"} salesRepId={salesRepId}/>}
        </section>
    )
}
export default BrandManagementPage