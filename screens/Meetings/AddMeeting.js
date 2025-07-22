import { useNavigation, useRoute } from "@react-navigation/native";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import * as Yup from "yup";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { getAllMeetingFunc } from "../../redux/action";
import { selectUser } from "../../redux/userSlice";
import { addMeeting, updateMeeting } from "../../services/rootApi/meetingApi";
import { myConsole } from "../../hooks/useConsole";
import { addMeetingSchema } from "../../utils/validation";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import CustomText from "../../myComponents/CustomText/CustomText";
import { AntDesign, Feather } from "@expo/vector-icons";
import CustomMapView from "../../myComponents/CustomMapView/CustomMapView";
import CustomGooglePlacesSearch from "../../myComponents/CustomGooglePlacesSearch/CustomGooglePlacesSearch";
import { routeMeeting } from "../../utils/routes";
import { navigateToMapApp } from "../../utils/navigateToMapApp";
import { queryKeyCRM } from "../../utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { useGetLeadById, useGetLeadInAddMeeting } from "../../hooks/useCRMgetQuerry";
import { debounce } from "../../utils/debounce";
import IllusionBox from "../../myComponents/IllusionBoxForUpdate/IllusionBox";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";

const agents = [
  { label: "Ahmed", value: "Ahmed" },
  { label: "Soud", value: "Soud" },
];



