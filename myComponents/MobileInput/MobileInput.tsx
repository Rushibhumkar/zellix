import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { mobileCode, mobileCodeWithIdKey } from "../../utils/data";
import CustomInput from "../CustomInput/CustomInput";
import CustomText from "../CustomText/CustomText";
import DropdownRNE from "../DropdownRNE/DropdownRNE";

interface TMobileInput {
  onChange: (a: TPhone) => void;
  value: string;
  error?: any;
  isCountryPicker: boolean;
  onBlur: () => void;
}

interface TOnSelect {
  country?: Country,
  numb?: string
}

interface TPhone {
  number: string;
  countryCode: string;
  countryCodeAlphabet: CountryCode
}

const MobileInput = ({
  onChange,
  value,
  error,
  isCountryPicker = false,
  onBlur,
}: TMobileInput) => {
  const [number, setNumber] = useState({
    pin: value ? value?.split('-')[0] : "",
    phone: value ? value?.split('-')[1] : "",
  });
  const handleChangeMobile = (e: string, key: "pin" | "phone") => {
    if (!!e || e === '') {
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
    number: '',
    countryCode: '+91',
    countryCodeAlphabet: 'IN'
  });
  const [isInitial, setIsInitial] = useState(!value ? false : true);
  const onSelect = ({
    country,
    numb
  }: TOnSelect) => {
    //country code in alphabet because country picker need
    if (!!country?.cca2) {
      setPhone((prev) => {
        let temp = {
          ...prev,
          countryCode: `+${country.callingCode}`,
          countryCodeAlphabet: country.cca2
        }
        !!onChange && onChange(temp)
        return temp
      })
    }
    if ((!!numb || numb === '')) {
      setPhone((prev) => {
        let temp = {
          ...prev,
          number: numb?.trim()
        }
        !!onChange && onChange(temp)
        return temp
      })
    }
  }

  const pressForEdit = () => {
    setIsInitial(!isInitial)
  }


  return (
    <>
      {!isCountryPicker && <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: 'center',
          marginTop: 8,
          marginBottom: 15
        }}
      >
        <DropdownRNE
          placeholderStyle={"#a9a9a9"}
          dropdownStyle={{ height: 30 }}
          containerStyle={{ width: "38%" }}
          placeholder="+91"
          arrOfObj={mobileCodeWithIdKey}
          keyValueGetOnSelect="_id"
          keyValueShowInBox="name"
          onChange={(e) => handleChangeMobile(e, "pin")}
          initialValue={number?.pin}
          mode="modal"
          isSearch
          dpWidth={250}
        />
        <CustomInput
          placeholder="Mobile Number"
          containerStyle={{ width: "60%" }}
          onChangeText={(e) => handleChangeMobile(e, "phone")}
          props={{
            keyboardType: "number-pad",
          }}
          value={number?.phone}
        />
      </View>}
      {isCountryPicker && <>
        <View
          style={{
            borderWidth: 0.5,
            borderRadius: 8,
            paddingHorizontal: 5,
            ...(!error && { marginBottom: 10 }),
            marginTop: 5
          }}
        >
          {!isInitial && <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: 'center'
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
            />
            <TextInput
              onChangeText={(v) => onSelect({ numb: v })}
              value={phone?.number}
              style={{
                flex: 1,
                fontSize: 16,
                paddingHorizontal: 10
              }}
              onBlur={onBlur}
            />
          </View>}
          {isInitial &&
            <TouchableOpacity
              onPress={pressForEdit}
              style={{ height: 35, justifyContent: 'center', paddingHorizontal: 5 }}
            >
              <CustomText>{value}</CustomText>
            </TouchableOpacity>
          }
        </View>
        {error && <CustomText
          marginBottom={10}
          color={'red'}
        >
          {error}
        </CustomText>}
      </>}

    </>
  );
};

export default MobileInput;

const styles = StyleSheet.create({});
