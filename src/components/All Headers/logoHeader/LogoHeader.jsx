import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GetAuthData } from "../../../lib/store";
import { getPermissions } from "../../../lib/permission";
import PermissionDenied from "../../PermissionDeniedPopUp/PermissionDenied";
import styles from "../topNav/index.module.css";
import { SearchIcon } from "../../../lib/svg";
import { useCart } from "../../../context/CartContext";
import axios from 'axios'
import { originAPi } from "../../../lib/store";
import { FaStore } from "react-icons/fa";
import { CustomerServiceIcon, OrderIcon } from "../../../lib/svg";
import Loading from "../../Loading";
import "./style.css";
const LogoHeader = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [key, setKey] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const { getOrderQuantity } = useCart();
  const [cartQty, setCartQty] = useState(0);
  useEffect(() => {
    setCartQty(getOrderQuantity() ?? 0)
  }, [getOrderQuantity])
  const handleInputChange = (e) => setSearchTerm(e.target.value);
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const user = await GetAuthData(); // Fetch user data
        const userPermissions = await getPermissions(); // Fetch permissions
        setPermissions(userPermissions); // Set permissions in state
      } catch (err) {
        console.error("Error fetching permissions", err);
      }
    }

    fetchPermissions(); // Fetch permissions on mount
  }, []);

  // Memoize permissions to avoid unnecessary re-calculations
  const memoizedPermissions = useMemo(() => permissions, [permissions]);

  // Handle restricted access
  const handleRestrictedAccess = () => {
    PermissionDenied();
  };



  const searchAccounts = async (term) => {
    if (term.length <= 2) return setSuggestions([]);

    try {
      setIsLoading(true);
      const authData = await GetAuthData();
      const accessToken = authData?.x_access_token;
      setKey(accessToken);

      const salesRepIdz = authData?.Sales_Rep__c;


      const response = await axios.post(`${originAPi}/beauty/search-accounts`, {
        searchTerm: term,
        accessToken,
        salesRepId: salesRepIdz,
      });

      const combinedSuggestions = [
        ...response.data.accounts.map((account) => ({ ...account, type: "account" })),
        ...response.data.manufacturers.map((manufacturer) => ({ ...manufacturer, type: "Account_Manufacturer__c" })),
        ...response.data.opportunityLineItems.map((opportunity) => ({ ...opportunity, type: 'order' })),
        ...response.data.products.map((product) => ({ ...product, type: "Product2" })),
        ...response.data.case.map((item) => ({ ...item, type: "case" })),
      ];

      // Filter to ensure unique manufacturers based on ManufacturerId__c
      const uniqueSuggestions = combinedSuggestions.filter((suggestion, index, self) => {
        return (
          suggestion.type !== "Account_Manufacturer__c" ||
          index === self.findIndex((s) => s.ManufacturerId__c === suggestion.ManufacturerId__c)
        );
      });

      setSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => searchAccounts(searchTerm), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSuggestionClick = (id, manufacturerId, type, opportunityId) => {
    if (type === "account") {
      navigate(`/store/${id}`);
    } else if (type === "Account_Manufacturer__c") {
      navigate(`/Brand/${manufacturerId}`);
    } else if (type === "Product2") {
      navigate(`/productPage/${id}`);
    } else if (type === "case") {
      navigate(`/CustomerSupportDetails?id=${id}`);
    } else if (type == "order") {
      localStorage.setItem("OpportunityId", JSON.stringify(opportunityId));
      window.location.href = "/orderDetails";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm("");
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);





  return (
    <div className={styles.laptopModeSticky}>
      <div className={`${styles.laptopMode}`}>
        {/* My Retailers */}
        <div className={`${styles.lapSetting} d-none-print`}>
          <p className={`m-0  ${styles.language}`}>
            {memoizedPermissions?.modules?.order?.create ? (
              <Link to="/my-retailers" className="linkStyle">
                My Retailers
              </Link>
            ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                My Retailers
              </span>
            )}
          </p>

          {/* New Arrivals */}
          <p className={`m-0   ${styles.language}`}>
            {memoizedPermissions?.modules?.newArrivals?.view ? (
              <Link to="/new-arrivals" className="linkStyle">
                New Arrivals
              </Link>
            ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                New Arrivals
              </span>
            )}
          </p>

          {/* Brands */}
          <p className={`m-0   ${styles.language}`}>
            {memoizedPermissions?.modules?.brands?.view ? (
              <Link to="/brand" className="linkStyle">
                Brands
              </Link>
            ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                Brands
              </span>
            )}
          </p>
        </div>

        {/* Logo */}
        <div className={styles.lapSetting}>
          <Link to="/dashboard" className={`linkStyle`}>
            <img src={"/assets/images/BFSG_logo.svg"} alt="logo" />
          </Link>
        </div>

        {/* Dashboard & My Bag */}
        <div className={`${styles.lapSetting} d-none-print`}>
          {/* Dashboard */}
          <p className={`m-0 w-[100px] ${styles.language} flex search-bar`}>
            <div className="search-container" ref={searchRef}>
              <input className="search expandright" id="searchright" type="search" placeholder="Search..." value={searchTerm} onChange={handleInputChange} />
              <label className="button searchbutton" htmlFor="searchright">
                <span className="searchCode">Search...</span>
                <span className="mglass">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="8.24976" cy="8.25" r="4.5" stroke="black" />
                    <path
                      d="M8.24976 6C7.95428 6 7.6617 6.0582 7.38872 6.17127C7.11574 6.28434 6.8677 6.45008 6.65877 6.65901C6.44983 6.86794 6.2841 7.11598 6.17103 7.38896C6.05795 7.66195 5.99976 7.95453 5.99976 8.25"
                      stroke="black"
                      strokeLinecap="round"
                    />
                    <path d="M14.9998 15L12.7498 12.75" stroke="black" strokeLinecap="round" />
                  </svg>
                </span>
              </label>

              {/* Suggestions Dropdown */}
              {isLoading ? (
                <ul className="dropdown-search"><Loading /></ul>
              ) : suggestions.length > 0 ? (
                <ul className="dropdown-search">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.Id} onClick={() => handleSuggestionClick(suggestion.Id, suggestion.ManufacturerId__c, suggestion.type, suggestion.Id)}>
                      <div className="suggestion-item">
                        <div className="suggested-images">
                          {suggestion.type === "Account_Manufacturer__c" && (
                            <img className="search-logo" src={`\\assets\\images\\brandImage\\${suggestion.ManufacturerId__c}.png`} onError={(e) => (e.target.src = "\\assets\\images\\dummy.png")} alt="Manufacturer Logo" />
                          )}
                          {suggestion.type === "case" && <CustomerServiceIcon width={30} height={30} />}
                          {suggestion.type === "account" && <FaStore />}
                          {suggestion.type === "order" && <OrderIcon height={50} width={50} />}
                          {suggestion.type === "Product2" && (
                            <img className="search-logo" src={`${suggestion.imageUrl}?oauth_token=${key}`} onError={(e) => (e.target.src = "\\assets\\images\\dummy.png")} alt="" />
                          )}
                        </div>
                        <div className="suggested-content">
                          <div className="api-name">
                            {suggestion.type === "Account_Manufacturer__c" && suggestion.ManufacturerName__c}
                            {suggestion.type === "account" && suggestion.Name}
                            {suggestion.type === "order" && suggestion.PO_Number__c}
                            {suggestion.type === "case" && suggestion.CaseNumber}
                            {suggestion.type === "Product2" && (
                              <span
                                className="product-name"
                                title={suggestion.Name} // Shows full name on hover
                              >
                                {suggestion.Name.length > 18 ? `${suggestion.Name.substring(0, 18)}...` : suggestion.Name}
                              </span>
                            )}
                          </div>
                          <div className="suggested-name">
                            {suggestion.type === "Account_Manufacturer__c" && <p className="suggestion-name">Brand</p>}
                            {suggestion.type === "account" && <p className="suggestion-name">Store</p>}
                            {suggestion.type === "case" && <p className="suggestion-name">Case</p>}
                            {suggestion.type === "order" && <p className="suggestion-name">Placed Order</p>}
                            {suggestion.type === "Product2" && !suggestion.OpportunityId && <p className="suggestion-name">Product</p>}
                          </div>
                        </div>
                      </div>

                    </li>
                  ))}
                </ul>
              ) : (
                searchTerm && <ul className="dropdown-search">No Data Found</ul> // Show no data found message
              )}
            </div>
          </p>

          <p className={`m-0  ${styles.language}`}>
            {/* {memoizedPermissions?.modules?.dashboard?.view ? ( */}
            <Link to="/dashboard" className="linkStyle">
              Dashboard
            </Link>
            {/* ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                Dashboard
              </span>
            )} */}
          </p>

          {/* My Bag */}

          {memoizedPermissions?.modules?.order?.create ? <>
            <p className={`m-0  ${styles.language}`}>
            <Link to="/my-bag" className="linkStyle">
                My Bag ({cartQty})
              </Link>
            </p>
          </> :
            <p className={`m-0  ${styles.language}`} style={{ cursor: "not-allowed", color: "grey" }} onClick={handleRestrictedAccess}>

              <span className={`linkStyle`} >         <Link to="/my-bag" className="linkStyle">
                My Bag ({cartQty})
              </Link>
              </span>
            </p>
          }


        </div>
      </div>
    </div>
  );
};

export default LogoHeader;
