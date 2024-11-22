import { useState } from 'react';
import QuantitySelector from './QuantitySelector';
import Img1 from './images/makeup1.png'
import styles from './Style.module.css'


function EyesProduct() {
  
  const [quantity1, setQuantity1] = useState(1);
  const [quantity2, setQuantity2] = useState(1);
  const [quantity3, setQuantity3] = useState(1);
  const [quantity4, setQuantity4] = useState(1);

  const increment1 = () => {
    setQuantity1(quantity1 + 1);
  };

  const decrement1 = () => {
    if (quantity1 > 1) {
      setQuantity1(quantity1 - 1);
    }
  };

  const increment2 = () => {
    setQuantity2(quantity2 + 1);
  };

  const decrement2 = () => {
    if (quantity2 > 1) {
      setQuantity2(quantity2 - 1);
    }
  };

  const increment3 = () => {
    setQuantity3(quantity3 + 1);
  };

  const decrement3 = () => {
    if (quantity3 > 1) {
      setQuantity3(quantity3 - 1);
    }
  };

  return (
    <div>
<table className="table table-hover ">
  
  
  <tbody className={styles.projectsee}>
    <tr>
      <th scope="row"><img src={Img1}/></th>
      <td>V18300011</td>
      <td>3700076448894</td>
      <td>Becca</td>
      <td>$75</td>
      <td>$38.7</td>
      <td>3</td>
      <td>  <QuantitySelector quantity={quantity1} onIncrement={increment1} onDecrement={decrement1} />
      </td>
    </tr>
    <tr>
      <th scope="row"><img src={Img1}/></th>
      <td>V18300011</td>
      <td>3700076448894</td>
      <td>Becca</td>
      <td>$75</td>
      <td>$38.7</td>
      <td>3</td>
      <td> <QuantitySelector  quantity={quantity2} onIncrement={increment2} onDecrement={decrement2} /></td>
    </tr>
    <tr>
      <th scope="row"><img src={Img1}/></th>
      <td>V18300011</td>
      <td>3700076448894</td>
      <td>Becca</td>
      <td>$75</td>
      <td>$38.7</td>
      <td>3</td>
      <td><QuantitySelector quantity={quantity3} onIncrement={increment3} onDecrement={decrement3} /></td>
    </tr>

    <tr>
      <th scope="row"><img src={Img1}/></th>
      <td>V18300011</td>
      <td>3700076448894</td>
      <td>Becca</td>
      <td>$75</td>
      <td>$38.7</td>
      <td>3</td>
      <td><QuantitySelector quantity={quantity3} onIncrement={increment3} onDecrement={decrement3} /></td>
    </tr>

    <tr>
      <th scope="row"><img src={Img1}/></th>
      <td>V18300011</td>
      <td>3700076448894</td>
      <td>Becca</td>
      <td>$75</td>
      <td>$38.7</td>
      <td>3</td>
      <td><QuantitySelector quantity={quantity3} onIncrement={increment3} onDecrement={decrement3} /></td>
    </tr>

     <tr>
      <th scope="row"><img src={Img1}/></th>
      <td>V18300011</td>
      <td>3700076448894</td>
      <td>Becca</td>
      <td>$75</td>
      <td>$38.7</td>
      <td>3</td>
      <td><QuantitySelector quantity={quantity3} onIncrement={increment3} onDecrement={decrement3} /></td>
    </tr>

    
  </tbody>
</table>

    </div>
  )
}

export default EyesProduct