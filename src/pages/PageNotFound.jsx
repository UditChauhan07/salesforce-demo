import { useEffect } from "react";
import LoginHeader from "../components/All Headers/loginHeader/LoginHeader";
import DefaultPage from "../components/Default";
import { PublicCheck } from "../lib/store";
import AppLayout from "../components/AppLayout";

const PageNotFound = () => {
    return (<>
        {PublicCheck() ? <AppLayout><DefaultPage /></AppLayout> : <>        <LoginHeader />
            <DefaultPage /></>}
    </>)
}
export default PageNotFound;