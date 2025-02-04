import React, { useEffect, useState } from 'react';
import './MultiSelectSearch.css';
import { UserIcon } from '../../lib/svg';
import ToggleSwitch from '../ToggleButton';
import Loading from '../Loading';
import Swal from 'sweetalert2';
let limit = 500;

const MultiSelectSearch = ({ options, selectedValues, onChange, loading = null, manufacturers = [], setWarning, brandSelected = [], manufacturersList = [], errorMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSelected, setShowSelected] = useState(false);
    const [brand, setBrand] = useState();
    const [showAll, stShowAll] = useState(false);
    const [isLoadings, setIsLoading] = useState(loading ? true : false);
    const [alert, setAlert] = useState(false);
    // Handle selecting or deselecting an item
    const handleSelect = (item) => {
        const isSelected = selectedValues.some(selected => selected.Id === item.Id);

        // Check if selected values exceed the limit of 250
        if (!isSelected && selectedValues.length >= limit) {
            // alert("You cannot select more than 250 items.");
            errorMessage?.("You cannot select more than " + limit + " items.")
            return; // Prevent further selection
        }

        if (item?.AccountId && manufacturers.length && !isSelected) {
            const isBrandMatched = item.BrandIds.some(brandId =>
                brandSelected.some(brand => brand.Id === brandId)
            );

            if (!isBrandMatched) {
                setWarning?.(item.Id);
            }
        }

        const newSelectedValues = isSelected
            ? selectedValues.filter(selected => selected.Id !== item.Id) // Deselect item
            : [...selectedValues, item]; // Select item

        onChange?.(newSelectedValues); // Notify parent component of selection change
    };


    // Filter options based on search term
    const [filteredOptions, setFilteredOptions] = useState();

    useEffect(() => {
        setIsLoading(true)
        // Call the filtering function when searchTerm or brand changes
        var results = options.filter(function (option) {
            var brandMatch = true;
            var nameMatch = false;
            var titleMatch = false;
            var accountNameMatch = false;

            // Check for brand match
            if (brand) {
                if (option && option.BrandIds) {
                    brandMatch = option.BrandIds.includes(brand);
                } else {
                    brandMatch = false;
                }
            }

            // Check for name match
            if (option && option.Name) {
                nameMatch = option.Name.toLowerCase().includes(searchTerm.toLowerCase());
            }

            // Check for title match
            if (option && option.Title) {
                titleMatch = option.Title.toLowerCase().includes(searchTerm.toLowerCase());
            }

            // Check for account name match
            if (option && option.Account && option.Account.Name) {
                accountNameMatch = option.Account.Name.toLowerCase().includes(searchTerm.toLowerCase());
            }

            // Return true if brandMatch is true and any of the other conditions match
            return brandMatch && (nameMatch || titleMatch || accountNameMatch);
        });

        if (!showAll) {
            // Extract the brand IDs from the brands list
            // let validBrandIds = new Set(manufacturers?.map(brand => brand.Id));
            let validBrandIds = new Set(brandSelected?.map(brand => brand.Id));


            let matchedResults = results.filter(result => {
                // Check if AccountId exists
                if (result.AccountId) {
                    // If AccountId exists, compare BrandIds with validBrandIds
                    return result.BrandIds?.some(brandId => validBrandIds.has(brandId));
                } else {
                    // If AccountId does not exist, return the result as is
                    return result;
                }
            });

            setFilteredOptions(matchedResults); // brand only subscribers
        } else {
            setFilteredOptions(results); // all subscribers
        }
        setTimeout(() => {
            setIsLoading(false)
        }, 1500);
    }, [searchTerm, brand, options, showAll]);
    useEffect(() => {
        if (!loading) {
            setIsLoading(false)
        }
    }, [loading])

    const AutoSelectChangeHandler = async () => {
        // Calculate how many more items can be selected without exceeding the limit
        const remainingSelections = limit - selectedValues.length;

        // Filter out options that are already selected
        let newOptions = filteredOptions.filter(
            option => !selectedValues.some(selected => selected.Id === option.Id)
        );

        // Check if adding new options would exceed the 250-item limit

        if (!brand) {
            // alert(`You can only select up to 250 items. You have ${remainingSelections} remaining.`);
            // errorMessage?.(`You can only select up to ${limit} items. You have ${remainingSelections} remaining.`)

            const brandSelectedIds = brandSelected.map(brand => brand.Id);

            newOptions = newOptions.filter(result => {
                // Check if AccountId exists
                if (result.AccountId) {
                    // If AccountId exists, compare BrandIds with validBrandIds
                    return result.BrandIds?.some(brandId => brandSelectedIds.includes(brandId));
                }else{
                    return result;
                }
            })

            if (newOptions.length) {
                let message = "<p class='text-[16px]'>This email will go to:</p><p class='text-[16px]'>Subscribers of Brands:</p><ol>";
                brandSelected.map(brand => {
                    // Count the number of contacts with the current brandId
                    const count = newOptions.filter(c => c.BrandIds.includes(brand.Id)).length;

                    if (count > 0) {
                        message += `<li class='text-[14px]'>${brand.Name}:${count} Subscribers</li>`;
                    }
                });
                message += '</ol>';

                let check = await Swal.fire({
                    title: 'Alert',
                    html: message,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#000',  // Black
                    cancelButtonColor: '#000',   // White
                    confirmButtonText: 'ACCEPT',
                    cancelButtonText: 'CANCEL',
                    background: '#f9f9f9',
                    color: '#333',
                }).then((result) => {
                    return result.isConfirmed;  // Returns true if user confirms, false otherwise
                });


                if (!check) {
                    return; // Prevent adding more than the limit
                }
            } else {
                errorMessage?.(`You already selected all contact of selected Brand.`)
                return;
            }
        }

        // If there are any new options to add, call onChange with the updated list
        if (newOptions.length > 0) {
            onChange?.([...selectedValues, ...newOptions]);
        }
    };

    const resetSelectChangeHandler = () => {
        onChange?.([]);
    }
    const brandSelectionHandler = (event) => {
        const { target } = event;
        if (target.value != 0) {
            setBrand(target.value);
        } else {
            setBrand();
        }
    }

    const brandNames = (brandSelected?.map((brand) => brand.Name) || [])
        ?.reduce((acc, curr, index, arr) => {
            if (index === 0) {
                return curr; // For the first brand, just return the name without a comma
            } else if (index === arr.length - 1) {
                return `${acc} and ${curr}`; // For the last brand, add "and" before the name
            }
            return `${acc}, ${curr}`; // For the middle brands, add commas
        }, '');

    const BrandNameGenerator = (Brandids) => {
        // Filter manufacturers based on Brandids and extract names
        const selectedBrands = manufacturersList
            ?.filter(brand => Brandids.includes(brand.Id))
            ?.map(brand => brand.Name) || [];

        // Ensure brandSelected is correctly referenced or set to selectedBrands
        const brandSelected = selectedBrands || [];

        // Handle cases based on the number of brands selected
        if (brandSelected.length === 0) return ''; // No brands selected
        if (brandSelected.length === 1) return brandSelected[0]; // Only one brand
        if (brandSelected.length === 2) return `${brandSelected[0]} and ${brandSelected[1]}`; // Two brands

        // More than two brands, format with commas and 'and' before the last one
        return brandSelected.slice(0, -1).join(', ') + `, and ${brandSelected[brandSelected.length - 1]}`;
    };


    return (
        <div className="multi-select-container">
            <header>
                {/* <h1>User Search</h1> */}
                <ul className="select-user-list justify-content-between align-items-center">
                    <div className='d-flex flex-column align-items-center justify-content-start'>

                        <b className='d-flex justify-content-start align-items-center w-[100%]'><input type='checkbox' value={1} onChange={() => setShowSelected(!showSelected)} style={{ width: '15px', height: '15px', margin: 0 }} />&nbsp;Selected Users:&nbsp;<span style={{ fontWeight: '400', display: 'flex' }}>                 {selectedValues?.length ? selectedValues.length < 3 ? selectedValues.map((user, index) => (
                            <li key={user.Id}>{user.Name}{index != (selectedValues.length - 1) ? `,` : ""}&nbsp;</li>
                        )) : `${selectedValues.filter(e => !e.AccountId).length ? `${selectedValues.filter(e => !e.AccountId).length} Users selected` : ''} ${selectedValues.filter(e => !e.AccountId).length && selectedValues.filter(e => e.AccountId).length ? ' and ' : ''} ${selectedValues.filter(e => e.AccountId).length ? `${selectedValues.filter(e => e.AccountId).length} contact selected` : ''}` : "No Users selected"}</span></b>
                    </div>
                    <div className='d-flex flex-column align-items-center justify-content-end'>
                        <span className='text-end w-[100%]'><span onClick={AutoSelectChangeHandler} className='cursor-pointer text-[#509fde] hover:underline'>Select All</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span className='cursor-pointer text-[#509fde] hover:underline' onClick={resetSelectChangeHandler}>Reset</span></span>
                    </div>
                </ul>
                <div className='d-flex justify-content-between align-items-center'>

                    <input
                        type="text"
                        placeholder="Search for users..."
                        value={searchTerm}
                        style={{ width: '55%' }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {manufacturers?.length ? <select className={"brandSearch"} style={{ width: '25%', maxWidth: '200px', height: '45px', marginTop: '8px' }} onChange={brandSelectionHandler}>
                        <option value={0} selected>All Brand</option>
                        {showAll ? manufacturers.map((brand) => (
                            <option style={{ appearance: 'none' }} value={brand.Id}>{brand.Name}</option>
                        )):brandSelected.map((brand) => (
                            <option style={{ appearance: 'none' }} value={brand.Id}>{brand.Name}</option>
                        ))}
                    </select> : null}
                    <div className='w-[20%] d-flex justify-content-center align-items-center text-[13px]'><span>Subscribers for<br /> <span title={brandNames} className='cursor-pointer text-[#509fde]'>Selected brand</span></span>&nbsp;&nbsp;<ToggleSwitch selected={showAll} onToggle={(value) => { stShowAll(value) }} />&nbsp;&nbsp;All</div>

                </div>
            </header>
            <div className="user-list">
                {!isLoadings ?
                    filteredOptions?.length ?
                        filteredOptions.map((option) => (
                            <div
                                key={option.Id}
                                className={`user-item ${selectedValues.some(selected => selected.Id === option.Id) ? 'selected' : showSelected ? 'd-none' : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                <div className="user-avatar"><UserIcon width={25} height={25} /></div>
                                <div className="user-info">
                                    <span className="user-name d-flex align-items-center">{(!brandSelected.some(brand => option.BrandIds?.includes(brand.Id)) && selectedValues.some(selected => selected.Id === option.Id) && option.AccountId) ? <div className='redBlock mr-1' title="the subscriber doesn't have the selected brand"></div> : null}{option.Name}</span>
                                    <span className="user-email maxSizeDiv">{option.Email}</span>
                                    {option?.Title ? <span className="user-etc maxSizeDiv"><b className="text-['Arial']">Title:&nbsp;</b>{option?.Title}</span> : null}
                                    {option?.Phone ? <span className="user-etc"><b>Phone:&nbsp;</b>{option?.Phone}</span> : null}
                                    {option?.Account?.Name ? <span className="user-etc maxSizeDiv"><b>Store:&nbsp;</b>{option?.Account?.Name}</span> : null}
                                </div>
                                {(option.BrandIds?.length) ?
                                    <div className='user-brands'>
                                        <b>Brands Subscribed</b>
                                        <span className='user-etc user-etc07 text-end text-[10px] max-w-[150px]'>{BrandNameGenerator(option.BrandIds)}</span>
                                    </div> : null}
                            </div>
                        )) : "No record found." : <div className='m-auto'><Loading height={'100px'} /></div>}
            </div>
        </div>
    );
};

export default MultiSelectSearch;
