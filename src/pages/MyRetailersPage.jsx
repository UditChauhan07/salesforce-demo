import React, { useEffect, useState, useMemo } from "react";
import MyRetailers from "../components/My Retailers/MyRetailers";
import { FilterItem } from "../components/FilterItem";
import { useManufacturer } from "../api/useManufacturer";
import FilterSearch from "../components/FilterSearch";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { DestoryAuth, GetAuthData, admins, getRetailerList, getSalesRepList } from "../lib/store";
import { CloseButton } from "../lib/svg";
import { getPermissions } from "../lib/permission";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
const MyRetailersPage = () => {
  const { data: manufacturers } = useManufacturer();
  const [searchParams] = useSearchParams();
  const manufacturerId = searchParams.get("manufacturerId");
  const [retailerList, setRetailerList] = useState({ data: [], isLoading: true });
  const [manufacturerFilter, setManufacturerFilter] = useState(manufacturerId);
  const [sortBy, setSortBy] = useState();
  const [userData, setUserData] = useState({});
  const [searchBy, setSearchBy] = useState("");
  const [salesRepList, setSalesRepList] = useState([]);
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [hasPermission, setHasPermission] = useState(null); // State to store permission status
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!manufacturerId) {
      setManufacturerFilter(null);
    } else {
      setManufacturerFilter(manufacturerId);
    }
  }, [manufacturerId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await GetAuthData();
        setUserData(user);
        if (!selectedSalesRepId) setSelectedSalesRepId(user.Sales_Rep__c);

        // Fetch retailer list
        getRetailerListHandler({ key: user.x_access_token, userId: selectedSalesRepId ?? user.Sales_Rep__c });

        // // Fetch sales reps if admin
        if (admins.includes(user.Sales_Rep__c)) {
          getSalesRepList({ key: user.x_access_token })
            .then((repRes) => setSalesRepList(repRes.data))
            .catch((repErr) => console.log({ repErr }));
        }
      } catch (err) {
        console.log({ err });
        DestoryAuth();
      }
    };

    fetchData();
  }, [selectedSalesRepId]);



  const getRetailerListHandler = ({ key, userId }) => {
    setRetailerList({ data: [], isLoading: true });
    getRetailerList({ key, userId })
      .then((retailerRes) => {
        console.log({retailerRes});
        
        setRetailerList({ data: retailerRes?.data.length ? retailerRes?.data : [], isLoading: false })})
      .catch(e => console.error(e));
  };

  const salesRepHandler = (value) => {
    setSelectedSalesRepId(value);
    getRetailerListHandler({ key: userData.x_access_token, userId: value });
  };
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const user = await GetAuthData(); // Fetch user data
        const userPermissions = await getPermissions(); // Fetch permissions
        console.log({userPermissions});
        
        setPermissions(userPermissions); // Set permissions in state
        if (userPermissions?.modules?.order?.create === false) {
          PermissionDenied();
          navigate('/dashboard')
        }
      } catch (err) {
        console.error("Error fetching permissions", err);
      }
    }

    fetchPermissions(); // Fetch permissions on mount
  }, []);

  // Memoize permissions to avoid unnecessary re-calculations
  const memoizedPermissions = useMemo(() => permissions, [permissions]);

  return (
    <AppLayout
      filterNodes={
        <>
          {memoizedPermissions?.modules?.godLevel ?
            <>
              <FilterItem
                minWidth="220px"
                label="salesRep"
                name="salesRep"
                value={selectedSalesRepId}
                options={salesRepList.map((salesRep) => ({
                  label: salesRep.Id == userData.Sales_Rep__c ? 'My Retailers (' + salesRep.Name + ')' : salesRep.Name,
                  value: salesRep.Id,
                }))}
                onChange={(value) => salesRepHandler(value)}
              />
            </> : null}

          <FilterItem
            label="Sort by"
            value={sortBy}
            options={[
              {
                label: "A-Z",
                value: "a-z",
              },
              {
                label: "Z-A",
                value: "z-a",
              },
            ]}
            name="sortBy1"
            onChange={(value) => {
              setSortBy(value);
            }}
          />
          <FilterItem
            minWidth="220px"
            label="All Brands"
            name="Manufacturer1"
            value={manufacturerFilter}
            options={manufacturers?.data?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            }))}
            onChange={(value) => setManufacturerFilter(value)}
          />
          <FilterSearch
            onChange={(e) => setSearchBy(e.target.value)}
            value={searchBy}
            placeholder={"Search by Retailers"}
            minWidth={"167px"}
          />
          <button
            className="border px-2.5 py-1 leading-tight d-grid"
            onClick={() => {
              setSortBy(null);
              setManufacturerFilter(null);
              setSearchBy("");
              setSelectedSalesRepId(userData.Sales_Rep__c);
              getRetailerListHandler({ key: userData.x_access_token, userId: userData.Sales_Rep__c })
            }}
          >
            <CloseButton crossFill={'#fff'} height={20} width={20} />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
          </button>


        </>
      }
    >
      <MyRetailers
        pageData={retailerList?.data || []}
        sortBy={sortBy}
        searchBy={searchBy}
        isLoading={retailerList.isLoading}
        selectedSalesRepId={selectedSalesRepId}
        filterBy={
          manufacturerFilter
            ? manufacturers?.data?.find(
              (manufacturer) => manufacturer.Id === manufacturerFilter
            )
            : null
        }
      />
      {/* <OrderStatusFormSection /> */}
    </AppLayout>
  );
};

export default MyRetailersPage;
