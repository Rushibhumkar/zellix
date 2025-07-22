import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,

} from "react-native";
import ModalWithBlur from "../../myComponentsHRM/ModalWithBlur/ModalWithBlur";
import { useDispatch, useSelector } from "react-redux";
import EditIcon from "../../assets/svg/EditIcon";
import Header from "../../components/Header";
import { myConsole } from "../../hooks/useConsole";
import { useGetLeadById, useGetMeeting } from "../../hooks/useCRMgetQuerry";
import useModal from "../../hooks/useModal";
import Container from "../../myComponents/Container/Container";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomModelMessage from "../../myComponents/CustomModelMessage";
import CustomText from "../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import RowItem from "../../myComponents/RowItem/RowItem";
import { selectUser, setCallDetect } from "../../redux/userSlice";
import { leadStatusUpdate, useLatestMeetings } from "../../services/rootApi/leadApi";
import {
  inLeadStatus,
  leadTypeObj,
  roleEnum,
  statusObj,
  userTypes,
} from "../../utils/data";
import { queryKeyCRM } from "../../utils/queryKeys";
import { routeLead, routeMeeting } from "../../utils/routes";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import AddNote from "./component/AddNote";
import NotesCard from "./component/NotesCard";
import LeadUserInfo from "./component/LeadUserInfo";
import LeadLogsInfo from "./component/LeadLogsInfo";
import TabButton from "./component/TabButton";
import MeetingInfo from "./component/MeetingInfo";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import DatePickerExpo from "../../myComponents/DatePickerExpo/DatePickerExpo";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import CancelIcon from "../../assets/svg/CancelIcon";
import {sendFollowUpNotification} from '../../services/rootApi/notificationApi'
import { checkPermission } from "../../utils/commonFunctions";
import {useGetUserPermission} from '../../services/rootApi/permissionApi'
import { color } from "../../const/color";

const extractStringObj = (input) => {
  const parsedInput = JSON.parse(input);
  const result = {};
  for (let key in parsedInput) {
    if (parsedInput?.hasOwnProperty(key)) {
      const keyVal = key
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/[^\w\s]/g, "") // Remove non-word characters (like periods)
        .trim(); // Trim any extra spaces

      // Add the transformed key-value pair to the result object
      result[keyVal] = parsedInput[key];
    }
  }
  return result;
};

const formatDateTime = (date, time) => {
  let d = moment(date).format('DD/MM/YYYY') || 'N/A';
  let h = moment(time).format('hh:mm A') || 'N/A';
  return `${d}, ${h}`
};

const combineDateAndTime = (dateStr, timeStr) => {
  return moment.utc({
    year: moment.utc(dateStr).year(),
    month: moment.utc(dateStr).month(),         // 0-indexed (0 = January)
    date: moment.utc(dateStr).date(),
    hour: moment.utc(timeStr).hour(),
    minute: moment.utc(timeStr).minute(),
    second: moment.utc(timeStr).second(),
    millisecond: moment.utc(timeStr).millisecond(),
  }).toISOString();
};

