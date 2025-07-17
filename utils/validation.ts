import * as Yup from "yup";
import { parsePhoneNumber } from "libphonenumber-js";

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid Email Address"),
  password: Yup.string().required("Password is required"),
});

export const ForgetSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email Is Required")
    .email("Invalid Email Address"),
});

export const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Old Password is required"),
  newPassword: Yup.string()
    .min(3, "Password must be at least 3 characters")
    .required("New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your password"),
});

export const AddLeadSchema = Yup.object().shape({
  clientName: Yup.string().required("client is required"),
  mobileNumber: Yup.string().required("mobilenumber is required"),
  EmailAddress: Yup.string().required("Email Address is required"),
  comment: Yup.string().required("comment is required"),
  LeadType: Yup.string().required(" select LeadType"),
  whatsappLink: Yup.string().required("whatsappLink is required"),
  selectManager: Yup.string().required("select Manager"),
  selectAgent: Yup.string().required("select Agent"),
});

export const AddUsersSchema = Yup.object().shape({
  name: Yup.string().required("name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email Address is required"),
  role: Yup.string().required("Role is required"),
});

export const teamLeadSchema = Yup.object().shape({
  name: Yup.string().required("Field is required"),
  // managerId: Yup.string().required("Field is required"),
  srManagerId: Yup.string().required("Field is required"),
  // createdBy: Yup.string().required("Field is required"),
  // teamLeadId: Yup.string(),
  // agents: Yup.array()
});

export const addBookingSchema = Yup.object().shape({
  developer: Yup.string().required("Field is required"),
  relationshipManager: Yup.string().required("Field is required"),
  meeting: Yup.string().required("Field is required"),
  projectName: Yup.string().required("Field is required"),
  unit: Yup.string().required("Field is required"),
  areaSQFT: Yup.number()
    .typeError("Area must be a number")
    .required("Area is required")
    .min(100, "Area must be greater than or equal to 100"),
  total: Yup.number()
    .typeError("Total must be a number")
    .required("Total is required")
    .min(1000, "Total must be greater than or equal to 1000"),
  propertyDetails: Yup.string().required("Field is required"),
  paymentPlan: Yup.string().required("Field is required"),
  paymentMode: Yup.string().required("Field is required"),
  token: Yup.string().required("Field is required"),
  // bookingAmount: Yup.string().required("Field is required"),
  // passback: Yup.string().required("Field is required"),
  // passbackPerc: Yup.string().required("Field is required"),
  commission: Yup.string().required("Field is required"),
  commissionPerc: Yup.string().required("Field is required"),
  clientLoyalty: Yup.string().required("Field is required"),
  clientLoyaltyPerc: Yup.string().required("Field is required"),
  brokerReferral: Yup.string().required("Field is required"),
  brokerReferralPerc: Yup.string().required("Field is required"),
  //  paymentProof: Yup.string().required("Field is required"),
  //  paymentProof2:  Yup.string().required("Field is required"),
});

export const addSingleLeadSchema = Yup.object().shape({
  //srManager: Yup.string().required("Name is Required"),
  type: Yup.string().required("Type is required"),
  name: Yup.string().required("Name is Required"),
  clientName: Yup.string().required("Client Name is Required"),
  clientMobile: Yup.string().required("Mobile is Required"),
  clientEmail: Yup.string()
    .email("Invalid email format")
    .required(" Field required"),
  whatsapp: Yup.string()
    .required("WhatsApp number is required")
    .matches(/^[1-9]\d{5,}$/, "Invalid WhatsApp number")
    .min(6, "WhatsApp number must be at least 6 characters"),
});
export const addSingleLeadWithSrManagerSchema = Yup.object().shape({
  //srManager: Yup.string().required("Name is Required"),
  type: Yup.string().required("Type is required"),
  name: Yup.string().required("Name is Required"),
  clientName: Yup.string().required("Client Name is Required"),
  clientMobile: Yup.string().required("Mobile is Required"),
  srManager: Yup.string().required("Sr Manager is Required"),
  clientEmail: Yup.string()
    .email("Invalid email format")
    .required(" Field required"),
  whatsapp: Yup.string()
    .required("WhatsApp number is required")
    .matches(/^[1-9]\d{5,}$/, "Invalid WhatsApp number")
    .min(6, "WhatsApp number must be at least 6 characters"),
});

