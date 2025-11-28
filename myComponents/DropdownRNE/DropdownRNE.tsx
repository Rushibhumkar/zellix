import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import UpDownIcon from "../../assets/svg/UpDownIcon";
import { color } from "../../const/color";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { myConsole } from "../../hooks/useConsole";
import NoDataFound from "../NoDataFound/NoDataFound";
import CustomText from "../CustomText/CustomText";
// import { teamUsers } from '../../utils/teamUsers';

//
const teamUsers = (teams = [], users = []) => {
  return users.filter((user) => {
    let InTeam = false;
    teams.forEach((team) => {
      if (team.srManager?._id === user._id) {
        InTeam = true;
        return true;
      } else if (team.manager?._id === user._id) {
        InTeam = true;
        return true;
      } else if (team?.assistantManager?._id === user?._id) {
        InTeam = true;
        return true;
      } else if (team.teamLead?._id === user._id) {
        InTeam = true;
        return true;
      } else if (team.agents && team.agents.length > 0) {
        team.agents.forEach((agent) => {
          if (agent._id === user._id) {
            InTeam = true;
            return true;
          }
        });
      }
    });

    if (InTeam) {
      return true;
    }
    return false;
  });
};
//

interface TDropdownRNE {
  arrOfObj: [];
  keyValueShowInBox?: string;
  keyValueGetOnSelect?: string;
  placeholder?: string;
  error?: string;
  containerStyle: StyleProp<ViewStyle>;
  dropdownStyle: StyleProp<ViewStyle>;
  keyName:
    | "agent"
    | "sr_manager"
    | "manager"
    | "team_lead"
    | "assistant_manager";
  label: string;
  onChange: (a: {}) => void;
  isMultiSelect: boolean;
  dropdownPosition: "auto" | "top" | "bottom";
  initialValue: string | [string];
  labelTextStyle: StyleProp<TextStyle>;
  isAdvanceSearch: boolean;
  isSearch: boolean;
  mode: "auto" | "modal" | "default";
  maxHeight: number;
  onEndReached: any;
  onEndReachedThreshold: any;
  ListFooterComponent: any;
  refreshControl: any;
  onChangeText: any;
  isLoading: boolean;
  dpWidth: number;
  onSelect: (a: any) => void;
  isCountryPicker?: boolean;
}

