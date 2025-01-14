import React, { useEffect, useMemo, useState } from "react";
import BrandCard from "../components/BrandCard";
import { FilterItem } from "../components/FilterItem";
import FilterSearch from "../components/FilterSearch";
import { useManufacturer } from "../api/useManufacturer";
import Loading from "../components/Loading";
import { useNavigate } from "react-router";
import Page from "./page.module.css";
import AppLayout from "../components/AppLayout";
import { CloseButton } from "../lib/svg";
import { getPermissions } from "../lib/permission";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
const brandsImageMap = {
  Diptyque: "Diptyque.png",
  Byredo: "Byredo-1.png",
  "Maison Margiela": "Maison Margiela.png",
  "Bobbi Brown": "Bobbi Brown.png",
  "ESTEE LAUDER": "Estee Lauder.png",
  "RMS Beauty": "rmsbeauty.png",
  ReVive: "revive-1.png",
  "R Co ": "R co.png",
  "R Co Bleu": "R co Bleu.png",
  "Bumble and Bumble": "Bumblea and Bumble.png",
  "BY TERRY": "By Terry.png",
  "Susanne Kaufmann": "susanne kaufman.png",
  "Kevyn Aucoin Cosmetics": "Kevyn Aucoin.jpg",
  Smashbox: "Smashbox-3.png",
  "EVE LOM": "Evelom.png",
  AERIN: "Aerin.png",
  ARAMIS: "Aramis.png",
  "Victoria Beckham Beauty": "vbbfreatured.png",
  "Re-Nutriv": "Re-Nutriv-2.png",
  "LOccitane": "LOccitane-freatured.png",
  "111Skin": "a0ORb000001EbK5MAK.png",
  "Supergoop!": "super-freatured.png",
  "NEST New York":"nest-freatured.png"
};

const defaultImage = "dummy.png";

const BrandsPage = () => {
  const { data: manufacturers, isLoading, error } = useManufacturer();
  // const [highestRetailers, setHighestRetailers] = useState(true);
  const [searchBy, setSearchBy] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [createOrder,setCreateOrder] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    const userData = localStorage.getItem("Name");
    if (!userData) {
      navigate("/");
    }
  }, []);
  const filteredPageData = useMemo(() => {
    if (!Array.isArray(manufacturers?.data)) {
      return [];
    }
    let newValues = manufacturers?.data?.map((brand) => brand);

    if (searchBy) {
      newValues = newValues?.filter((value) =>
        value.Name?.toLowerCase().includes(searchBy?.toLowerCase())
      );
    }
    switch (sortBy) {
      case "highest":
        newValues = newValues?.sort((a, b) => b.Accounds - a.Accounds);
        break;
      case "lowest":
        newValues = newValues?.sort((a, b) => a.Accounds - b.Accounds);
        break;
      case "a-z":
        newValues = newValues?.sort((a, b) => a.Name?.localeCompare(b.Name));
        break;
      case "z-a":
        newValues = newValues?.sort((a, b) => b.Name?.localeCompare(a.Name));
        break;
      default:
        newValues = newValues?.sort((a, b) => b.Accounds - a.Accounds);
    }
    return newValues;
  },
    [searchBy, manufacturers, sortBy]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPermissions = await getPermissions()
        setCreateOrder(userPermissions?.modules?.order?.create)
        if (userPermissions?.modules?.brands?.view === false) { PermissionDenied(); navigate('/dashboard'); }
      } catch (error) {
        console.log("Permission Error", error)
      }
    }
    fetchData()
  }, [])
  return (
    <>
      <AppLayout
        filterNodes={
          <>

            <FilterItem
              label="Sort by"
              name="Sort-by"
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
                {
                  label: "Highest Retailers",
                  value: "highest",
                },
                {
                  label: "Lowest Retailers",
                  value: "lowest",
                },
              ]}
              onChange={(value) => {
                setSortBy(value);
              }}
            />
            {/* <FilterItem
              minWidth="220px"
              label="Lowest Retailers"
              name="Lowest-Retailers"
              value={highestRetailers}
              options={[
                {
                  label: "Highest Retailers",
                  value: true,
                },
                {
                  label: "Lowest Retailers",
                  value: false,
                },
              ]}
              onChange={(value) => setHighestRetailers(value)}
            /> */}
            <FilterSearch
              onChange={(e) => setSearchBy(e.target.value)}
              value={searchBy}
              placeholder={"Search by Name"}
              minWidth={"130px"}
            />
            <button
              className="border px-2 py-1 leading-tight d-grid"
              onClick={() => {
                // setHighestRetailers(true);
                setSearchBy("");
                setSortBy("");
              }}
            >
              <CloseButton crossFill={'#fff'} height={20} width={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
            </button>


          </>
        }
      >
        {isLoading ? (
          <Loading height={"70vh"} />
        ) : (
          <div>
            <div
              className="uppercase text-center flex justify-center items-center tracking-[1.8px] my-[48px]"
              style={{ fontFamily: "Montserrat-500" }}
            >
              Below are the Brands available with “Beauty Fashions Sales Group”
            </div>
            {/* <div className="widthGivenBrandDetailPage grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 grid-cols-2 gap-4  m-auto">    */}
            <div className={` ${Page.widthGivenBrandDetailPage}`}>
              {filteredPageData?.length ? (
                <>
                  {filteredPageData?.map((brand, index) => (
                    <BrandCard
                      key={index}
                      image={brandsImageMap[brand?.Name] || defaultImage}
                      brand={brand}
                      createOrder={createOrder}
                    />
                  ))}
                </>
              ) : null}
            </div>
            {!filteredPageData?.length && (
              <div className="lg:min-h-[300px] xl:min-h-[380px]">
                <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">
                  No data found
                </div>
              </div>
            )}
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default BrandsPage;
