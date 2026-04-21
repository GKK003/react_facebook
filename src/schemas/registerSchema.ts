import * as yup from "yup";

export const registerSchema = yup.object({
  firstName: yup
    .string()
    .required("What's your first name?")
    .min(2, "What's your first name?")
    .max(30, "What's your first name?")
    .matches(/^[A-Za-z]+$/, "What's your first name?"),

  lastName: yup
    .string()
    .required("What's your last name?")
    .min(2, "What's your last name?")
    .max(30, "What's your last name?")
    .matches(/^[A-Za-z]+$/, "What's your last name?"),

  email: yup
    .string()
    .required("Please enter a valid mobile number or email address.")
    .email("Please enter a valid mobile number or email address."),

  password: yup
    .string()
    .required(
      "Enter a combination of at least eight numbers, letters and punctuation marks.",
    )
    .min(
      8,
      "Enter a combination of at least eight numbers, letters and punctuation marks.",
    )
    .matches(
      /[A-Z]/,
      "Enter a combination of at least eight numbers, letters and punctuation marks.",
    )
    .matches(
      /\d/,
      "Enter a combination of at least eight numbers, letters and punctuation marks.",
    ),

  birthday: yup
    .object({
      day: yup.string().required(),
      month: yup.string().required(),
      year: yup.string().required(),
    })
    .test(
      "birthday-complete",
      "Select your birthday. You can change who can see this later.",
      (val) => !!val?.day && !!val?.month && !!val?.year,
    ),

  gender: yup
    .string()
    .required("Please choose a gender. You can change who can see this later."),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;