const DropdownRNE = ({
  arrOfObj,
  keyValueShowInBox = "name",
  keyValueGetOnSelect = "_id",
  placeholder,
  error,
  containerStyle,
  label,
  keyName,
  onChange,
  isMultiSelect,
  dropdownPosition,
  initialValue,
  labelTextStyle,
  isAdvanceSearch = false,
  isSearch = false,
  mode = "auto",
  maxHeight = 220,
  onEndReached,
  onEndReachedThreshold,
  ListFooterComponent,
  refreshControl,
  onChangeText,
  isLoading = false,
  dpWidth,
  dropdownStyle,
  isCountryPicker,
  onSelect,
}: TDropdownRNE) => {
  //
  const { allUsers, team } = useSelector(selectUser);
  const [value, setValue] = useState(initialValue ?? null);
  const [selected, setSelected] = useState(initialValue ?? []);
  const [data, setData] = useState([]);
  useEffect(() => {
    if (!!initialValue) {
      !isMultiSelect ? setValue(initialValue) : setSelected(initialValue);
    }
  }, [initialValue]);
  useEffect(() => {
    if (!!keyName) {
      if (isAdvanceSearch) {
        const filterData = teamUsers(team, allUsers)
          ?.filter((el) => el?.role?.toLowerCase() === keyName?.toLowerCase())
          .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1));
        setData(filterData);
      } else {
        if (keyName === "agent") {
          setData(allUsers);
        } else {
          const filterData = allUsers?.filter(
            (el) => el?.role?.toLowerCase() === keyName?.toLowerCase()
          );
          setData(filterData);
        }
      }
    }
  }, [allUsers, team, keyName]);

  //
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <CustomText style={styles.textItem}>
          {item?.[keyValueShowInBox]}
        </CustomText>
        {/* {item.value === value && <UpDownIcon />} */}
      </View>
    );
  };

  const validData = (arrOfObj?.length ? arrOfObj : data)?.filter(
    (item) => typeof item?.[keyValueShowInBox] === "string"
  );
  return (
    <View style={[containerStyle]}>
      {label && (
        <CustomText style={[styles.label, labelTextStyle]}>
          {label ?? "label"}
        </CustomText>
      )}
      {!isMultiSelect ? (
        <Dropdown
          mode={mode}
          search={isSearch}
          style={[styles.dropdown, dropdownStyle]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          searchPlaceholderTextColor={color.strokeColor}
          inputSearchStyle={[
            styles.inputSearchStyle,
            { color: color.mainTxtColor },
          ]}
          iconStyle={styles.iconStyle}
          data={
            searchText.trim()
              ? validData?.filter((item) =>
                  item[keyValueShowInBox]
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                )
              : validData
          }
          maxHeight={maxHeight}
          labelField={keyValueShowInBox} //jis key ko show krna h
          valueField={keyValueGetOnSelect} //jis key ko set krna h
          placeholder={
            placeholder ? placeholder : label ? label : "placeholder"
          }
          searchPlaceholder="Search..."
          value={value}
          onChange={(item) => {
            setValue(item?.[keyValueGetOnSelect]);
            onChange && onChange(item?.[keyValueGetOnSelect]);
            onSelect && onSelect(item);
          }}
          // renderLeftIcon={() => (
          //     <UpDownIcon transform={[{ rotate: '180deg' }]} style={{ marginRight: 10 }} />
          // )}
          renderRightIcon={() => (
            <UpDownIcon
              color={color.mainTxtColor}
              transform={[{ rotate: !open ? "180deg" : "0deg" }]}
            />
          )}
          renderItem={renderItem}
          onFocus={() => setOpen((prev) => !prev)}
          onBlur={() => setOpen((prev) => !prev)}
          dropdownPosition={dropdownPosition ?? "auto"}
          containerStyle={{
            borderRadius: 10,
            paddingVertical: 5,
            maxHeight: 300,
            ...(dpWidth && { width: dpWidth }),
          }}
          activeColor={color.selectedBg}
          flatListProps={{
            ListEmptyComponent: (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  padding: 20,
                  minHeight: 100,
                }}
              >
                {!isLoading ? (
                  <CustomText
                    fontSize={18}
                    fontWeight="500"
                    color={color.mainTxtColor}
                  >
                    No Data Found
                  </CustomText>
                ) : (
                  <ActivityIndicator />
                )}
              </View>
            ),
            onEndReached: onEndReached,
            onEndReachedThreshold: onEndReachedThreshold,
            ListFooterComponent: ListFooterComponent,
            refreshControl: refreshControl,
          }}
          onChangeText={(text) => {
            setSearchText(text);
            onChangeText && onChangeText(text);
          }}
        />
      ) : (
        <MultiSelect
          mode={mode}
          style={[styles.dropdown, dropdownStyle]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={[styles.selectedTextStyle]}
          searchPlaceholderTextColor={color.strokeColor}
          inputSearchStyle={[
            styles.inputSearchStyle,
            { color: color.mainTxtColor },
          ]}
          iconStyle={styles.iconStyle}
          search={isSearch}
          data={
            searchText.trim()
              ? validData?.filter((item) =>
                  item[keyValueShowInBox]
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                )
              : validData
          }
          labelField={"name"} //jis key ko show krna h
          valueField={keyValueGetOnSelect} //jis key ko set krna h
          placeholder={
            placeholder ? placeholder : label ? label : "placeholder"
          }
          searchPlaceholder="Search..."
          value={selected}
          onChange={(item) => {
            setSelected(item);
            onChange && onChange(item);
          }}
          selectedStyle={{ borderRadius: 12 }}
          renderRightIcon={() => (
            <UpDownIcon
              color={color.mainTxtColor}
              transform={[{ rotate: !open ? "180deg" : "0deg" }]}
            />
          )}
          renderItem={renderItem}
          onFocus={() => setOpen((prev) => !prev)}
          onBlur={() => setOpen((prev) => !prev)}
          dropdownPosition={dropdownPosition ?? "auto"}
          flatListProps={{
            ListEmptyComponent: (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  padding: 20,
                }}
              >
                <CustomText fontSize={18} fontWeight="500">
                  No Data Found
                </CustomText>
              </View>
            ),
            onEndReached: onEndReached,
            onEndReachedThreshold: onEndReachedThreshold,
            ListFooterComponent: ListFooterComponent,
            refreshControl: refreshControl,
          }}
          onChangeText={onChangeText}
          activeColor={color.selectedBg}
          containerStyle={{
            borderRadius: 10,
            paddingVertical: 5,
            maxHeight: 300,
          }}
        />
      )}
      {error && <CustomText style={styles.errorText}>{error}</CustomText>}
    </View>
  );
};

export default DropdownRNE;

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    borderWidth: 1.6,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderColor: "#739fe141",
    // backgroundColor: color.white
  },
  icon: {
    marginRight: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    flex: 1,
    fontSize: 15,
    color: color.mainTxtColor,
  },
  placeholderStyle: {
    fontSize: 15,
    color: color.mainTxtColorFade,
  },
  selectedTextStyle: {
    fontSize: 15,
    color: color.mainTxtColor,
  },
  iconStyle: {
    width: 20,
    height: 20,
    color: color.mainTxtColor,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 12,
    borderColor: color.mainTxtColor,
  },
  errorText: {
    color: "red",
    marginTop: 0,
  },
  label: {
    color: color.mainTxtColor,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "500",
  },
});
