import { DestoryAuth, originAPi } from "../lib/store";
import { useFetch } from "./useFetch";

export const useRetailersData = () => {
  const fetchedRetailers = useFetch(
    originAPi+"/beauty/v3/JbUxci",
    {
      method: "POST",
    }
  );
  if (fetchedRetailers.status == 300) {
    DestoryAuth();
  } else {
  return fetchedRetailers;
  }
};
