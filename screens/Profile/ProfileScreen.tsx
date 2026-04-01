import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import CustomText from "../../myComponents/CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { shadow1, shadow2, shadowLight } from "../../const/globalStyle";
import * as Clipboard from "expo-clipboard";
import { useAppToast } from "../../components/AppToast";
import { Feather } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { removeItemValue } from "../../hooks/useAsyncStorage";
import { useQueryClient } from "@tanstack/react-query";
import { logOut } from "../../services/authApi/auth";
import { onLogOutEmpty } from "../../redux/action";

const ProfileScreen = () => {
  const { user } = useSelector(selectUser);
  const { navigate } = useNavigation();
  const toast = useAppToast();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const handleCopy = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    toast.success("Copied " + text);
  };

  const getInitials = (name = "", lastName = "") => {
    const full = `${name} ${lastName}`.trim();
    if (!full) return "";
    const words = full.split(" ");
    return (
      words[0][0].toUpperCase() +
      (words.length > 1 ? words[words.length - 1][0].toUpperCase() : "")
    );
  };
  const handleLogout = async () => {
    try {
      let a = await logOut(user?._id);
      await queryClient.clear();
      await removeItemValue("token");
      await removeItemValue("userDetail");
      await dispatch(onLogOutEmpty());
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        }),
      );
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fullName = `${user?.name || ""} ${user?.lastName || ""}`.trim();

  return (
    <Container>
      <Header
        title="My Profile"
        isWithAnimation
        showActions={true}
        moduleName="loggedInUserProfile"
        showSearch={false}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <LinearGradient
          colors={["#2755ff", "#86b6ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <CustomText style={styles.avatarText}>
                {getInitials(user?.name, user?.lastName)}
              </CustomText>

              <View style={styles.onlineDot} />
            </View>

            <CustomText style={styles.name}>{fullName}</CustomText>

            {user?.role && (
              <CustomText style={styles.role}>
                {user?.role?.replace("_", " ")} • {user?.customId || ""}
              </CustomText>
            )}
          </View>
        </LinearGradient>

        {(user?.email || user?.mobile || user?.address?.city) && (
          <View style={styles.card}>
            <CustomText style={styles.cardTitle}>
              CONTACT INFORMATION
            </CustomText>

            {user?.email && (
              <TouchableOpacity
                onLongPress={() => handleCopy(user.email)}
                activeOpacity={0.7}
                style={styles.row}
              >
                <View style={styles.iconCircle}>
                  <Feather name="mail" size={18} color="#3B6CB7" />
                </View>

                <View>
                  <CustomText style={styles.label}>EMAIL ADDRESS</CustomText>
                  <CustomText style={styles.value}>{user.email}</CustomText>
                </View>
              </TouchableOpacity>
            )}

            {user?.mobile && (
              <TouchableOpacity
                onLongPress={() => handleCopy(user.mobile)}
                activeOpacity={0.7}
                style={styles.row}
              >
                <View style={styles.iconCircle}>
                  <Feather name="phone" size={18} color="#3B6CB7" />
                </View>

                <View>
                  <CustomText style={styles.label}>PHONE NUMBER</CustomText>
                  <CustomText style={styles.value}>{user.mobile}</CustomText>
                </View>
              </TouchableOpacity>
            )}

            {user?.address?.city && (
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Feather name="map-pin" size={18} color="#3B6CB7" />
                </View>
                <View>
                  <CustomText style={styles.label}>LOCATION</CustomText>
                  <CustomText style={styles.value}>
                    {user.address.city}
                  </CustomText>
                </View>
              </View>
            )}
          </View>
        )}

        {(user?.designation ||
          user?.empCode ||
          user?.dateOfJoining ||
          user?.role) && (
          <View style={styles.card}>
            <CustomText style={styles.cardTitle}>EMPLOYMENT DETAILS</CustomText>

            <View style={styles.grid}>
              {user?.designation && (
                <View style={styles.gridItem}>
                  <CustomText style={styles.label}>DEPARTMENT</CustomText>
                  <CustomText style={styles.value}>
                    {user.designation}
                  </CustomText>
                </View>
              )}

              {user?.customId && (
                <View style={styles.gridItem}>
                  <CustomText style={styles.label}>EMPLOYEE ID</CustomText>
                  <CustomText style={styles.value}>{user.customId}</CustomText>
                </View>
              )}

              {user?.dateOfJoining && (
                <View style={styles.gridItem}>
                  <CustomText style={styles.label}>JOINING DATE</CustomText>
                  <CustomText style={styles.value}>
                    {new Date(user.dateOfJoining).toDateString()}
                  </CustomText>
                </View>
              )}

              {user?.role && (
                <View style={styles.gridItem}>
                  <CustomText style={styles.label}>ROLE</CustomText>
                  <CustomText style={styles.value}>
                    {user.role.replace("_", " ")}
                  </CustomText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* CHANGE PASSWORD */}
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Feather name="shield" size={20} color="#FF6A00" />
          </View>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => navigate("ChangePassword")}
          >
            <CustomText style={styles.actionTitle}>Change Password</CustomText>
            <CustomText style={styles.actionSub}>
              Update your security credentials
            </CustomText>
          </TouchableOpacity>
          <Feather name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={() => handleLogout?.()}
        >
          <View style={styles.actionIcon}>
            <Feather name="log-out" size={20} color="#FF3B30" />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText style={styles.logoutTitle}>Logout</CustomText>
            <CustomText style={styles.logoutSub}>
              Sign out of your account
            </CustomText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 20,
  },

  avatarWrapper: {
    alignItems: "center",
    marginTop: 10,
  },

  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#ffffff60",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
  },

  onlineDot: {
    position: "absolute",
    bottom: 8,
    right: 8,
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: "#00C853",
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  role: {
    color: "#dbe6ff",
    fontSize: 14,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    margin: 14,
    padding: 16,
    borderRadius: 16,
    ...shadowLight,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B6CB7",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },

  iconCircle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#EEF3FB",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 12,
    color: "#8A94A6",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E2A3A",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "48%",
    marginBottom: 16,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 14,
    padding: 16,
    borderRadius: 16,
    ...shadowLight,
  },

  actionIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },

  actionSub: {
    fontSize: 12,
    color: "#8A94A6",
  },

  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    margin: 14,
    padding: 16,
    borderRadius: 16,
  },

  logoutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },

  logoutSub: {
    fontSize: 12,
    color: "#FF6B6B",
  },
});
