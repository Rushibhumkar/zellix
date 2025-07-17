import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import Header from "../../components/Header";
import { removeItemValue } from "../../hooks/useAsyncStorage";
import { useDispatch, useSelector } from "react-redux";
import { onLogOutEmpty } from "../../redux/action";
import ChangePassLogo from "../../assets/svg/ChangePassLogo";
import LogoutLogo from "../../assets/svg/LogoutLogo";
import Container from "../../myComponents/Container/Container";
import { logOut } from "../../services/authApi/auth";
import { selectUser } from "../../redux/userSlice";
import { baseURL, setBaseUrl } from "../../services/authApi/axiosInstance";
import CRMLogoIcon from "../../assets/svgHRM/CRMLogoIcon";
import CustomText from "../../myComponents/CustomText/CustomText";
import { roleEnum, statusEnum } from "../../utils/data";
import {
  routeExpense,
  routeIncentive,
  routeInvoice,
  routeProject,
  routeReferral,
} from "../../utils/routes";
import ProjectIcon from "../../assets/svg/ProjectIcon";
import ExpenseSvg from "../../assets/svg/ExpenseSvg";
import InvoiceSvg from "../../assets/svg/InvoiceSvg";
import IncentiveSvg from "../../assets/svg/IncentiveSvg";
import ReferralSvg from "../../assets/svg/ReferralSvg";
import { checkPermission } from "../../utils/commonFunctions";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import {useGetUserPermission} from '../../services/rootApi/permissionApi'
import { myConsole } from "../../hooks/useConsole";

const Setting = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectUser);
  const isSubSupSrMng =
    user?.role === roleEnum?.sub_admin ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sr_manager;
  const isAgent = user?.role === roleEnum?.agent;
  const isSubSup = user?.role === roleEnum?.sub_admin || user?.role === roleEnum?.sup_admin
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      let a = await logOut(user?._id);
      await removeItemValue("token");
      await removeItemValue("userDetail");
      await dispatch(onLogOutEmpty());
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { data: permission = {} } = useGetUserPermission(user?._id);
      const canViewExpenses = checkPermission(
      permission,
      "Expenses",
      "viewList",
      user?.role
    );
      const canViewInvoices = checkPermission(
      permission,
      "Invoices",
      "viewList",
      user?.role
    );
  return (
    <>
      <Header title={"Setting"} />
      <Container>
        <View style={{ padding: 20, gap: 5 }}>
          {([
            roleEnum.sr_manager,
            roleEnum.sub_admin,
            roleEnum.sup_admin,
          ].includes(user?.role) ||
            user?.status === statusEnum.approved) && (
              <Pressable
                style={[styles.fdRow]}
                onPress={() => navigation.navigate("HRManagementStack")}
              >
                <CRMLogoIcon />
                <Text
                  style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}
                >
                  HRMS
                </Text>
              </Pressable>
            )}

          {isSubSupSrMng && (
            <Pressable
              style={styles.fdRow}
              onPress={() => navigation.navigate(routeProject.ProjectNavigator)}
            >
              <ProjectIcon />
              <Text
                style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}
              >
                Project
              </Text>
            </Pressable>
          )}
          {/* 88888888888888 */}
          <Pressable
            style={styles.fdRow}
            onPress={() =>
              navigation.navigate(routeIncentive.IncentiveNavigator)
            }
          >
            <IncentiveSvg />

            <Text style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}>
              Incentive
            </Text>
          </Pressable>
          <Pressable
            style={styles.fdRow}
            onPress={() =>
              navigation.navigate(routeReferral.ReferralNavigator)
            }
          >
            <ReferralSvg />

            <Text style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}>
              Referrals
            </Text>
          </Pressable>
          {true && (
            <Pressable
              style={styles.fdRow}
              onPress={() => navigation.navigate(routeInvoice.InvoiceNavigator)}
            >
              <InvoiceSvg />
              <Text
                style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}
              >
                Invoice
              </Text>
            </Pressable>
          )}
          {true && <Pressable
            style={styles.fdRow}
            onPress={() => navigation.navigate(routeExpense.ExpenseNavigator)}
          >
            <ExpenseSvg />
            <Text style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}>
              Expense
            </Text>
          </Pressable>}
          {/* 88888888888888 */}

          <Pressable
            style={styles.fdRow}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <ChangePassLogo />
            <Text style={{ color: "#000000", fontSize: 18, fontWeight: "600" }}>
              Change Password
            </Text>
          </Pressable>
          <View style={styles.fdRow}>
            <LogoutLogo />
            <Pressable onPress={handleLogout}>
              <View style={{ flexDirection: "row" }}>
                <CustomText fontSize={18} fontWeight="600">
                  LogOut...
                </CustomText>
                {isLoading && (
                  <ActivityIndicator
                    style={{ marginStart: 10 }}
                    color="#FFC857"
                  />
                )}
              </View>
            </Pressable>
          </View>
        </View>
        <Pressable
          onLongPress={() =>
            Alert.alert("Base URL(Plz click on Cancel)", `${baseURL}`, [
              {
                text: "Cancel",
                onPress: () => console.log("Ask me later pressed"),
              },
              {
                text: "Live Url",
                onPress: () => setBaseUrl("https://api.crmaxproperty.com"),
                style: "cancel",
              },
              {
                text: "Test Url",
                onPress: () =>
                  setBaseUrl("https://axproperty-backend.onrender.com"),
              },
            ])
          }
          style={{
            width: 50,
            height: 50,
            position: "absolute",
            bottom: 20,
          }}
        ></Pressable>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    // marginTop: 20,
    borderBottomColor: "#131313",
    width: "100%",
    borderBottomWidth: 0.5,
    marginVertical: 10,
  },
  fdRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderBottomColor: "#131313",
    width: "100%",
    borderBottomWidth: 0.5,
    paddingVertical: 10,
    // marginVertical: 10,
  },
});

export default Setting;
