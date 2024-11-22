import * as Yup from "yup";

export const OrderStatusSchema = Yup.object().shape({
    // description :Yup.string().required("Please enter description.").min(1, "Use 1 characters or more for description."),
    contact:Yup.object().required("Please select contact name."),
    // contact: Yup.object({
    //     label: Yup.string().required("Please select contact name."), 
    //     value: Yup.string().required("Please select contact name.")
    // })
    
})