export const roleList = [
  { label: "Sr Manager", value: "sr_manager" },
  { label: "Manager", value: "manager" },
  { label: "Team Lead", value: "team_lead" },
  { label: "Agent", value: "agent" },
];

export const roleListArr = [
  { name: "Sr Manager", _id: "sr_manager" },
  { name: "Manager", _id: "manager" },
  { name: "Assistant Manager", _id: "assistant_manager" },
  { name: "Team Lead", _id: "team_lead" },
  { name: "Agent", _id: "agent" },
];

export const bookingEntryStatusObj = {
  reject_timeout: "Rejected Time Out",
  awaiting_documents: "Awaiting Deposit Documents",
  executed: "Executed",
  awaiting_token_payment: "Awaiting token Payment",
  buyer_confirmation: "Buyer Confirmation",
  spa_signed: "SPA signed by both parties",
  rejected: "Rejected",
};



export const meetingStatus = {
  schedule: "Meeting Scheduled",
  conducted: "Meeting Conducted",
  reschedule: "Meeting Rescheduled",
};

export const userTypes = {
  sup_admin: "Super Admin",
  sub_admin: "Sub Admin",
  sr_manager: "Sr Manager",
  manager: "Manager",
  team_lead: "Team Lead",
  agent: "Agent",
  assistant_manager: "Assistant Manager"
};

export const roleEnum = {
  sr_manager: "sr_manager",
  manager: "manager",
  team_lead: "team_lead",
  agent: "agent",
  sup_admin: "sup_admin",
  sub_admin: "sub_admin",
  assistant_manager: "assistant_manager"
};

export const statusEnum = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

export const leadType = [
  { value: "lead", label: "Lead" },
  { value: "calling_data", label: "Calling Data" },
];

export const leadTypeObj = { lead: "Lead", calling_data: "Calling Data" };

export const status = [
  { value: "assign", label: "Assigned", _id: "assign", name: "Assigned" },
  {
    value: "contacted",
    label: "Contacted",
    _id: "contacted",
    name: "Contacted",
  },
  {
    value: "no_response",
    label: "No Response",
    _id: "no_response",
    name: "No Response",
  },
  {
    value: "active_cold",
    label: "Active Cold",
    _id: "active_cold",
    name: "Active Cold",
  },
  {
    value: "active_hot",
    label: "Active Hot",
    _id: "active_hot",
    name: "Active Hot",
  },
  {
    value: "meeting_scheduled",
    label: "Meeting Scheduled",
    _id: "meeting_scheduled",
    name: "Meeting Scheduled",
  },
  {
    value: "wrong_details",
    label: "Spam/Wrong contact details",
    _id: "wrong_details",
    name: "Spam/Wrong contact details",
  },
  { value: "broker", label: "Broker", _id: "broker", name: "Broker" },
  { value: "Not Able to Connect", label: "Not Able to Connect", _id: "not_able_to_connect", name: "Not Able to Connect" },
  { value: "Follow Up Required", label: "Follow Up Required", _id: "follow_up_required", name: "Follow Up Required" },
  { value: "Disqualified", label: "Disqualified", _id: "disqualified", name: "Disqualified" },
  { value: "Not Interested", label: "Not Interested", _id: "not_interested", name: "Not Interested" },
  { value: "Deal Booked", label: "Deal Booked", _id: "deal_booked", name: "Deal Booked" },
  { value: "Deal Cancelled", label: "Deal Cancelled", _id: "deal_cancelled", name: "Deal Cancelled" },

];

export const statusObj = {
  new: "New",
  assign: "Assigned",
  contacted: "Contacted",
  no_response: "No Response",
  active_cold: "Active Cold",
  active_hot: "Active Hot",
  meeting_scheduled: "Meeting Scheduled",
  wrong_details: "Spam/Wrong contact details",
  broker: "Broker",
  not_interested_buy_later: "Not Interested May Buy Later",
  not_able_to_connect: "Not Able to Connect",
  followUp_required: "Follow Up Required",
  disqualified: "Disqualified",
  not_interested: "Not Interested",
  deal_booked: "Deal Booked",
  deal_cancelled: "Deal Cancelled",
  nr_event: "NR Event",
};

