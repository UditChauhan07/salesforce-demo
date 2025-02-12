import axios from "axios";
import LZString from 'lz-string';
import { getPermissions } from "./permission";
import dataStore from "./dataStore";
export const originAPi = process.env.REACT_APP_OA_URL || "https://live.beautyfashionsales.com/"
// export const originAPi =  "http://localhost:5001"
export const defaultLoadTime = 1800000;
let url2 = `${originAPi}/retailerv2/`;
let url = `${originAPi}/beauty/`;
let URL = `${originAPi}/beauty/0DS68FOD7s`;
const orderKey = "orders";
const accountIdKey = "AccountId__c";
const brandIdKey = "ManufacturerId__c";
const brandKey = "Account";
const accountKey = "manufacturer";
const POCount = "woX5MkCSIOlHXkT";
const support = "AP0HBuNwbNnuhKR";
const shareKey = "R7Mmw2nG41y6MqI";
export const salesRepIdKey = "BzQIEAjzCEHmlXc";
export const admins = ["00530000005AdvsAAC", "0053b00000DgEVEAA3", "0051O00000CvAVTQA3", "0053b00000CwOnLAAV", "0053b00000C75e8AAB", "0053b00000DgEvqAAF"]; //, "0053b00000CwOnLAAV" ,"0053b00000DgEVEAA3"

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


export function ShareDrive(data, remove = false, keyValue = shareKey) {
  if (remove) {
    localStorage.removeItem(keyValue);
    return true;
  }
  if (data) {
    localStorage.setItem(keyValue, LZString.compress(JSON.stringify(data)));
    return true;
  } else {
    let strData = localStorage.getItem(keyValue);
    if (strData) {
      strData = LZString.decompress(strData);
      return JSON.parse(strData);
    }
    return null;
  }
}
export const sortArrayHandler = (arr = [], getter, order = 'asc') => {
  // Check if arr is an array
  if (!Array.isArray(arr)) {
    console.warn('Provided input is not an array. Returning an empty array.');
    return []; // or return arr; if you want to return the original input
  }

  // Proceed with sorting
  return arr?.sort(
    order === 'desc'
      ? (a, b) => getter(b).localeCompare(getter(a))
      : (a, b) => getter(a).localeCompare(getter(b))
  );
};


export async function getAttachment(token, caseId) {
  try {
    console.log(token, caseId, "rawData");
    const response = await axios.post(
      originAPi + "/wpVvqb9cSF7hnil/getAttachment",
      {
        caseId: caseId,
        key: token,
      }
    );
    const data = await response.data;
    console.log(data, "backend attachment");
    if (data.status === 300) {
      DestoryAuth();
    } else {
      return data;
    }
  } catch (error) {
    console.log(error, "backend get attachment error");
    return null;
  }
}


export async function AuthCheck() {
  if (JSON.parse(localStorage.getItem("Api Data"))?.data) {
    return true;
  } else {
    DestoryAuth();
    return false;
  }
}
export async function getAllAccountBrand({ key, accountIds }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url2 + "/EACucX1daQv1ZhN", {
    method: "POST",
    body: JSON.stringify({ key, accountIds }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());

  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.data || [];
  }
}
export function PublicCheck() {
  if (JSON.parse(localStorage.getItem("Api Data"))?.data) {
    return true;
  } else {
    return false;
  }
}

