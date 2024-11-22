import { createContext, useContext, useEffect, useState } from "react";
import React from "react";

const BagContext = createContext();

const BagProvider = ({ children }) => {
  const [orders, setOrders] = useState({});
  const [orderQuantity, setOrderQuantity] = useState(0);

  useEffect(() => {
    // Manually calculates the order quantity from order state
    let orderQuantity = 0;
    Object.values(orders)?.forEach((order) => {
      orderQuantity += order.quantity;
    });
    setOrderQuantity(orderQuantity);
  }, [orders]);

  useEffect(() => {
    // Update the local storage whenever the order state is changed
    if (Object.keys(orders)?.length) {
      deleteOrder();
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    // Gets the orders from local storage on initial render
    const fetchedOrders = localStorage.getItem("orders");
    if (fetchedOrders) {
      setOrders(JSON.parse(fetchedOrders));
    }
  }, []);

  const addOrder = (product, quantity, discount) => {
    setOrders((prev) => {
      const obj = { ...prev };
      obj[product.Id] = parseOrderObjectWithDiscount(product, quantity, discount);
      return obj;
    });
  };
  const setOrderProductPrice = async (product, price, discount = null) => {
    setOrders((prev) => {
      const obj = { ...prev };
      if (obj[product.Id]) {
        obj[product.Id].product.salesPrice = price;
        obj[product.Id].product.discount = discount;
        console.log({ aa: obj[product.Id] });
        return obj;
      } else {
        return true
      }
    });
    return true
  };
  const parseOrderObjectWithDiscount = (product, quantity, discount) => {

    return {
      quantity: quantity,
      product,
      discount: {
        MinOrderAmount: discount.MinOrderAmount,
        margin: discount.margin,
        sample: discount.sample,
        testerMargin: discount.testerMargin,
        testerproductLimit: discount.testerproductLimit,
      },
      account: {
        name: localStorage.getItem("Account"),
        id: localStorage.getItem("AccountId__c"),
        address: localStorage.getItem("address"),
        shippingMethod: JSON.parse(localStorage.getItem("shippingMethod")),
      },
      manufacturer: {
        name: localStorage.getItem("manufacturer"),
        id: localStorage.getItem("ManufacturerId__c"),
      },
      productType: product.Category__c === "PREORDER" ? "pre-order" :
        product?.Category__c?.toUpperCase().match("EVENT") ? "pre-order" :
          product.Category__c === "TESTER" ? "tester" : product.Category__c?.toUpperCase() === "Samples" ? "samples" : "wholesale",
    };
  };
  // deletion of orders with quantity 0
  const deleteOrder = () => {
    Object.keys(orders).forEach((order) => {
      if (orders[order]["quantity"] === 0) {
        delete orders[order];
      }
    });
    if (Object.keys(orders).length === 1) {
      if (Object.values(orders)[0]["quantity"] === 0) {
        localStorage.removeItem("orders");
      }
    }
    if (Object.keys(orders).length === 0) {
      localStorage.removeItem("orders");
    }
  };

  return (
    <BagContext.Provider
      value={{
        orders,
        setOrders,
        setOrderProductPrice,
        orderQuantity,
        setOrderQuantity,
        addOrder,
        deleteOrder
      }}
    >
      {children}
    </BagContext.Provider>
  );
};

export const useBag = () => useContext(BagContext);

export default BagProvider;
