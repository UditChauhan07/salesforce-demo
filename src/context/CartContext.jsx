import React, { createContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { CartHandler, GetAuthData } from '../lib/store';
let orderCartKey = "AA0KfX2OoNJvz7x"

// Create the context
const CartContext = createContext();

const initialOrder = {
    ordertype: null, // Initially null, will be set on the first product addition
    Account: {
        name: null,
        id: null,
        address: null,
        shippingMethod: null,
        SalesRepId: null,
        PoNumber: null,
        Note: null,
        discount: {
            MinOrderAmount: null,
            margin: null,
            sample: null,
            testerMargin: null,
            testerproductLimit: null,
            sampleInclude: true,
            testerInclude: true
        },
    },
    Manufacturer: {
        name: null,
        id: null,
    },
    items: [], // Cart items
    orderQuantity: 0, // Total quantity of products
    total: 0, // Total price,
    PaymentDetails: {},
    CreatedBy: null,
    CreatedAt: null
};


// Cart Provider component
const CartProvider = ({ children }) => {

    const [order, setOrder] = useState({});

    useEffect(() => {
        if (!initialOrder.CreatedBy) {
            GetAuthData().then((user) => {
                if (user) {
                    if (user?.Sales_Rep__c) {
                        initialOrder.CreatedBy = user?.Sales_Rep__c;
                    }
                }
            })
        }
    }, [initialOrder])

    const fetchCartFromServer = async () => {
        try {
            const user = await GetAuthData();
            if (user) {
                if (user?.Sales_Rep__c) {
                    const getOrder = { CreatedBy: user?.Sales_Rep__c };
                    const cart = await CartHandler({ cart: getOrder });


                    // Validate if the fetched cart has essential content like Account and Manufacturer
                    if (cart?.Account?.id && cart?.Manufacturer?.id) {
                        // setOrder(cart); // Set the fetched cart if valid
                        // localStorage.setItem(orderCartKey, JSON.stringify(cart)); // Store in local storage
                        return cart;
                    } else {
                        // setOrder(initialOrder); // Use initial order if no valid cart is found
                        return false;
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            return false;
        }
    };
    const fetchCart = async () => {
        const savedCart = JSON.parse(localStorage.getItem(orderCartKey)) || initialOrder;
        const serverCart = await fetchCartFromServer();
        if (serverCart) {
            localStorage.setItem(orderCartKey, JSON.stringify(serverCart));
            setOrder(serverCart); // Use server cart if available
        } else {
            setOrder(initialOrder)
        }
    }

    useEffect(() => {
        // Add event listener for storage changes
        const handleStorageChange = (event) => {
            if (event.key === orderCartKey) {
                const updatedCart = event.newValue ? JSON.parse(event.newValue) : initialOrder;
                setOrder(updatedCart); // Update the order state when another tab modifies the cart
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange); // Cleanup listener on unmount
        };
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchCart();
                // console.log('Page is active');
                // Check for updates or fetch data
            }
        };

        const handleFocus = () => {
            // console.log('Window is focused');
            // Maybe refresh data or resume actions
        };

        const handleBlur = () => {
            // console.log('Window is blurred');
            // Pause any ongoing activities
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);


        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);



    const confirmReplaceCart = (accountMatch, manufacturerMatch, orderTypeMatch, msg = null) => {
        let message = "Account, Manufacturer, or Order Type do not match the current cart. Do you want to replace the cart with the new cart?";
        if (accountMatch && manufacturerMatch && orderTypeMatch) {
            if (msg) {
                message = msg;
            } else {
                message = "The account, manufacturer, and order type match. Do you want to proceed with the cart replacement?";
            }
        } else if (!accountMatch) {
            message = "The account does not match the current cart. Do you want to replace the cart with the new account order?";
        } else if (!manufacturerMatch) {
            message = "The brand does not match the current cart brand. Do you want to replace the cart with the new brand order?";
        } else if (!orderTypeMatch) {
            message = "The order type does not match the current cart. Do you want to replace the cart with the new order type?";
        }

        return Swal.fire({
            title: 'Replace Cart?',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000',  // Black
            cancelButtonColor: '#000',   // White
            confirmButtonText: 'Yes, replace it!',
            cancelButtonText: 'No, keep current',
            background: '#f9f9f9',
            color: '#333',
        }).then((result) => {
            return result.isConfirmed;  // Returns true if user confirms, false otherwise
        });
    };

    // Initialize the order (always replace the existing cart)
    const initializeOrder = (account, manufacturer) => {
        setOrder({
            ...initialOrder,
            Account: account,
            Manufacturer: manufacturer,
        });

        return {
            status: 'success',
            message: 'New cart initialized with provided account and manufacturer.',
        };
    };


    const addOrder = async (product, account, manufacturer) => {
        // let status = await fetchCart();
        const user = await GetAuthData();
        let qty = product.qty || product.Min_Order_QTY__c || 1;
        // If the cart is empty or just initialized, set the orderType based on the first product added
        if (!order.ordertype) {
            let orderRaw = {
                ...order,
                ordertype: product.orderType,
                Account: account,
                Manufacturer: manufacturer,
                items: [{ ...product, qty }],
                orderQuantity: qty,
                total: product.price * qty,
                CreatedAt: new Date(),
                CreatedBy: user?.Sales_Rep__c,
            }
            setOrder(orderRaw);

            localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
            await CartHandler({ cart: orderRaw, op: 'create' });
            return {
                status: 'success',
                message: 'Product added to the new cart',
            };
        }

        // Check if the account, manufacturer, and orderType match
        const isAccountMatch = order.Account.id === account.id;
        const isManufacturerMatch = order.Manufacturer.id === manufacturer.id;
        const isOrderTypeMatch = order.ordertype === product.orderType;

        if (isAccountMatch && isManufacturerMatch && isOrderTypeMatch) {
            // Now check if the product being added is a Tester or Sample
            const isTester = product?.Category__c === "TESTER";
            const isSample = product?.Category__c?.toUpperCase() === "SAMPLES";

            // Check if testerInclude or sampleInclude is false and we're adding the wrong type
            const hasTesterInCart = order.items.some(item => item.Category__c === "TESTER");
            const hasSampleInCart = order.items.some(item => item.Category__c?.toUpperCase() === "SAMPLES");

            // **Fix: Only trigger alert when testerInclude or sampleInclude is false**
            if ((!account.discount?.testerInclude && isTester && !hasTesterInCart) || (!account.discount?.sampleInclude && isSample && !hasSampleInCart)) {
                let msg = `This brand requires you to add ${isTester ? "Tester" : "Sample"} products in a separate order. You cannot mix it with other products.`;

                let status = await confirmReplaceCart(isAccountMatch, isManufacturerMatch, isOrderTypeMatch, msg);
                if (status) {
                    // Replace the cart with the new tester or sample product
                    const res = await deleteCartForever();
                    if (res) {
                        let orderRaw = {
                            ...initialOrder,
                            ordertype: product.orderType,
                            Account: account,
                            Manufacturer: manufacturer,
                            items: [{ ...product, qty }],
                            orderQuantity: qty,
                            total: product.price * qty,
                            CreatedAt: new Date(),
                            CreatedBy: user?.Sales_Rep__c,
                        }
                        setOrder(orderRaw);
                        localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
                        await CartHandler({ cart: orderRaw, op: 'create' });
                        return {
                            status: 'success',
                            message: `The cart has been replaced with the new ${isTester ? "Tester" : "Sample"} product.`,
                        };
                    }
                } else {
                    // User cancels the cart replacement
                    return {
                        status: 'warning',
                        message: 'Cart replacement was canceled. The current cart remains unchanged, and the product was not added.',
                    };
                }
            }

            // **Fix: Ensure this block is only triggered when testerInclude or sampleInclude is false**
            if ((hasTesterInCart && !account.discount?.testerInclude && !isTester) ||
                (hasSampleInCart && !account.discount?.sampleInclude && !isSample)) {
                let msg = `You already have ${hasTesterInCart ? "Tester" : "Sample"} products in your cart. You cannot add other types of products.`;

                let status = await confirmReplaceCart(isAccountMatch, isManufacturerMatch, isOrderTypeMatch, msg);
                if (status) {
                    // Replace the cart with the new product
                    const res = await deleteCartForever();
                    if (res) {
                        let orderRaw = {
                            ...initialOrder,
                            ordertype: product.orderType,
                            Account: account,
                            Manufacturer: manufacturer,
                            items: [{ ...product, qty }],
                            orderQuantity: qty,
                            total: product.price * qty,
                            CreatedAt: new Date(),
                            CreatedBy: user?.Sales_Rep__c,
                        }
                        setOrder(orderRaw);
                        localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
                        await CartHandler({ cart: orderRaw, op: 'create' });

                        return {
                            status: 'success',
                            message: `The cart has been replaced with the new ${isTester ? "Tester" : "Sample"} product.`,
                        };
                    }
                } else {
                    // User cancels the cart replacement
                    return {
                        status: 'warning',
                        message: 'Cart replacement was canceled. The current cart remains unchanged, and the product was not added.',
                    };
                }
            }

            // If all checks pass, add the product to the existing cart
            let orderRaw = order
            const existingProduct = order.items.find(item => item.Id === product.Id);

            if (existingProduct) {
                // Update the existing product quantity
                const updatedItems = order.items.map(item =>
                    item.Id === product.Id ? { ...item, qty } : item
                );

                // Update the total quantity and price
                const updatedOrderQuantity = order.orderQuantity - existingProduct.qty + qty;
                const updatedTotal = order.total - (existingProduct.price * existingProduct.qty) + (product.price * qty);

                orderRaw = {
                    ...order,
                    items: updatedItems,
                    orderQuantity: updatedOrderQuantity,
                    total: updatedTotal,
                };
            } else {
                // Add new product to the cart
                orderRaw = {
                    ...order,
                    items: [...order.items, { ...product, qty }],
                    orderQuantity: order.orderQuantity + qty,
                    total: order.total + product.price * qty,
                };
            }

            setOrder(orderRaw);

            localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
            await CartHandler({ cart: orderRaw, op: 'update' });

            return { status: 'success', message: 'Product added to the existing cart' };
        } else {
            // If account, manufacturer, or orderType don't match, ask for confirmation to replace the cart
            let status = await confirmReplaceCart(isAccountMatch, isManufacturerMatch, isOrderTypeMatch);

            if (status) {
                // Replace the cart with the new product
                const res = await deleteCartForever();
                if (res) {
                    let orderRaw = {
                        ...initialOrder,
                        ordertype: product.orderType,
                        Account: account,
                        Manufacturer: manufacturer,
                        items: [{ ...product, qty }],
                        orderQuantity: qty,
                        total: product.price * qty,
                        CreatedAt: new Date(),
                        CreatedBy: user?.Sales_Rep__c,
                    }
                    setOrder(orderRaw);
                    await CartHandler({ cart: orderRaw, op: 'create' });
                    return {
                        status: 'success',
                        message: 'The cart has been replaced with a new one. The product has been added to the new cart.',
                    };
                }
            } else {
                return {
                    status: 'warning',
                    message: 'Cart replacement was canceled. The current cart remains unchanged, and the product was not added.',
                };
            }
        }
    };

    const updateProductPrice = async (productId, price = 0) => {
        // Convert price to a number and validate
        const numericPrice = parseFloat(price);

        if (isNaN(numericPrice) || numericPrice < 0) {
            Swal.fire({
                title: "Invalid Price!",
                text: "Please provide a valid non-negative number for the price.",
                icon: "warning",
                confirmButtonColor: "#000", // Black
            });
            return; // Stop further execution for invalid input
        }

        // Format the price to 2 decimal places
        const formattedPrice = parseFloat(numericPrice.toFixed(2));

        let orderRaw = order;
        const product = order.items.find((item) => item.Id === productId);
        if (!product) {
            Swal.fire({
                title: "Product Not Found!",
                text: `No product found with ID: ${productId}`,
                icon: "error",
                confirmButtonColor: "#000", // Black
            });
        }

        // Calculate the updated total
        const updatedItems = order.items.map((item) =>
            item.Id === productId
                ? { ...item, price: formattedPrice } // Update price for matching product
                : item
        );

        const updatedTotal =
            order.total -
            product.price * product.qty +
            formattedPrice * product.qty;

        // Return the updated order state
        orderRaw = {
            ...order,
            items: updatedItems,
            total: parseFloat(updatedTotal.toFixed(2)), // Ensure total is also formatted
        };
        setOrder(orderRaw);
        localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
        await CartHandler({ cart: orderRaw, op: 'update' });

        // Optional success message (uncomment if needed)
        // Swal.fire({
        //     title: "Price Updated!",
        //     text: `The price for the product with ID: ${productId} has been successfully updated.`,
        //     icon: "success",
        //     confirmButtonColor: "#000", // Black
        // });
    };



    // Update product quantity
    const updateProductQty = async (productId, qty) => {

        // Ensure qty is a valid positive number
        if (isNaN(qty) || qty <= 0) {

            if (qty == 0) {
                removeProduct(productId)
            }
            return; // Don't update if qty is invalid
        }
        let orderRaw = order;
        const product = order.items.find(item => item.Id === productId);
        if (!product) {
            console.warn(`Product with id ${productId} not found.`);
            return order; // No product found
        }

        const updatedItems = order.items.map(item =>
            item.Id === productId
                ? { ...item, qty } // Update the product qty
                : item
        );
        // Check if the cart is empty after removing the item
        if (updatedItems.length === 0) {
            deleteOrder();  // Call deleteOrder() if items array is empty
            return initialOrder;
        }
        // Directly update the order quantity and total to avoid unnecessary recalculation
        const updatedOrderQuantity = order.orderQuantity - product.qty + qty;
        const updatedTotal = order.total - (product.price * product.qty) + (product.price * qty);

        orderRaw = {
            ...order,
            items: updatedItems,
            orderQuantity: updatedOrderQuantity,
            total: updatedTotal,
        };
        setOrder(orderRaw);
        localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
        await CartHandler({ cart: orderRaw, op: 'update' });
    };

    // Remove a product from the cart by productId
    const removeProduct = async (productId) => {
        // const result = await Swal.fire({
        //     title: 'Are you sure?',
        //     text: 'Do you want to remove this product from the cart?',
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonColor: '#000', // Black
        //     cancelButtonColor: '#000', // Red for cancel
        //     confirmButtonText: 'Yes, remove it!',
        //     cancelButtonText: 'No, keep it',
        //     background: '#f9f9f9',
        //     color: '#333',
        // });

        if (isProductCarted(productId)) {
            let orderRaw = order;
            const updatedItems = order.items?.filter(item => item.Id !== productId);
            const removedItem = order.items?.find(item => item.Id === productId);

            // Check if the cart is empty after removing the item
            if (updatedItems.length === 0) {
                deleteOrder(); // Call deleteOrder() if items array is empty
                orderRaw = initialOrder;
            }

            // Otherwise, update the cart normally
            orderRaw = {
                ...order,
                items: updatedItems,
                orderQuantity: order.orderQuantity - (removedItem ? removedItem.qty : 0),
                total: order.total - (removedItem ? removedItem.price * removedItem.qty : 0),
            };
            setOrder(orderRaw);
            localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
            await CartHandler({ cart: orderRaw, op: 'update' });
            // Optional: Show success message
            Swal.fire({
                title: 'Removed!',
                text: 'The product has been removed from your cart.',
                icon: 'success',
                confirmButtonColor: '#000',
                background: '#f9f9f9',
                color: '#333',
            });
        }
    };




    // update order based on data 
    const keyBasedUpdateCart = async (data) => {
        let orderRaw = {
            ...order, ...data
        }
        setOrder(orderRaw);
        localStorage.setItem(orderCartKey, JSON.stringify(orderRaw));
        await CartHandler({ cart: orderRaw, op: 'create' });
    };

    const isProductCarted = (productId) => {
        // Check if the product exists in the cart
        const matchingProducts = order.items?.filter(item => item.Id === productId) || [];


        // If found, return the array of matching products; if not, return false
        return matchingProducts.length > 0 ? { ...order, items: matchingProducts[0] } : false;
    };

    const isCategoryCarted = (categoryKey) => {
        // Ensure order.items exists and is an array
        if (!Array.isArray(order.items)) {
            return false;
        }
        // Convert the string 'null' to actual null for comparison
        const normalizedCategoryKey = categoryKey === 'null' ? null : categoryKey;

        // Filter items that match the given category, handling potential null/undefined product or category
        const matchingItems = order.items.filter(item =>
            item && item.Category__c == normalizedCategoryKey
        );


        // If found, sum up the quantity of matching products; otherwise, return false
        if (matchingItems.length > 0) {
            const totalQuantity = matchingItems.reduce((sum, item) => sum + (item.qty || 0), 0);
            return totalQuantity;
        }

        return false;
    };


    const contentApiFunction = async (productList, account, manufacturer, ordertype = 'wholesale') => {
        const res = await deleteOrder();
        const user = await GetAuthData();
        if (res) {

            // Directly replace the current order with a new one based on the provided product list
            const newOrderTotal = productList.reduce((sum, product) => sum + product.price * (product.qty || 1), 0);
            const newOrderQuantity = productList.reduce((sum, product) => sum + (product.qty || 1), 0);

            // Set the new order with the account and manufacturer details
            let cartRaw = {
                ordertype, // Set the order type; adjust if needed
                Account: account,
                Manufacturer: manufacturer,
                items: productList.map(product => ({ ...product, qty: product.qty || 1 })), // Ensure each product has a qty
                orderQuantity: newOrderQuantity,
                total: newOrderTotal,
                CreatedAt: new Date(),
                CreatedBy: user?.Sales_Rep__c
            }
            setOrder(cartRaw);
            localStorage.setItem(orderCartKey, JSON.stringify(cartRaw));

            let orderStatus = await CartHandler({
                cart: cartRaw, op: 'create'
            })
            return orderStatus;
        }
    };


    // Delete the entire cart (reset to initial state)
    const deleteOrder = async () => {
        try {
            const res = await deleteCartForever();

            if (res) {
                setOrder(initialOrder); // Only reset if deletion was successful
                return true;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const deleteCartForever = async () => {
        try {
            const user = await GetAuthData();
            const getOrder = { CreatedBy: user?.Sales_Rep__c };
            localStorage.removeItem(orderCartKey);
            const res = await CartHandler({ cart: getOrder, op: 'delete' });
            return res
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // Get order total
    const getOrderTotal = () => {
        return order?.total || 0;
    };

    // Get order quantity
    const getOrderQuantity = () => {
        return order?.orderQuantity || 0;
    };

    const contextValue = {
        order,
        initializeOrder,
        addOrder,
        updateProductQty,
        removeProduct,
        deleteOrder,
        getOrderTotal,
        getOrderQuantity,
        isProductCarted,
        isCategoryCarted,
        contentApiFunction,
        keyBasedUpdateCart,
        fetchCart,
        deleteCartForever,
        updateProductPrice
    };

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

// Custom hook to use the CartContext
const useCart = () => {
    return React.useContext(CartContext);
};

export { CartProvider, useCart };