const LeadsDetails = () => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation();
  const { user, lead } = useSelector(selectUser);
  const isSubSupSrMng =
    user?.role === roleEnum?.sub_admin ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sr_manager;
  const { params } = useRoute();


  const modalNote = useModal();
  const [activeTab, setActiveTab] = useState(1);
  // let detail = params?.item;
  // let detail = {};
  let details = params?.item;
  //detail nam se state btao waha leadDetailById ka data save kro ##start
  // const { data: detail, isLoading: isLoadingQuery } = useGetLeadDetail(params?.item?._id);
  const {
    data: detail,
    isLoading: isLoadingQuery,
    refetch: refetchLeadDetail,
  } = useGetLeadById(params?.item?._id);
  const useLatest = useLatestMeetings(params?.item?._id);
  // myConsole('params?.item', params?.item)
  //##end

  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(false);

  //
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  useEffect(() => {
    setFields({
      comments: detail?.comments ?? "",
      status: detail?.status ?? "",
      statusInfo: detail?.statusInfo ?? "",
    });
  }, [detail]);
  const [isMailAvail, setIsMailAvail] = useState(false);
  const isAdminOrAssigne =
    user?.role === "sup_admin" ||
    user?.role === "sub_admin" ||
    details?.assign?._id === user?._id;

  const [noteUpdate, setNoteUpdate] = useState();
 
  const [tdForFUT, setTdForFUT] = useState({
    date: new Date(),
    time: new Date()
  });

  const FUTModal = useModal();

  //
  const isLeadEdit =
    (user?.role === roleEnum?.sup_admin ||
      user?.role === roleEnum?.sub_admin) &&
    detail?._id;

  const handleConvertToMeeting = () => {
    navigate(routeMeeting.MeetingsNavigator, {
      params: {
        detail: {
          lead: {
            _id: details?._id,
          },
        },
      },
      screen: routeMeeting.AddMeeting,
      initial: false,
    });
  };

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    try {
      let validate = () => {
        for (const key in fields) {
          if (fields.hasOwnProperty(key)) {
            if (!fields[key]) {
              return false;
            }
          }
        }
        return true;
      };
      if (true) {
        let sendData = {
          ...(fields.comments && { comments: fields.comments }),
          ...(fields.status && { status: fields.status }),
          ...(fields.statusInfo && { statusInfo: fields.statusInfo }),
          ...(fields.status === 'followUp_required' && { followUpTime: combineDateAndTime(tdForFUT.date, tdForFUT.time) })
        };

        let res = await leadStatusUpdate({
          id: detail?._id,
          data: sendData,
        });

        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLeadDetailById, detail?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLead],
        });
        popUpConfToast.successMessage(res);

        // await dispatch(getAllLeadFunc());
        // setIsVisible(true);
        // setMessage(res?.data);
        // navigate(routeLead.allLead);
      }
    } catch (err) {
      myConsole("err in leadStatusUpdate", err);
      popUpConfToast.errorMessage(err?.response?.data ?? "Server error");
    } finally {
      setIsLoading(false);
      FUTModal.closeModal();
    }
  };
  const onChange = (key, value) => {
    setFields((prev) => {
      return { ...prev, [key]: value };
    });
  };
  const openMail = (mailAddress) => {
    MailComposer.composeAsync({
      recipients: [`${mailAddress}`],
    });
  };

  useEffect(() => {
    async function checkAvailabilityMail() {
      let isMailAvailTemp = await MailComposer.isAvailableAsync();
      setIsMailAvail(isMailAvailTemp);
    }
    checkAvailabilityMail();
  }, []);

  const navToCall = async () => {
    await dispatch(
      setCallDetect({
        isCall: true,
        leadId: detail?._id,
      })
    );
    await Linking.openURL(`tel:+${detail?.clientMobile}`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetchLeadDetail();
    setRefreshing(false);
  };

  const deleteNotes = async (notesId) => {

    try {
      setIsLoadingDelete(notesId);
      await axiosInstance.delete(`api/notes/${detail?._id}/${notesId}`)
      refetchLeadDetail()
    }
    catch {
      setIsLoadingDelete('')
    }
    finally {
      setIsLoadingDelete('')
    }
  }

  useEffect(() => {
    if (!!detail?.statusChangedAt) {
      setTdForFUT({
        date: detail?.followUpTime || new Date(),
        time: detail?.followUpTime || new Date()
      })
    }
  }, [detail?.statusChangedAt])
  const [notiMsg, setNotiMsg] = useState('');
 const [showNotiPopup, setShowNotiPopup] = useState(false)
 const [isNotificationLoading, setIsNotificationLoading] = useState(false);
const handleSubmit = async () => {
  try {
    if (!notiMsg.trim()) {
      popUpConfToast.errorMessage('Please enter a message.');
      return;
    }

    setIsNotificationLoading(true);

    let payload = {
      leadId: detail?._id,
      message: notiMsg
    };

    let res = await sendFollowUpNotification(payload);
    popUpConfToast.successMessage('Notification sent successfully!');
    setNotiMsg('');
    setShowNotiPopup(false);

        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLeadDetailById, detail?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeyCRM.getLead],
        });
  } catch (err) {
    popUpConfToast.errorMessage(err?.response?.data ?? 'Failed to send notification');
  } finally {
    setIsNotificationLoading(false);
  }
};
 const { data: permission = {} } = useGetUserPermission(user?._id);

    const canEditLead = checkPermission(
      permission,
      "Leads",
      "edit",
      user?.role
    );
