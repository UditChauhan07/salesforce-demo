import * as Yup from "yup";

export const SignUpFormSchema = Yup.object().shape({
  firstName: Yup.string().required("This field is required.").min(1, "Use 1 or more characters for Name").max(20, "Use 20 characters or fewer for your Name"),
  lastName: Yup.string().required("This field is required.").min(1, "Use 1 or more characters for Name").max(20, "Use 20 characters or fewer for your Name"),
  email: Yup.string().required("This field is required.").email("Please enter your valid email address. "),
  contact: Yup.number("Use only numbers").required("This field is required").min(10,"Phone number must be 10 characters!"),
  storeName: Yup.string().required("This field is required.").min(2, "Use 2 or more characters for store name").max(20, "Use 20 characters or fewer for your Name"),
  storeLocation: Yup.string().required("This field is required.").min(2, "Use 2 or more characters for store location").max(20, "Use 20 characters or fewer for your location."),
  descriptionOfStore: Yup.string().required("Please enter description.").min(1, "Use 1 characters or more for description."),
  sellOption: Yup.string(),
  brands: Yup.array().min(1, "Pick at least 1 brand").required("This field is required"),
  // mobile: Yup.number("Use only numbers").min(100000000, "Phone number must be 10 characters!").max(9999999999, "Invalid Phone number"),
});
