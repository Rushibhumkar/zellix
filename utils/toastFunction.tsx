import { ActivityIndicator } from "react-native";
import { Popup } from "react-native-popup-confirm-toast";
import { color } from "../const/color";

const wantLoading = (title = 'Do you want to Delete!'): void =>
    Popup.show({
        type: 'confirm',
        title: title,
        buttonText: <ActivityIndicator size={'small'} color={'white'} />,
        confirmText: 'No',
        cancelCallback: () => {
            Popup.hide();
        },
        buttonContentStyle: {
            flexDirection: 'row',
            gap: 20,
        },
        okButtonStyle: { backgroundColor: color.red },
        confirmButtonStyle: { backgroundColor: color.grayBtn },
    });
interface TIsConfirm {
    onConfirm: () => void;
    title?: string;
}
const wantDelete = ({ onConfirm, title = 'Do you want to Delete!' }: TIsConfirm): void =>
    Popup.show({
        type: 'confirm',
        title: title,
        buttonText: 'Yes',
        confirmText: 'No',
        callback: () => {
            onConfirm && onConfirm();
        },
        cancelCallback: () => {
            Popup.hide();
        },
        buttonContentStyle: {
            flexDirection: 'row',
            gap: 20,
        },
        okButtonStyle: { backgroundColor: color.red },
        confirmButtonStyle: { backgroundColor: color.grayBtn },
    });

export const popupModal2 = {
    wantLoading,
    wantDelete
}