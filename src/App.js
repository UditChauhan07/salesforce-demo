import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SalesReport from "./reports/sales_report/SalesReport";
import NewnessReport from "./reports/newness/NewnessReport";
import ComparisonReport from "./reports/comparison/ComparisonReport";
import "../node_modules/bootstrap/dist/js/bootstrap";
import Login from "./pages/Login";
import Testing from "./components/Testing";
import TopProducts from "./pages/TopProducts";
import Logout from "./components/Logout";
import MyRetailersPage from "./pages/MyRetailersPage";
import { UserProvider } from "./context/UserContext";
import BrandsPage from "./pages/BrandsPage";
import CustomerCare from "./pages/CustomerCare";
import AboutUs from "./pages/AboutUs";
import WholesaleInquiry from "./pages/WholesaleInquiry"
import Careers from "./pages/Careers"
import Instagram from "./pages/Instagram"
import Linkdin from "./pages/Linkdin"
import JoinUs from "./pages/JoinUs"
import EducationCenter from "./pages/EducationCenter";
import NewArrivals from "./pages/NewArrivals";
import CustomerSupport from "./pages/CustomerSupport";
import MarketingCalendar from "./pages/MarketingCalendar";
import MyBag from "./pages/MyBag";
import OrderListPage from "./pages/OrderListPage";
import Product from "./components/BrandDetails/Product";
import BagProvider from "./context/BagContext";
import MyBagOrder from "./pages/MyBagOrder";
import OrderStatusForm from "./pages/OrderStatusForm";
import CustomerSupportDetails from "./pages/CustomerSupportDetails";
import SignUp from "./pages/SignUp";
import Dashboard from "./components/Dashboard/Dashboard";
import TargetReport from "./reports/targetReport";
import YearlyComparisonReport from "./reports/yealyComparison/ComparisonReport";
import CustomerService from "./pages/CustomerService";
import OrderStatusIssues from "./OrderStatusIssues";
import EmailSetting from "./pages/EmailSetting";
import BMAIssues from "./pages/BMAIssues";
import PageNotFound from "./pages/PageNotFound";
import PublicProduct from "./pages/public/Product";
import TargetRollOver from "./reports/targetRollOver";
import StoreDetails from "./pages/StoreDetails";
import BrandDetails from "./pages/BrandDetails";
import Tier from "./reports/TierStanding";
import HelpSection from "./pages/HelpSection";
import AuditReport from "./reports/AuditReport/AuditReport";
import OrderComplete from "./pages/OrderComplete";
import CreateNewsletter from "./components/EmailBlasts/createNewsletter";
import NewsLetterReport from "./pages/NewsLetterReport";
import NewsletterSetting from "./pages/NewsletterSetting";
import ContactDetailedReport from "./reports/ContactDetailedreport/ContactDetailedReport";
import CartHover from "./components/CartHover";
import { CartProvider } from "./context/CartContext";
import ProductPage from "./components/ProductPage/ProductPage";
import { AnimatePresence } from 'framer-motion';
import ProductOrder from "./pages/ProductOrder";
import LearnMore from "./pages/LearnMore";
function App() {
  // const Redirect = ({ href }) => {
  //   window.location.href = href;
  // };
  return (
    <AnimatePresence>
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <CartHover />
            <Routes>
              <Route path="/sales-report" element={<SalesReport />}></Route>
              <Route path="/newness-report" element={<NewnessReport />}></Route>
              <Route path="/Target-Report" element={<TargetRollOver />}></Route>
              <Route path="/comparison-report" element={<ComparisonReport />}></Route>
              <Route path="/comparison" element={<YearlyComparisonReport />}></Route>
              <Route path="/order-list" element={<OrderListPage />}></Route>
              <Route path="/top-products" element={<TopProducts />}></Route>
              <Route path="/login" element={<Login />}></Route>
              <Route path="/" element={<Login />}></Route>
              <Route path="/logout" element={<Logout />}></Route>
              <Route path="/my-retailers" element={<MyRetailersPage />}></Route>
              <Route path="/dashboard" element={<Dashboard />}></Route>
              <Route path="/product" element={<Product />}></Route>
              {/* <Route path="/product/:name" element={<ProductDetails/>}></Route> */}
              <Route path="/my-bag" element={<MyBag />}></Route>
              <Route path="/brand" element={<BrandsPage />}></Route>
              <Route path="/order/complete" element={<OrderComplete />}></Route>
              <Route path="/customer-care" element={<CustomerCare />}></Route>
              <Route path="/customer-support" element={<CustomerSupport />}></Route>
              <Route path="/CustomerSupportDetails" element={<CustomerSupportDetails />}></Route>
              <Route path="/new-arrivals" element={<NewArrivals />}></Route>
              <Route path="/marketing-calendar" element={<MarketingCalendar />}></Route>
              <Route path="/education-center" element={<EducationCenter />}></Route>
              <Route path="/about-us" element={<AboutUs />}></Route>
              <Route path="/wholesale-inquiry" element={<WholesaleInquiry />}></Route>
              <Route path="/careers" element={<Careers />}></Route>
              <Route path="/instagram" element={<Instagram />}></Route>
              <Route path="/linkdin" element={<Linkdin />}></Route>
              <Route path="/join-us" element={<JoinUs />}></Route>
              <Route path="logout" element={<Logout />}></Route>
              <Route path="/lead" element={<SignUp />}></Route>
              <Route path="/orderDetails" element={<MyBagOrder />}></Route>
              {/* <Route path="/customerService" element={<CustomerServiceForm />}></Route> */}
              <Route path="/customerService" element={<CustomerService />}></Route>
              <Route path="/orderStatus" element={<OrderStatusIssues />}></Route>
              <Route path="/orderStatusForm" element={<OrderStatusForm />}></Route>
              <Route path="/newsletter" element={<EmailSetting />}></Route>
              <Route path="/newsletter/report" element={<NewsLetterReport />}></Route>
              <Route path="/newsletter/create" element={<CreateNewsletter />}></Route>
              <Route path="/newsletter/setting" element={<NewsletterSetting />}></Route>
              <Route path="/brandManagementApproval" element={<BMAIssues />}></Route>
              <Route path="/public/product/:id/:token/details" element={<PublicProduct />}></Route>
              <Route path="/Help-Section" element={<HelpSection />}></Route>
              <Route path="/store/:id" element={<StoreDetails />} />
              <Route path="/Brand/:id" element={<BrandDetails />} />
              <Route path="/TierStanding" element={<Tier />} />
              <Route path="/AuditReport" element={<AuditReport />} />
              <Route path="/account-contact-detailed-Report" element={<ContactDetailedReport />} />
              <Route path='/productPage/:id' element={<ProductPage />} />
              <Route path='/public/product/order' element={<ProductOrder/>} />
              <Route path="/learn-more" element={<LearnMore/>}/>
              <Route path="*" element={<PageNotFound />}></Route>

              {/* 1234 */}
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    </AnimatePresence>
  );
}

export default App;
