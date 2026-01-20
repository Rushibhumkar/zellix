import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Linking,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import * as Application from "expo-application";
import CustomBtn from "../CustomBtn/CustomBtn";
import CustomText from "../CustomText/CustomText";
import { getAppVersion } from "../../services/rootApi/api";
import { myConsole } from "../../hooks/useConsole";
import { Feather } from "@expo/vector-icons";
import { color } from "../../const/color";

/* ---------- VERSION COMPARE ---------- */
const compareVersions = (current: string, target: string) => {
  const c = current.split(".").map(Number);
  const t = target.split(".").map(Number);

  for (let i = 0; i < Math.max(c.length, t.length); i++) {
    const diff = (c[i] || 0) - (t[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

const UpdateChecker = () => {
  const hasCheckedRef = useRef(false);

  const [visible, setVisible] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkVersion = async () => {
      try {
        const res = await getAppVersion();
        const data = res?.data?.data;

        const platformData =
          Platform.OS === "android" ? data.android : data.ios;

        // if (!platformData?.isActive) return;

        const currentVersion = Application.nativeApplicationVersion || "0.0.0";

        // myConsole("currentVersionnn", currentVersion);

        const {
          latestVersion,
          minSupportedVersion,
          forceUpdate,
          appStoreUrl,
          releaseNotes,
        } = platformData;

        const belowMin =
          compareVersions(currentVersion, minSupportedVersion) < 0;
        const belowLatest = compareVersions(currentVersion, latestVersion) < 0;

        if (belowMin || belowLatest) {
          setForceUpdate(forceUpdate);
          setStoreUrl(appStoreUrl);
          setNotes(releaseNotes || "");
          setVisible(true);
        }
      } catch (e) {
        console.log("❌ App version check failed:", e);
      }
    };

    checkVersion();
  }, []);

  const handleUpdate = () => {
    if (storeUrl) Linking.openURL(storeUrl);
  };

  const handleClose = () => {
    if (!forceUpdate) {
      console.log("✅ Popup closed");
      setVisible(false);
    }
  };

  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade">
      <TouchableWithoutFeedback disabled={forceUpdate} onPress={handleClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            pointerEvents="box-none"
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "80%",
              alignItems: "center",
            }}
          >
            {!forceUpdate && (
              <TouchableOpacity
                style={{ position: "absolute", top: 8, right: 6, padding: 8 }}
                onPress={handleClose}
              >
                <Feather name="x" size={20} color="grey" />
              </TouchableOpacity>
            )}
            <CustomText
              style={{
                fontSize: 22,
                fontWeight: "600",
                color: color.mainTxtColor,
              }}
            >
              {forceUpdate ? "Update Required" : "Update Available"}
            </CustomText>

            {!!notes && (
              <CustomText
                style={{
                  marginVertical: 10,
                  textAlign: "center",
                  color: "grey",
                }}
              >
                {notes}
              </CustomText>
            )}

            <CustomBtn
              title="Update Now"
              onPress={handleUpdate}
              containerStyle={{ marginTop: 20 }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default UpdateChecker;
