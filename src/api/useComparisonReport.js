import axios from "axios";
import { DestoryAuth, originAPi } from "../lib/store";

export const useComparisonReport = (props) => {
  return {
    fetchComparisonReportAPI: async ( {ManufacturerId__c, month, year}) => {
      // console.log("props", ManufacturerId__c, month, year);
      const response = await axios.post(originAPi+"/9kJs2I6Bn/rMTwGEXljiSXGFt", {
        ManufacturerId__c: ManufacturerId__c,
        month: month,
        year: year,
      });
      if (response.status == 300) {
        DestoryAuth();
      } else {
        return response.data;
      }
    },
  };
};
