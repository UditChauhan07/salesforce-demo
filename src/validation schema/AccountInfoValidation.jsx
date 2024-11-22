import * as Yup from "yup";

export const AccountInfoValidation = Yup.object().shape({
    description :Yup.string().required("Please enter description.").min(1, "Use 1 characters or more for description."),
    account:Yup.object().required("Please select Store name."),
    manufacturer:Yup.object().required("Please select Brand name."),
    contact:Yup.object().required("Please select Contact name."),
})