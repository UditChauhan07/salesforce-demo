import React, { useEffect, useMemo, useState } from "react";
import Filters from "../components/OrderList/Filters";
import Styles from "../components/OrderList/style.module.css";
import AppLayout from "../components/AppLayout";
import { GetAuthData, admins, defaultLoadTime, getOrderList, getSalesRepList } from "../lib/store";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination/Pagination";
import OrderListContent from "../components/OrderList/OrderListContent";
import { FilterItem } from "../components/FilterItem";
import { useNavigate } from "react-router-dom";
import { getPermissions } from "../lib/permission";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
import dataStore from "../lib/dataStore";
import useBackgroundUpdater from "../utilities/Hooks/useBackgroundUpdater";
let PageSize = 10;

const OrderListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [shipByText, setShipByText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchShipBy, setSearchShipBy] = useState();
  const [userData, setUserData] = useState({});
  const [salesRepList, setSalesRepList] = useState([])
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [filterValue, onFilterChange] = useState({
    month: "",
    manufacturer: null,
    search: "",
  });
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
  }, [filterValue.month]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPermissions = await getPermissions();
        setPermissions(userPermissions);
        if (userPermissions?.modules?.order?.view === false) { PermissionDenied(); navigate('/dashboard'); }
      } catch (error) {
        console.log("Permission Error", error)
      }
    }
    fetchData()
  }, [])

  const handleFilterChange = (filterType, value) => {
    onFilterChange((prev) => {
      const newData = { ...prev };
      newData[filterType] = value;
      return newData;
    });
    setCurrentPage(1);
  };

  function sortingList(data) {
    data.sort(function (a, b) {
      return new Date(b.CreatedDate) - new Date(a.CreatedDate);
    });
    return data;
  }

  const orderData = useMemo(() => {
    return (
      orders
        // Manufacturer filter
        ?.filter(
          (order) =>
            !filterValue.manufacturer ||
            filterValue.manufacturer === order.ManufacturerId__c
        )
        // Search by account filter
        ?.filter((order) => {
          return (
            !filterValue?.search?.length ||
            order.AccountName?.toLowerCase().includes(
              filterValue?.search?.toLowerCase()
            )
          );
        })
        .filter((order) => {
          if (searchShipBy) {
            const orderItems = order.OpportunityLineItems?.records;
            if (orderItems?.length) {
              return (
                orderItems?.some((item) => {
                  return item.Name?.toLowerCase().includes(
                    searchShipBy?.toLowerCase()
                  );
                }) ||
                order.PO_Number__c?.toLowerCase().includes(
                  searchShipBy?.toLowerCase()
                )
              );
            } else if (
              order.PO_Number__c?.toLowerCase().includes(
                searchShipBy.toLowerCase()
              )
            ) {
              return true;
            }
            return false;
          }
          return true;
        })
    );
  }, [filterValue, orders, searchShipBy]);

  const readyOrderList = (order) => {
    if(order){
      let sorting = sortingList(order||[]);
      setOrders(sorting);
    }
    setLoaded(true);
  }

  useEffect(() => {
    setLoaded(false);
    GetAuthData()
      .then((response) => {
        setUserData(response)
        dataStore.subscribe("/orderList" + `${selectedSalesRepId ?? response.Sales_Rep__c}${filterValue.month}`, readyOrderList)
        if (!selectedSalesRepId) setSelectedSalesRepId(response.Sales_Rep__c)
        getOrderlIsthandler({ key: response.x_access_token, Sales_Rep__c: selectedSalesRepId ?? response.Sales_Rep__c })
        if (memoizedPermissions?.modules?.godLevel) {
          dataStore.getPageData("getSalesRepList", () => getSalesRepList({ key: response.x_access_token })).then((repRes) => {
            console.log({repRes});
            
            setSalesRepList(repRes.data)
          }).catch((repErr) => {
            console.log({ repErr });
          })
        }
        return () => {
          dataStore.unsubscribe("/orderList" + `${selectedSalesRepId ?? response.Sales_Rep__c}${filterValue.month}`, readyOrderList)
        }
      })
      .catch((err) => {
        console.log({ err });
      });
  }, [filterValue.month , permissions]);

  useEffect(() => {
    setShipByText(searchShipBy);
  }, [searchShipBy]);

  

  const getOrderlIsthandler = ({ key, Sales_Rep__c }) => {
    
    dataStore.getPageData("/orderList" + Sales_Rep__c + filterValue.month, () => getOrderList({
      user: {
        key,
        Sales_Rep__c,
      },
      month: filterValue.month,
    }))
      .then((order) => {
        readyOrderList(order);
      })
      .catch((error) => {
        console.log({ error });
      });
  }
  useBackgroundUpdater(()=>getOrderlIsthandler(userData.x_access_token,userData.Sales_Rep__c),defaultLoadTime);
  const orderListBasedOnRepHandler = (value) => {
    setOrders([])
    setSelectedSalesRepId(value)
    setLoaded(false)
    getOrderlIsthandler({ key: userData.x_access_token, Sales_Rep__c: value })
  }

  const memoizedPermissions = useMemo(() => permissions, [permissions]);
  return (
    <AppLayout
      filterNodes={
        <>
          {memoizedPermissions?.modules?.godLevel ? <>
            <FilterItem
              minWidth="220px"
              label="salesRep"
              name="salesRep"
              value={selectedSalesRepId}
              options={salesRepList.sort((a, b) => a.Name.localeCompare(b.Name)).map((salesRep) => ({
                label: salesRep.Id == userData.Sales_Rep__c ? 'My Orders (' + salesRep.Name + ')' : salesRep.Name,
                value: salesRep.Id,
              }))}
              onChange={(value) => orderListBasedOnRepHandler(value)}
            />
          </> : null}

          <Filters
            onChange={handleFilterChange}
            value={filterValue}
            resetFilter={() => {
              onFilterChange({
                manufacturer: null,
                month: "",
                search: "",
              });
              setSearchShipBy("");
              setSelectedSalesRepId(userData.Sales_Rep__c);
              orderListBasedOnRepHandler(userData.Sales_Rep__c);
            }}
          />
        </>
      }
    >
      {!loaded ? (
        <Loading height={'50vh'} />
      ) : (
        <div>
          <section>
            <div className="">
              <div className={Styles.orderMainDiv}>
                <div className={Styles.OrderMainPr}>
                  <div className={Styles.inorderflex}>
                    <div>
                      <h2>Your Orders</h2>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSearchShipBy(e.target.elements.searchShipBy.value);
                      }}
                    >
                      <div
                        className={`d-flex align-items-center ${Styles.InputControll}`}
                      >
                        <input
                          type="text"
                          name="searchShipBy"
                          onChange={(e) => setShipByText(e.target.value)}
                          value={shipByText}
                          placeholder="Search All Orders"
                        />
                        <button>Search Orders</button>
                      </div>
                    </form>
                  </div>
                  <OrderListContent
                    data={orderData?.slice(
                      (currentPage - 1) * PageSize,
                      currentPage * PageSize
                    )}
                    setSearchShipBy={setSearchShipBy}
                    searchShipBy={searchShipBy}
                    memoizedPermissions={memoizedPermissions}
                  />
                </div>
                <Pagination
                  className="pagination-bar"
                  currentPage={currentPage}
                  totalCount={orderData.length}
                  pageSize={PageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  );
};

export default OrderListPage;
