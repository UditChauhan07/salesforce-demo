import Chart from "react-apexcharts";

const GraphHandler = ({manufacturerSalesYear,options,Styles})=>{
    return <div className="row mt-5">
    <div className="">
      <p className={Styles.Tabletext}>Total Sale By Brand</p>
      <div className={`${Styles.graphmain} cardShadowHover`}>
        <Chart options={options} series={manufacturerSalesYear} type="area" width="100%" height="100%" />
      </div>
    </div>
  </div>
  }

  export default GraphHandler;