import axios from "axios";
import { originAPi, uploadFileSupport } from "../lib/store";
const access_token = async () => {
  const response = await axios.post(originAPi + "/beauty/login");
  return response.data.data.access_token;
};
export const useSignUp = () => {
  return {
    newUserSignUp: async (values, files = []) => {
      const key = await access_token();
      if (key) {
        let bodydata = {
          link: "https://beautyfashionsales.my.salesforce.com/services/data/v51.0/sobjects/Lead",
          key,
          data: {
            FirstName: values.firstName,
            LastName: values.lastName,
            Company: values.storeName,
            Manufacturer__c: values.brands.toString(),
            Address_for_Samples__c: values.storeLocation,
            Phone: String(values.contact),
            Email: values.email,
            Description: values.descriptionOfStore,
            Notes__c: values.descriptionOfStore,
            How_do_you__c: values.sellOption,
            Website: values?.website ?? null,
            Facebook_URL__c: values?.facebookUrl ?? null,
            Instagram_URL__c: values?.instagramUrl ?? null,
            Status: "Lead Open in Salesforce",
            LeadSource: "Wholesale Inquiry From Brand",
            Payment_Type__c: values?.paymentType ?? "Credit Card",
            Margin__c: values?.margin ?? "50",
            Display_or_Assortment__c: values?.assortment ?? "No Display",
          },
        };
        const response = await axios.post(originAPi + "/beauty/B0F9FC7237TC", bodydata);
        if (files.length && response?.data?.status == 200 && response?.data?.data?.id) {
          let leadId = response?.data?.data?.id;
          let fileUploader = await uploadFileSupport({ key, supportId: leadId, files })
          if(fileUploader){
            return response.data.status == 200 ? response.data.status : response?.data?.err ? response?.data?.err : response?.data;
          }
        } else {
          return response.data.status == 200 ? response.data.status : response?.data?.err ? response?.data?.err : response?.data;
        }
      }
    },
  };
};
