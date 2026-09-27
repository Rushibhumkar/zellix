// Values are persisted by the API; keep aligned with backend and web.
export enum UserRole {
  sup_admin = "sup_admin",
  sub_admin = "sub_admin",
  sr_manager = "sr_manager",
  manager = "manager",
  assistant_manager = "assistant_manager",
  team_lead = "team_lead",
  agent = "agent",
  hr = "hr",
  contentCreator = "contentCreator",
  seo = "seo",
  account = "account",
  collection = "collection",
  front_office = "front_office",
  engineer = "engineer",
  developer = "developer",
  marketing = "marketing",
  office_admin = "office_admin",
  pnl = "pnl",
}
export const USER_ROLES = UserRole;
export const ROLE_LABELS: Record<UserRole, string> = {
  "sup_admin": "Super Admin",
  "sub_admin": "Director",
  "sr_manager": "PNL",
  "manager": "Manager",
  "assistant_manager": "Assistant Manager",
  "team_lead": "Team Lead",
  "agent": "Agent",
  "hr": "HR",
  "contentCreator": "Content Creator",
  "seo": "Digital Marketer",
  "account": "Account",
  "collection": "Collection",
  "front_office": "Front Office",
  "engineer": "Engineer",
  "developer": "Developer",
  "marketing": "Marketing",
  "office_admin": "Office Admin",
  "pnl": "PNL (Legacy)"
};
export const ROLE_VALUES = Object.freeze(Object.values(UserRole));
export const ROLE_OPTIONS = Object.freeze(ROLE_VALUES.map(value => ({ value, label: ROLE_LABELS[value] })));
export const ASSIGNABLE_ROLE_OPTIONS = Object.freeze(ROLE_OPTIONS.filter(({ value }) => value !== UserRole.sup_admin));
export const isValidRole = (role: unknown): role is UserRole => typeof role === "string" && ROLE_VALUES.includes(role as UserRole);
