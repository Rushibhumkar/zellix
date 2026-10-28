const fs = require("fs");
const path = require("path");

const commonFunctions = fs.readFileSync(
  path.join(__dirname, "../utils/commonFunctions.ts"),
  "utf8"
);
const navigation = fs.readFileSync(
  path.join(__dirname, "../navigation/HRManagementStack.tsx"),
  "utf8"
);
const permissionSets = fs.readFileSync(
  path.join(__dirname, "../screensHRM/UsersHRM/RolePermissionSetsHRM.tsx"),
  "utf8"
);

for (const role of ["agent", "team_lead"]) {
  if (!commonFunctions.includes(`"${role}"`)) {
    throw new Error(`Mobile permission guard must include ${role}`);
  }
}

if (!commonFunctions.includes('module === "Recruitment"')) {
  throw new Error("Mobile permission guard must hard-block Recruitment");
}

if (!navigation.includes("isRecruitmentRestricted")) {
  throw new Error("Interview navigation must enforce the restricted roles");
}

for (const permissionCheck of [
  '"HrmsDashboard"',
  '"Users"',
  '"Attendance"',
  '"Leaves"',
]) {
  if (!navigation.includes(permissionCheck)) {
    throw new Error(`HRMS navigation must check ${permissionCheck} permission`);
  }
}

for (const conditionalTab of [
  "canViewDashboard &&",
  "canViewUsers &&",
  "canViewAttendance &&",
  "canViewLeaves &&",
]) {
  if (!navigation.includes(conditionalTab)) {
    throw new Error(`HRMS tab must be conditional: ${conditionalTab}`);
  }
}

if (!permissionSets.includes('moduleName !== "Recruitment"')) {
  throw new Error("Restricted roles must not be offered Recruitment permissions");
}

console.log("Interview role access checks passed");
