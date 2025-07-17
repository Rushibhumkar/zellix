import React, { useState, useEffect, ReactNode } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from '../../myComponents/CustomText/CustomText';
import { popUpConfToast } from '../../utils/toastModalByFunction';
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn';
import ModalWithBlur from '../ModalWithBlur/ModalWithBlur';
import LeaveAppRemark from '../../screensHRM/LeaveHRM/components/LeaveAppRemark';
import { Popup, SPSheet, Toast } from 'react-native-popup-confirm-toast';
import EditIcon from '../../assets/svgHRM/EditIcon';

const CustomToastMessage = ({ children }: { children: ReactNode }) => {
  const [handler, setHandler] = useState({
    message: '',
    isVisible: false,
  });
  useEffect(() => {
    //hideMessage
    hideMessage = (prev) => {
      return { ...prev, isVisible: true }
    }
  }, [handler]);

  return (
    <View style={{ flex: 1 }}>
      <Modal animationType="fade" transparent={true} visible={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View>
              <CustomText
                color='white'
                fontSize={15}
              >
                lead updated successfully
              </CustomText>
            </View>
          </View>
        </View>
      </Modal>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
});

export let hideMessage: any = () => null;
export default CustomToastMessage;

////////notes
const DummyPoPUp = () => {
  const component = (props) => {
    //hook or class 
    return (<View>
      <CustomBtn
        title='hight'
        onPress={() => props.spSheet.setHeight(HEIGHT - 100, () => navigate(routeLeave.AllLeaveStack))}
      />
      <FlatList
        data={[...new Array(20)]}
        renderItem={() => {
          return <Text style={{ marginHorizontal: 20, marginBottom: 20 }}>Hi, SekizliPenguen</Text>
        }}
      />

    </View>);

    // props.spSheet.hide();
    // props.spSheet.setHeight(150,()=>alert('nice'));
  };
  //
  const BodyComponent = () => {
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 25,
      }}>
        <ActivityIndicator
          color={color.saffronMango}
          size={'large'}
        />
        <CustomText
          fontSize={18}
          fontWeight='700'
          color={color.saffronMango}
        >Please Wait...</CustomText>
        <TouchableOpacity
          onPress={() => popUpConfToast.successMessage('das')}
        >
          <Text>sdf</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return <>
    <ModalWithBlur
      visible={false}
    >
      <LeaveAppRemark
        heading='Leave Application Approved'
        onChangeText={(v) => console.log('v', v)}
        onPressCancel={() => console.log('cancel')}
        onPressSubmit={() => console.log('submit')}
      />
    </ModalWithBlur>
    <CustomBtn
      title='PLZ Wait'
      onPress={() => popUpConfToast.plzWait({
        bodyComponent: () => <BodyComponent />
      })}
    // onPress={() => popUpConfToast.waitingModal()}
    />
    <CustomBtn
      title='Confirm'
      // containerStyle={{}}
      onPress={() => popUpConfToast.confirmModal({
        // clickOnConfirm: () => popUpConfToast.plzWait({
        //     bodyComponent: () => bodyComponent()
        // })
        clickOnConfirm: () => popUpConfToast.plzWait({
          bodyComponent: () => bodyComponent()
        })
      })}
    />
    <CustomBtn
      title='Success'
      onPress={() => popUpConfToast.successMessage('Lead added successfully')}
    />
    {/* Popup */}
    <TouchableOpacity
      style={{ borderColor: 1 }}
      onPress={() =>
        Popup.show({
          type: 'success', //confirm,info,danger,warning,success
          title: 'info!',
          textBody: 'Mutlak özgürlük, kendi başına hiçbir anlam ifade etmez. ',
          buttonText: 'OK',
          callback: () => Popup.hide(),
          bounciness: 15
        })
      }
    >
      <Text>Open Popup Message</Text>
    </TouchableOpacity>
    {/* Toast */}
    <TouchableOpacity
      onPress={() =>
        Toast.show({
          title: 'I\'m Eight!',
          text: 'The best gift I received in this life are the codes. They are worlds inside the worlds.',
          backgroundColor: '#702c91',
          timeColor: '#440f5f',
          timing: 2000,
          icon: <EditIcon onPress={() => Toast.hide()} />,
          position: 'top',
          statusBarTranslucent: false,
          statusBarType: 'light-content',
          statusBarAndroidHidden: false,
          statusBarType: 'dark-content'
          // statusBarTranslucent: true,
          // onCloseComplete: () => {
          //     alert('onCloseComplete');
          // },
          // onOpenComplete: () => {
          //     alert('onOpenComplete');
          // },
          // descTextStyle: { margin: 10 },
          // titleTextStyle: { margin: 20 }

        })
      }
    >
      <Text>Open Top Toast</Text>
    </TouchableOpacity>
    {/* popup */}
    <TouchableOpacity
      onPress={() => {
        const popup = Popup;
        popup.show({
          // type: 'confirm',
          // textBody: 'Hesabınızın silinme işlemini onaylamak için şifrenizi giriniz.',
          bodyComponent: (bodyProps) => <View
          >
            <Text>Mustafa Kemal ATATÜRK</Text>
            <CustomBtn
              title='qq'
              onPress={() => Popup.hide()}
            />
          </View>,
          confirmText: 'Cancels',
          iconEnabled: false,
          buttonEnabled: false,
        });
      }}
    >
      <Text>Open Popup Confirm Message</Text>
    </TouchableOpacity>
    {/* SPSheet */}
    <TouchableOpacity
      onPress={
        () => {
          const spSheet = SPSheet;
          spSheet.show({
            component: () => component({ ...this.props, spSheet }),
            dragFromTopOnly: false,
            dragTopOnly: true,
            closeOnDragDown: true,
            // closeOnPressMask: false,
            // onCloseComplete: () => {
            //     alert('onCloseComplete');
            // },
            // onOpenComplete: () => {
            //     alert('onOpenComplete');
            // },
            height: 250,
            // duration: 4050,
            // closeDuration: 2050,
            customStyles: {
              backgroundColor: 'red',
              margin: 20,

            }
          });
        }
      }
    >
      <Text>Open SPSheet Message</Text>
    </TouchableOpacity>
    {/*  */}
  </>
}
