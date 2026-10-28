const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "../screensHRM/Interview/ScheduleInterview.tsx"),
  "utf8"
);

if (!source.includes('referredBy: Yup.string().notRequired()')) {
  throw new Error("Interview referral must remain optional in mobile validation");
}

if (!source.includes('label="Referred By (Optional)"')) {
  throw new Error("Mobile interview form must identify Referred By as optional");
}

if (!source.includes('...(values.referredBy ? { referredBy: values.referredBy } : {})')) {
  throw new Error("Mobile interview payload must omit an empty referral");
}

console.log("Interview Referred By optional checks passed");
