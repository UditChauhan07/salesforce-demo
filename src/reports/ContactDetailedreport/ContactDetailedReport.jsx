import React, { useEffect, useState, useMemo } from 'react';
import AppLayout from '../../components/AppLayout';
import Styles from "./index.module.css"; // Preserving your original styles
import { FilterItem } from '../../components/FilterItem';
import Loading from '../../components/Loading';
import styles from "../../components/newness report table/table.module.css"; // Preserving your table styles
import styless from "../../components/Modal UI/Styles.module.css";
import * as XLSX from 'xlsx';
import { MdOutlineDownload } from "react-icons/md";
import { getPermissions } from "../../lib/permission";
import FilterSearch from '../../components/FilterSearch';
import PermissionDenied from '../../components/PermissionDeniedPopUp/PermissionDenied';
import { useNavigate } from 'react-router-dom';
import { fetchAccountDetails } from '../../lib/contactReport';
import { CloseButton, SearchIcon } from "../../lib/svg";
import ModalPage from "../../components/Modal UI";
import DynamicTable from '../../utilities/Hooks/DynamicTable';
import { sortArrayHandler } from '../../lib/store';
function ContactDetailedReport() {
    const navigate = useNavigate();
    const [accountManufacturerRecords, setAccountManufacturerRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [activeAccounts, setActiveAccounts] = useState("Active Account");
    const [exportToExcelState, setExportToExcelState] = useState(false);
    const [filters, setFilters] = useState({
        accountFilter: '',
        saleRepFilter: '',
        manufacturerFilter: 'Bobbi Brown',
        accountStatusFilter: 'Active Account',
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters); // Added state for debounced filters
    const [accounts, setAccounts] = useState([]);
    const [salesReps, setSalesReps] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState(null);
    const [selectedManufacturer, setSelectedManufacturer] = useState('BOBBI BROWN');
    // Debounce Filter Updates
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [filters]);
    async function fetchData() {
        setLoading(true);
        await fetchAccountDetails(
            setLoading,
            setAccountManufacturerRecords,
            setFilteredRecords,
            setAccounts,
            setSalesReps,
            setManufacturers
        );

        try {
            const userPermissions = await getPermissions();
            setPermissions(userPermissions);
            if (!userPermissions?.modules?.reports?.contactDetailedReport.view) {
                PermissionDenied();
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Error fetching permissions", err);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);

    // Filter records based on the search criteria
    const filteredData = useMemo(() => {
        return accountManufacturerRecords.filter(record => {
            const accountMatch = debouncedFilters.accountFilter
                ? record.accountDetails?.Name?.toLowerCase().includes(debouncedFilters.accountFilter.toLowerCase())
                : true;

            const saleRepMatch = debouncedFilters.saleRepFilter
                ? record.manufacturers?.salesRep?.toLowerCase().includes(debouncedFilters.saleRepFilter.toLowerCase())
                : true;

            const manufacturerMatch = debouncedFilters.manufacturerFilter
                ? record.manufacturers?.manufacturerName?.toLowerCase().includes(debouncedFilters.manufacturerFilter.toLowerCase())
                : true;

            const accountStatusMatch = filters.accountStatusFilter === 'All'
                ? true
                : filters.accountStatusFilter === 'Active Account'
                    ? record.accountDetails?.Active_Closed__c === 'Active Account' // Show only active accounts
                    : false;

            return accountStatusMatch && manufacturerMatch && saleRepMatch && accountMatch;
        });
    }, [debouncedFilters, accountManufacturerRecords, filters]);
    useEffect(() => {
        setFilteredRecords(filteredData);
        console.log('filtered records', filteredRecords);
    }, [filteredData]);
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleClearFilters = async () => {
        setSelectedManufacturer('BOBBI BROWN')
        setFilters({
            accountFilter: '',
            saleRepFilter: '',
            manufacturerFilter: 'Bobbi Brown',
            accountStatusFilter: 'Active Account',

        });

    };
    const handleExportToExcel1 = () => {
        setExportToExcelState(true);
    };

    const handleExportToExcel = () => {
        setExportToExcelState(false)
        const exportData = filteredData.map(record => ({
            'Account Name': record.accountDetails?.Name || '',
            'First Name': record.contact?.FirstName || 'N/A',
            'Last Name': record.contact?.LastName || 'N/A',
            'Sales Rep': record.manufacturers?.salesRep || 'N/A',
            'Manufacturer': record.manufacturers?.manufacturerName || 'N/A',
            'Status': record.accountDetails?.Active_Closed__c,
            'Email': record.contact?.Email || 'N/A',
            'Phone': record.contact?.Phone || 'N/A',
            'Account Number': record.manufacturers?.accountNumber || 'N/A',
            'Margin': record.manufacturers?.margin || 'N/A',
            'Payment Type': record.manufacturers?.paymentType || 'N/A',
            'Store Street': record.accountDetails?.Store_Street__c || 'N/A',
            'Store City': record.accountDetails?.Store_City__c || 'N/A',
            'Store State': record.accountDetails?.Store_State__c || 'N/A',
            'Store Zip': record.accountDetails?.Store_Zip__c || 'N/A',
            'Store Country': record.accountDetails?.Store_Country__c || 'N/A',
            'Shipping Street': record.accountDetails?.ShippingStreet || 'N/A',
            'Shipping City': record.accountDetails?.ShippingCity || 'N/A',
            'Shipping State': record.accountDetails?.ShippingState || 'N/A',
            'Shipping Zip': record.accountDetails?.ShippingPostalCode || 'N/A',
            'Shipping Country': record.accountDetails?.ShippingCountry || 'N/A',
            'Billing Street': record.accountDetails?.BillingStreet || 'N/A',
            'Billing City': record.accountDetails?.BillingCity || 'N/A',
            'Billing State': record.accountDetails?.BillingState || 'N/A',
            'Billing Zip': record.accountDetails?.BillingPostalCode || 'N/A',
            'Billing Country': record.accountDetails?.BillingCountry || 'N/A',
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
        XLSX.writeFile(wb, `Contact Detailed Report ${new Date().toDateString()}.xlsx`);

    };

    // Memoize permissions to avoid unnecessary re-calculations
    const memoizedPermissions = useMemo(() => permissions, [permissions]);
    const ensureBobbiBrown = (options) => {
        const isBobbiBrownIncluded = options.some(option => option.value === 'BOBBI BROWN');

        if (!isBobbiBrownIncluded) {
            return [{ label: 'BOBBI BROWN', value: 'BOBBI BROWN' }, ...options];
        }

        return options;
    };
    return (
        <AppLayout
            filterNodes={

                <div className="d-flex justify-content-between m-auto" style={{ width: '99%' }}>
                    <div className="d-flex justify-content-start gap-4 col-4">
                        <FilterItem
                            minWidth="200px"
                            label="BOBBI BROWN"
                            value={selectedManufacturer} // Use temporary state
                            name="BOBBI BROWN"
                            options={ensureBobbiBrown(manufacturers)} // Ensure 'BOBBI BROWN' is in the options
                            onChange={(value) => {
                                // Update the temporary state only
                                setSelectedManufacturer(value);
                            }}
                            onFocus={() => setFilters((prev) => ({ ...prev, saleRepFilter: '' }))} // Optional
                        />

                        <button onClick={() => {

                            handleFilterChange('manufacturerFilter', selectedManufacturer);
                            // Also update the actual filter state
                            setFilters((prev) => ({ ...prev, manufacturerFilter: selectedManufacturer }));
                        }} className="border px-2 py-1 leading-tight d-grid"> <SearchIcon fill="#fff" width={20} height={20} />
                            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>search</small>
                        </button>

                    </div>
                    <div className="d-flex justify-content-end col-1"><hr className={Styles.breakHolder} /></div>
                    {memoizedPermissions?.modules?.godLevel && (
                        <FilterItem
                        minWidth="200px"
                        label="Sales Rep"
                        value={filters.saleRepFilter}
                        name="Sales Rep"
                        options={[...salesReps].sort((a, b) => a.label.localeCompare(b.label))}
                        onChange={(value) => handleFilterChange("saleRepFilter", value)}
                        onFocus={() => setFilters((prev) => ({ ...prev, manufacturerFilter: "" }))}
                       />
                    )}


                    <FilterItem
                        minWidth="200px"
                        label="Account Status"
                        name="Account Status"
                        value={filters.accountStatusFilter} // Show current filter value
                        options={[
                            { label: 'Active Accounts', value: 'Active Account' }, // Default option
                            { label: 'All Accounts', value: 'All' }, // Option to show all accounts
                        ]}
                        onChange={(value) => handleFilterChange('accountStatusFilter', value)} // Handle filter change
                    />
                    <FilterSearch
                        onChange={(e) => handleFilterChange('accountFilter', e.target.value)}
                        value={filters.accountFilter}
                        placeholder={"Search by account"}
                        minWidth={"167px"}
                    />
                    {exportToExcelState && (
                        <ModalPage
                            open
                            content={
                                <>
                                    <div style={{ maxWidth: "380px" }}>
                                        <h1 className={`fs-5 ${styless.ModalHeader}`}>Warning</h1>
                                        <p className={` ${styless.ModalContent}`}>Do you want to download Comparison Report?</p>
                                        <div className="d-flex justify-content-center gap-3 ">
                                            <button className={`${styless.modalButton}`} onClick={handleExportToExcel}>
                                                OK
                                            </button>
                                            <button className={`${styless.modalButton}`} onClick={() => setExportToExcelState(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </>
                            }
                            onClose={() => {
                                setExportToExcelState(false);
                            }}
                        />
                    )}


                    <div>
                        <button className="border px-2 py-1 leading-tight d-grid" onClick={handleClearFilters}>
                            <CloseButton crossFill={'#fff'} height={20} width={20} />
                            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
                        </button>
                    </div>
                    <button className="border px-2 py-1 leading-tight d-grid" onClick={handleExportToExcel1}>
                        <MdOutlineDownload size={16} className="m-auto" />
                        <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>export</small>
                    </button>
                </div>

            }
        >
            <div className={Styles.inorderflex}>
                <div>
                    <h2>
                        Account Contact Detailed Report
                    </h2>
                </div>
                <div></div>
            </div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className={`d-flex p-3 ${Styles.tableBoundary} mb-5`}>
                        <div style={{ overflow: "auto", width: "100%", height:'400px' }}>
                            {filteredRecords.length === 0 ? "NO DATA FOUND" :  
                               <DynamicTable mainData={sortArrayHandler(filteredData, g => g.accountDetails?.Name)} head={<thead>
                                <tr>
                                    <th className={`${styles.th} ${styles.stickyMonth} ${styles.stickyFirstColumnHeading}`} style={{ minWidth: "200px" }}>Account Name</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}  ${styles.stickySecondColumnHeading} `} style={{ minWidth: "200px" }}> Sales Rep</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Manufacturer</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Status</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>First Name </th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Last Name</th>


                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Email</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Phone</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Account Number</th>

                                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: "200px" }}>Margin</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Payment Type</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Store Street</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Store City</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Store State</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Store Zip</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Store Country</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Shipping Street</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Shipping City</th>

                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Shipping State</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Shipping  Zip</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Shipping Country</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Billing street</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Billing City </th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Billing State</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Billing  Zip</th>
                                    <th className={`${styles.th} ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>Billing Country</th>


                                </tr>
                            </thead>} className="table table-responsive" style={{ minHeight: "300px" }}>
                         
                           
                                {(items) => (

                                       <>
                                        <td className={`${styles.td} ${styles.stickyFirstColumn}`}>{items.accountDetails?.Name} </td>
                                        <td className={`${styles.td} ${styles.stickySecondColumn}`}>{items.manufacturers?.salesRep || 'N/A'}</td>
                                        <td className={styles.td}> {items.manufacturers?.manufacturerName || 'N/A'}</td>
                                        <td className={styles.td}> {items.accountDetails?.Active_Closed__c || 'N/A'}</td>
                                        <td className={styles.td}>{items?.contact?.FirstName || 'N/A'}</td>
                                        <td className={styles.td}>{items.contact?.LastName || 'N/A'}</td>
                                        <td className={styles.td}>{items.contact?.Email || 'N/A'}</td>
                                        <td className={styles.td}>{items.contact?.Phone || 'N/A'}</td>
                                        <td>{items.manufacturers?.accountNumber || 'N/A'}</td>

                                        <td className={styles.td}>{items.manufacturers?.margin || 'N/A'}</td>
                                        <td className={styles.td}>{items.manufacturers?.paymentType || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.Store_Street__c || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.Store_City__c || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.Store_State__c || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.Store_Zip__c || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.Store_Country__c || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.ShippingStreet || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.ShippingCity || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.ShippingState || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.ShippingPostalCode || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.ShippingCountry || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.BillingStreet || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.BillingCity || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.BillingState || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.BillingPostalCode || 'N/A'}</td>
                                        <td className={styles.td}>{items.accountDetails?.BillingCountry || 'N/A'}</td>
                                    </>
                                )}
                            </DynamicTable>
                            }
                         
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}

export default ContactDetailedReport;
