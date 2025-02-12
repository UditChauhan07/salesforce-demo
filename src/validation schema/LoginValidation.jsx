import * as Yup from "yup";

export const LoginFormSchema = Yup.object().shape({
    email:Yup.string().required("Please enter your email.").email("Please enter your valid email address. "),
    password:Yup.string().required("Please enter your password.").min(5, "Password is too short!").max(40,"Password is too long!"),
})