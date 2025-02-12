import axios from "axios";
import { DestoryAuth, originAPi } from "../lib/store";

const useLogin = () => {
  return {
    mutateLogin: async (email, password) => {
      // const response = await axios.post("https://dev.beautyfashionsales.com/beauty/v3/PYmsWL", { email, password });
      //v4/znuAsNjpVtT5O9H
      const response = await axios.post(originAPi+"/beauty/v3/gqJW69", { email, password });
      localStorage.setItem("response", JSON.stringify(response));
      
      if (response.status == 300) {
        // DestoryAuth();
      } else {
      return response.data;
      }
    },
  };
};

export default useLogin;
