import { useState } from "react";
import { BiLock } from "react-icons/bi";
import Styles1 from "./AS.module.css"
import Styles from "../../components/My Retailers/Styles.module.css"

const AccountSelector = ({ reason, AccountList, accountObj, contactObj }) => {
    const { accountId, setAccountId } = accountObj;
    const { contactId, setContactId } = contactObj;
    const [searchAct, setSearchAct] = useState()
    const shakeHandler = (id = null) => {

        let lock1 = document.getElementById(id || "lock1");
        if (lock1) {
            setTimeout(() => {
                lock1.classList.remove(Styles1.shake);
            }, 300)
            lock1.classList.add(Styles1.shake)
        }
    }
    return (
        <section style={{ borderBottom: '1px solid #ccc' }}>
            <p className={Styles1.reasonTitle}><span style={{ cursor: "pointer" }} onClick={() => shakeHandler()}>Select the accont you want to handle:</span> {!accountId && reason && <input type="text" placeholder='Search Account' autoComplete="off" className={Styles1.searchBox} title="You can search by Account Name" onKeyUp={(e) => { setSearchAct(e.target.value) }} id="poSearchInput" style={{ width: '120px' }} />} {!reason && <BiLock id="lock1" style={{ float: 'right' }} />}</p>
            <div className={Styles1.dGrid}>
                {AccountList && AccountList.length > 0 && AccountList.map((item, index) => (
                    <div className={`${Styles.mainRetailer} flex flex-col justify-between cardHover`}>
                        <h2 className="leading-normal">{item.Name}</h2>
                        <div>
                            <div>
                                <div className={Styles.RetailerImg}>
                                    {/* <img
                                        className="position-absolute w-100"
                                        src={require("../../components/My Retailers/Image/MapLocation.png")}
                                        alt="img"
                                        style={{
                                            zIndex: 0,
                                        }}
                                    /> */}
                                    <div className="d-flex ps-2 gap-2" style={{ zIndex: 1 }}>
                                        <img className={Styles.ControlerImg} src={"/assets/images/LocationPin.svg"} alt="img" />
                                        <p
                                            className="w-100 mb-0"
                                            style={{
                                                fontFamily: "Arial",
                                                fontWeight: 500,
                                                fontSize: "14px",
                                                color: "black",
                                            }}
                                        >
                                            {"No Location"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={Styles.BrandName}>
                                <div className={Styles.Brandspan}>
                                    {item.contact?.map((brand, index) => {
                                        return (
                                            <span style={{ height: "fit-content" }} key={index}>
                                                {brand.Name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
export default AccountSelector;