export function fetchBeg() {
  let orderStr = localStorage.getItem("AA0KfX2OoNJvz7x");


  if (orderStr) {
    let orderList = JSON.parse(orderStr);

    return orderList;
  }
}
export async function getAllAccountLocation({ key, accountIds }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url2 + "/GQGpen0kmGHGPtx", {
    method: "POST",
    body: JSON.stringify({ key, accountIds }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.data || [];
  }
}
export async function getAllAccountOrders({ key, accountIds, month, date = null }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url2 + "UQPIByU1hllkP9m", {
    method: "POST",
    body: JSON.stringify({ key, accountIds, month, date }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.data || [];
  }
}

export async function FreeShipHandler({ brandId }) {
  let user = await GetAuthData();
  let accessToken = user?.x_access_token || null;
  if (accessToken) {
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };
    let response = await fetch(originAPi + "qX8COmFYnyAj4e2/kSutd4qwJEYbKSo", {
      method: "POST",
      body: JSON.stringify({ key: accessToken, brandId }),
      headers: headersList,
    });
    let data = JSON.parse(await response.text());

    if (data.status == 200) {
      return data?.freeShipping || false;
    } else {
      return data.message;
    }
  } else {
    DestoryAuth();
    return false;
  }
}

export async function POGenerator() {
  try {

    let orderDetails = fetchBeg();
    let date = new Date();
    const sanitizeString = (str) =>
      str
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const sanitizedAccountName = sanitizeString(orderDetails.Account?.name || "");
    const sanitizedManufacturerName = sanitizeString(orderDetails.Manufacturer?.name || "");

    const response = await fetch(originAPi + "/qX8COmFYnyAj4e2/generatepov2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountName: sanitizedAccountName,
        manufacturerName: sanitizedManufacturerName,
        orderDate: date.toISOString(),
        accountId: orderDetails.Account?.id,  // Make sure this is passed
        manufacturerId: orderDetails.Manufacturer?.id // Ensure this is passed
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }


    const poData = await response.json();
    if (poData.success) {

      let res = await poData;
      let poNumber = res.poNumber;
      let address = res.address;
      let brandShipping = res?.brandShipping;
      let shippingMethod = res?.shippingMethod;
      let checkBrandAllow = res?.checkBrandAllow;
      let freeShipping = res?.freeShipping;

      return { poNumber, address, brandShipping, shippingMethod, checkBrandAllow, freeShipping };
    } else {
      console.error('Failed to generate PO number:', poData.message);
      return null;
    }
  } catch (error) {
    console.error('Error generating PO number:', error.message);
    return null;
  }
}


// account details 

export const fetchAccountDetails = async () => {
  let data = await GetAuthData(); // Fetch authentication data
  let salesRepId = data.Sales_Rep__c;
  let accessToken = data.x_access_token;

  try {
    // Await the axios.post call and return the resolved response
    let res = await axios.post(`${originAPi}/beauty/v3/23n38hhduu`, {
      salesRepId,
      accessToken,
    });
    console.log({ res }); // Log the response
    return res.data; // Return the response data
  } catch (error) {
    console.error("Error", error); // Log error details
    throw error; // Propagate the error to the caller
  }
};






// Helper function to generate codes




export function getStrCode(str) {
  if (!str) return null;
  let codeLength = str.split(" ");

  if (codeLength.length >= 2) {
    return `${codeLength[0].charAt(0).toUpperCase() + codeLength[1].charAt(0).toUpperCase()}`;
  } else {
    return `${codeLength[0].charAt(0).toUpperCase() + codeLength[0].charAt(codeLength[0].length - 1).toUpperCase()}`;
  }
}

// Helper function to pad numbers
function padNumber(n, isTwoDigit) {
  if (isTwoDigit) {
    return n < 10 ? "0" + n : n;
  } else {
    if (n < 10) return "000" + n;
    if (n < 100) return "00" + n;
    if (n < 1000) return "0" + n;
    return n;
  }
}

export function formatNumber(num) {
  if (num >= 0 && num < 1000000) {
    return (num / 1000).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "K";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "M";
  } else if (num < 0) {
    return (num / 1000).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "K";
  } else {
    return num;
  }
}

export async function DownloadAttachment(token, attachmentId) {
  console.log(token, "token download", attachmentId, "attachmentID");
  try {
    let response = await fetch(
      `${originAPi}/wpVvqb9cSF7hnil/downloadAttachment/${attachmentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response) {
      if (response.status == 300) {
        DestoryAuth();
      } else {
        return response;
      }
    }
  } catch (error) {
    return error;
  }
}

export function supportDriveBeg() {
  let supportList = localStorage.getItem(support);
  return JSON.parse(supportList);
}
export async function supportShare(data) {
  localStorage.setItem(support, JSON.stringify(data));
  return true;
}
export function supportClear() {
  localStorage.removeItem(support);
  if (localStorage.getItem(support)) {
    return false;
  } else {
    return true;
  }
}


export function isDateEqualOrGreaterThanToday(dateString) {
  // Parse the input date string
  const inputDate = new Date(dateString);
  // Get today's date
  const today = new Date();

  // Set time to 00:00:00 to compare only dates
  today.setHours(0, 0, 0, 0);

  // Compare the dates
  return today >= inputDate;
}
export async function OrderPlaced({ order }) {
  let orderinit = {
    info: order,
  };
  let headersList = {
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "4eIAaY2H", {
    method: "POST",
    body: JSON.stringify(orderinit),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 200) {
    localStorage.removeItem(orderKey);
    localStorage.removeItem(accountIdKey);
    localStorage.removeItem(brandIdKey);
    localStorage.removeItem(brandKey);
    localStorage.removeItem(accountKey);
    let lastCount = localStorage.getItem(POCount) || 1;
    localStorage.setItem(POCount, parseInt(+lastCount + 1));
    return { orderId: data.order, err: null };
  } else if (data.status == 300) {
    DestoryAuth();
  } else {
    if (data?.data) {
      return { err: data.data, orderId: null }
    } else {
      return false;
    }
  }
}

export async function DestoryAuth() {
  try {
    // Start clearing IndexedDB
    let status = await dataStore.clearAll();
    console.log({ status });

    if (status) {
      // Clear localStorage except for specified keys
      Object.keys(localStorage).forEach((key) => {
        if (key !== "passwordB2B" && key !== "emailB2B" && key !== "token") {
          localStorage.removeItem(key);
        }
      });
      console.log("gclear");


      // Optionally, show a loading indicator here
      // Example: showLoadingIndicator();

      // Redirect to the home page immediately
      window.location.href = window.location.origin;

      // Note: The clearing of IndexedDB will continue in the background
      return true;
    }
  } catch (e) {
    console.error('Error during logout:', e);
    // Optionally handle the error (e.g., show a message to the user)
  }
}
export async function cartSync({ cart }) {

  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url2 + "/SQ26OYkaaEAGNnK", {
    method: "POST",
    body: JSON.stringify(cart),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.data) {
    return data.data;
  } else {
    return true;
  }
}

export async function CartHandler({ op = null, cart }) {
  let cartUrl = url2;
  if (op == 'update' || op == 'create') {
    cartUrl += 'WdNhFjhMj08ReQp';
  } else if (op == 'delete') {
    cartUrl += 'CDllYsPY4teyTCA';
  } else {
    cartUrl += "ZvOE66yNOVlk3TB"
  }
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(cartUrl, {
    method: "POST",
    body: JSON.stringify(cart),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  console.log({data});
  
  if (data?.data) {
    return data.data;
  } else {
    if (data.status == 200) {
      return true;
    }
  }
}

export async function GetAuthData() {
  if (!AuthCheck) {
    DestoryAuth();
  } else {
    return JSON.parse(localStorage.getItem("Api Data"))?.data;
  }
}

export async function getOrderList({ user, month }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();
  bodyContent.append("key", user.key);
  bodyContent.append("Sales_Rep__c", user.Sales_Rep__c);
  bodyContent.append("month", month === "last-6-months" ? "" : month);

  let response = await fetch(url + "v3/20h2J48c", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getOrderCustomerSupport({ user, searchId }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();

  bodyContent.append("key", user.key);
  bodyContent.append("Sales_Rep__c", user.Sales_Rep__c);
  if (searchId) bodyContent.append("searchId", searchId);

  let response = await fetch(url + "v3/Jn91V1GChwP9dZg", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getOrderofSalesRep({ user, month }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();
  bodyContent.append("key", user.key);
  bodyContent.append("salesRepId", user.Sales_Rep__c);

  let response = await fetch(url + "v3/8QUZQtEILKLsFeE", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getTargetReportAll({ user, year, preOrder }) {
  if (user) {
    let headersList = {
      Accept: "*/*",
    };
    let authData = await GetAuthData()
    let userPermissions = JSON.parse(authData.permission)
    let tried = false;
    let bodyContent = new FormData();
    bodyContent.append("key", user.x_access_token);
    if (!userPermissions?.modules?.godLevel) {
      bodyContent.append("SalesRepId", user.Sales_Rep__c);
    }
    if (year) {
      bodyContent.append("year", year);
    }
    if (preOrder) {
      bodyContent.append("preorder", preOrder);
    }
    let response = await fetch(url + "target/4Tu6do95AxLM3Cl", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });
    let data = JSON.parse(await response.text());
    if (data.status == 300) {
      DestoryAuth();
    } else {
      let rawRes = { ownerPermission: false, list: data.data };

      if (userPermissions?.modules?.godLevel) {
        rawRes.ownerPermission = true;
      }
      return rawRes;
    }
  } else {
    return false;
  }
}

export async function getRollOver({ user }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  const userPermissions = await getPermissions();
  let SalesRepId = user.Sales_Rep__c;
  if (userPermissions?.modules?.godLevel) {
    SalesRepId = null;
  }
  let response = await fetch(url + "target/SxaVXT0aX9wGVoM", {
    method: "POST",
    headers: headersList,
    body: JSON.stringify({ key: user.x_access_token, SalesRepId }),
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    let rawRes = { ownerPermission: false, list: data.data };
    if (userPermissions?.modules?.godLevel) {
      rawRes.ownerPermission = true;
    }
    return rawRes;
  }
}

export async function getOrderIdDetails({ rawData }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();
  bodyContent.append("key", rawData.key);
  bodyContent.append("opportunity_id", rawData.id);

  let response = await fetch(url + "/BKpeLbweyZPXmwe", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}


export async function getOrderDetailsBasedId({ rawData }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();
  bodyContent.append("key", rawData.key);
  bodyContent.append("opportunity_id", rawData.id);

  let response = await fetch(url + "0DS68FOD7s", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getOrderDetailsInvoice({ rawData }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();
  bodyContent.append("key", rawData.key);
  bodyContent.append("opportunity_id", rawData.id);

  let response = await fetch(url + "3JlgPqaeYIveHd6", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return { data: data.data, attachment: data.attachedmenetdata };
  }
}

export async function getDashboardata({ user, saleRepId }) {
  let headersList = {};
  if (user.headers) {
    headersList = user.headers || {};
  } else {
    headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
  }
  const finalSaleRepId = saleRepId || user.Sales_Rep__c;


  headersList = { ...headersList, key: user.x_access_token, SalesRepId: finalSaleRepId }
  console.log(saleRepId)
  let response = await fetch(originAPi + "/95zWpMEFtbAr8lqn/FlEpv2cw4VbxgDF", {
    // let response = await fetch(url + "v3/3kMMguJj62cyyf0", {
    method: "POST",
    body: null,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  console.warn({ data });
  // console.warn({data:user.Sales_Rep__c});
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getSupportList({ key, salesRepId }) {
  let headersList = {
    Accept: "*/*",
  };
  // console.log({user});
  let bodyContent = new FormData();
  bodyContent.append("key", key);
  bodyContent.append("salesRepId", salesRepId);

  let response = await fetch(url + "v3/TDIztRiHo6Juf3I", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getSupportDetails({ rawData }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();
  bodyContent.append("key", rawData.key);
  bodyContent.append("caseId", rawData.caseId);

  let response = await fetch(url + "v3/ffBUF1vNs9LTLfz", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getSupportFormRaw({ rawData }) {
  let headersList = {
    Accept: "*/*",
  };

  let bodyContent = new FormData();
  bodyContent.append("key", rawData.key);
  bodyContent.append("AccountId", rawData.AccountId);

  let response = await fetch(url + "v3/HX0RbhJ3jppDwQX", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getAllAccount({ user }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };
  let body = {
    key: user.x_access_token,
    salesRepId: user.Sales_Rep__c,
  };
  let response = await fetch(url + "v3/fmJJCh9HaL33Iqp", {
    method: "POST",
    headers: headersList,
    body: JSON.stringify(body),
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getAccountAllContact({ key, Id }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };
  let body = {
    key, Id
  };
  let response = await fetch(url + "v3/PP1Rx34VLTBuUqK", {
    method: "POST",
    headers: headersList,
    body: JSON.stringify(body),
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function postSupport({ rawData }) {
  console.log({ rawData });
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "v3/hunQaon7f5sTDeb", {
    method: "POST",
    body: JSON.stringify(rawData),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function postSupportAny({ rawData }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "v3/OFT88qVeJPUGsly", {
    method: "POST",
    body: JSON.stringify(rawData),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function postSupportComment({ rawData }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "v3/dgwz2CbCvN2QzAk", {
    method: "POST",
    body: JSON.stringify(rawData),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getProductList({ rawData }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "7ozraf8z5TdMyyH", {
    method: "POST",
    body: JSON.stringify(rawData),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    console.warn({ data });
    return data;
  }
}

export async function getProductImage({ rawData }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "v3/4v8x5lE25F6VmIs", {
    method: "POST",
    body: JSON.stringify(rawData),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.url;
  }
}

export async function getProductImageAll({ rawData }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  // let response = await fetch(url + "v3/Ftr7xyLKqgFo5MO", {
  let response = await fetch(url + "v3/fGBDynHKNNfVNki", {
    method: "POST",
    body: JSON.stringify(rawData),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getProductDetails({ rawData }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "v3/V59WN1CMm8Pjxay", {
    method: "POST",
    body: JSON.stringify(rawData),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data;
  }
}

export async function topProduct({ month, manufacturerId }) {

  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };
  let res = await GetAuthData()
  let salesRepId = "0053b00000CwOnLAAV"

  let response = await fetch(url + "v3/dC0mhTDnL9l0mK1", {
    method: "POST",
    body: JSON.stringify({ month, manufacturerId, salesRepId }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data;
  }
}
export async function getBrandList({ key, userId }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
    key,
    userId,
  };
  let response = await fetch(url + "v3/yRNGIO", {
    method: "POST",
    // body: JSON.stringify({key,userid:userId}),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data;
  }
}
//
export async function getRetailerList({ key, userId, manufacturerid = null }) {
  let headersList = {
    Accept: "*/*",
    key,
    userId, manufacturerid,
    "Content-Type": "application/json",
  };
  let response = await fetch(url + "v3/JbUxci", {
    method: "POST",
    // body: JSON.stringify({key,userid:userId}),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data;
  }
}

export async function getSalesRepList({ key }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "v3/1FnQ4K9DItMBZ1D", {
    method: "POST",
    body: JSON.stringify({ key }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data;
  }
}
export async function getAuditReportView({ key }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/audit/8rM04B63RFDXH9Z1", {
    method: "POST",
    body: JSON.stringify({ key }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}
export async function generateAuditTemplate({ key, Ids, brandId = null }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/audit/ei2TZIVfuTYQ5Bp1", {
    method: "POST",
    body: JSON.stringify({ key, brandId, Ids }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}


export async function getBrandAuditPaginate({ key, Ids }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/audit/8GdxECxXZpY6jhN", {
    method: "POST",
    body: JSON.stringify({ key, Ids }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}


export async function generateBrandAuditTemplate({ key, Ids, currentPage }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  // let response = await fetch(originAPi + "/audit/VggvfddCdQDQNo6", {
  // let response = await fetch(originAPi + "/audit/n0xkPhL3KI9mpIT", {
  let response = await fetch(originAPi + "/audit/8rM04B63RFDXH9Z", {
    method: "POST",
    body: JSON.stringify({ key, Ids, currentPage }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function getEmailBlastFromData({ key }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M", {
    method: "POST",
    body: JSON.stringify({ key }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}
export async function getEmailBlastReport({ key, Id }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/ufrWMQqZEzxPC38", {
    method: "POST",
    body: JSON.stringify({ key, Id }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}
export async function getEmailBlast({ key, Id, day = null, month = null, year = null, newsletter = null }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/T0pxZkWoI3zKNd5", {
    method: "POST",
    body: JSON.stringify({ key, Id, day, month, year, newsletter }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}

export async function fetchNewsletterData({ token }) {
  if (!token) {
    throw new Error('Access token is missing');
  }

  try {
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };
    let response = await fetch(originAPi + "/newsletter/CUq6TE3KT8", {
      method: "POST",
      body: JSON.stringify({
        key: token
      }),
      headers: headersList,
    });
    let data = JSON.parse(await response.text());
    if (data.status == 300) {
      DestoryAuth();
    } else {
      return data.data;
    }
  } catch (err) {
    console.error('Error fetching newsletter data:', err.message);
    throw err;
  }
};
export async function fetchNextMonthNewsletterBrand({ key, date = null, forMonth = 1 }) {
  if (!key) {
    throw new Error('Access token is missing');
  }

  try {
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };
    let response = await fetch(originAPi + "/newsletter/Cfe5pdfgpUBjnw9", {
      method: "POST",
      body: JSON.stringify({
        key, date, forMonth
      }),
      headers: headersList,
    });
    let data = JSON.parse(await response.text());


    if (data.status == 300) {
      DestoryAuth();
    } else {
      return data.data;
    }
  } catch (err) {
    console.error('Error fetching newsletter data:', err.message);
    throw err;
  }
};

export async function createNewsletter(body) {
  // if (!body) {
  //   throw new Error('Access token is missing');
  // }

  try {
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };
    let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/3Se95gppZqEB03UASAA", {
      method: "POST",
      body: JSON.stringify(body),
      headers: headersList,
    });
    let data = JSON.parse(await response.text());

    if (data.message == "Processing complete") {
      return { status: true, message: null };
    } else {
      // DestoryAuth();
      return { status: false, message: data.message };
    }
  } catch (err) {
    console.error('Error fetching newsletter data:', err);
    return { status: false, message: err.message };
  }
};


export async function fetchNewletterPreview(body) {
  // if (!body) {
  //   throw new Error('Access token is missing');
  // }

  try {
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };
    let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/hLsoGJGjWAkTjaF", {
      method: "POST",
      body: JSON.stringify(body),
      headers: headersList,
    });
    let data = JSON.parse(await response.text());

    return { status: true, data: data.data };
  } catch (err) {
    console.error('Error fetching newsletter data:', err);
    return { status: false, message: err.message };
  }
};

export async function publicProductDetails({ token, id }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/VxkG0B5ODZxz1Cb", {
    method: "POST",
    body: JSON.stringify({ token, id }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  return data;
}


export async function getEmailBody({ key, id }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };
  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/sGvrHyHtuLuQfis", {
    method: "POST",
    body: JSON.stringify({ key, id }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());

  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}
export async function deleteEmailBlast({ key, ids }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/uZYl7iJRZswNYd6", {
    method: "POST",
    body: JSON.stringify({ key, ids }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}
export async function resetEmailBlast({ key, ids }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/8XoSdoqMZ2dAiqh", {
    method: "POST",
    body: JSON.stringify({ key, ids, status: true }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}
export async function resentEmailBlast({ key, ids }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/c35tdTxizS24VoX", {
    method: "POST",
    body: JSON.stringify({ key, ids }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data;
  }
}
export async function storeDatesHandler({ key, dates, forMonth = 1 }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/08fC7mUSNzUduyt", {
    method: "POST",
    body: JSON.stringify({ key, dates: JSON.stringify(dates), forMonth }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    if (data.status == 200) {
      return true;
    } else {
      return false
    }
  }
}

export async function storeRandomHandler({ key, random }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/GRoeMb363MtQs8B", {
    method: "POST",
    body: JSON.stringify({ key, random }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    if (data.status == 200) {
      return true;
    } else {
      return false
    }
  }
}

export async function createRandomHandler() {
  ;

  let response = await fetch(originAPi + "/EAZ7KKgTyBDsI4M/vUbxDTnfunVyde9");
  let data = JSON.parse(await response.text());
  console.log({ data });
  if (data.status == 300) {
    DestoryAuth();
  } else {
    if (data.status == 200) {
      return true;
    } else {
      return false
    }
  }
}

export async function getSessionStatus({ key, salesRepId }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };
  let response = await fetch(url + "v3/XbgheAKvG5EtkXs", {
    method: "POST",
    body: JSON.stringify({ key, salesRepId }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data;
  }
}

export async function getMarketingCalendar({ key, manufacturerId, year }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(url + "v3/eVC3IaiEEz3x7ym", {
    method: "POST",
    body: JSON.stringify({ key, manufacturerId, year }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  console.log({ data });
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.data;
  }
}

export async function getYearlyComparison({ year, ManufacturerId__c }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/9kJs2I6Bn/Ox2KAg3U0e9l3Ht7lBG7", {
    method: "POST",
    body: JSON.stringify({ year, ManufacturerId__c }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  console.log({ data });
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.data;
  }
}

export async function getTierReportHandler({ year = null, token }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/AJ8GcUnufrmuGkn", {
    method: "POST",
    body: JSON.stringify({ year, token }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.data;
  }
}

export async function getOrderDetailsPdf({ key, opportunity_id }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/mIRX7B9FlQjmOaf/0DS68FOD7s", {
    method: "POST",
    body: JSON.stringify({ key, opportunity_id }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.file || false;
  }
}

export async function getMarketingCalendarPDF({ key, manufacturerId, month, year }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/mIRX7B9FlQjmOaf", {
    method: "POST",
    body: JSON.stringify({ key, manufacturerId, month, year }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  console.log({ data });
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.file || false;
  }
}

export async function getMarketingCalendarPDFV2({ key, manufacturerId, month, year }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/mIRX7B9FlQjmOaf/VTOUZjSm8aIm1ve", {
    method: "POST",
    body: JSON.stringify({ key, manufacturerId, month, year }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  console.log({ data });
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.file || false;
  }
}

export async function getMarketingCalendarPDFV3({ key, manufacturerId, month, year }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  let response = await fetch(originAPi + "/mIRX7B9FlQjmOaf/ohSOBafoPQH0NQi", {
    method: "POST",
    body: JSON.stringify({ key, manufacturerId, month, year }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data?.file || false;
  }
}

export const ArrayFindMaxMin = ({ max = true, getter, data }) => {
  const obj = data.reduce((value, current) => {
    if (max) {
      return current[getter] > value[getter] ? current : value;
    } else {
      return current[getter] < value[getter] ? current : value;
    }
  }, data[0]);
  return obj;
}

export async function uploadFileSupport({ key, supportId, files }) {
  if (files.length) {

    let headersList = {
      "Accept": "*/*", key, supportId
    }
    console.log({ headersList });
    let bodyContent = new FormData();
    files.map((file) => {
      bodyContent.append("files", file.file);
    })
    let response = await fetch(originAPi + "/unCb9Coo4FFqCtG/w72MrdYNHfsSsqe", {
      method: "POST",
      body: bodyContent,
      headers: headersList
    });

    let data = JSON.parse(await response.text());
    if (data) {
      return data.data
    }
  }
}


export const hexabrand = {
  a0O3b00000hym7GEAQ: "#38A3A5",
  a0O3b00000fQrZyEAK: "#9EC1DA",
  a0O1O00000XYBvQUAX: "#f6b6ad",
  a0O3b00000pY2vqEAC: "#ffe3d5",
  a0O3b00000p80IJEAY: "#fdeec8",
  a0O3b00000lCFmREAW: "#a6a0d4",
  a0ORb000000BQ0nMAG: "#206BA1",
  a0O3b00000p7zqKEAQ: "#BEE6DC",
  a0O3b00000ffNzbEAE: "#A66C98",
  a0O3b00000p4F4DEAU: "#6D597A",
  a0O3b00000p4F4CEAU: "#CBA188",
  a0ORb0000000uwfMAA: "#EFD6B1",
  a0O3b00000p4F4HEAU: "#D9D9D9",
  a0ORb000000QzsfMAC: "#B7C8B3",
  a0O1O00000XYBvkUAH: "#6D243E",
  a0O1O00000XYBvaUAH: "#4B95DD",
  a0ORb000000nDfFMAU: "#073763",
  a0ORb000000nDIiMAM: "#7f6000",
  a0ORb000001KCNpMAO: "#F7E8D5",
  a0ORb000002AOMTMA4: "#B8D8BA",
  a0ORb000001EbK5MAK: "#D0E2EC"
};

export const hexabrandText = {
  a0O3b00000hym7GEAQ: "#ffffff",
  a0O3b00000fQrZyEAK: "#2a516d",
  a0O1O00000XYBvQUAX: "#972111",
  a0O3b00000pY2vqEAC: "#bb3e00",
  a0O3b00000p80IJEAY: "#c58300",
  a0O3b00000lCFmREAW: "#352e66",
  a0ORb000000BQ0nMAG: "#0d2b40",
  a0O3b00000p7zqKEAQ: "#2f7967",
  a0O3b00000ffNzbEAE: "#EEDD82",
  a0O3b00000p4F4DEAU: "#ffffff",
  a0O3b00000p4F4CEAU: "#5e3d29",
  a0ORb0000000uwfMAA: "#8a5e1c",
  a0O3b00000p4F4HEAU: "#575757",
  a0ORb000000QzsfMAC: "#445840",
  a0O1O00000XYBvkUAH: "#ffffff",
  a0O1O00000XYBvaUAH: "#ffffff",
  a0ORb000000nDfFMAU: "#deb887",
  a0ORb000000nDIiMAM: "#deb887"
};

export async function getStoreDetails({ key, Id }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };
  let response = await fetch(originAPi + "/retailerv2/OuE4gYJIz2ZUEP6", {
    method: "POST",
    body: JSON.stringify({ key, Id }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data || {};
  }
}

export async function refreshTargetRollOver() {

  let response = await fetch(originAPi + "/95zWpMEFtbAr8lqn/GtRomPJiUPtVfwx");
  let data = JSON.parse(await response.text());
  console.log({ data });

  if (data.status == 200) {
    return true;
  } else {
    return false;
  }
}

export async function getBrandPaymentDetails({ key, Id, AccountId }) {
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };
  let response = await fetch(originAPi + "/stripe/e8IZytvGI1IJX74", {
    method: "POST",
    body: JSON.stringify({ key, Id, AccountId }),
    headers: headersList,
  });
  let data = JSON.parse(await response.text());
  if (data.status == 300) {
    DestoryAuth();
  } else {
    return data.data || {};
  }
}

export const brandDetails =
{
  a0O3b00000hym7GEAQ: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/Byredo%20Ben%20Gorham-main.6dd86132b5ca75e66104.jpg" },
    tagLine: "REINVENTING THE WORLD OF LUXURY.",
    desc: '<p class="seti">Byredo is a European luxury brand founded in Stockholm in 2006 by Ben Gorham, with an ambition to translate memories and emotions into products and experiences.</p><p class="seti">Byredo is reinventing the world of luxury through a new approach, where creation is led by emotions, expressing a full and limitless brand universe.</p><p class="seti">Byredo conceives objects using the highest quality materials available, and high-end design details to fuel a renewed approach to modern luxury.</p><p class="seti">Byredo creates and develops a range of products such as fragrance, makeup, home, leather goods and accessories, and is sold in more than 40 countries in a very high-end exclusive network worldwide. We believe that through creativity, we are able to develop timeless products, both meaningful and inspirational, to people and their lives.</p><p class="seti">A native Swede, born to an Indian mother and a Canadian father, Ben grew up in Toronto, New York and Stockholm. He graduated from the Stockholm art school with a degree in fine arts, but a chance meeting with perfumer Pierre Wulff convinced him that he`d rather create fragrances than paintings. With no formal training in the field, Gorham, 31 years old , sought out the services of world renowned perfumers Olivia Giacobetti and Jerome Epinette, explaining his olfactory desires and letting them create the compositions. As an outsider in the beauty industry, Ben is somewhat of an anomaly and has been recognized for his personal style and connection to fashion and art in several international magazines such as French Vogue, Vanity Fair, Elle, V Magazine and Fantastic Man to name a few.</p>'
  },
  a0O3b00000fQrZyEAK: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/Diptyque-main.58df6e56a34604ee019f.webp" },
    tagLine: "AN OLFACTORY JOURNEY.",
    desc: '<p class="seti">For Diptyque, creating fragrances is an art and art is a journey. An imaginary journey of the mind and the senses across olfactory landscapes, far from the paths that others take, in search of rare raw materials and unexpected accords. A journey between the past and the future, between tradition and the avant-garde, toward another place where history, new ideas, and disruption combine.</p><p class="seti">Diptyque is always in between two worlds, finding its balance between dreams and reality, free from traditional gender codes or cultural boundaries, committed to developing connections and blends that nourish its inspiration. It is a creator of essences and images where the eye, the hand, and the nose are united to constantly revisit the surprising world of Haute Parfumerie.</p>'
  },
  a0O1O00000XYBvQUAX: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/rms-main.d3808346ce74c6385895.png" },
    tagLine: "MASTERFULLY MADE. BEAUTIFULLY CLEAN.",
    desc: '<p class="seti">A pioneer of the clean beauty movement, Rose-Marie Swift is the founder and the spirit of the brand. A master makeup artist for over 30 years, her lightbulb moment was realizing that cosmetics could be made with better, safer ingredients while simultaneously making women more beautiful. Bold, authentic, and unwavering in her quest for innovative clean ingredients that perform, she launched RMS in 2009 to clean up the industry and set a higher standard for beauty.</p><p class="seti"> If you know...you know. Just ask the world’s top supermodels and a community of loyal followers who have worn RMS for over a decade. As a professional makeup artist, it was important to Rose-Marie that RMS products were not only safe to use but could also be beautiful and long-lasting on a photo shoot, a runway show, and, of course, every day.</p><p class="seti"> RMS products are simple to understand, easy to use, and showcase the need for pure, simple, plant-based, skin-loving ingredients - and the beauty of radiant, glowing, natural human skin.</p>'
  },
  a0O3b00000pY2vqEAC: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/revive-main.6f1d78477450b18ea9ab.png" },
    tagLine: "RESEARCH. RENEWAL. RESULTS",
    desc: '<p class="seti"><b>GIVE NEW LIFE TO SKIN.</b></p><p class="seti">A high-performance, luxury skincare line developed by plastic and reconstructive surgeon Dr. Gregory Bays Brown in 1997. RéVive formulas unlock the power of Bio-Renewal Technology, a cutting edge science, which visibly transforms renews, restoring skin to a younger, healthier, more supple version of itself. This collection of bio-engineered, skin-identical peptides mimic your own bio-renewal process to help restore skin`s youthful glow.</p><p class="seti"> RéBuild your skin, from the inside, out.</p>'
  },
  a0O3b00000p80IJEAY: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/Bb.Brand-main.2d847754b231e7165727.jpg" },
    tagLine: "SUSTAINABLE LUXURY.",
    desc: '<p class="seti">Bumble and bumble began as an New York City salon in 1977, where we clipped, colored, and styled our way into prominence – with a strong design aesthetic and extraordinary products; in magazines, on runways, and backstage worldwide. Bumble and bumble has over 40+ years of salon industry expertise, owns and operates two leading flagship salons in NYC, and has salon partnerships with over 1500 independently owned salons all across North America.</p><p class="seti">Bumble and bumble is inspired by masters of the craft: hairstylists and colorists obsessed with technical and artistic excellence through bold self-expression. Bumble and bumble invents products to meet these professional, exacting standards that are also easy enough for anyone to use: from the iconic wave-enhancing Surf Spray to the best-selling mega-moisturizing Hairdresser`s Invisible Oil range. These well-loved products are used by pros in Bumble and bumble salons and by millions of people around the world at home every day. Bumble and bumble creates products for all hair types, textures, and style preferences with uncompromising quality to instantly elevate your personal style with an effortlessly modern look. We are deeply, passionately, and fearlessly dedicated to the craft of hair. </p>'
  },
  a0O3b00000lCFmREAW: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/Smashbox.a7d1cb75ff5bffb7c858.jpg" },
    tagLine: "CREATIVITY, COMMUNITY, AND COLLABORATION.",
    desc: '<p class="seti">Everyone has a story. Ours is original and authentic and sets us apart from every other beauty brand. We`re proud of our story, and this is how we tell it: We live for lipstick. We get excited about primers. (No, seriously, we do.) But mostly, we love sharing our makeup secrets with you. Why? Because creativity and collaboration are at the core of our DNA. We are the only brand born out of a legendary photo studio — Smashbox Studios in Los Angeles — where major photographers, celebrities and makeup artists converge to create iconic images every day. Studio-tested, shockingly high-performance. Longwearing and skincaring. Artistry made easy. Hardworking makeup that keeps up with you.</p>'
  },
  a0ORb000000BQ0nMAG: {
    img: { src: "/assets/images/31.jpg" },
    tagLine: "Good. Better. Best. Beckham. That's the Victoria Standard.",
    desc: "<p class='seti'>Although Victoria Beckham had experienced the world's best beauty products (often in the hands of the world's best stylists, under the direction of the world's best photographers) she still found herself looking around - and into her makeup bag - and thinking 'This could be better'. Because, despite the array of quality, style, craft and heritage on offer, everything that excelled in one area seemed to sacrifice in another. And so Victoria Beckham Beauty was created to make the products that would finally meet these uncompromising standards: Proven performance and an elevated experience delivered with intentional integrity, transparency and inclusivity. A keenly curated range that only includes items that genuinely add to the best already out there; Shades selected for classical looks and contemporary styles; The feeling of luxury from first sight to last swipe, sweep or dab; The enduring quality required by demanding lifestyles; Fashion-led, female founded, cruelty-free, conscious and clean.</p><p class='seti'>Pure excellence in every way, at all times. Ambitious? Absolutely. Unreasonable? Not one bit.</p>"
  },
  a0O3b00000p7zqKEAQ: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/bobbi-brown-main.d67c6c3e9732a993f1c2.png" },
    tagLine: "BEGIN WITH SKIN. GLOW FROM WITHIN.",
    desc: '<p class="seti">In 1991, Bobbi Brown was founded by a female makeup artist in New York, designed for the world--your world. We offer approachable artistry and create beauty must-haves that look good, work hard, and stay fresh every hour of the day.</p><p class="seti">We remain women-first, champions of individual beauty, original owners of healthy, glowing skin, with the most premium products and effortless artistry, and expanding the brand and line in a way that is even more relevant to today’s consumer.</p>'
  },
  a0O3b00000ffNzbEAE: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/Maison%20Margiela-main.a172327e11f40992d628.webp" },
    tagLine: "SMELLS LIKE MEMORIES.",
    desc: '<p class="seti">Maison Margiela is a Parisian haute couture house founded on ideas of nonconformity and the subversion of norms. Appointed Creative Director in 2014, the British couturier John Galliano exercises his visual language to expand on the grammar of Maison Margiela, creating a new technical vocabulary that cements the house’s position as a singular and autonomous entity in the realm of luxury.</p><p class="seti">In 1994, Maison Margiela introduced the first "REPLICA" fashion pieces: garments and accessories hand-picked throughout the world and meticulously reproduced, preserving their character and charm. Each piece features a special label inside, describing the source and period of the original item.</p><p class="seti">In 2012, Maison Margiela expanded on this unique concept with a collection of fragrances: the scents your memories are made of. The "REPLICA" collection assembles iconcolast fragrances that have the universal power to trigger personally cherished moments, personal stories lived or to be lived.</p>'
  },
  a0O3b00000p4F4DEAU: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/estee-launder-main.49ed7ad83e9ca188b827.png" },
    tagLine: "CREATING THE FUTURE OF BEAUTY TOGETHER.",
    desc: '<p class="seti">Estée Lauder is the flagship brand of The Estée Lauder Companies Inc. Founded by Estée Lauder, one of the world’s first female entrepreneurs, the brand today continues her legacy of creating the most innovative, sophisticated, high-performance skin care and makeup products and iconic fragrances — all infused with a deep understanding of women’s needs and desires. Today Estée Lauder engages with women in over 150 countries and territories around the world and at a variety of touch points, in stores and online. And each of these relationships consistently reflects Estée’s powerful and authentic woman-to-woman point of view.</p><p class="seti">In 1946, Mrs. Estée Lauder started with four cremes and a dream. With grit and persistence, she paved her own way in the beauty industry—going from selling her cremes in salons to selling them on the shelves of stores around the world.</p><p class="seti">At a time when the beauty industry was ruled by men, Estée was the original girl boss, breaking glass ceilings and defying expectations at every turn. She was a true influencer, connecting with and giving honest, real-world beauty advice to women around the world.</p><p class="seti">Her life’s passion was to make everyone look and feel their most beautiful, and it’s this same spirit and high-touch experience that we strive to bring to every customer today.</p>'
  },
  a0O1O00000XYBvkUAH: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/kevy-auc-main.25b5d3519359b521f0ac.png" },
    tagLine: "BEAUTY BELONGS TO THE BRAVE",
    desc: '<p class="seti">Kevyn Aucoin Beauty was founded in 2001 by one of the most iconic and influential makeup artists of all time. In the 90s, Kevyn became the first celebrity makeup artist with clients like Cindy Crawford, Naomi Campbell, Kate Moss, Cher, Whitney Houston, Madonna, Liza Minelli, Barbara Streisand, Tina Turner, and Jennifer Lopez. He perfected and brought fame to many iconic makeup techniques like contouring and the “J.Lo glow” leading him to become the first-ever makeup artist to receive a CFDA Award .</p><p class="seti">Kevyn tragically passed away in 2002, but not before launching his legacy brand– Kevyn Aucoin Beauty, where Kevyn’s spirit lives on today: It’s unapologetic, brave, and rather quite fearless.</p><p class="seti">Kevyn believed that every woman is beautiful within, and makeup was simply his tool for helping her discover that beauty. He was a man and an artist decades ahead of his time, which paved the way for innovative, award-winning products, high-performance formulas, and textures.</p><p class="seti">His luxurious textures and expansive shade ranges have had a broad appeal globally for 20 years, when most brands had a limited shade range. He was a true industry pioneer who championed inclusivity, originality, empowerment and education, which remain pillars of the brand today.</p>'
  },
  a0O1O00000XYBvaUAH: {
    img: { src: "https://beautyfashionsales.vercel.app/static/media/By-terry-main.c479f0be0d3cb5bb50c3.png" },
    tagLine: "PARISIAN-BORN, SKINCARE-INFUSED MAKEUP.",
    desc: '<p class="seti">Terry de Gunzburg is a trailblazing industry legend who over the course of the past 30 years has changed the face of beauty.</p><p class="seti">Trading a career in medicine for a more creative life, Terry studied at the Carita beauty school in Paris and quickly became an in-demand makeup artist working with some of the biggest names in fashion. Her trademark beauty look has always been distinctive: imperceptible foundation, impeccable lips and thick, separated lashes.</p><p class="seti">As International Makeup Designer of YSL Beauté for 15 years, Terry invented the iconic Touché Eclat in 1992 (as well as countless other products and formulas). Radiance and a healthy complexion has always been key to Terry’s approach to make up, and so she decided to launch her own collection of products in 1998, and BY TERRY was born.</p><p class="seti">In 2004 after a mix up in the lab, double the amount of rose butter was added to a lip balm which would soon become BY TERRY’s most successful product: Baume de Rose. Described as the Rolls Royce of lip balms, it symbolizes everything the brand stands for—luxury, indulgence and a timelessness.</p><p class="seti">Almost 10 years ago, before hyaluronic acid was widely known by households worldwide, Terry created the first clean mattifying setting powder, the Hyaluronic Hydra-Powder. This was the start of Terry’s one of a kind Hyaluronic Range. We remain today pioneers of this ingredient and its applications. </p>'
  },
  a0O3b00000p4F4CEAU: {
    img: {},
    tagLine: null,
    desc: null
  },
  a0ORb0000000uwfMAA: {
    img: {},
    tagLine: null,
    desc: null
  },
  a0O3b00000p4F4HEAU: {
    img: {},
    tagLine: null,
    desc: null
  },
  a0ORb000000QzsfMAC: {
    img: {},
    tagLine: null,
    desc: null
  },
  a0ORb000000nDfFMAU: {
    img: {},
    tagLine: null,
    desc: null
  },
  a0ORb000000nDIiMAM: {
    img: {},
    tagLine: null,
    desc: null
  },
  a0ORb000001KCNpMAO: {
    img: { src: "/assets/images/29.jpg" },
    tagLine: "Every. Single. Day.™",
    desc: "<p>SPF is the #1 thing you can do for your skin, so we put it first in all we do. Founded in 2005 by mom and former elementary school teacher Holly Thaggard, Supergoop! is made with a mission: To change the way the world thinks about sunscreen and end the epidemic of skin cancer. As the Experts in SPF™, we’ve been raising the bar for effective, feel-good sunscreen for nearly 20 years. Discover our 40+ dermatologist-tested formulas for all skin types, tones and routines, and find the SPF you want to wear. Every. Single. Day.™</p>"
  },
  a0ORb000002AOMTMA4: {
    img: { src: '/assets/images/featured-a0ORb000002AOMTMA4.jpg' },
    tagLine: "Where mood is elevated and scent is celebrated",
    desc: "<p>Scent your world with NEST New York’s fragranced home, personal care, wellness, and technology collections. Recognized by the fragrance industry as a gamechanger, founder Laura Slatkin has a unique approach to fragrance, artfully blending notes of the familiar, the exotic, and the unexpected for a fragrance experience like no other.</p>"
  }
}
// .....................
export const productGuides = {
  productKey1: {
    Categoryname: "Access",
    filename: "How to Access BFSG Retailer Portal Video.mp4",
    OriginalFileName: "how-to-access-bfsg-retailer-portal-video",
    Link: "help/how-to-access-bfsg-retailer-portal-video.mp4",
    Type: "Video",
  },
  productKey2: {

    Categoryname: "Access",
    filename: "How To Access BFSG Retailer Portal.pdf",
    OriginalFileName: "how-to-access-bfsg-retailer-portal",
    Link: "help/how-to-access-bfsg-retailer-portal.pdf",
    Type: "pdf",

    // Direct link to the video file
  },
  productKey3: {
    Categoryname: "Customer Service",

    Link: "help/how-to-report-incorrect-charges.pdf",
    filename: "How To Report Incorrect Charges.pdf",
    OriginalFileName: "how-to-report-incorrect-charges",
    Type: "Pdf",

    // Direct link to the video file
  },
  productKey4: {
    Categoryname: "Customer Service",
    Link: "help/how-to-report-product-damages-video.mp4",
    filename: "How to Report Product Damages Video.mp4",
    OriginalFileName: "how-to-report-product-damages-video",
    Type: "Video",
  },
  productKey5: {
    Categoryname: "Customer Service",
    Link: "help/how-to-report-product-damages.pdf",
    filename: "How To Report Product Damages.pdf",
    OriginalFileName: "how-to-report-product-damages",
    Type: "pdf",

    // Direct link to the video file
  },
  productKey6: {
    Categoryname: "Customer Service",
    Link: "help/how-to-report-product-shortage.pdf",
    filename: "How To Report Product Shortage.pdf",
    OriginalFileName: "how-to-report-product-shortage",
    Type: "pdf",

    // Direct link to the video file
  },
  productKey7: {
    Categoryname: "Customer Service",
    Link: "help/how-to-report-product-shortages-video.mp4",
    filename: "How to Report Product Shortages Video.mp4",
    OriginalFileName: "how-to-report-product-shortages-video",
    Type: "Video",

    // Direct link to the video file
  },
  productKey8: {
    Categoryname: "Customer Service",
    Link: "help/how-to-request-invoice-tracking-number-order-status.pdf",
    filename: "How To Request Invoice Tracking Number Order Status.pdf",
    OriginalFileName: "	how-to-request-invoice-tracking-number-order-status",
    Type: "pdf",

    // Direct link to the video file
  },
  productKey9: {
    Categoryname: "Marketing Calender",
    Link: "help/how-to-marketing-calendar-video.mp4",
    filename: "How To Marketing Calendar Video.mp4",
    OriginalFileName: "how-to-marketing-calendar-video",
    Type: "Video",

    // Direct link to the video file
  },
  productKey10: {
    Categoryname: "Marketing Calender",
    Link: "help/how-to-marketing-calendar.pdf",
    filename: "How To Marketing Calendar.pdf",
    OriginalFileName: "how-to-marketing-calendar",
    Type: "pdf",

    // Direct link to the video file
  },
  productKey11: {
    Categoryname: "Orders",
    Link: "help/how-to-place-an-event-order-for-elc-brand.pdf",
    filename: "How To Place an Event order for ELC brand.pdf",
    OriginalFileName: "how-to-place-an-event-order-for-elc-brand",
    Type: "pdf",

    // Direct link to the video file
  },

  productKey12: {
    Categoryname: "Orders",
    Link: "help/how-to-place-an-event-order-video.mp4",
    filename: "How to Place an Event Order Video.mp4",
    OriginalFileName: "how-to-place-an-event-order-video",
    Type: "Video",

    // Direct link to the video file
  },
  productKey13: {
    Categoryname: "Orders",
    Link: "help/how-to-place-an-order-video.mp4",
    filename: "How To Place an Order Video.mp4",
    OriginalFileName: "how-to-place-an-order-video",
    Type: "Video",

    // Direct link to the video file
  },
  productKey14: {
    Categoryname: "Orders",
    Link: "help/how-to-place-an-order.pdf",
    filename: "How To Place an Order.pdf",
    OriginalFileName: "how-to-place-an-order",
    Type: "pfd",

    // Direct link to the video file
  },
  productKey15: {
    Categoryname: "Orders",
    Link: "help/how-to-place-preorders-video.mp4",
    filename: "How To Place Preorders Video.mp4",
    OriginalFileName: "how-to-place-preorders-video",
    Type: "Video",

    // Direct link to the video file
  },
  productKey16: {
    Categoryname: "Orders",
    Link: "help/how-to-place-preorders.pdf",
    filename: "How to Place Preorders.pdf",
    OriginalFileName: "how-to-place-preorders",
    Type: "pdf",


    // Direct link to the video file
  },


};

export function DateConvert(dateString, timeStamp = false) {
  if (dateString && timeStamp) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    dateString = new Date(dateString).toLocaleDateString(undefined, options)
    return dateString
  }
  if (dateString) {
    const [year, month, day] = dateString.split(/[-/]/);
    if (day && month && year) {
      let parsedDate = new Date(`${month}/${day}/${year}`);
      if (!isNaN(parsedDate.getTime())) {
        const options = { day: "numeric", month: "short", year: "numeric" };
        let launchDateFormattedDate = new Intl.DateTimeFormat("en-US", options).format(new Date(parsedDate));
        return launchDateFormattedDate;
      }
    }
    // throw new Error("Invalid date string");
  }
}