export const developerOptions = [
  { _id: "AKSHARA_DEVELOPERS", name: "AKSHARA DEVELOPERS" },
  { _id: "AL_ANSARI", name: "AL ANSARI" },
  { _id: "AL_HABTOOR", name: "AL HABTOOR" },
  { _id: "AL_SHIRAWI", name: "AL SHIRAWI" },
  { _id: "ALEF_AL_MAMSHA", name: "ALEF -AL MAMSHA" },
  { _id: "ARABIAN_GULF", name: "ARABIAN GULF" },
  { _id: "AYS_DEVELOPERS", name: "AYS DEVELOPERS" },
  { _id: "AZIZI", name: "AZIZI" },
  { _id: "BINGHATTI", name: "BINGHATTI" },
  { _id: "BLOOM", name: "BLOOM" },
  { _id: "DAMAC", name: "DAMAC" },
  { _id: "DANUBE", name: "DANUBE" },
  { _id: "DEYAAR", name: "DEYAAR" },
  { _id: "DI", name: "DI" },
  { _id: "DUBAI_HOLDING", name: "DUBAI HOLDING" },
  { _id: "DUBAI_SOUTH", name: "DUBAI SOUTH" },
  { _id: "DURAR", name: "DURAR" },
  { _id: "ELITE", name: "ELITE" },
  { _id: "EMAAR", name: "EMAAR" },
  { _id: "EQUITI", name: "EQUITI" },
  { _id: "EXPO_CITY", name: "EXPO CITY" },
  { _id: "IGO", name: "IGO (INVEST GROUP OVERSEAS)" },
  { _id: "MARCUS", name: "MARCUS" },
  { _id: "MUDONS", name: "MUDONS" },
  { _id: "MYKA", name: "MYKA" },
  { _id: "MYRA", name: "MYRA" },
  { _id: "NABNI", name: "NABNI" },
  { _id: "NAKHEEL", name: "NAKHEEL" },
  { _id: "NSHAMA", name: "NSHAMA" },
  { _id: "OCTA", name: "OCTA" },
  { _id: "OMNIYAT", name: "OMNIYAT" },
  { _id: "ORO_24", name: "ORO 24" },
  { _id: "PURE_GOLD", name: "PURE GOLD" },
  { _id: "REPORTAGE", name: "REPORTAGE" },
  { _id: "SDS_TOWER", name: "SDS TOWER" },
  { _id: "SHARJAH", name: "SHARJAH" },
  { _id: "SLS", name: "SLS" },
  { _id: "SOBHA", name: "SOBHA" },
  { _id: "TIGER", name: "TIGER" },
  { _id: "TIGER_PROPERTY", name: "TIGER PROPERTY" },
  { _id: "WASL", name: "WASL" },
  { _id: "SELECT_GROUP", name: "SELECT GROUP" },
  { _id: "BNH", name: "BNH" },
  { _id: "MAG", name: "MAG" },
  { _id: "PROFILE", name: "PROFILE" },
  { _id: "EMIRATES_PROPERTIES", name: "EMIRATES PROPERTIES" },
  { _id: "Symbolic", name: "Symbolic" },
  { _id: "Sustainable_City", name: "Sustainable City" },
];

export const inputStatusOptions = [
  { _id: "reject_timeout", name: "Rejected Time Out" },
  { _id: "awaiting_documents", name: "Awaiting Deposit Documents" },
  { _id: "executed", name: "Executed" },
  { _id: "awaiting_token_payment", name: "Awaiting token Payment" },
  { _id: "buyer_confirmation", name: "Buyer Confirmation" },
  { _id: "spa_signed", name: "SPA signed by both parties" },
  { _id: "rejected", name: "Rejected" },
  { _id: "deal_cancelled", name: "Deal Cancelled" },
  { _id: "eoi_picked", name: "EOI Picked" },
  { _id: "partial_dp_complete", name: "Partial DP Completed" },
  { _id: "204complete_spa_pending", name: "20% + 4% Complete SPA Pending" },
  { _id: "eoi_canceled", name: "EOI Cancelled" }
];

export const PaymentStatus = [
  { name: "Pending", _id: "pending" },
  { name: "Received", _id: "received" },
  { name: "Not Received", _id: "not_received" }
];
//BookingStatus, mode of payment,Token,
export const ModeOfPayment = [
  { _id: "cash", name: "Cash" },
  { _id: "cheque", name: "Cheque" },
  { _id: "bank_tranfer", name: "Bank Transfer" },
];

export const tokenInBooking = [
  { _id: true, name: "Paid" },
  { _id: false, name: "UnPaid" },
];

