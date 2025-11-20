import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { color } from "../../const/color";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { roleEnum } from "../../utils/data";
import CustomText from "../../myComponents/CustomText/CustomText";
import { shadowPrimaryColor } from "../../const/globalStyle";

const UsersManagement = () => {
  const navigation = useNavigation();
  const { user } = useSelector(selectUser);

  const menuItems = [
    {
      id: 1,
      title: "Users",
      screen: "users",
      roles: [roleEnum.sup_admin, roleEnum.sr_manager],
    },
    {
      id: 2,
      title: "Teams",
      screen: "teamList",
      roles: [roleEnum.sup_admin, roleEnum.sr_manager, roleEnum.manager, roleEnum.agent],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <View style={styles.container}>
      <Header title={"Users Management"} />
      <View style={styles.content}>
        
        <View style={styles.menuContainer}>
          {filteredMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.6}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <CustomText style={styles.icon}>
                    {item.title === "Users" ? "👥" : "🏢"}
                  </CustomText>
                </View>
                <View style={styles.textContainer}>
                  <CustomText style={styles.menuTitle}>
                    {item.title}
                  </CustomText>
                  <CustomText style={styles.menuDescription}>
                    {item.title === "Users" 
                      ? "Manage individual users and permissions" 
                      : "Organize users into teams and groups"}
                  </CustomText>
                </View>
                <View style={styles.arrowContainer}>
                  <CustomText style={styles.arrow}>›</CustomText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: color.mainTxtColor,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "500",
  },
  menuContainer: {
    gap: 16,
  },
  menuCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
...shadowPrimaryColor,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: color.saffronMango + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: color.mainTxtColor,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
  arrowContainer: {
    paddingLeft: 10,
  },
  arrow: {
    fontSize: 24,
    color: "#9ca3af",
    fontWeight: "bold",
  },
});

export default UsersManagement;