import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Please enter your email address.")
    .email("Please enter a valid email address."),

  password: yup.string().required("Please enter your password."),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
