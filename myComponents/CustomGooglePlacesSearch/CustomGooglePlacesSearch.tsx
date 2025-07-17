import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import React, { useRef, useEffect } from "react";
import CustomText from "../CustomText/CustomText";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { SPSheet } from "react-native-popup-confirm-toast";
import { color } from "../../const/color";

const dynamicStyles = {
  textInputContainer: {
    width: '100%',
    backgroundColor: 'pink',
  },
  textInput: {
    height: 40,
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: 'red',
    color: 'pink',
    fontSize: 16,
  },
  listView: {
    borderRadius: 5,
    // maxHeight: 600, // Control the height of the dropdown list
    minHeight: 250,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    // marginBottom: 20,
    marginTop: 50
    // position: 'absolute',
    // top: 45,
    // left: 0,
    // right: 0,
    // zIndex: 1000,
  },
  description: {
    color: 'black',
  },
  cancelButton: {
    fontSize: 14,
    color: '#1faadb',
    paddingRight: 10,
  },
};

interface TCustomGooglePlacesSearch {
  onPress: (a: any, b: any) => void;
  handleBlur: () => void;
  defaultValue?: string;
}
const CustomGooglePlacesSearch = ({
  onPress,
  handleBlur,
  defaultValue,
}: TCustomGooglePlacesSearch) => {
  // const keyValue = `AIzaSyAIRlf2yEXRf9ZAM3u4vt3d25XjCt8wU08`;
  const keyValue = `AIzaSyDUjsrrYwsQnZZX6ocF7jQcXevrhoK9ruU`;
  const textInput2 = useRef(null);

  useEffect(() => {
    if (textInput2.current && defaultValue) {
      textInput2.current.setAddressText(defaultValue);
    }
  }, [defaultValue]);

  const chooseLocation = () => {

    const spSheet = SPSheet;
    spSheet.show({
      component: () => <View
        style={{ margin: 20 }}
      >
        <View >
          <GooglePlacesAutocomplete
            placeholder="Search meeting location..."
            debounce={200}
            query={{
              key: keyValue,
              language: "en",
            }}
            keyboardShouldPersistTaps="handled"
            onPress={(data, details) => {
              onPress(data, details);
              spSheet.hide();
              //   setFieldValue('location', data.description)
              //   setFieldValue('coordinates', {
              //     lat: details?.geometry?.location?.lat,
              //     lng: details?.geometry?.location?.lng
              //   })
            }}
            //
            nearbyPlacesAPI="GooglePlacesSearch"
            // currentLocation={true}
            listViewDisplayed="auto"
            minLength={2}
            enablePoweredByContainer={false}
            // currentLocationLabel="Current location"
            fetchDetails={true}
            ref={textInput2}
            disableScroll={true}
            styles={{
              textInputContainer: dynamicStyles.textInputContainer,
              textInput: dynamicStyles.textInput,
              listView: dynamicStyles.listView,
              description: dynamicStyles.description,
            }}
            // autoFocus={false}
            // styles={{
            //   container: {
            //     borderWidth: 0.5,
            //     borderRadius: 10,
            //     padding: 2,
            //     marginBottom: 15,
            //     backgroundColor: 'red'
            //   },
            // }}
            textInputProps={{
              style: {
                backgroundColor: 'white',
                paddingVertical: 5,
                paddingHorizontal: 10,
                height: 40,
                color: 'black',
                fontSize: 15,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                borderRadius: 8,
                borderWidth: 0.5
              },
              // onBlur: handleBlur("location"),
              onBlur: handleBlur,
              // defaultValue: defaultValue,
              // value: values?.location,
            }}

          />
        </View>
      </View>,
      height: 350,
      keyboardHeightAdjustment: true
    });
  }

  return (
    <TouchableOpacity
      style={{ borderWidth: 0.5, minHeight: 38, borderRadius: 10, padding: 10, justifyContent: 'center', marginBottom: 15 }}
      onPress={chooseLocation}
    >
      <CustomText
        color={!defaultValue ? 'gray' : 'black'}
      >{defaultValue || 'Meeting location'}</CustomText>
    </TouchableOpacity>
  );
};

export default CustomGooglePlacesSearch;
