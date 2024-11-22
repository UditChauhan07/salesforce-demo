import axios from "axios";
import { originAPi } from "../lib/store";
const access_token = async () => {
  const response = await axios.post(originAPi+"/beauty/login");
  return response.data.data.access_token;
};
export const useSignUp = () => {
  return {
    newUserSignUp: async (values) => {
      const key = await access_token();
      let bodydata = {
        link: "https://beautyfashionsales.my.salesforce.com/services/data/v51.0/sobjects/Lead",
        key: key,
        data: {
          FirstName: values.firstName,
          LastName: values.lastName,
          Company: values.storeName,
          Manufacturer__c: values.brands.toString(),
          Address_for_Samples__c: values.storeLocation,
          Phone: String(values.contact),
          Email: values.email,
          Description: values.descriptionOfStore,
          How_do_you__c: values.sellOption,
          Website: "https://www.designersx.us/",
          Facebook_URL__c: "https://www.facebook.com/your.username/",
          Instagram_URL__c: "https://www.instagram.com/yourusername/",
          Status: "Lead Open in Salesforce",
          LeadSource: "Wholesale Inquiry From Brand",
          Payment_Type__c: "Credit Card",
          Margin__c: "50",
          Display_or_Assortment__c: "No Display",
        },
      };
      const response = await axios.post(originAPi+"/beauty/B0F9FC7237TC", bodydata);
      return response.data.status;
    },
  };
};