const AddMeeting = () => {
  const queryClient = useQueryClient();
  // const { lead, user, allUsers } = useSelector(selectUser);
  // const dispatch = useDispatch();
  const { navigate, goBack } = useNavigation();
  const { params } = useRoute();
  let data = params?.detail;
  const isUpdate = !!data?.productPitch;
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);
  const [isLoading, setLoading] = useState(false);
  // let filteredLead = lead?.filter((el) => user?._id === el?.assign?._id)?.map((x) => {
  //   return { ...x, name: x?.clientName }
  // }).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1);
  // let leadNameToClientName = lead?.map((el) => { return { ...el, name: el?.clientName } }).sort((a, b) => a.name === b.name ? 0 : a.name < b.name ? -1 : 1)
  // const textInput2 = useRef(null);
  const [tempDate, setTempDate] = useState({
    date: '',
    time: ''
  });
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchValue, setSearchValue] = useState("");
  const [isUpdateFrom, setIsUpdateFrom] = useState(data?.lead?._id);
  //react query lead
  const { data: leadList,
    isLoading: loading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useGetLeadInAddMeeting({
    search: debouncedSearch
  })

  const { data: leadDetail, isLoading: loadingLead } = useGetLeadById(data?.lead?._id)


  useEffect(() => {
    setTempDate({
      date: data?.scheduleDate?.date ?? new Date(),
      time: data?.scheduleDate?.time ?? new Date()
    })
  }, [])

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    validationSchema: addMeetingSchema,
    initialValues: {
      lead: data?.lead?._id ?? "",
      productPitch: data?.productPitch ?? "",
      clientAddress: data?.clientAddress ?? "",
      clientCity: data?.clientCity ?? "",
      clientCountry: data?.clientCountry ?? "",
      location: data?.meetings?.length > 0 ? data?.meetings[0]?.location : "",
      remarks: data?.meetings?.length > 0 ? data?.meetings[0]?.remarks : "",
      status: data?.meetings?.length > 0 ? data?.meetings[0]?.status : "",
      agents: data?.agents ?? "",
      scheduleDate: data?.scheduleDate ?? new Date(),



    },
    onSubmit: async (value) => {
      setLoading(true);
      let tempDa = `${tempDate?.date.toString().slice(0, 13)}${tempDate?.time
        .toString()
        .slice(13)}`
      try {
        let sendData = {
          ...values,
          scheduleDate: tempDa,
          self: false,
        };
        if (isUpdate) {
          let res = await updateMeeting({
            id: data?._id,
            data: { ...sendData },
          });
          // myConsole("update", resUpdate?.data)
          // setIsVisible(true);
          // setMessage(resUpdate?.data);
          // await dispatch(getAllMeetingFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeetingById, data?._id]
          })
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeeting]
          });
          goBack();
          // navigate(routeMeeting.AllMeetings);
          popUpConfToast.successMessage(res?.data)
        } else {
          let res = await addMeeting(sendData);
          // myConsole("resAddMeeting", res)
          // await setIsVisible(true);
          // await setMessage(res?.data);
          // await dispatch(getAllMeetingFunc());
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getMeeting]
          });
          popUpConfToast.successMessage(res?.data)
          queryClient.invalidateQueries({
            queryKey: [queryKeyCRM.getDashboardCount]
          });
          goBack();
          // await navigate(routeMeeting.AllMeetings);
        }
      } catch (error) {
        popUpConfToast.errorMessage('Server error')
        // setMessage(error?.response?.data);
        // setIsVisible(false);
      } finally {
        setLoading(false);
      }
    },
  });

  const toggleMapViewModal = (v) => {
    setIsMapModalVisible(!isMapModalVisible);
    // setMapLatLng(v)
  };

  const onEndReach = () => {
    if (hasNextPage && !loading && leadList?.length > 0) {
      fetchNextPage && fetchNextPage()
    }
  }

  const onRefresh = async () => {
    try {
      setRefreshing(true)
      await queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLeadInAddMeeting]
      })
    }
    catch (e) {
      console.log('refreshGetAllLeave', e)
    }
    finally {
      setRefreshing(false)
    }
  }

  const debounceSearch = React.useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };
  return (
    <>
      <Header title={isUpdate ? 'Update Meetings' : "Add Meetings"} />
      <Container  >
        <ScrollViewWithKeyboardAvoid
        >
          <View style={{ padding: 20, paddingBottom: 100 }}>
            <CustomModelMessage
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              message={message ?? 'Meeting is added successfully'}
              onClose={() => {
                setIsVisible(false);
                setMessage(null);
              }}
              onPressBtn={() => navigate("AllMeetings")}
            />

            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}
            >
              Client{" "}
            </Text>

            {!isUpdateFrom ? <DropdownRNE
              arrOfObj={leadList?.map((el) => {
                return {
                  name: el?.clientName || el?.name,
                  _id: el?._id
                }
              }) || []}
              keyValueGetOnSelect="_id"
              keyValueShowInBox="name"
              label="Lead"
              placeholder="Lead..."
              onChange={(a) => setFieldValue("lead", a)}
              containerStyle={{ marginBottom: 15 }}
              onBlur={handleBlur("lead")}
              initialValue={values?.lead}
              isSearch
              maxHeight={300}
              mode="modal"
              //
              onEndReached={onEndReach}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage && <ActivityIndicator
                  size={'small'}
                  color={'#002E6B'}
                />
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onChangeText={(v) => handleSearchChange(v)}
              isLoading={loading}
            /> :
              <IllusionBox
                title="Lead"
                value={leadDetail?.clientName || leadDetail?.name || ''}
                onPress={() => setIsUpdateFrom(false)}
              />
            }

            {errors?.lead && touched?.lead && (
              <Text style={styles.errorText}>{errors?.lead}</Text>
            )}
            <CustomInput
              label="Product Pitch"
              placeholder="Product Pitch"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("productPitch")}
              onBlur={handleBlur("productPitch")}
              value={values?.productPitch}
            />
            {errors.productPitch && touched.productPitch && (
              <Text style={styles.errorText}>{errors.productPitch}</Text>
            )}

            <CustomInput
              label="Client Address"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("clientAddress")}
              onBlur={handleBlur("clientAddress")}
              value={values?.clientAddress}
            />
            {errors.clientAddress && touched.clientAddress && (
              <Text style={styles.errorText}>{errors.clientAddress}</Text>
            )}
            <CustomInput
              label="Client City"
              placeholder="Client City"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("clientCity")}
              value={values?.clientCity}
              onBlur={handleBlur("clientCity")}
            />
            {errors.clientCity && touched.clientCity && (
              <Text style={styles.errorText}>{errors.clientCity}</Text>
            )}

            <CustomInput
              label="Client Country"
              placeholder="Client Country"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("clientCountry")}
              onBlur={handleBlur("clientCountry")}
              value={values?.clientCountry}
            />
            {errors.clientCountry && touched.clientCountry && (
              <Text style={styles.errorText}>{errors.clientCountry}</Text>
            )}

            {/* <CustomInput
              label="Meeting Location"
              placeholder="Meeting Location"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("location")}
              onBlur={handleBlur("location")}
              value={values?.location}
            /> */}
            <View
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <CustomText
                  marginBottom={10}
                  fontSize={16}
                  fontWeight="500"
                >
                  Meeting Location
                </CustomText>
                {values?.coordinates?.lng && <Feather
                  name="map-pin"
                  size={20}
                  color="#2D67C6"
                  style={{ padding: 5 }}
                  onPress={() => navigateToMapApp(values?.coordinates)}
                // onPress={toggleMapViewModal}
                />}
              </View>
              <CustomGooglePlacesSearch
                handleBlur={handleBlur('location')}
                onPress={(data, details) => {
                  setFieldValue('location', data.description)
                  setFieldValue('coordinates', {
                    lat: details?.geometry?.location?.lat,
                    lng: details?.geometry?.location?.lng
                  })
                }}
                defaultValue={values?.location}
              />
              {/* <GooglePlacesAutocomplete
                placeholder="Search meeting location..."
                debounce={500}
                query={{
                  key: `AIzaSyAT8kOHt32jptCSfEC0yvIfPj8X57QPp-4`,
                  language: 'en'
                }}
                onPress={(data, details) => {
                  setFieldValue('location', data.description)
                  setFieldValue('coordinates', {
                    lat: details?.geometry?.location?.lat,
                    lng: details?.geometry?.location?.lng
                  })
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
                autoFocus={false}
                styles={{
                  container: {
                    borderWidth: 0.5,
                    borderRadius: 10,
                    padding: 2,
                    marginBottom: 15
                  }
                }}
                textInputProps={{
                  style: {
                    backgroundColor: 'white',
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                  },
                  onBlur: handleBlur("location"),
                  // value: values?.location,
                }}
              /> */}
            </View>
            {errors.location && touched.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}

            <CustomInput
              label="Remarks"
              placeholder="Remarks"
              containerStyle={{ marginBottom: 15 }}
              onChangeText={handleChange("remarks")}
              onBlur={handleBlur("remarks")}
              value={values?.remarks}
            />
            {errors.remarks && touched.remarks && (
              <Text style={styles.errorText}>{errors.remarks}</Text>
            )}

            <DropdownRNE
              label="Status"
              placeholder="Status"
              containerStyle={{ marginBottom: 15 }}
              arrOfObj={[
                {
                  name: "Meeting Schedule",
                  _id: "schedule",
                  value: "l",
                },
                {
                  name: "Meeting Conducted",
                  _id: "conducted",
                  value: "o",
                },
              ]}
              keyValueShowInBox="name"
              keyValueGetOnSelect="_id"
              onChange={(a) => setFieldValue("status", a)}
              initialValue={values?.status}
            />
            {errors.status && touched.status && (
              <Text style={styles.errorText}>{errors.status}</Text>
            )}
            {/* <DatePickerExpo
              boxContainerStyle={{ marginBottom: 15 }}
              onSelect={(a) => setFieldValue("scheduleDate", a)}
              initialValue={values?.scheduleDate}
              title={"Schedule Date"}
            /> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 5,
              }}
            >
              <DatePickerExpo
                title={"Date"}
                boxContainerStyle={{ marginBottom: 20, width: "47%" }}
                onSelect={(date) => setTempDate(prevState => ({ ...prevState, date }))}
                initialValue={tempDate?.date}
              />
              <DatePickerExpo
                title={"Time"}
                boxContainerStyle={{ marginBottom: 20, width: "47%" }}
                // onSelect={(a) => setFieldValue("time", a)}
                onSelect={(time) => setTempDate(prevState => ({ ...prevState, time }))}
                initialValue={tempDate?.time}
                mode="time"
              />
            </View>
            <DropdownRNE
              isMultiSelect={true}
              keyValueShowInBox="name"
              keyValueGetOnSelect="_id"
              label={"Agents"}
              keyName="agent"
              placeholder={"Select agent"}
              containerStyle={{ marginBottom: 15 }}
              onChange={(a) => setFieldValue("agents", a)}
              initialValue={values?.agents}
              isSearch
              mode="modal"
            />
            {errors.agents && touched.agents && (
              <Text style={styles.errorText}>{errors.agents}</Text>
            )}
            <CustomBtn
              title="Submit"
              onPress={handleSubmit}
              containerStyle={{ margin: 20 }}
              isLoading={isLoading}
            />
          </View>
        </ScrollViewWithKeyboardAvoid>
        <CustomMapView
          isMapModalVisible={isMapModalVisible}
          toggleMapViewModal={toggleMapViewModal}
          mapLatLng={values?.coordinates}
          hasBackdrop={false}
        />
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  inputlable: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  input: {
    marginTop: 10,
    height: 37.5,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    width: "100%",
  },
  errorText: {
    color: "red",
    marginTop: -15,
    marginBottom: 10
  },
});

export default AddMeeting;
