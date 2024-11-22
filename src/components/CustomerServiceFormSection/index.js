import { useEffect, useState } from "react";
import styles from "./style.module.css";
import { GetAuthData, getSupportFormRaw, postSupport, supportClear, supportDriveBeg, supportShare } from "../../lib/store";
import { Link, useNavigate } from "react-router-dom";
const CustomerServiceFormSection = () => {
  const navigate = useNavigate();
  const [prioritiesList, setPrioritiesList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [supportTicketData, setTicket] = useState();
  const [activeBtn, setActive] = useState(false);
  useEffect(() => {
    let data = supportDriveBeg();
    setTicket(data);
    GetAuthData()
      .then((user) => {
        let rawData = {
          key: user.x_access_token,
          AccountId: data.orderStatusForm.accountId,
        };
        getSupportFormRaw({ rawData })
          .then((raw) => {
            setPrioritiesList(raw.Priority);
            setContactList(raw.ContactList);
          })
          .catch((error) => {
            console.error({ error });
          });
      })
      .catch((err) => {
        console.error({ err });
      });
  }, []);

  const onChangeHandler = (key, value) => {
    let temp = supportTicketData;
    temp.orderStatusForm[key] = value;

    supportShare(temp)
      .then((response) => {
        let data = supportDriveBeg();
        setTicket(data);
      })
      .catch((error) => {
        console.error({ error });
      });

      console.log(supportTicketData);
  };
  const onSubmitHandler = (e) => {
    e.preventDefault();
    setActive(true);
    GetAuthData()
      .then((user) => {
        supportTicketData.orderStatusForm.salesRepId = user.Sales_Rep__c;
        supportTicketData.key = user.x_access_token;
        postSupport({ rawData: supportTicketData })
          .then((response) => {
            if (response) {
              console.log({ response });
              let flush = supportClear();
              if (flush) navigate("/CustomerSupportDetails?id=" + response);
            } else {
              alert("Something went wrong..");
            }
          })
          .catch((err) => {
            console.error({ err });
          });
      })
      .catch((error) => {
        console.error({ error });
      });
    return;
  };
 
  return (
    <div className={styles.container}>
      <form className={styles.formContainer} onSubmit={onSubmitHandler}>
        <b className={styles.containerTitle}>Customer Services</b>
        {/* priority */}
        <label className={styles.labelHolder}>
          Priority
          <select
            onChange={(e) => {
              onChangeHandler("priority", e.target.value);
            }}
            required
          >
            {prioritiesList.map((priority) => {
              return (
                <option value={priority.value} selected={priority.value == supportTicketData?.orderStatusForm?.priority}>
                  {priority.name}
                </option>
              );
            })}
          </select>
        </label>
        
        {/* contact name */}
        <label className={styles.labelHolder}>
          Contact Name
          <select
            onChange={(e) => {
              onChangeHandler("contactId", e.target.value);
            }}
            required
          >
            <option val>Select Contact</option>
            {contactList.map((priority) => {
              return (
                <option value={priority.Id} selected={priority.Id == supportTicketData?.orderStatusForm?.contactId}>
                  {priority.Name}
                </option>
              );
            })}
          </select>
        </label>
          {/* Opportunity name */}
          <label className={styles.labelHolder}>
          Opportunity Name
          <input type="text"
            placeholder="Enter opportunity name"
            required
            onChange={(e) => {
            //   onChangeHandler("desc", e.target.value);
            }}
            // value={supportTicketData?.orderStatusForm?.desc}
          />
        </label>
         {/* Amount Owed */}
         <label className={styles.labelHolder}>
          Amount Owed
          <input type="text"
            placeholder="Enter amount"
            required
            onChange={(e) => {
            //   onChangeHandler("desc", e.target.value);
            }}
            // value={supportTicketData?.orderStatusForm?.desc}
          />
        </label>
        {/* Description */}
        <label className={styles.labelHolder}>
          Describe your issues
          <textarea
            placeholder="Description"
            required
            rows={4}
            onChange={(e) => {
              onChangeHandler("desc", e.target.value);
            }}
            defaultValue={supportTicketData?.orderStatusForm?.desc}
          ></textarea>
        </label>
        {/* email checkbox */}
        <label>
          <input
            type="checkbox"
            checked={supportTicketData?.orderStatusForm?.sendEmail}
            onChange={(e) => {
              onChangeHandler("sendEmail", e.target.checked);
            }}
          />
          &nbsp;Send Updates via email
        </label>
        <div className={styles.dFlex}>
          <Link to={"/order-list"} className={styles.btn}>
            Cancel
          </Link>
          <input type="submit" className={styles.btn} value={"Submit"} disabled={activeBtn} />
        </div>
      </form>
    </div>
  );
};
export default CustomerServiceFormSection;
