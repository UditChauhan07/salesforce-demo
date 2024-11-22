import styles from "./style.module.css";
function OrderLoader() {
  return (
    <div className={styles.loaderContainer}>
      <i className={styles.background}></i>
      <h2 className={styles.titleHolder}>Processing....  <strong> Please Wait</strong></h2>
      <div className={styles.ballContainer}>
        <div className={`${styles.ball} ${styles.mb}`}></div>
      </div>
    </div>
  );
};
export default OrderLoader;