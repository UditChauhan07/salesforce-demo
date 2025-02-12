import React, { forwardRef, useEffect, useState } from 'react';
import './MultiStepForm.css'; // Import the CSS file
import MultiSelectSearch from '../../SearchBox';
import { createNewsletter, fetchNewletterPreview, fetchNewsletterData, fetchNextMonthNewsletterBrand, GetAuthData, months, originAPi, ShareDrive } from '../../../lib/store';
import Styles from './index.module.css';
import Loading from '../../Loading';
import ModalPage from '../../Modal UI';
import { BiExit, BiSave } from 'react-icons/bi';
import ToggleSwitch from '../../ToggleButton';
import { FaEye } from 'react-icons/fa';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalenderIcon } from '../../../lib/svg';
import { useManufacturer } from '../../../api/useManufacturer';

const contactLocalKey = "lCpFhWZtGKKejSX"

const MultiStepForm = () => {
    const { data: manufacturersList, isLoading, error } = useManufacturer();
    const [currentStep, setCurrentStep] = useState(1);
    const [manufacturers, setManufacturers] = useState({ isLoaded: false, data: [] })
    const [Subscribers, setSubscribers] = useState({ isLoaded: false, users: [], contacts: [] })
    const [allSubscribers, setAllSubscribers] = useState([]);
    const [callBackError, setCallbackError] = useState(false);
    const [callBackErrorMsg, setCallbackErrorMsg] = useState();
    const [isSubmit, setIsSubmit] = useState(false)
    const [isSchedule, setIsSchedule] = useState(false);
    const [isPreview, setIsPreview] = useState();
    const [isPreviewHtml, setIsPreviewHtml] = useState({ isLoaded: false, preview: null });
    const [loading, setLoading] = useState(true);
    const [errorContact, setErrorContact] = useState([])
    const [showErrorList, setShowErrorList] = useState(false)
    const [warning, setWarning] = useState(false)
    const [minDate, setMinDate] = useState(new Date());
    const [maxDate, setMaxDate] = useState(new Date());

    const [formData, setFormData] = useState({
        subscriber: [],
        template: null,
        brand: [],
        date: null,
        subject: null,
        newsletter: null,
        forMonth: 1
    });
    const [showBrandList, setshowBrandList] = useState([]);

    // useEffect(() => {
    //     let brandIdsArray = formData.subscriber.map(item => item?.BrandIds);
    //     const allBrandIds = brandIdsArray.flat();
    //     const uniqueBrandIds = [...new Set(allBrandIds)];
    //     const filteredBrands = manufacturers?.data?.filter(brand => uniqueBrandIds.includes(brand.Id));
    //     formData.subscriber?.some((user) => {
    //         if (!user.AccountId) {
    //             setIsUserSelected(true);
    //             return true; // This stops the iteration once AccountId is found
    //         }
    //         setIsUserSelected(false)
    //         return false; // Continue the iteration if AccountId is not found
    //     });
    //     if (isUserSelected) {

    //         setshowBrandList(manufacturers?.data)
    //     } else {

    //         setshowBrandList(filteredBrands)
    //     }
    // }, [formData, isUserSelected])

    const GetBrandDataHandler = ()=>{
        GetAuthData().then((user) => {
            fetchNextMonthNewsletterBrand({ key: user.x_access_token, date: formData.date ? getDate(formData.date) : null, forMonth: formData.forMonth }).then((brandRes) => {
                setshowBrandList(brandRes?.brandList)
                setManufacturers({ isLoaded: true, data: brandRes?.brandList || [], nonReady: brandRes?.brandnonList || [] })
            }).catch((brandErr) => {
                console.log({ brandErr });
            })

        }).catch((userErr) => {
            console.log(userErr)
        })
    }

    const handleAccordionClick = (step) => {

        if (step === 3 && (!formData.brand.length)) {
            setCallbackError(true)
            setCallbackErrorMsg('Please select a brand')
            handleAccordionClick(2)
            return;
        }
        if (step === 4 && (!formData.template)) {
            setCallbackError(true)
            setCallbackErrorMsg('Please select a template')
            handleAccordionClick(2)
            return;
        }
        if (step === 2 && (!formData.newsletter || !formData.subject)) {
            if (!formData.newsletter) {
                setCallbackError(true)
                setCallbackErrorMsg('Please enter newsletter name');
                handleAccordionClick(1)
            }
            if (!formData.subject) {
                setCallbackError(true)
                setCallbackErrorMsg('Please enter subject');
                handleAccordionClick(1)
            }
            return;
        }
        if (step == 5) {
            setIsPreview(isPreviewHtml.preview)
        }
        if(step == 2){
            GetBrandDataHandler();
        }
        setCurrentStep(step);
    };
    useEffect(() => {
        setErrorContact([])
        const contactList = Subscribers.contacts.filter(item1 =>
            formData.subscriber.some(item2 => item2.Id === item1.Id)
        )
        const nonMatchingBrands = contactList.filter(item =>
            !item.BrandIds.some(brandId => formData.brand.includes(brandId))
        );
        setErrorContact(nonMatchingBrands)
    }, [formData.subscriber, formData.brand, Subscribers.contacts])

    const handleChange = (e) => {
        const { value, name } = e.target;

        if (name === "brand") {
            setFormData((prevFormData) => {
                const brandAlreadySelected = prevFormData.brand.includes(value);

                // If brand is already selected, remove it; otherwise, add it
                const updatedBrandSelection = brandAlreadySelected
                    ? prevFormData.brand.filter((brandId) => brandId !== value)
                    : [...prevFormData.brand, value];

                return { ...prevFormData, brand: updatedBrandSelection };
            });
        } else {
            if (name == "forMonth") {
                setManufacturers({ isLoaded: false, data: [] })
                setshowBrandList([])
                setFormData({ ...formData, [name]: value, brand: [] });
            }else{
                setFormData({ ...formData, [name]: value });
            }
        }
    };

    const handleDateChange = (value) => (
        setFormData({ ...formData, date: value })
    )
    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentStep === 5 && !formData.subscriber.length) {
            // alert('Please select a subscriber first.');
            setCallbackError(true)
            setCallbackErrorMsg('Please select a subscriber first.')
            handleAccordionClick(5)
            return;
        }
        // if (errorContact.length) {
        //     setShowErrorList(true);
        //     return;
        // }
        generateOrderNow();
    };

    useEffect(() => {
        setIsPreview()
        if (currentStep == 4) {
            setIsPreviewHtml({ isLoaded: false, preview: null })
            generateNewsletterPreview();
        }
    }, [currentStep])


    const generateNewsletterPreview = () => {
        let body = {
            newsletter: formData.newsletter,
            subject: formData.subject,
            template: formData.template,
            brandIds: JSON.stringify(formData.brand),
            date: formData.date ? getDate(formData.date) : null,
            forMonth: formData.forMonth
        }
        fetchNewletterPreview(body).then((result) => {

            if (result.status) {
                if (result.data) {
                    setIsPreviewHtml({ isLoaded: true, preview: result.data })
                }
            }
        }).catch((err) => {
            console.log({ err });

        })
    }
    const errorMessage = (message) => {
        if (message) {
            setCallbackError(true)
            setCallbackErrorMsg(message)
        }
    }
    const generateOrderNow = () => {
        setShowErrorList(false);
        if (currentStep === 5 && !formData.subscriber.length) {
            // alert('Please select a subscriber first.');
            setCallbackError(true)
            setCallbackErrorMsg('Please select a subscriber first.')
            handleAccordionClick(5)
            return;
        }
        const contactList = Subscribers.contacts.filter(item1 =>
            formData.subscriber.some(item2 => item2.Id === item1.Id)
        )
        setIsSubmit(true)
        const userIds = Subscribers.users.filter(item1 =>
            formData.subscriber.some(item2 => item2.Id === item1.Id)
        ).map(item => item.Id);
        const contactIds = contactList.map(item => item.Id);

        let body = {
            newsletter: formData.newsletter,
            subject: formData.subject,
            template: formData.template,
            brandIds: JSON.stringify(formData.brand),
            date: formData.date ? getDate(formData.date) : null,
            contactIds: JSON.stringify(contactIds),
            userIds: JSON.stringify(userIds),
            forMonth: formData.forMonth
        }

        createNewsletter(body).then((result) => {
            if (result.status) {
                setTimeout(() => {
                    window.location.href = "/newsletter"
                    setTimeout(() => {
                        setIsSubmit(false);
                    }, 1000);
                    setCurrentStep(1);
                    setFormData({
                        subscriber: [],
                        template: '',
                        brand: [],
                        date: '',
                        subject: '',
                        newsletter: '',
                        forMonth: 1
                    });
                }, 2000);
            } else {
                setIsSubmit(false)
                setCallbackError(true)
                setCallbackErrorMsg(result.message)
            }
        }).catch((err) => {
            console.log({ err });
        })
    }

    useEffect(() => { }, [callBackError])

    useEffect(() => {
        setLoading(true);
        const loadData = async () => {
            try {
                let user = await GetAuthData();
                const token = user?.x_access_token;
                if (!token) {
                    throw new Error('Access token is not available');
                }
                
                const response = await fetchNewsletterData({ token });
                
                ShareDrive(response, false, contactLocalKey)
                const contactList = response.contactList;
                if (!Subscribers.isLoaded) {
                    // const contactList = response.contactList.filter(item => item.BrandIds && item.BrandIds.length);
                    setSubscribers({ isLoaded: true, users: response.userList, contacts: contactList })
                    setAllSubscribers([...response.userList, ...contactList])
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        let localCall = ShareDrive(null, null, contactLocalKey)
        if (localCall) {
            const contactList = localCall.contactList;
            // const contactList = localCall.contactList.filter(item => item.BrandIds && item.BrandIds.length);
            setSubscribers({ isLoaded: true, users: localCall.userList, contacts: contactList })
            setAllSubscribers([...localCall.userList, ...contactList])
            setTimeout(() => {

                setLoading(false);
            }, 1000);
        }
        loadData();

    }, [currentStep]);
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Set to tomorrow

        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month

        setMinDate(tomorrow);
        setMaxDate(endOfMonth);
    }, [])


    useEffect(() => {
        console.log({ manufacturers });


    }, [formData.subscriber, manufacturers])



    const handleSelectionChange = (newSelectedValues) => {
        setFormData((prev) => {
            return { ...prev, subscriber: newSelectedValues };
        }
        )
    };
    const removeWaringSubscriber = () => {
        setFormData((prev) => {
            return { ...prev, subscriber: formData.subscriber.filter(selected => selected.Id !== warning) };
        });
        setWarning(false);
    }
    const ImageWithFallback = ({ src, alt, fallbackSrc, ...props }) => {
        if (!fallbackSrc) fallbackSrc = originAPi + "/dummy.png"
        const handleError = (e) => {
            e.target.onerror = null; // Prevent infinite loop if fallback image also fails
            e.target.src = fallbackSrc;
        };

        return <img src={src} alt={alt} onError={handleError} {...props} />;
    };
    function getDate(date) {
        var today = new Date(date);

        return today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    }

    const DatePickerLabel = forwardRef(({ value, onClick }, ref) => (
        <button type='button' className='w-[100%] d-flex justify-content-between align-items-center m-0' style={{ background: '#fff', color: '#000', height: '50px', padding: '15px' }} onClick={onClick} ref={ref}>
            <span>{value}</span>
            <CalenderIcon fill='#000' />
        </button>
    ));
    

    return (
        <div className="form-container create-newsletter">
            {isSubmit ? <Loading height={'500px'} /> :
                <>
                    {warning ? <ModalPage
                        open={warning ?? false}
                        content={<div className="d-flex flex-column gap-3">
                            <h2>
                                Alert!!!
                            </h2>
                            <p className="modalContent">
                                {Subscribers.contacts.filter(selected => selected.Id === warning).length ? Subscribers.contacts.filter(selected => selected.Id === warning)[0].Name : "User"}
                                &nbsp;doesn't subscribe for following brands:<br />
                                Are you sure, you want to send the newsletter.<br />
                                <ol style={{ listStyle: 'disc', textAlign: 'start', marginTop: '1rem' }}>
                                    {/* {index < (manufacturers.data.filter(brand => formData.brand.includes(brand.Id)).length - 2) ? ', ' : index != (manufacturers.data.filter(brand => formData.brand.includes(brand.Id)).length - 1) ? ' and ' : null} */}
                                    {manufacturers.data.filter(brand => formData.brand.includes(brand.Id)).map((brand, index) => (<li>{brand.Name}</li>))}
                                </ol>
                            </p>
                            <div className="d-flex justify-content-around">
                                <button className={`${Styles.btn} d-flex align-items-center`} onClick={removeWaringSubscriber}>
                                    <BiExit /> &nbsp;No
                                </button>
                                <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => { setWarning(false) }}>
                                    <BiSave /> &nbsp;Yes
                                </button>
                            </div>
                        </div>}
                        onClose={() => { setWarning(false) }}
                    /> : null}
                    {callBackError ? <ModalPage
                        open={callBackError ?? false}
                        content={<div className="d-flex flex-column gap-3">
                            <h2>
                                Alert!!!
                            </h2>
                            <p className={Styles.modalContent}>
                                {callBackErrorMsg}
                            </p>
                            <div className="d-flex justify-content-around">
                                <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => { setCallbackError(false); setCallbackErrorMsg(); }}>
                                    <BiExit /> &nbsp;Ok
                                </button>
                            </div>
                        </div>}
                        onClose={() => { setCallbackError(false); setCallbackErrorMsg(); }}
                    /> : null}
                    {currentStep == 4 ? <ModalPage
                        open={(currentStep == 4) ?? false}
                        styles={{ position: 'fixed', bottom: 0 }}
                        classes={` ${Styles.maxHeightNinty}`}
                        content={<div className="d-flex flex-column gap-3">
                            <h2 className='text-start' style={{ position: 'sticky', top: '-20px', background: '#fff', zIndex: '111', paddingTop: '20px' }}>
                                Newsletter Preview
                                <hr />
                            </h2>
                            {isPreviewHtml.isLoaded ?
                                <div className={`${Styles.modalContent} max-w-[70vw]`} dangerouslySetInnerHTML={{ __html: isPreviewHtml.preview }} />
                                : (<Loading height={'55vh'} />)}
                            <div className="d-flex justify-content-around" style={{ position: 'sticky', bottom: '-20px', zIndex: 11, background: '#fff', padding: '1rem 0' }}>
                                <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => { handleAccordionClick(3); }}>
                                    Go Back
                                </button>
                                <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => { handleAccordionClick(5); }}>
                                    Select Subscribers
                                </button>
                            </div>
                        </div>}
                        onClose={() => { handleAccordionClick(3); }}
                    /> : null}
                    {showErrorList ? <ModalPage
                        open={showErrorList ?? false}
                        styles={{ width: '100%' }}
                        content={<div className="d-flex flex-column gap-3">
                            <h2>
                                Warning!!!
                            </h2>
                            <hr style={{ marginTop: 0 }} />
                            <p className={`${Styles.modalContent} text-start`}>
                                The following subscribers will not get newletter,
                                as there are no products available for marketing calender.
                                <table className="table table-hover text-start mt-2">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '300px' }}>Subscriber name</th>
                                            <th style={{ width: '300px' }}>Email</th>
                                            <th>Brands</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                    {errorContact.length ?
                                        errorContact.map((element) => (
                                            <tr>
                                                <td><div>{element.Name}{element?.Account?.Name ? <><br /><b className='text-[9px]'>{element?.Account?.Name}</b></> : null}</div></td>
                                                <td>{element.Email}</td>
                                                <td><div>
                                                    {showBrandList?.filter(brand => element?.BrandIds?.includes(brand.Id))?.length ?
                                                        showBrandList?.filter(brand => element?.BrandIds?.includes(brand.Id)).map((brand, index) => (<small>{brand.Name}{index != (showBrandList?.filter(brand => element?.BrandIds?.includes(brand.Id)).length - 1) ? ", " : ""}</small>)) : "brand don't match with current celender"}
                                                </div>
                                                </td>
                                            </tr>
                                        ))
                                        : null}
                                </table>
                            </p>
                            <hr style={{ margin: 0 }} />
                            <div className="d-flex justify-content-around">
                                <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => { setShowErrorList(false) }}>
                                    <BiExit /> &nbsp;Go Back
                                </button>
                                <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => { generateOrderNow() }}>
                                    <BiSave /> &nbsp;Proceed
                                </button>
                            </div>
                        </div>}
                        onClose={() => { setShowErrorList(false); }}
                    /> : null}
                    <form onSubmit={handleSubmit} className="multi-step-form">
                        {/* Progress Bar */}
                        {/* <div className="progress-bar">
                    <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                        1
                    </div>
                    <div className={`progress-line ${currentStep > 1 ? 'active' : ''}`}></div>
                    <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                        2
                    </div>
                    <div className={`progress-line ${currentStep > 2 ? 'active' : ''}`}></div>
                    <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                        3
                    </div>
                </div> */}

                        <div className="accordion-item">
                            <div
                                className={`accordion-header ${currentStep === 1 ? 'active' : ''}`}
                            // onClick={() => handleAccordionClick(1)}
                            >
                                <h3>Newsletter Details</h3>
                                <span>{currentStep === 1 ? '-' : '+'}</span>
                            </div>
                            {currentStep === 1 && (
                                <div className="accordion-body">
                                    <div className='mt-4 pt-3'>
                                        <div className='d-flex justify-content-between'>

                                            <label style={{ width: '45%' }} className="text-[15px] text-[#000] font-['Montserrat-400'] text-start">
                                                <b>Newsletter Title:</b>
                                                <input
                                                    type="text"
                                                    name="newsletter"
                                                    value={formData.newsletter}
                                                    onChange={handleChange}
                                                    placeholder="Enter newsletter"
                                                    required
                                                    maxLength={100}
                                                />
                                            </label>
                                            <label style={{ width: '21%' }} className="text-[15px] text-[#000] font-['Montserrat-400'] text-start">
                                                <b>Include Months:</b>
                                                <select name="forMonth" onChange={handleChange} value={formData.forMonth}>
                                                    <option value={1} selected>upto 1 month</option>
                                                    <option value={2}>upto 2 month</option>
                                                    <option value={3}>upto 3 month</option>
                                                </select>
                                            </label>
                                            <label style={{ width: '30%' }} className="text-[16px] text-[#000] font-['Montserrat-400'] text-start">
                                                <b>Send Type:</b>
                                                <div className="d-flex mt-3 h-full text-[16px] text-[#000]">
                                                    Send Now&nbsp;&nbsp;<ToggleSwitch selected={isSchedule} onToggle={(value) => { setIsSchedule(value); handleChange({ target: { value: null, name: "date" } }) }} />&nbsp;&nbsp;Schedule later
                                                </div>
                                            </label>
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <label style={{ width: '68%' }} className="text-[16px] font-['Montserrat-400'] text-start">
                                                <b>Subject:</b>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="Enter subject"
                                                    required
                                                    maxLength={100}
                                                />
                                            </label>
                                            <label style={{ width: '30%' }} className="text-[16px] font-['Montserrat-400'] text-start">
                                                <b>Date:</b>
                                                <div id='newsletterDateSelector'>
                                                    <DatePicker
                                                        selected={formData.date}
                                                        onChange={handleDateChange}
                                                        dateFormat="MMM/dd/yyyy"
                                                        popperPlacement="auto"
                                                        minDate={minDate}
                                                        maxDate={maxDate}
                                                        popperModifiers={{
                                                            preventOverflow: {
                                                                enabled: true,
                                                            },
                                                        }}
                                                        disabled={!isSchedule}
                                                        customInput={<DatePickerLabel />}
                                                    />
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="accordion-item text-[16px] font-['Montserrat-400']">
                            <div
                                className={`accordion-header ${currentStep === 2 ? 'active' : ''}`}
                            // onClick={() => handleAccordionClick(2)}
                            >
                                <h3>Brand Selection</h3>
                                <span>{currentStep === 2 ? '-' : '+'}</span>
                            </div>
                            {currentStep === 2 && (
                                <div className="accordion-body">
                                    {manufacturers.isLoaded ?
                                        <>
                                            <div className="text-start">
                                                <div className='d-flex justify-content-between'>

                                                    <b className='d-flex gap-2'>Newsletter ready brands: <p style={{ fontWeight: 'normal' }}>These Brands are ready to be included in newsletter for&nbsp;{months[new Date().getMonth()]}{formData.forMonth == 1 ? ' and ' : (formData.forMonth == 2||formData.forMonth == 3) ? ', ' : null}{formData.forMonth >= 1 ? months[new Date().getMonth() + 1] : null}{formData.forMonth == 2 ? ' and ' :formData.forMonth == 3? ', ':null}{formData.forMonth >= 2 ? months[new Date().getMonth() + 2] : null}{formData.forMonth == 3? ' and ':null}{formData.forMonth >= 3 ? months[new Date().getMonth() + 3] : null}</p></b>
                                                    <div className='d-flex gap-2'>
                                                        <p className='cursor-pointer text-[#509fde] hover:underline' onClick={() => { setFormData({ ...formData, brand: showBrandList.map(element => (element.Id)) }); }}>&nbsp;Select all</p>|
                                                        <p className='cursor-pointer text-[#509fde] hover:underline' onClick={() => { setFormData({ ...formData, brand: [] }); }}>Reset</p>
                                                    </div>
                                                </div>
                                                <div className={`${Styles.dFlex} ${Styles.gap10} mt-4`}>
                                                    {showBrandList?.length ? (showBrandList.map((brand) => (
                                                        <div
                                                            key={brand.Id}
                                                            className={`${Styles.templateHolder} ${formData.brand.includes(brand.Id) ? Styles.selected : ''}`}
                                                            onClick={() => handleChange({ target: { value: brand.Id, name: "brand" } })}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="brand"
                                                                checked={formData.brand.includes(brand.Id)}
                                                                value={brand.Id}
                                                                required
                                                                className={Styles.hiddenRadio}
                                                            />
                                                            <ImageWithFallback
                                                                src={`${originAPi}/brandImage/${brand.Id}.png`}
                                                                title={`Click to select ${brand.Name}`}
                                                                style={{ maxHeight: '100px', mixBlendMode: 'luminosity' }}
                                                                alt={`Brand ${brand.Id}`}
                                                            />
                                                            <p className={Styles.labelHolder}>{brand.Name}</p>
                                                            {/* <div
                                                            className={Styles.previewIcon}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent triggering the brand selection
                                                                window.open(`${originAPi}brandImage/${brand.Id}.png`, '_blank');
                                                            }}
                                                        >
                                                            <FaEye />
                                                        </div> */}
                                                        </div>
                                                    ))
                                                    ) : "No brand available. Selected subscribers's brands does not have any product in marketing calendar"}
                                                </div>
                                            </div>
                                            <div className="text-start mt-2 mb-2">
                                                <b className='d-flex gap-2'>Other Brand: <p style={{ fontWeight: 'normal' }}>These brands not ready for newsletter as per now.</p></b>
                                                <div className={`${Styles.dFlex} ${Styles.gap10} mt-4`}>
                                                    {
                                                        manufacturers?.nonReady?.length ? (manufacturers?.nonReady.map((brand) => (
                                                            <div
                                                                key={brand.Id}
                                                                className={`${Styles.templateHolder} ${formData.brand.includes(brand.Id) ? Styles.selected : ''}`}
                                                                onClick={() => { setCallbackError(true); setCallbackErrorMsg("You can't send newsletter for this brand") }}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="brand"
                                                                    checked={formData.brand.includes(brand.Id)}
                                                                    value={brand.Id}
                                                                    required
                                                                    className={Styles.hiddenRadio}
                                                                />
                                                                <ImageWithFallback
                                                                    src={`${originAPi}/brandImage/${brand.Id}.png`}
                                                                    title={`Click to select ${brand.Name}`}
                                                                    style={{ maxHeight: '100px', mixBlendMode: 'luminosity' }}
                                                                    alt={`Brand ${brand.Id}`}
                                                                />
                                                                <p className={Styles.labelHolder}>{brand.Name}</p>
                                                                {/* <div
                                                            className={Styles.previewIcon}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent triggering the brand selection
                                                                window.open(`${originAPi}brandImage/${brand.Id}.png`, '_blank');
                                                            }}
                                                        >
                                                            <FaEye />
                                                        </div> */}
                                                            </div>
                                                        ))
                                                        ) : "No brand available. Selected subscribers's brands does not have any product in marketing calendar"}
                                                </div>
                                            </div></>
                                        : (
                                            <Loading height={'40vh'} />
                                        )}
                                </div>
                            )}
                        </div>


                        {/* Step 2: Template and Brand Selection */}
                        <div className="accordion-item text-[16px] font-[Montserrat-400]">
                            <div
                                className={`accordion-header ${currentStep === 3 ? 'active' : ''}`}
                            // onClick={() => handleAccordionClick(3)}
                            >
                                <h3>Template Selection</h3>
                                <span>{currentStep === 3 ? '-' : '+'}</span>
                            </div>
                            {currentStep === 3 && (
                                <div className="accordion-body">
                                    <div className="text-start">

                                        <b>Select Template:</b>
                                        <div className={`${Styles.dFlex} mt-4`}>
                                            <div
                                                className={`${Styles.templateHolder} ${formData.template == 1 ? Styles.selected : ''}`}
                                                onClick={() => handleChange({ target: { value: 1, name: "template" } })}
                                            >
                                                <input
                                                    type="radio"
                                                    name="template"
                                                    checked={formData.template == 1}
                                                    value={1}
                                                    required
                                                    className={Styles.hiddenRadio}
                                                />
                                                <img src="/assets/templates/1.png" alt="Template 2" />
                                                <div
                                                    className={Styles.previewIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering the brand selection
                                                        window.open(`/assets/templates/1.png`, '_blank');
                                                    }}
                                                >
                                                    <FaEye />
                                                </div>
                                            </div>
                                            <div
                                                className={`${Styles.templateHolder} ${formData.template == 2 ? Styles.selected : ''}`}
                                                onClick={() => handleChange({ target: { value: 2, name: "template" } })}
                                            >
                                                <input
                                                    type="radio"
                                                    name="template"
                                                    checked={formData.template == 2}
                                                    value={2}
                                                    required
                                                    className={Styles.hiddenRadio}
                                                />
                                                <img src="/assets/templates/2.png" alt="Template 1" />
                                                <div
                                                    className={Styles.previewIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering the brand selection
                                                        window.open(`/assets/templates/2.png`, '_blank');
                                                    }}
                                                >
                                                    <FaEye />
                                                </div>
                                            </div>
                                            <div
                                                className={`${Styles.templateHolder} ${formData.template == 3 ? Styles.selected : ''}`}
                                                onClick={() => handleChange({ target: { value: 3, name: "template" } })}
                                                // onClick={() => { setCallbackError(true); setCallbackErrorMsg('Comming soon...') }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="template"
                                                    checked={formData.template == 3}
                                                    value={3}
                                                    required
                                                    className={Styles.hiddenRadio}
                                                />
                                                <img src="/assets/templates/3.png" alt="Template 2" />
                                                <div
                                                    className={Styles.previewIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering the brand selection
                                                        window.open(`/assets/templates/3.png`, '_blank');
                                                    }}
                                                >
                                                    <FaEye />
                                                </div>
                                            </div>
                                            <div
                                                className={`${Styles.templateHolder} ${formData.template == 4 ? Styles.selected : ''}`}
                                                onClick={() => handleChange({ target: { value: 4, name: "template" } })}
                                                // onClick={() => { setCallbackError(true); setCallbackErrorMsg('Comming soon...') }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="template"
                                                    checked={formData.template == 4}
                                                    value={4}
                                                    required
                                                    className={Styles.hiddenRadio}
                                                />
                                                <img src="/assets/templates/4.png" alt="Template 4" />
                                                <div
                                                    className={Styles.previewIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering the brand selection
                                                        window.open(`/assets/templates/4.png`, '_blank');
                                                    }}
                                                >
                                                    <FaEye />
                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                </div>
                            )}
                        </div>
                        <div className="accordion-item">
                            <div
                                className={`accordion-header ${currentStep === 5 ? 'active' : ''}`}
                            // onClick={() => handleAccordionClick(4)}
                            >
                                <h3>Subscribers</h3>
                                <span>{currentStep === 5 ? '-' : '+'}</span>
                            </div>
                            {currentStep === 5 && (
                                <>
                                    <div className="accordion-body">
                                        <MultiSelectSearch
                                            loading={(!Subscribers.isLoaded || loading) ? <div className='m-auto'><Loading height={'100px'} /></div> : null}
                                            options={allSubscribers}
                                            selectedValues={formData.subscriber}
                                            onChange={handleSelectionChange}
                                            manufacturers={manufacturers?.data || []}
                                            setWarning={setWarning}
                                            brandSelected={manufacturers.data.filter(brand => formData.brand.includes(brand.Id))}
                                            manufacturersList={manufacturersList?.data || []}
                                            errorMessage={errorMessage}
                                        />

                                    </div>
                                </>
                            )}
                        </div>

                        <div className="button-group">
                            {currentStep != 1 ? <button
                                type="button"
                                className="prev-btn"
                                onClick={() => handleAccordionClick(currentStep == 5 ? 3 : currentStep - 1)}
                            >
                                Previous
                            </button> : null}&nbsp;
                            <div>
                                {isPreviewHtml.isLoaded ? <button
                                    type="button"
                                    className="next-btn"
                                    onClick={() => handleAccordionClick(4)}
                                >
                                    Preview
                                </button> : null}&nbsp;
                                {currentStep == 5 ? <button type="submit" onClick={() => {
                                    if (currentStep === 5 && (!formData.brand.length)) {
                                        setCallbackError(true)
                                        setCallbackErrorMsg('Please select a brand')
                                        return;
                                    }
                                }} className="submit-btn">
                                    Submit
                                </button> : <button
                                    type="button"
                                    className="next-btn"
                                    onClick={() => handleAccordionClick(currentStep + 1)}
                                >
                                    Next
                                </button>}
                            </div>
                        </div>
                    </form></>}
        </div>
    );
};

export default MultiStepForm;