// export const mobileCode = [
//   { _id: "91", name: "+91 (IN)" },
//   { _id: "1", name: "+1 (USA)" },
//   { _id: "44", name: "+44 (UK)" },
//   { _id: "971", name: "+971 (UAE)" },
// ]
export const mobileCode = [
  { code: "1", country: "USA/Canada" },
  { code: "7", country: "Russia/Kazakhstan" },
  { code: "20", country: "Egypt" },
  { code: "27", country: "South Africa" },
  { code: "30", country: "Greece" },
  { code: "31", country: "Netherlands" },
  { code: "32", country: "Belgium" },
  { code: "33", country: "France" },
  { code: "34", country: "Spain" },
  { code: "36", country: "Hungary" },
  { code: "39", country: "Italy" },
  { code: "40", country: "Romania" },
  { code: "41", country: "Switzerland" },
  { code: "43", country: "Austria" },
  { code: "44", country: "United Kingdom" },
  { code: "45", country: "Denmark" },
  { code: "46", country: "Sweden" },
  { code: "47", country: "Norway" },
  { code: "48", country: "Poland" },
  { code: "49", country: "Germany" },
  { code: "51", country: "Peru" },
  { code: "52", country: "Mexico" },
  { code: "53", country: "Cuba" },
  { code: "54", country: "Argentina" },
  { code: "55", country: "Brazil" },
  { code: "56", country: "Chile" },
  { code: "57", country: "Colombia" },
  { code: "58", country: "Venezuela" },
  { code: "60", country: "Malaysia" },
  { code: "61", country: "Australia" },
  { code: "62", country: "Indonesia" },
  { code: "63", country: "Philippines" },
  { code: "64", country: "New Zealand" },
  { code: "65", country: "Singapore" },
  { code: "66", country: "Thailand" },
  { code: "81", country: "Japan" },
  { code: "82", country: "South Korea" },
  { code: "84", country: "Vietnam" },
  { code: "86", country: "China" },
  { code: "90", country: "Turkey" },
  { code: "91", country: "India" },
  { code: "92", country: "Pakistan" },
  { code: "93", country: "Afghanistan" },
  { code: "94", country: "Sri Lanka" },
  { code: "95", country: "Myanmar" },
  { code: "98", country: "Iran" },
  { code: "211", country: "South Sudan" },
  { code: "212", country: "Morocco" },
  { code: "213", country: "Algeria" },
  { code: "216", country: "Tunisia" },
  { code: "218", country: "Libya" },
  { code: "220", country: "Gambia" },
  { code: "221", country: "Senegal" },
  { code: "222", country: "Mauritania" },
  { code: "223", country: "Mali" },
  { code: "224", country: "Guinea" },
  { code: "225", country: "Ivory Coast" },
  { code: "226", country: "Burkina Faso" },
  { code: "227", country: "Niger" },
  { code: "228", country: "Togo" },
  { code: "229", country: "Benin" },
  { code: "230", country: "Mauritius" },
  { code: "231", country: "Liberia" },
  { code: "232", country: "Sierra Leone" },
  { code: "233", country: "Ghana" },
  { code: "234", country: "Nigeria" },
  { code: "235", country: "Chad" },
  { code: "236", country: "Central African Republic" },
  { code: "237", country: "Cameroon" },
  { code: "238", country: "Cape Verde" },
  { code: "239", country: "Sao Tome and Principe" },
  { code: "240", country: "Equatorial Guinea" },
  { code: "241", country: "Gabon" },
  { code: "242", country: "Congo" },
  { code: "243", country: "Democratic Republic of the Congo" },
  { code: "244", country: "Angola" },
  { code: "245", country: "Guinea-Bissau" },
  { code: "246", country: "British Indian Ocean Territory" },
  { code: "248", country: "Seychelles" },
  { code: "249", country: "Sudan" },
  { code: "250", country: "Rwanda" },
  { code: "251", country: "Ethiopia" },
  { code: "252", country: "Somalia" },
  { code: "253", country: "Djibouti" },
  { code: "254", country: "Kenya" },
  { code: "255", country: "Tanzania" },
  { code: "256", country: "Uganda" },
  { code: "257", country: "Burundi" },
  { code: "258", country: "Mozambique" },
  { code: "260", country: "Zambia" },
  { code: "261", country: "Madagascar" },
  { code: "262", country: "Reunion/Mayotte" },
  { code: "263", country: "Zimbabwe" },
  { code: "264", country: "Namibia" },
  { code: "265", country: "Malawi" },
  { code: "266", country: "Lesotho" },
  { code: "267", country: "Botswana" },
  { code: "268", country: "Eswatini" },
  { code: "269", country: "Comoros" },
  { code: "290", country: "Saint Helena" },
  { code: "291", country: "Eritrea" },
  { code: "297", country: "Aruba" },
  { code: "298", country: "Faroe Islands" },
  { code: "299", country: "Greenland" },
  { code: "350", country: "Gibraltar" },
  { code: "351", country: "Portugal" },
  { code: "352", country: "Luxembourg" },
  { code: "353", country: "Ireland" },
  { code: "354", country: "Iceland" },
  { code: "355", country: "Albania" },
  { code: "356", country: "Malta" },
  { code: "357", country: "Cyprus" },
  { code: "358", country: "Finland" },
  { code: "359", country: "Bulgaria" },
  { code: "370", country: "Lithuania" },
  { code: "371", country: "Latvia" },
  { code: "372", country: "Estonia" },
  { code: "373", country: "Moldova" },
  { code: "374", country: "Armenia" },
  { code: "375", country: "Belarus" },
  { code: "376", country: "Andorra" },
  { code: "377", country: "Monaco" },
  { code: "378", country: "San Marino" },
  { code: "380", country: "Ukraine" },
  { code: "381", country: "Serbia" },
  { code: "382", country: "Montenegro" },
  { code: "383", country: "Kosovo" },
  { code: "385", country: "Croatia" },
  { code: "386", country: "Slovenia" },
  { code: "387", country: "Bosnia and Herzegovina" },
  { code: "389", country: "North Macedonia" },
  { code: "420", country: "Czech Republic" },
  { code: "421", country: "Slovakia" },
  { code: "423", country: "Liechtenstein" },
  { code: "973", country: "Bahrain" },
  { code: "965", country: "Kuwait" },
  { code: "968", country: "Oman" },
  { code: "974", country: "Qatar" },
  { code: "966", country: "Saudi Arabia" },
  { code: "971", country: "United Arab Emirates" },
  // Add more as needed for additional countries.
]

