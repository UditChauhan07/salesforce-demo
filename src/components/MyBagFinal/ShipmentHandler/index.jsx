import { useEffect } from 'react';
import Styles from './Styles.module.css';
import { BiInfoCircle } from 'react-icons/bi';
import { useCart } from '../../../context/CartContext';

const ShipmentHandler = ({ data = [], total = 0,setIsSelect }) => {
    const { order, keyBasedUpdateCart } = useCart();

    // Function to determine the initial selected shipping method
    const getInitialSelectedShippingMethod = () => {
        if (!order?.Account) return null;

        const { shippingMethod } = order.Account;

        // Check if shippingMethod has an ID
        if (shippingMethod?.id) {
            return data.find(element => element.id === shippingMethod.id) || null;
        }

        // Check if shippingMethod has 'own'
        if (shippingMethod?.own) {
            return data.find(element => element.own === shippingMethod.own) || null;
        }

        // Match by method and number
        const matchedMethod = data.find(element => 
            element.number === shippingMethod?.number && 
            element.method === shippingMethod?.method
        );

        if (matchedMethod) {
            return matchedMethod;
        }
        if(data.length == 1){
            return data[0];
        }

        // Fallback to find a method with brandDefault true
        const defaultMethod = data.find(element => element.brandDefault === true);
        return defaultMethod || null;
    };

    // Set the initial selected shipping method
    const initialSelectedMethod = getInitialSelectedShippingMethod();

    useEffect(() => {
        // If there's an initial selected method, update the order
        if (initialSelectedMethod) {
            const tempOrder = { ...order.Account, shippingMethod: initialSelectedMethod };
            keyBasedUpdateCart({ Account: tempOrder });
            setIsSelect?.(true);
        }
    }, [initialSelectedMethod]);

    const onChangeHandler = (element) => {
        const tempOrder = { ...order.Account, shippingMethod: element };
        keyBasedUpdateCart({ Account: tempOrder });      
        setIsSelect?.(true);
    };

    if (data.length === 0) return null;

    return (
        <div className={`${Styles.dFlex} ${Styles.gap10} m-1`}>
            {data.map((element, index) => {
                const isSelected = (order?.Account?.shippingMethod?.id === element.id ||
                    (order?.Account?.shippingMethod?.own && order?.Account?.shippingMethod.own === element.own) ||
                    (element.number && order?.Account?.shippingMethod?.number === element.number && order?.Account?.shippingMethod?.method === element.method));

                return (
                    <div
                        key={element?.Id || index}
                        className={`${Styles.templateHolder} ${isSelected ? Styles.selected : ''}`}
                        onClick={() => { onChangeHandler(element) }}>
                        <input
                            type="radio"
                            name="brand"
                            checked={isSelected}
                            value={element?.Id || index}
                            className={Styles.hiddenRadio} />
                        <p className={Styles.labelHolder}>{element.name} <BiInfoCircle title={element?.desc?<span dangerouslySetInnerHTML={{__html:element?.desc}}/>:null} /></p>
                        <small className={Styles.descHolder}>
                            For this order, shipping cost will be <b>${Number(total * element?.cal).toFixed(2) || 0}</b>
                        </small>
                    </div>
                );
            })}
        </div>
    );
};

export default ShipmentHandler;