myConsole('canEditLead',canEditLead)
  return (
    <>
      {activeTab === 1 && (
        <Container>
          <CustomModelMessage
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            message={message}
            onClose={() => {
              setIsVisible(false);
              setMessage(null);
            }}
          />
          <Header title={"Lead Details"} onBack={() => navigate(routeLead.allLead)} />
          {isSubSupSrMng && (
            <TabButton activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
         <ModalWithBlur visible={showNotiPopup} onClose={() => setShowNotiPopup(false)}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Send follow up notification</Text>
        <TouchableOpacity style={{position:'absolute',top:0,right:-16,marginTop:4}} onPress={()=>setShowNotiPopup(false)}>
<CancelIcon/>
</TouchableOpacity>
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
value={notiMsg}
onChangeText={setNotiMsg}
placeholderTextColor={'grey'}
          placeholder="Enter your message"
        />

<TouchableOpacity 
  style={styles.button} 
  onPress={handleSubmit}
  disabled={isNotificationLoading}
>
  {isNotificationLoading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={styles.buttonText}>Submit</Text>
  )}
</TouchableOpacity>

      </View>
    </ModalWithBlur>
          <ScrollView
            style={{ padding: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <TouchableOpacity style={{alignSelf:'flex-end',backgroundColor:'#BFBFBF',paddingHorizontal:16,paddingVertical:6,borderRadius:8,marginBottom:12}} activeOpacity={0.6} onPress={() => setShowNotiPopup(true)}
>
              <CustomText>Send Follow Up Notification</CustomText>
            </TouchableOpacity>
            <View style={{ paddingBottom: 150 }}>
              {isLoadingQuery && <ActivityIndicator />}
              <MainTitle
                title="Client Details"
                containerStyle={{ marginBottom: 20 }}
                icon={
                  <TouchableOpacity>
                    {isLeadEdit && canEditLead && (
                      <Pressable
                        onPress={() => navigate(routeLead.AddLeads, { detail })}
                        style={{ padding: 5, paddingRight: 0 }}
                      >
                        <EditIcon />
                      </Pressable>
                    )}
                    {user?._id === detail?.assign?._id && (
                      <CustomBtn
                        title="Convert to Meeting"
                        //isLoading={isLoadingMeeting}
                        textStyle={{ fontSize: 12, color: "black" }}
                        onPress={handleConvertToMeeting}
                        containerStyle={{
                          backgroundColor: "rgb(191, 191, 191)",
                        }}
                      />
                    )}
                  </TouchableOpacity>
                }
              />
              <RowItem
                title="Source"
                value={detail?.name}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Client Name"
                value={detail?.clientName}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Mobile Number"
                containerStyle={{ marginBottom: 10 }}
                component={
                  detail?.clientMobile ? (
                    <TouchableOpacity
                      // onPress={() => Linking.openURL(`tel:${detail?.clientMobile}`)}
                      onPress={() => navToCall()}
                    >
                      <CustomText>{detail?.clientMobile}</CustomText>
                    </TouchableOpacity>
                  ) : (
                    <CustomText>{"N/A"}</CustomText>
                  )
                }
              />
              <RowItem
                title="Email Address"
                value={detail?.clientEmail}
                containerStyle={{ marginBottom: 10 }}
                component={
                  detail?.clientEmail ? (
                    <TouchableOpacity
                      onPress={() =>
                        isMailAvail ? openMail(detail?.clientEmail) : null
                      }
                    >
                      <Text numberOfLines={1}>{detail?.clientEmail}</Text>
                    </TouchableOpacity>
                  ) : (
                    <CustomText>{"N/A"}</CustomText>
                  )
                }
              />
              <RowItem
                title="WhatsApp Link"
                value=""
                containerStyle={{ marginBottom: 10 }}
                icon={detail?.whatsapp ? "whatsapp" : "n/a"}
                onPressIcon={() =>
                  detail?.whatsapp
                    ? Linking.openURL(`${detail?.whatsapp}`)
                    : null
                }
              />
              <RowItem
                title="Type"
                value={leadTypeObj[detail?.type]}
                containerStyle={{ marginBottom: 10 }}
              />

              <RowItem
                title="Status"
                containerStyle={{ marginBottom: 10 }}
                component={
                  isAdminOrAssigne ? (
                    <DropdownRNE
                      placeholder=" "
                      arrOfObj={inLeadStatus}
                      keyValueGetOnSelect="_id"
                      keyValueShowInBox="name"
                      initialValue={fields?.status}
                      onChange={(v) => onChange("status", v)}
                      mode="auto"
                    />
                  ) : (
                    <Text>{statusObj[detail?.status]}</Text>
                  )
                }
              />
              {fields?.status === 'followUp_required' &&
                <RowItem
                  title="Follow Up Time"
                  component={
                    <View
                      style={{
                        flexDirection: 'row'
                      }}
                    >
                      <TouchableOpacity
                        onPress={FUTModal.openModal}
                      >
                        <CustomText>
                          {detail?.status !== 'followUp_required' ? 'Click for Date and Time'
                            :
                            formatDateTime(tdForFUT.date, tdForFUT.time)}</CustomText>
                      </TouchableOpacity>
                    </View>
                  }
                />}
              {/* <RowItem
            title="Status Information"
            value=""
            containerStyle={{ marginBottom: 10 }}
            component={sta
              isAdminOrAssigne ? (
                <CustomInput
                  placeholder=" "
                  value={fields.statusInfo}
                  onChangeText={(v) => onChange("statusInfo", v)}
                  props={{
                    multiline: true,
                  }}
                  inputStyle={{ height: 100 }}
                />
              ) : (
                <Text>{detail?.statusInfo}</Text>
              )
            }
          /> */}
              <RowItem
                title="Comments"
                value=""
                containerStyle={{ marginBottom: 10 }}
                component={
                  true ? (
                    <CustomInput
                      placeholder=" "
                      value={fields.comments}
                      onChangeText={(v) => onChange("comments", v)}
                      props={{
                        multiline: true,
                        textAlignVertical: 'top',
                        editable: false
                      }}
                      inputStyle={{ height: 100 }}
                    />
                  ) : (
                    <Text>{fields?.comments}</Text>
                  )
                }
              />
              <RowItem
                title="Assigned To"
                value={detail?.assign?.name}
                containerStyle={{ marginBottom: 10 }}
              />
              <RowItem
                title="Role"
                value={userTypes[detail?.assign?.role]}
                containerStyle={{ marginBottom: 30 }}
              />
              {isAdminOrAssigne && (
                <CustomBtn
                  title="Submit"
                  containerStyle={{ marginBottom: 20, width: 100, alignSelf: 'flex-end' }}
                  onPress={handleStatusUpdate}
                  isLoading={isLoading}
                  textStyle={{ fontSize: 14 }}
                />
              )}
              {/* notes */}
              <MainTitle
                title="Notes"
                containerStyle={{ marginBottom: 20 }}
                icon={
                  <TouchableOpacity onPress={() => {
                    setNoteUpdate({})
                    modalNote.openModal()
                  }}>
                    <EditIcon />
                  </TouchableOpacity>
                }
              />
              <NotesCard
                noteArr={detail?.notes}
                onEdit={(v) => {
                  setNoteUpdate(v)
                  modalNote.openModal()
                }}
                onDelete={(i) => { deleteNotes(i) }}
                isLoadingDelete={isLoadingDelete}
              />
              {!!detail?.additionalQuestions &&
                Object.entries(
                  extractStringObj(detail?.additionalQuestions)
                ).map(([key, value], index) => {
                  return (
                    <RowItem
                      key={index}
                      title={key}
                      value={value}
                      containerStyle={{ marginBottom: 10 }}
                    />
                  );
                })}
              <MainTitle
                title="Call logs"
                containerStyle={{ marginBottom: 20 }}
              />

              {detail?.callLogs?.length > 0 &&
                detail?.callLogs?.map((el, i) => {
                  const duration = moment.duration(el?.duration, "seconds");
                  return (
                    <RowItem
                      key={el?._id || i}
                      title={`Call Info ${i + 1}`}
                      value={`${duration.hours()}:${duration.minutes()}:${duration.seconds()} , ${moment(
                        el?.callTime
                      ).format("MM-DD-YYYY HH:mm")}`}
                      containerStyle={{ marginBottom: 10 }}
                    />
                  );
                })}
              {/* {isAdminOrAssigne && (
                <CustomBtn
                  title="Submit"
                  containerStyle={{ margin: 20 }}
                  onPress={handleStatusUpdate}
                  isLoading={isLoading}
                />
              )} */}
            </View>
          </ScrollView>
          {isAdminOrAssigne && (
            <AddNote
              modal={modalNote}
              leadID={detail?._id}
              refetch={refetchLeadDetail}
              notesId={noteUpdate?.id}
              remark={noteUpdate?.note}
            />
          )}
        </Container>
      )}
      {activeTab === 2 && (
        <LeadUserInfo
          leadId={detail?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      {activeTab === 3 && (
        <LeadLogsInfo
          leadId={detail?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      {activeTab === 4 && (
        <MeetingInfo
          leadId={params?.item?._id}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      <CustomModal
        visible={FUTModal.visible}
        onClose={FUTModal.closeModal}
        hasBackdrop
      >
        <View style={{ backgroundColor: 'white', width: 300, padding: 20, borderRadius: 10 }}>
          {/* <CustomText
            fontSize={17}
            fontWeight="600"
          >Select Time and Date</CustomText> */}
          <MainTitle
            title="Select Date and Time"
          />
          <View style={{ height: 15 }} />
          <DatePickerExpo
            title="Date"
            boxContainerStyle={{ marginBottom: 15 }}
            onSelect={(v) => {
              setTdForFUT((prev) => {
                return { ...prev, date: v }
              })
            }}
            initialValue={tdForFUT.date}
          />
          <DatePickerExpo
            title="Time"
            mode="time"
            boxContainerStyle={{ marginBottom: 20 }}
            onSelect={(v) => {
              setTdForFUT((prev) => {
                return { ...prev, time: v }
              })
            }}
            initialValue={tdForFUT.time}
          />
          {/* <CustomBtn
            title="Submit"
            textStyle={{ fontSize: 14 }}
            containerStyle={{ alignSelf: 'center' }}
            onPress={handleStatusUpdate}
          /> */}
          <CustomBtn
            title="Submit"
            containerStyle={{ marginBottom: 20, width: 100, alignSelf: 'center' }}
            onPress={handleStatusUpdate}
            isLoading={isLoading}
            textStyle={{ fontSize: 14 }}
          />
        </View>
      </CustomModal>
    </>
  );
}; 

export default LeadsDetails;

const styles=StyleSheet.create({
   modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    // padding: 20,
    width: '90%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: color.saffronMango,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
})