export const mobileCodeWithIdKey = mobileCode?.map((el) => {
  return { ...el, _id: `${el?.code}`, name: `+ ${el?.code} ${el?.country}` }
})



export const inBookingStatus = [
  { _id: "approved", name: "Approved" },
  { _id: "pending", name: "Pending" },
  { _id: "rejected", name: "Rejected" },
]

export const inMeetingStatus = [
  {
    name: "Schedule",
    _id: "schedule"
  },
  {
    name: "Conducted",
    _id: "conducted"
  },
  {
    name: "Reschedule",
    _id: "reschedule"
  },
]

export const inLeadStatus = [
  { _id: "assign", name: "Assigned" },
  // { _id: "contacted", name: "Contacted" },
  { _id: "claimed", name: "Claimed" },
  { _id: "lost", name: "Lost" },
  { _id: "no_response", name: "No Response" },
  { _id: "active_cold", name: "Active Cold" },
  { _id: "active_hot", name: "Active Hot" },
  { _id: "meeting_scheduled", name: "Meeting Scheduled" },
  { _id: "wrong_details", name: "Spam/Wrong contact details" },
  { _id: "broker", name: "Broker" },
  { _id: "not_interested_buy_later", name: "Not Interested May Buy Later" },
  { _id: "not_able_to_connect", name: "Not Able to Connect" },
  { _id: "followUp_required", name: "Follow Up Required" },
  { _id: "disqualified", name: "Disqualified" },
  { _id: "not_interested", name: "Not Interested" },
  { _id: "deal_booked", name: "Deal Booked" },
  { _id: "deal_cancelled", name: "Deal Cancelled" },
  { _id: "nr_event", name: "NR Event" },
];

export const leadTypeInAS = [
  { _id: "lead", name: "Lead" },
  { _id: "calling_data", name: "Calling Data" },
];

export const monthsStatic = [
  "Jan", "Feb", "Mar", "Apr", "May", "June", "July",
  "Aug", "Sept", "Oct", "Nov", "Dec"
]



export const summaryList = [
  { value: "confirm_business", name: "Confirmed Business" },
  { value: "eoi_canceled", name: "EOI Cancelled" },
  { value: "eoi", name: "Expression of Interest" },
  { value: "cancel_business", name: "Cancel Business" },
];




export const confirmedBusinessList = [
  { value: "total", name: "Sum of Value of Property" },
  { value: "commission", name: "Sum of Gross Revenue" },
  { value: "clientLoyalty", name: "Sum of Client Loyalty" },
  { value: "brokerReferral", name: "Sum of Broker" },
  { value: "netCommission", name: "Sum of Net Revenue" },
];

export const ExpressionOfInterestList = [
  { value: "total", name: "Sum of Value of Property" },
  { value: "commission", name: "Sum of Gross Revenue" },
  { value: "clientLoyalty", name: "Sum of Client Loyalty" },
  { value: "brokerReferral", name: "Sum of Broker" },
  { value: "netCommission", name: "Sum of Net Revenue" },
];



