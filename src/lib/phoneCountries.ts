import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneCountry = {
  isoCode: CountryCode;
  nameArabic: string;
  dialCode: string;
  flag: string;
};
const regionNames = new Intl.DisplayNames(["ar"], { type: "region" });

export function countryFlag(isoCode: string) {
  return isoCode
    .toUpperCase()
    .replace(/./g, character =>
      String.fromCodePoint(127397 + character.charCodeAt(0))
    );
}

export const PHONE_COUNTRIES: PhoneCountry[] = getCountries()
  .map(isoCode => ({
    isoCode,
    nameArabic: regionNames.of(isoCode) || isoCode,
    dialCode: `+${getCountryCallingCode(isoCode)}`,
    flag: countryFlag(isoCode),
  }))
  .sort((a, b) => a.nameArabic.localeCompare(b.nameArabic, "ar"));

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES.find(
  country => country.isoCode === "YE"
)!;

export function buildInternationalPhone(dialCode: string, localPhone: string) {
  const normalizedLocal = localPhone.replace(/\D/g, "").replace(/^0+/, "");
  return normalizedLocal ? `${dialCode}${normalizedLocal}` : "";
}
