import React, { useState } from 'react';
import './ToggleSwitch.css'; // Import the CSS file

const ToggleSwitch = ({ onToggle,selected=false }) => {
  const [isToggled, setIsToggled] = useState(selected);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    onToggle(!isToggled);
  };

  return (
    <div 
      className={`toggle-switch ${isToggled ? 'switch-on' : 'switch-off'}`} 
      onClick={handleToggle}
    >
      <div className={`toggle ${isToggled ? 'toggle-on' : 'toggle-off'}`} />
    </div>
  );
};

export default ToggleSwitch;
