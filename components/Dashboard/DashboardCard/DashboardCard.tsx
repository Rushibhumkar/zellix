import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { color } from "../../../const/color";
import CustomText from "../../../myComponents/CustomText/CustomText";
import DropdownRNE from "../../../myComponents/DropdownRNE/DropdownRNE";
import DownArrow from "../../../assets/svg/DownArrow";
import DatePickerExpo from "../../../myComponents/DatePickerExpo/DatePickerExpo";
import { summary } from "../../../services/hrmApi/userHrmApi";
import { summaryList } from "../../../utils/data";
import moment from "moment";
import NoDataFound from "../../../myComponents/NoDataFound/NoDataFound";

// Line component for a horizontal separator
const Line = () => <View style={styles.line} />;

// Helper function to format text values
const formatText = (value) => {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US").format(value);
  }
  return value;
};

export default function DashboardCard({ title = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startDate, setStartDate] = useState(moment().startOf("month"));
  const [endDate, setEndDate] = useState(moment());
  const [selectedItem, setSelectedItem] = useState("confirm_business");
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
      console.warn("Invalid date range: Start Date must be before End Date.");
      return;
    }

    const fetchSummaryData = async () => {
      setIsLoading(true);
      setSummaryData(null);
      try {
        const details = {
          endDate: endDate,
          startDate: startDate,
          value: selectedItem || "total",
        };

        const data = await summary(details);
        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, [startDate, endDate, selectedItem]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.textContainer}>
        <CustomText style={styles?.titleText}>{title}</CustomText>
      </View>

      {/* Dropdown & Date Pickers */}
      <View style={styles.dropdownContainer}>
        <DropdownRNE
          containerStyle={{ width: "100%" }}
          placeholder="Value"
          arrOfObj={summaryList}
          keyValueShowInBox="name"
          keyValueGetOnSelect="value"
          onChange={(v) => {
            setSelectedItem(v);
          }}
          initialValue={"confirm_business"}
        />

        <View style={styles.datePickersContainer}>
          <DatePickerExpo
            title="Start Date"
            boxContainerStyle={styles.datePickerBox}
            onSelect={setStartDate}
            initialValue={startDate}
          />
          <DatePickerExpo
            title="End Date"
            boxContainerStyle={styles.datePickerBox}
            onSelect={setEndDate}
            initialValue={endDate}
          />
        </View>
      </View>

      {/* Card Details */}
      {summaryData?.data?.length > 0 ? (
        summaryData?.data?.map((item) => (
          <View key={item?._id} style={styles.cardContainer}>
            <View style={styles.headerRow}>
              <View style={{ width: "40%" }}>
                <CustomText style={styles.keyStyle}>
                  Sum of Value of Property
                </CustomText>
                <CustomText>{formatText(item?.total?.total)}</CustomText>
              </View>
              <View style={{ width: "40%" }}>
                <CustomText style={styles.keyStyle}>
                  Sum of Gross Revenue
                </CustomText>
                <CustomText>{formatText(item?.commission?.total)}</CustomText>
              </View>
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <DownArrow
                  width={20}
                  height={20}
                  style={{
                    transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Expanded Content */}
            {isExpanded && (
              <View>
                <Line />
                <View style={styles.detailsRow}>
                  <View style={styles.infoBlock}>
                    <CustomText style={styles.keyStyle}>
                      Sum of Net Revenue
                    </CustomText>
                    <CustomText>
                      {formatText(item?.clientLoyalty?.total)}
                    </CustomText>
                  </View>
                  <View style={{ width: "30%" }}>
                    <CustomText style={styles.keyStyle}>
                      Sum of Client Loyalty
                    </CustomText>
                    <CustomText>
                      {formatText(item?.netCommission?.total)}
                    </CustomText>
                  </View>
                  <View style={{ width: "25%" }}>
                    <CustomText style={styles.keyStyle}>
                      Sum of Broker
                    </CustomText>
                    <CustomText>
                      {formatText(item?.brokerReferral?.total)}
                    </CustomText>
                  </View>
                </View>
                <Line />
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={{ marginVertical: 20 }}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <NoDataFound width={200} height={200} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: 1,
    borderColor: color.goldenYellow,
    borderRadius: 10,
    padding: 10,
    margin: 20,
    backgroundColor: "#FCFAFA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  textContainer: {
    alignSelf: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: color.goldenYellow,
    paddingBottom: 5,
  },
  dropdownContainer: {
    marginTop: 20,
    justifyContent: "space-between",
  },
  datePickersContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  datePickerBox: {
    marginBottom: 20,
    width: "47%",
  },
  cardContainer: {
    backgroundColor: "white",
    marginVertical: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.gray,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: 40,
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  infoBlock: {
    width: "30%",
    paddingRight: 5,
  },
  line: {
    borderBottomWidth: 1,
    borderStyle: Platform.OS === "ios" ? "solid" : "dashed",
    width: "100%",
    marginVertical: 10,
    borderBottomColor: "lightgrey",
  },
  keyStyle: {
    fontWeight: "600",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
  },
});
