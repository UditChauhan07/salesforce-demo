import React, { useState } from 'react';

const Dropdown = () => {
  const [selectedOption, setSelectedOption] = useState('Option 1');

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <select value={selectedOption} onChange={handleChange}>
      <option type="radio" value="Option 1">Option 1</option>
      <option value="Option 2">Option 2</option>
      <option value="Radio 1">Radio 1</option>
      <option value="Radio 2">Radio 2</option>
      <option value="Option 3">Option 3</option>
    </select>
  );
};

export default Dropdown;
