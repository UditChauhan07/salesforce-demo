import axios from "axios";
import { getPermissions } from "../lib/permission"; // Import the getPermissions function
import { DestoryAuth, originAPi } from "../lib/store";

const useSalesReport = () => {
  return {
    salesReportData: async ({ yearFor, dateFilter }) => {
      try {
        // Get user permissions using the getPermissions function
        const userPermissions = await getPermissions();

        if (!userPermissions) {
          
          return null;
        }

        
        let reportUrl = originAPi + "/9kJs2I6Bn/i0IT68Q8&0";

        // Check if the user has godLevel access
        if (userPermissions.modules.godLevel) {
          // If godLevel is true, use the specific URL for god-level users
          reportUrl = originAPi + "/salesReport/4i1cKeDt9";
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const salesRepId = JSON.parse(localStorage.getItem("Api Data")).data.Sales_Rep__c;
        const response = await axios.post(
          reportUrl,
          {
            salesRepId: salesRepId,
            yearFor: yearFor,
            dateFilter: dateFilter,
          },
          {
            headers: {
              'Timezone': timezone,
            },
          }
        );

        // If the user has godLevel access, add ownerPermission to the response
        if (userPermissions.modules.godLevel) {
          response.data.ownerPermission = true;
        }

        // Handle response status
        if (response.status === 300) {
          DestoryAuth();
        } else {
          return response;
        }
      } catch (error) {
        console.error("Error fetching sales report data:", error);
        throw error;
      }
    },
  };
};

export default useSalesReport;
