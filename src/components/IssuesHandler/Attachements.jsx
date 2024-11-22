import { BiLock, BiSave, BiUpload } from "react-icons/bi";
import Styles from "./Attachements.module.css";
import { BsFillEyeFill } from "react-icons/bs";
import { useState } from "react";
import ModalPage from "../Modal UI";

const Attachements = ({ files, setFile, setDesc, orderConfirmed, SubmitHandler }) => {
    const [confirm, setConfirm] = useState(false);
    function handleChange(e) {
        let tempFile = [...files];
        let reqfiles = e.target.files;
        if (reqfiles) {
            if (reqfiles.length > 0) {
                Object.keys(reqfiles).map((index) => {
                    let url = URL.createObjectURL(reqfiles[index])
                    if (url) {
                        tempFile.push({ preview: url, file: reqfiles[index] });
                    }
                    // this thoughing me Failed to execute 'createObjectURL' on 'URL': Overload resolution failed?
                })
            }
        }
        setFile(tempFile);
    }
    const handleFileChange = (event) => {
        const files = event.target.files;
        const images = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (event) => {
                images.push(event.target.result);
            };

            reader.readAsDataURL(file);
        }
        console.log({ images });
    };
    const shakeHandler = () => {
        let lock1 = document.getElementById("lock2");
        if (lock1) {
            setTimeout(() => {
                lock1.classList.remove(Styles.shake);
            }, 300)
            lock1.classList.add(Styles.shake)
        }
    }
    const fileRemoveHandler = (index) => {
        let tempFile = [...files];
        tempFile.splice(index, 1)
        setFile(tempFile);
    }
    return (<section style={{ borderBottom: '1px solid #ccc' }} id="AttachementSection">
        <ModalPage
            open={confirm || false}
            content={
                <div className="d-flex flex-column gap-3">
                    <h2>
                        Confirm
                    </h2>
                    <p>
                        Are you sure you want to generate a ticket?<br /> This action cannot be undone.<br /> You will be redirected to the ticket page after the ticket is generated.
                    </p>
                    <div className="d-flex justify-content-around ">
                        <button className={Styles.btnHolder} onClick={SubmitHandler}>
                            Submit
                        </button>
                        <button className={Styles.btnHolder} onClick={() => setConfirm(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            }
            onClose={() => {
                setConfirm(false);
            }}
        />
        <h2 className={Styles.reasonTitle}><span style={{ cursor: "pointer" }} onClick={shakeHandler}>Help us by sending some Details:</span> {!orderConfirmed && <BiLock style={{ float: 'right' }} id="lock2" />}</h2>
        {orderConfirmed &&
            <div className={Styles.attachContainer}>
                <div className={Styles.dFlex}>
                    <div className={Styles.attachHolder}>
                        <p className={Styles.subTitle}>upload some Attachements</p>
                        <label className={Styles.attachLabel} for="attachement"><div><div className={Styles.attachLabelDiv}><BiUpload /></div></div></label>
                        <input type="file" style={{ width: 0, height: 0 }} id="attachement" onChange={handleChange} multiple accept="image/*" />
                        <div className={Styles.imgHolder}>
                            {files.map((file, index) => (
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', right: '5px', top: '-5px', color: '#000', zIndex: 1, cursor: 'pointer', fontSize: '18px' }} onClick={() => { fileRemoveHandler(index) }}>x</span>
                                    <a href={file?.preview} target="_blank" title="Click to Download">
                                        <img src={file?.preview} key={index} alt={file?.preview} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={Styles.descholder}>
                        <p className={Styles.subTitle}>Describe you Problem</p>
                        <textarea name="desc" id="" className={Styles.textAreaPut} onKeyUp={(e) => setDesc(e.target.value)}></textarea>
                    </div>
                </div>
                <button className={Styles.btnHolder} onClick={() => setConfirm(true)}><BiSave />&nbsp;Submit</button>
            </div>}
    </section>)
}
export default Attachements;