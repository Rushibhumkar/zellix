import { Popup, Toast, SPSheet } from "react-native-popup-confirm-toast";
import { color } from "../const/color";
import { ActivityIndicator, View } from "react-native";

const successMessage = (message) => {
  return Popup.show({
    type: "success", //confirm,info,danger,warning,success
    title: "Successful!",
    textBody: message ?? "---",
    buttonText: "OK",
    callback: () => Popup.hide(),
    bounciness: 15,
    buttonText: "OK",
    okButtonStyle: { backgroundColor: color.green },
    iconHeaderStyle: {
      marginBottom: -10,
    },
  });
};

const errorMessage = (message) => {
  return Popup.show({
    type: "danger", //confirm,info,danger,warning,success
    title: "Error!",
    textBody: message ?? "Server Error please try again",
    buttonText: "OK",
    callback: () => Popup.hide(),
    bounciness: 15,
    buttonText: "OK",
    okButtonStyle: { backgroundColor: "#A7100A" },
    iconHeaderStyle: {
      marginBottom: -10,
    },
  });
};

const confirmModal = ({
  clickOnConfirm,
  message = "Do you want to delete users",
}) => {
  return Popup.show({
    type: "confirm",
    title: "Confirm!",
    textBody: message,
    buttonText: "Delete",
    confirmText: "Cancel",
    callback: () => {
      console.log("Okey Callback && hidden");
      clickOnConfirm();
      // Popup.hide();
      // successMessage('asa')
    },
    cancelCallback: () => {
      console.log("Cancel Callback && hidden");
      Popup.hide();
    },
    buttonContentStyle: {
      // justifyContent: 'center',
      flexDirection: "row",
      gap: 20,
    },
    iconHeaderStyle: {
      marginBottom: -10,
    },
    okButtonStyle: { backgroundColor: "#DC7331" },
    confirmButtonStyle: { borderColor: "black", borderWidth: 1 },
  });
};

const waitingModal = () => {
  return Popup.show({
    type: "success", //confirm,info,danger,warning,success
    title: "Successful!",
    textBody: " successfully",
    buttonText: "OK",
    callback: () => Popup.hide(),
    bounciness: 15,
    buttonText: "OK",
    okButtonStyle: { backgroundColor: color.green },
    iconHeaderStyle: {
      marginBottom: -10,
    },
  });
};
const plzWait = ({ bodyComponent }) => {
  const popup = Popup;
  return popup.show({
    bodyComponent: () => bodyComponent(),
    iconEnabled: false,
    buttonEnabled: false,
    // containerStyle: { padding: 0, margin: 0, backgroundColor: 'red' },
    modalContainerStyle: {
      padding: 0,
      margin: 0,
      alignItems: "center",
      marginTop: -20,
    },
    modalContainerStyle: {
      backgroundColor: "transparent",
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
    },
  });
};

const popUpClose = () => {
  return Popup.hide();
};

export const popUpConfToast = {
  successMessage,
  errorMessage,
  confirmModal,
  plzWait,
  waitingModal,
  popUpClose,
};
