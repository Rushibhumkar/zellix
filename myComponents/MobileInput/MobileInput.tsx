import React, { useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { mobileCodeWithIdKey } from "../../utils/data";
import CustomInput from "../CustomInput/CustomInput";
import CustomText from "../CustomText/CustomText";
import DropdownRNE from "../DropdownRNE/DropdownRNE";
import { color } from "../../const/color";

interface TMobileInput {
  onChange: (a: TPhone) => void;
  value: string;
  error?: any;
  isCountryPicker: boolean;
  onBlur: () => void;
  customStyle?: StyleProp<ViewStyle>;
  countryCodeDisabled?: boolean;
  mobileNumberDisabled?: boolean;
  hideCountryPicker?: boolean;
}

interface TOnSelect {
  country?: Country;
  numb?: string;
}

interface TPhone {
  number: string;
  countryCode: string;
  countryCodeAlphabet: CountryCode;
}

const MobileInput = ({
  onChange,
  value,
  error,
  isCountryPicker = false,
  onBlur,
  customStyle,
  countryCodeDisabled = false,
  mobileNumberDisabled = false,
  hideCountryPicker = false,
}: TMobileInput) => {
  const [number, setNumber] = useState({
    pin: value ? value?.split("-")[0] : "",
    phone: value ? value?.split("-")[1] : "",
  });
  useEffect(() => {
    if (!value) {
      setNumber({
        pin: "",
        phone: "",
      });
      return;
    }

    if (value.includes("-")) {
      const [pin, phone] = value.split("-");
      setNumber({ pin, phone });
    } else {
      setNumber({
        pin: "",
        phone: value,
      });
    }
  }, [value]);

  useEffect(() => {
    if (!number.pin) {
      setNumber((prev) => ({
        ...prev,
        pin: "971",
      }));
    }
  }, []);

  const handleChangeMobile = (e: string, key: "pin" | "phone") => {
    if (!!e || e === "") {
      setNumber((prev) => {
        return { ...prev, [key]: e };
      });
    }
  };
  // useEffect(() => {
  //   if (onChange && !!number.phone && !!number.phone) {
  //     onChange(`${number.pin}-${number.phone}`);
  //   }
  // }, [number]);

  useEffect(() => {
    if (!number.phone) return;

    onChange?.(number.pin ? `${number.pin}-${number.phone}` : number.phone);
  }, [number.pin, number.phone]);

  const [phone, setPhone] = useState<TPhone>({
    number: "",
    countryCode: "+971",
    countryCodeAlphabet: "AE",
  });
  const [isInitial, setIsInitial] = useState(!value ? false : true);
  const onSelect = ({ country, numb }: TOnSelect) => {
    //country code in alphabet because country picker need
    if (!!country?.cca2) {
      setPhone((prev) => {
        let temp = {
          ...prev,
          countryCode: `+${country.callingCode}`,
          countryCodeAlphabet: country.cca2,
        };
        !!onChange && onChange(temp);
        return temp;
      });
    }
    if (!!numb || numb === "") {
      setPhone((prev) => {
        let temp = {
          ...prev,
          number: numb?.trim(),
        };
        !!onChange && onChange(temp);
        return temp;
      });
    }
  };

  const pressForEdit = () => {
    setIsInitial(!isInitial);
  };

  const formattedCodes = mobileCodeWithIdKey.map((item) => ({
    ...item,
    displayName: `+${item.code} ${item.country}`,
  }));

  return (
    <>
      {!isCountryPicker && (
        <View
          style={[
            {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
              marginBottom: 15,
            },
            customStyle,
          ]}
        >
          {!hideCountryPicker && (
            <DropdownRNE
              disabled={countryCodeDisabled}
              placeholderStyle={"#a9a9a9"}
              containerStyle={{
                width: "28%",
                opacity: mobileNumberDisabled ? 0.5 : 1,
              }}
              dropdownStyle={{ height: 40, paddingTop: 8, borderRadius: 12 }}
              placeholder="+971"
              arrOfObj={formattedCodes}
              keyValueGetOnSelect="code"
              // keyValueShowInBox="displayName"
              onChange={(e) => handleChangeMobile(e, "pin")}
              initialValue={number?.pin || "971"}
              mode="modal"
              isSearch
              dpWidth={250}
            />
          )}
          <CustomInput
            placeholder="Mobile Number"
            containerStyle={{
              width: hideCountryPicker ? "100%" : "70%",
              opacity: mobileNumberDisabled ? 0.5 : 1,
            }}
            onChangeText={(e) => handleChangeMobile(e, "phone")}
            props={{
              keyboardType: "number-pad",
              editable: !mobileNumberDisabled,
            }}
            value={number?.phone}
          />
        </View>
      )}
      {isCountryPicker && (
        <>
          <View
            style={{
              borderWidth: 1.8,
              borderRadius: 14,
              paddingHorizontal: 5,
              ...(!error && { marginBottom: 10 }),
              marginTop: 5,
              borderColor: "#739fe141",
            }}
          >
            {!isInitial && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <CountryPicker
                  countryCode={phone.countryCodeAlphabet}
                  withCallingCodeButton
                  onSelect={(v) => onSelect({ country: v })}
                  withFilter
                  withAlphaFilter
                  withCallingCode
                  withCloseButton
                  theme={{
                    primaryColor: color.mainTxtColor,
                    onBackgroundTextColor: color.mainTxtColor,
                  }}
                />
                <TextInput
                  onChangeText={(v) => onSelect({ numb: v })}
                  value={phone?.number}
                  keyboardType="number-pad"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    paddingHorizontal: 10,
                    color: color.mainTxtColor,
                  }}
                  onBlur={onBlur}
                />
              </View>
            )}
            {isInitial && (
              <TouchableOpacity
                onPress={pressForEdit}
                style={{
                  height: 35,
                  justifyContent: "center",
                  paddingHorizontal: 5,
                }}
              >
                <CustomText style={{ color: color.mainTxtColor }}>
                  {value}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
          {error && (
            <CustomText marginBottom={10} color={"red"} fontSize={12}>
              {error}
            </CustomText>
          )}
        </>
      )}
    </>
  );
};

export default MobileInput;

const styles = StyleSheet.create({});
