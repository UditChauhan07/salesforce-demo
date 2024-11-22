import { MdOutlineDownload } from "react-icons/md"
import AppLayout from "../../components/AppLayout"
import { useEffect, useMemo, useState } from "react"
import ModalPage from "../../components/Modal UI";
import SelectBrandModel from "../../components/My Retailers/SelectBrandModel/SelectBrandModel";
import { useManufacturer } from "../../api/useManufacturer";
import Loading from "../../components/Loading";
import { generateBrandAuditTemplate, getAuditReportView, GetAuthData, getBrandAuditPaginate, originAPi } from "../../lib/store";
import { CloseButton } from "../../lib/svg";
import AuditReportTable from "../../components/AuditReportTable";
import { getPermissions } from "../../lib/permission";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../../components/PermissionDeniedPopUp/PermissionDenied";
import { FilterItem } from "../../components/FilterItem";
import FilterSearch from "../../components/FilterSearch";
// Styling
const styles = {
    optionContainer: {
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        flex: 1,
        transition: 'transform 0.3s ease',
    },
    optionTitle: {
        fontSize: '20px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    chunkList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
    },
    chunkButton: {
        position: 'relative',
        padding: '10px 15px',
        fontSize: '14px',
        color: '#fff',
        backgroundColor: '#444',
        border: '2px solid #333',
        borderRadius: '5px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loader: {
        width: '12px',
        height: '12px',
        border: '2px solid #fff',
        borderTop: '2px solid #999',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    checkmark: {
        color: '#0f0',
        fontSize: '18px',
    },
    '@keyframes spin': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
    },
};

