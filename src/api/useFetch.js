import { useAuth } from "../context/UserContext";
import useSWR from "swr";

const fetcher = (data /**Array */) =>
  fetch(data[0] /**URL */, data[1] /**options */).then((res) => res.json());

export const useFetch = (url, options) => {
  const { user, isUserLoading } = useAuth();

  const swr = useSWR(
    () =>
      !isUserLoading && url
        ? [
            url,
            {
              ...(options || {}),
              headers: {
                "Content-type": "application/json",
                // key: user?.data.api.access_token,
                // userId: user?.data.user.Sales_Rep__c,
                key: user?.data.access_token,
                userId: user?.data.Sales_Rep__c,  
                ...(options?.headers || {}),
              },
            },
          ]
        : null,
    fetcher
  );

  return swr;
};
