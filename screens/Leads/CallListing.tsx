import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { color } from "../../const/color";

const DIAL_PAD = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
];

const CallListing = () => {
  const [showDialPad, setShowDialPad] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const appState = useRef(AppState.currentState);

  const isCallingRef = useRef(false);

  const formattedNumber = useMemo(() => {
    return phoneNumber;
  }, [phoneNumber]);

  const handlePress = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setPhoneNumber("");
  };

  const handleCall = async () => {
    if (!phoneNumber) return;

    try {
      isCallingRef.current = true;

      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (err) {
      console.log("Call Error", err);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // returned from call screen
      if (
        appState.current === "background" &&
        nextAppState === "active" &&
        isCallingRef.current
      ) {
        setShowDialPad(false);
        setPhoneNumber("");
        isCallingRef.current = false;
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Container>
      <Header title="Calls" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Call History</Text>
        </View>
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.floatingButton}
        onPress={() => setShowDialPad(true)}
      >
        <MaterialIcons name="dialpad" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Dial Pad Modal */}
      <Modal
        visible={showDialPad}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDialPad(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowDialPad(false);
            setPhoneNumber("");
          }}
        >
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheet}>
                {/* Header */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Dial Pad</Text>

                  <TouchableOpacity onPress={() => setShowDialPad(false)}>
                    <Feather name="x" size={24} color="#0F172A" />
                  </TouchableOpacity>
                </View>

                {/* Number */}
                <View style={styles.numberContainer}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.numberText,
                      {
                        color: !!formattedNumber
                          ? "#0F172A"
                          : color.placeholderGrey,
                      },
                    ]}
                  >
                    {formattedNumber || "Enter Number"}
                  </Text>

                  {!!phoneNumber && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleClearAll}
                      style={styles.clearButton}
                    >
                      <Feather name="x" size={16} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Dial Pad */}
                <FlatList
                  data={DIAL_PAD}
                  keyExtractor={(_, index) => String(index)}
                  numColumns={3}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.row}
                  contentContainerStyle={{ paddingTop: 10 }}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.keyButton}
                      onPress={() => {
                        handlePress(item[0]);
                      }}
                      onLongPress={() => {
                        if (item[0] === "0") {
                          setPhoneNumber((prev) => prev + "+");
                        }
                      }}
                      delayLongPress={300}
                    >
                      <Text style={styles.keyText}>{item[0]}</Text>

                      {!!item[1] && (
                        <Text style={styles.keySubText}>{item[1]}</Text>
                      )}
                    </Pressable>
                  )}
                />

                {/* Call Button */}
                <View style={styles.bottomActions}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.callButton,
                      {
                        opacity: phoneNumber ? 1 : 0.5,
                      },
                    ]}
                    disabled={!phoneNumber}
                    onPress={handleCall}
                  >
                    <Feather name="phone-call" size={22} color="#fff" />
                  </TouchableOpacity>

                  {phoneNumber.length > 0 && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.backButton}
                      onPress={handleDelete}
                    >
                      <Feather name="delete" size={20} color="#0F172A" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Container>
  );
};

export default CallListing;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 100,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: color.mainTxtColor,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  numberContainer: {
    minHeight: 46,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  numberText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 1,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },

  keyButton: {
    // aspectRatio: 1,
    height: 60,
    width: "30%",
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  keyText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },

  keySubText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 1,
  },

  callButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomActions: {
    height: 72,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  backButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    bottom: 4,
  },
});
