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
}: TMobileInput) => {
  const [number, setNumber] = useState({
    pin: value ? value?.split("-")[0] : "",
    phone: value ? value?.split("-")[1] : "",
  });
  useEffect(() => {
    if (value && value.includes("-")) {
      const [pin, phone] = value.split("-");
      setNumber({ pin, phone });
    }
  }, [value]);
  const handleChangeMobile = (e: string, key: "pin" | "phone") => {
    if (!!e || e === "") {
      setNumber((prev) => {
        return { ...prev, [key]: e };
      });
    }
  };
  useEffect(() => {
    if (onChange && !!number.phone && !!number.phone) {
      onChange(`${number.pin}-${number.phone}`);
    }
  }, [number]);
  //////////////////////////////////////////////
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
          <DropdownRNE
            placeholderStyle={"#a9a9a9"}
            dropdownStyle={{ height: 40, paddingTop: 8, borderRadius: 12 }}
            containerStyle={{
              width: "28%",
            }}
            placeholder="+971"
            arrOfObj={formattedCodes}
            keyValueGetOnSelect="_id"
            // keyValueShowInBox="displayName"
            onChange={(e) => handleChangeMobile(e, "pin")}
            initialValue={number?.pin}
            mode="modal"
            isSearch
            dpWidth={250}
          />
          <CustomInput
            placeholder="Mobile Number"
            containerStyle={{ width: "70%" }}
            onChangeText={(e) => handleChangeMobile(e, "phone")}
            props={{
              keyboardType: "number-pad",
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
                <CustomText>{value}</CustomText>
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
