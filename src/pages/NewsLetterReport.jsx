import { useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useEffect,useState } from 'react';
import EmailTable from "../components/EmailBlasts/EmailTable";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
import { getPermissions } from '../lib/permission';
const NewsLetterReport = () => {
    const location = useLocation();
    const navigate = useNavigate()
    const { year, month, day,newsletter } = location.state || {};
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
    

    const [monthList, setMonthList] = useState([]);
    const [dayList, setDayList] = useState([])
    const [selMonth, setMonth] = useState();
    const [selDay, setDay] = useState();
    const [selNewsletter, setNewsletter] = useState();
    const [selYear, setYear] = useState();
    const [filter, setFilter] = useState({});
    const [filterHelper, setFilterHelper] = useState({ day: null, month: null, year: null,newsletter:null })

    useEffect(() => {
        if (!year || !month || !day||!newsletter) {
            
            alert("no found.")
        }else{
            setDay(day)
            setMonth(month)
            setYear(year)
            setNewsletter(newsletter)
            setFilterHelper({ day, month, year,newsletter })
        }
    }, [year, month, day,newsletter])
    return (<AppLayout>
          <div className="emailContainer">
        <EmailTable setDayList={setDayList} setMonthList={setMonthList} day={selDay} month={selMonth} year={selYear} setFilter={setFilter} newsletter={selNewsletter} />
        </div>
    </AppLayout>
    )
}
export default NewsLetterReport;