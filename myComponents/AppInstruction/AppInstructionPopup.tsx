import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import CustomBtn from "../CustomBtn/CustomBtn";
import CustomText from "../CustomText/CustomText";
import { getAppInstruction } from "../../services/rootApi/api";
import { myConsole } from "../../hooks/useConsole";
import { Feather } from "@expo/vector-icons";
import { color } from "../../const/color";

const STORAGE_KEY = "appInstructionDontShow";

const AppInstructionPopup = () => {
  const { user } = useSelector(selectUser);
  const userId = user?._id;
  const storageKey = `${STORAGE_KEY}:${userId}`;

  const [visible, setVisible] = useState(false);
  const [instruction, setInstruction] = useState(null);
  const [dontShowChecked, setDontShowChecked] = useState(false);

  useEffect(() => {
    let active = true;
    setVisible(false);
    setInstruction(null);
    setDontShowChecked(false);
    if (!userId) return;

    const checkInstruction = async () => {
      try {
        const res = await getAppInstruction();
        const data = res?.data?.data;

        // no active instruction from backend
        if (!active || !data || data.isActive === false) return;

        // check locally stored "don't show again" flag for this version
        const saved = await AsyncStorage.getItem(storageKey);
        const stored = saved ? JSON.parse(saved) : null;
        if (!active) return;

        // if user opted out for this exact version, don't show again
        if ((stored?.hidden || (data.showOnce && stored?.seen)) && stored?.version === data.version) {
          myConsole("App instruction hidden by user for version", data.version);
          return;
        }

        if (data.showOnce) {
          await AsyncStorage.setItem(storageKey, JSON.stringify({ seen: true, version: data.version }));
        }
        if (!active) return;
        setInstruction(data);
        setVisible(true);
      } catch (e) {
        console.log("❌ App instruction check failed:", e);
      }
    };

    checkInstruction();
    return () => { active = false; };
  }, [userId, storageKey]);

  const handleClose = async () => {
    if ((dontShowChecked || instruction?.showOnce) && instruction?.version) {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify({
          hidden: dontShowChecked,
          seen: true,
          version: instruction.version,
        }));
      } catch (e) {
        console.log("❌ Failed to store dontShowAgain flag:", e);
      }
    }
    setVisible(false);
  };

  const toggleDontShow = () => setDontShowChecked((prev) => !prev);

  if (!visible || !instruction) return null;

  const {
    heading,
    description,
    points = [],
    showCrossIcon = true,
    okButton = { show: true, text: "OK" },
    dontShowAgain = { show: true, text: "Don't show it again" },
  } = instruction;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={showCrossIcon ? handleClose : () => {}}>
      <TouchableWithoutFeedback
        onPress={showCrossIcon ? handleClose : undefined}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 12,
                width: "100%",
                maxHeight: "80%",
              }}
            >
              {showCrossIcon && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 6,
                    padding: 8,
                    zIndex: 1,
                  }}
                  onPress={handleClose}
                >
                  <Feather name="x" size={20} color="grey" />
                </TouchableOpacity>
              )}

              <CustomText
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: color.mainTxtColor,
                  textAlign: "center",
                  marginBottom: 10,
                  paddingHorizontal: showCrossIcon ? 24 : 0,
                }}
              >
                {heading}
              </CustomText>

              <ScrollView style={{ maxHeight: 320 }}>
                {!!description && (
                  <CustomText
                    style={{
                      marginBottom: 12,
                      textAlign: "center",
                      color: "grey",
                    }}
                  >
                    {description}
                  </CustomText>
                )}

                {points.length > 0 && (
                  <View style={{ marginBottom: 10 }}>
                    {points.map((point, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          marginBottom: 8,
                          paddingHorizontal: 4,
                        }}
                      >
                        <CustomText
                          style={{ color: color.mainTxtColor, marginRight: 6 }}
                        >
                          •
                        </CustomText>
                        <CustomText
                          style={{ flex: 1, color: color.mainTxtColor }}
                        >
                          {point}
                        </CustomText>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {!instruction.showOnce && dontShowAgain?.show && (
                <TouchableOpacity
                  onPress={toggleDontShow}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    marginBottom: 4,
                    alignSelf: "center",
                  }}
                >
                  <Feather
                    name={dontShowChecked ? "check-square" : "square"}
                    size={18}
                    color={color.mainTxtColor}
                    style={{ marginRight: 8 }}
                  />
                  <CustomText
                    style={{ color: color.mainTxtColor, fontSize: 13 }}
                  >
                    {dontShowAgain.text || "Don't show it again"}
                  </CustomText>
                </TouchableOpacity>
              )}

              {okButton?.show && (
                <CustomBtn
                  title={okButton.text || "OK"}
                  onPress={handleClose}
                  containerStyle={{ marginTop: 16 }}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AppInstructionPopup;
