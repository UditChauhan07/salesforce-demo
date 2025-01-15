// orderService.js
import { GetAuthData, getAllAccountOrders } from "../../lib/store";

export const orderListHandler = async (accountIds = null, filterValue) => {
  try {
    const response = await GetAuthData();
    const accountList = response.data.accountList;

    const orderResponse = await getAllAccountOrders({
      key: response.data.x_access_token,
      accountIds: JSON.stringify(accountIds || response.data.accountIds),
      month: filterValue.month,
    });

    // Return orders and accountList for further processing
    return { orders: orderResponse, accountList };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};