const AuditReport = () => {
    const [isShowBrandModal, setIsShowBrandModal] = useState(false);
    const { data: manufacturers, isLoading, error } = useManufacturer();
    const [isPdfGenerated, setIsPdfGenerated] = useState(false)
    const [brandSelect, setbrandSelected] = useState();
    const [brandStep, setBrandStep] = useState(0);
    const [brandPages, setBrandPages] = useState({ isLoaded: false, value: 0 });
    const [totalAccount, setTotalAccount] = useState();
    const [currentFileName, setCurrentFileName] = useState('');
    const [selectedSalesRepId, setSelectedSalesRepId] = useState();
    const [userData, setUserData] = useState({});
    const [hasPermission, setHasPermission] = useState(null);
    const navigate = useNavigate()
    const [manufacturerFilter, setManufacturerFilter] = useState();
    const [searchBy, setSearchBy] = useState("");
    const [auditReport, setAuditReport] = useState({ isLoaded: false, data: [] })
    const [token, setToken] = useState();
    const [permissions, setPermissions] = useState(null);
    useEffect(() => {
        async function fetchPermissions() {
            try {
                const userPermissions = await getPermissions(); // Fetch permissions
                setPermissions(userPermissions); // Set permissions in state
                if (userPermissions?.modules?.reports?.auditReport.view === false) {
                    PermissionDenied()
                    navigate('/dashboard')
                }
            } catch (err) {
                console.error("Error fetching permissions", err);
            }
        }

        fetchPermissions(); // Fetch permissions on mount
    }, []);
    useEffect(() => {
        GetAuthData().then((user) => {
            setToken(user.x_access_token);
            getAuditReportView({ key: user.x_access_token }).then((reportRes) => {
                console.log({ reportRes });
                setAuditReport({ isLoaded: true, data: reportRes })

            }).catch((reportErr) => {
                console.log({ reportErr });

            })
        }).catch((userErr) => {
            console.log({ userErr });

        })
    }, [])

    const onCloseModal = () => {
        setBrandStep(0);
        setTotalAccount()
        setBrandPages({ isLoaded: false, value: 0 });
        setIsShowBrandModal(false);
        setIsPdfGenerated(false)
    }

    const BrandPaginateHanlder = (brand) => {
        setBrandStep(1);
        setbrandSelected(brand)
        if (!brand) {
            brand = brandSelect;
        }
        GetAuthData().then((user) => {
            getBrandAuditPaginate({ key: user.x_access_token, Ids: JSON.stringify([brand.Id]), }).then((data) => {
                let pages = Math.ceil(data.length / 10)
                // console.log({ pages });
                setTotalAccount(data.length)

                setBrandPages({ isLoaded: true, value: pages })
            }).catch((aErr) => {
                console.log({ aErr });
            })
        }).catch((userErr) => {
            console.log({ userErr });
        })
    }

    const ChunkedReportDownload = ({ chunks }) => {
        const [loadingChunk, setLoadingChunk] = useState(null);
        const [downloadedChunks, setDownloadedChunks] = useState([]);
        const [busyParts, setBusyParts] = useState([]);

        const onChangeHandler = async (page) => {
            // If a download is in progress, mark other parts as busy
            if (loadingChunk !== null && loadingChunk !== page) {
                if (!busyParts.includes(page)) {
                    setBusyParts((prev) => [...prev, page]);
                    setTimeout(() => {
                        setBusyParts((prev) => prev.filter((part) => part !== page));
                    }, 3000); // Show "Busy" message for 3 seconds
                }
                return;
            }

            setLoadingChunk(page);
            try {
                const user = await GetAuthData();
                const file = await generateBrandAuditTemplate({
                    key: user.x_access_token,
                    Ids: JSON.stringify([brandSelect.Id]),
                    currentPage: page
                });

                if (file) {
                    const a = document.createElement('a');
                    let fileName = `${brandSelect.Name}-Audit-Report-Part-${page}-${new Date().toISOString()}.pdf`.replaceAll(" ", "-");
                    a.href = `${originAPi}/files${file}/${fileName}/index`;
                    a.download = fileName;
                    a.click();
                    setDownloadedChunks((prev) => [...prev, page]);
                }
            } catch (error) {
                console.error('Error generating or downloading PDF:', error);
            } finally {
                // Ensure this runs regardless of success or failure
                setLoadingChunk(null);
            }
        };

        


        return (
            <div style={styles.optionContainer}>
                <div style={styles.chunkList}>
                    {chunks.map((chunk, index) => {
                        const partNumber = index + 1;
                        const isBusy = busyParts.includes(partNumber);
                        const isDownloading = loadingChunk === partNumber;
                        const isDownloaded = downloadedChunks.includes(partNumber);

                        return (
                            <button
                                key={"NTS" + index}
                                style={styles.chunkButton}
                                onClick={() => onChangeHandler(partNumber)}
                                disabled={isDownloading || isBusy}
                            >
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    {isDownloading && <div style={styles.loader}></div>}
                                    <span style={{ marginLeft: isDownloading ? '10px' : '0', display: 'flex' }}>
                                        {isDownloading
                                            ? 'Downloading...'
                                            : isBusy
                                                ? 'Busy, please try again later'
                                                : <><MdOutlineDownload size={16} className="m-auto" />&nbsp;{`Part ${partNumber}`}</>}
                                    </span>
                                </span>
                                {isDownloaded && (
                                    <span style={styles.checkmark}>&#10003;</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Main UI component to compare both options
    const ReportDownloadComparison = () => {
        useEffect(() => {
            // Any side-effects based on brandPages can be handled here
        }, [brandPages]);
        const chunks = Array.from({ length: brandPages.value }, (_, i) => i + 1);

        return (
            <div style={styles.comparisonContainer}>
                {brandPages.isLoaded ?
                    chunks.length ? <ChunkedReportDownload chunks={chunks} /> : "Not data found" :
                    <Loading height={'200px'} />}
            </div>
        );
    };


    const AuditForm = () => {
        useEffect(() => { }, [brandStep])
        return (
            <>
                {brandStep == 1 ?
                    <div className="p-[20px] max-w-[900px]">
                        <section>
                            <div className="d-flex align-items-center justify-content-between gap-5 mb-4">
                                <h3 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] text-left">Download Audit Report for {brandSelect?.Name || 'NA'} in Parts</h3>
                                <button type="button" onClick={onCloseModal}>
                                    <CloseButton />
                                </button>
                            </div>
                            {brandPages.isLoaded ? <small className="d-block w-[100%] text-right mb-2">Total Accounts: <b>{totalAccount}</b></small> : null}
                            <ReportDownloadComparison /></section></div>
                    : brandStep == 0 ?
                        <SelectBrandModel brands={manufacturers?.data} onChange={BrandPaginateHanlder} onClose={onCloseModal} />
                        :
                        null}
            </>
        )
    }

    const filteredData = useMemo(() => {
        // Return all data if no filter values are present
        if (!searchBy && !manufacturerFilter) {
            return auditReport.data;
        }
    
        return auditReport.data?.map((report) => {
            let matchesSearch = true;
            let filteredBrands = report.Brands || []; // Ensure we handle the case where there are no brands
    
            // Check if searchBy matches Name or Owner.Name
            if (searchBy) {
                matchesSearch =
                    report?.Name?.toLowerCase().includes(searchBy.toLowerCase()) ||
                    report?.Owner?.Name?.toLowerCase().includes(searchBy.toLowerCase());
            }
            
    
            // Filter Brands based on manufacturerFilter
            if (manufacturerFilter) {
                filteredBrands = filteredBrands.filter(
                    (brand) => brand.ManufacturerId__c === manufacturerFilter
                );
            }
    
            // If the report matches the search or has filtered brands, return the report
            if (matchesSearch && (filteredBrands.length > 0 || !manufacturerFilter)) {
                return {
                    ...report,
                    Brands: filteredBrands.length > 0 ? filteredBrands : report.Brands,  // Return filtered brands or all brands if no manufacturerFilter
                };
            }
    
            return null; // Return null if neither search nor manufacturer filter matches
        }).filter(report => report); // Remove any null reports
    }, [auditReport, manufacturerFilter, searchBy]);
    
        useEffect(()=>{},[searchBy])
        const reset = ()=>{
            setSearchBy(""); setManufacturerFilter();
        }


    return (<AppLayout
        filterNodes={
            <div className="d-flex justify-content-between m-auto" style={{ width: '99%' }}>
                {permissions?.modules?.reports?.auditReport.create?
                <button className="border px-2 py-1 leading-tight d-flex" onClick={() => setIsShowBrandModal(true)}>

                    <MdOutlineDownload size={16} className="m-auto" />
                    <small style={{ fontSize: '9px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Brand <br />Report</small>
                </button>:<p></p>}
                <div>
                    <div className="d-flex gap-4">
                        <FilterItem
                            minWidth="220px"
                            label="All Brands"
                            name="AllManufacturers1"
                            value={manufacturerFilter}
                            options={manufacturers?.data?.map((manufacturer) => ({
                                label: manufacturer.Name,
                                value: manufacturer.Id,
                            })) || []}
                            onChange={(value) => setManufacturerFilter(value)}
                        />
                        <FilterSearch onChange={(e) => setSearchBy(e.target.value)} value={searchBy} placeholder={"Search by account"} minWidth={"167px"} />
                        <button className="border px-2 py-1 leading-tight d-grid" onClick={reset}>
                            <CloseButton crossFill={'#fff'} height={20} width={20} />
                            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
                        </button>
                    </div>
                </div>
            </div>
        }>
        <ModalPage content={<AuditForm brandStep={brandStep} />} onClose={onCloseModal} open={isShowBrandModal} />
        {isLoading ? <Loading height={'40vh'} /> : <>
            {/* <div>
                <h2 className="font-['Arial-400'] text-[26px] tracking-[2.20px] text-left">
                    Audit Report
                </h2>
            </div> */}
            <div className="d-grid place-content-center min-h-[40vh]">
                {isPdfGenerated ? <><img src="https://i.giphy.com/7jtU9sxHNLZuv8HZCa.webp" width="480" height="480" /><p className="text-center mt-2">{`Creating PDF Audit Report for ${brandSelect?.Name}`}</p></> :
                    auditReport.isLoaded ?
                        <div style={{ width: '90vw', margin: '2rem auto' }}><AuditReportTable auditReport={filteredData || []} /></div>
                        : <div className="col-12"><Loading height={'50vh'}/></div>
                }

            </div></>}
    </AppLayout>)
}
export default AuditReport