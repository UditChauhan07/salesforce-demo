import axios from 'axios';
import { GetAuthData, DestoryAuth } from './store'; // Import any necessary functions
import { originAPi } from './store';
import { getPermissions } from './permission';

export const fetchAccountDetails = async (
  setLoading,
  setAccountManufacturerRecords,
  setFilteredRecords,
  setAccounts,
  setSalesReps,
  setManufacturers
) => {
  setLoading(true);
  try {
    // Get user permissions
    const userPermissions = await getPermissions();
    const saleRepId = JSON.parse(localStorage.getItem("Api Data")).data.Sales_Rep__c;
    // Fetch authentication data
    const data = await GetAuthData();
    if (!data) {
      console.log("No data found, destroying auth");
      DestoryAuth();
      return;
    }
    const accessToken = data.access_token;
    const apiUrl = `${originAPi}/skahHqskfz/NbvBPAyVSQ`;

    // Conditionally include salesRepId if user is not god-level
    const requestBody = {
      accessToken,
      ...(userPermissions?.modules?.godLevel ? {} : { salesRepId: saleRepId })  // If not god-level, include salesRepId
    };

    // Make the API request
    const res = await axios.post(apiUrl, requestBody);
    console.log("API Response:", res.data);

    if (res.data) {
      const records = res.data.records;

      // Flatten records for easier access
      const expandedRecords = records.flatMap(record => {
        const contacts = record.contact || [];
        return contacts.length
          ? contacts.map(contact => ({
              ...record,
              contact
            }))
          : [{ ...record, contact: null }];
      });

      // Filter out inactive accounts before setting records
      const activeRecords = expandedRecords.filter(record => record.accountDetails?.Active_Closed__c); 
      console.log("Active records:", activeRecords);

      setAccountManufacturerRecords(activeRecords);
      setFilteredRecords(activeRecords);

      // Prepare unique dropdown options
      const accountList = Array.from(new Set(activeRecords.map(record => record.accountDetails?.Name)))
        .map(name => ({
          label: name,
          value: name,
        }));

      const salesRepList = Array.from(new Set(activeRecords.map(record => record.manufacturers?.salesRep)))
        .map(name => ({
          label: name,
          value: name,
        })).filter(item => item.label); // Filter out any null or undefined values

      const manufacturerList = Array.from(new Set(activeRecords.map(record => record.manufacturers?.manufacturerName)))
        .map(name => ({
          label: name,
          value: name,
        })).filter(item => item.label); // Filter out any null or undefined values

      setAccounts(accountList);
      setSalesReps(salesRepList);
      setManufacturers(manufacturerList);
    }
  } catch (error) {
    console.error("Error fetching account details:", error);
  } finally {
    setLoading(false);
  }
};
