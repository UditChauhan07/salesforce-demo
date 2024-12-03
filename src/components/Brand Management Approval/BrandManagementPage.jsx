import { useState } from "react";
import BMAIHandler from "../IssuesHandler/BMAIHandler";
import { GetAuthData, postSupportAny } from "../../lib/store";
import AccountInfo from "../IssuesHandler/AccountInfo";


const BrandManagementPage = ({ accountList,setSubmitForm,salesRepId }) => {
    const reasons = [{ name: "RTV Request", icon: '/assets/request.png', desc: "" }, { name: "Other", icon: '/assets/Other.png', desc: "" }];
    const [reason, setReason] = useState();

    return (
        <section>
            <BMAIHandler reasons={reasons} reason={reason} setReason={setReason} resetHandler={null} />
            {reason && <AccountInfo reason={reason} Accounts={accountList} postSupportAny={postSupportAny} GetAuthData={GetAuthData} setSubmitForm={setSubmitForm} typeId={"0123b000000GfOEAA0"} salesRepId={salesRepId}/>}
        </section>
    )
}
export default BrandManagementPage