export const addLeadInBulk = Yup.object().shape({
  srManager: Yup.string().required("Field required"),
});

export const addMeetingSchema = Yup.object().shape({
  clientAddress: Yup.string().required("Field required"),
  clientCity: Yup.string().required("Field required"),
  clientCountry: Yup.string().required("Field required"),
  location: Yup.string().required("Field required"),
  productPitch: Yup.string().required("Field required"),
  remarks: Yup.string().required("Field required"),
  // scheduleDate: Yup.string().required("Field required"),
  // self: Yup.string().required("Field required"),
  status: Yup.string().required("Field required"),
  lead: Yup.string().required("Field required"),
  agents: Yup.array().of(Yup.string()).required("Field is required"),
});

export const addExpenseSchema = Yup.object().shape({
  expenseCategory: Yup.string().required("Expense Category required"),
  expenseSubCategory: Yup.string().required("Expense Sub Category required"),
  team: Yup.string().required("Team is required"),
  expenseAmount: Yup.number().required("Expense Amount required"),
  vatPercent: Yup.number().required("Vat Percent required"),
  vatAmount: Yup.number().required("Vat Amount required"),
  amountExcludedVat: Yup.number().required("Amount Excluded Vat required"),
  officeName: Yup.string().required("Office Name required"),
  expenseDate: Yup.date().required("Expense Date required"),
  responsiblePerson: Yup.string().required("Responsible Person required"),
  remarks: Yup.string().required("Remark required"), // Allow empty remarks
});

export const addProjectSchema = Yup.object().shape({
  projectName: Yup.string().required("Project Name required"),
  formId: Yup.string().required("Form Id required"),
  pageName: Yup.string().required("Page Name is required"),
  source: Yup.string().required("Source required"),
  srManager: Yup.string().required("Manager required"),
  members: Yup.array().required("Amount Excluded Vat required"),
});

export const emailValidate = () =>
  Yup.string()
    .email("Invalid email format")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Enter a valid email address"
    )
    .required("Required");

export const alphabeticValidation = (
  required: boolean = true,
  minLength: number = 2,
  maxLength: number = 30,
  message: string = "Required"
) => {
  let schema = Yup.string()
    .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed")
    .min(minLength, `Minimum ${minLength} characters required`)
    .max(maxLength, `Maximum ${maxLength} characters allowed`);

  if (required) {
    schema = schema.required(message);
  }

  return schema;
};

export const alphanumericValidation = (
  required: boolean = true,
  minLength: number = 3,
  maxLength: number = 20,
  message: string = "Required"
) => {
  let schema = Yup.string()
    .matches(/^[a-zA-Z0-9\s]+$/, "Only letters, numbers and spaces are allowed")
    .min(minLength, `Minimum ${minLength} characters required`)
    .max(maxLength, `Maximum ${maxLength} characters allowed`);

  if (required) {
    schema = schema.required(message);
  }

  return schema;
};

export const urlReq = (message: string = "Field is required") =>
  Yup.string()
    .matches(
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/\S*)?$/,
      "Please enter a valid URL"
    )
    .required(message);

export const remarkValidate = (
  required: boolean = true,
  minLength: number = 5,
  maxLength: number = 20,
  message: string = "Required"
) => {
  let schema = Yup.string()
    .trim() // removes leading/trailing spaces
    .matches(
      /^[a-zA-Z0-9\s.,'-]+$/,
      "Only letters, numbers, spaces, comma, period, hyphen and apostrophe allowed"
    )
    .min(minLength, `Minimum ${minLength} characters required`)
    .max(maxLength, `Maximum ${maxLength} characters allowed`);

  if (required) {
    schema = schema.required(message);
  }

  return schema;
};
