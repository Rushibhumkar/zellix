import parsePhoneNumber, { CountryCode } from "libphonenumber-js";

export interface SelectedPhoneNumber {
  countryCode: string;
  countryCodeAlphabet?: string;
  number: string;
}

const cleanPhonePart = (value: string) => value.trim().replace(/[^\d+]/g, "");

export const formatSelectedPhoneNumber = ({
  countryCode,
  countryCodeAlphabet,
  number,
}: SelectedPhoneNumber) => {
  const cleanNumber = cleanPhonePart(number);
  if (!cleanNumber) return "";

  let parsedLocalNumber;
  try {
    parsedLocalNumber = countryCodeAlphabet
      ? parsePhoneNumber(cleanNumber, countryCodeAlphabet as CountryCode)
      : undefined;
  } catch {
    parsedLocalNumber = undefined;
  }

  if (parsedLocalNumber?.isValid()) return parsedLocalNumber.number;

  if (cleanNumber.startsWith("+")) return cleanNumber;

  const cleanCountryCode = cleanPhonePart(countryCode);
  const internationalCode = cleanCountryCode.startsWith("+")
    ? cleanCountryCode
    : `+${cleanCountryCode}`;

  return `${internationalCode}${cleanNumber}`;
};

export const isValidPhoneNumber = (value?: string | null) => {
  if (!value) return false;

  try {
    const cleanValue = cleanPhonePart(value);
    const internationalValue = cleanValue.startsWith("+")
      ? cleanValue
      : `+${cleanValue}`;
    return parsePhoneNumber(internationalValue)?.isValid() ?? false;
  } catch {
    return false;
  }
};
