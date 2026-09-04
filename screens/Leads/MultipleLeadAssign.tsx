import { View, Text } from "react-native";
import React, { FC, useState } from "react";
import CustomModal from "../../myComponents/CustomModal/CustomModal";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import CustomText from "../../myComponents/CustomText/CustomText";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { myConsole } from "../../hooks/useConsole";
import { leadAssignById } from "../../services/rootApi/leadApi";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeyCRM } from "../../utils/queryKeys";
import { color } from "../../const/color";
import { useGetMyAllTeamMembers } from "../../services/rootApi/api";

interface TMultipleLeadAssign {
  selected: string[];
  visible: boolean;
  setSelected: (selectedLeadIds: string[]) => void;
  toggleModal: () => void;
  setSnackBar: any;
  toast: any;
}

const MultipleLeadAssign: FC<TMultipleLeadAssign> = ({
  selected,
  visible,
  setSelected,
  toggleModal,
  setSnackBar,
  toast,
}) => {
  const queryClient = useQueryClient();
  const [assign, setAssign] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: myTeamMembers, isLoading: myTeamMembersLoading } =
    useGetMyAllTeamMembers();
  // myConsole("myTeamMemberss", myTeamMembers);
  // const teamMembersOptions = [
  //   ...(myTeamMembers?.sup_admin || []),
  //   ...(myTeamMembers?.sub_admin || []),
  //   ...(myTeamMembers?.sr_manager || []),
  //   ...(myTeamMembers?.manager || []),
  //   ...(myTeamMembers?.assistant_manager || []),
  //   ...(myTeamMembers?.team_lead || []),
  //   ...(myTeamMembers?.agent || []),
  // ];

  const teamMembersOptions = [
    ...(myTeamMembers?.sup_admin || [])
      .filter((i) => i?.label && i?.value)
      .map((i) => ({
        ...i,
        label: `${i.label} (Super Admin)`,
      })),

    ...(myTeamMembers?.sub_admin || [])
      .filter((i) => i?.label && i?.value)
      .map((i) => ({
        ...i,
        label: `${i.label} (Sub Admin)`,
      })),

    ...(myTeamMembers?.sr_manager || [])
      .filter((i) => i?.label && i?.value)
      .map((i) => ({
        ...i,
        label: `${i.label} (Sr Manager)`,
      })),

    ...(myTeamMembers?.manager || [])
      .filter((i) => i?.label && i?.value)
      .map((i) => ({
        ...i,
        label: `${i.label} (Manager)`,
      })),

    ...(myTeamMembers?.assistant_manager || [])
      .filter((i) => i?.label && i?.value)
      .map((i) => ({
        ...i,
        label: `${i.label} (Assistant Manager)`,
      })),

    ...(myTeamMembers?.team_lead || [])
      .filter((i) => i?.label && i?.value)
      .map((i) => ({
        ...i,
        label: `${i.label} (Team Lead)`,
      })),

    ...(myTeamMembers?.agent || [])
      .filter((i) => i?.label && i?.value)
      .map((i) => ({
        ...i,
        label: `${i.label} (Agent)`,
      })),
  ];

  // const onSelectManager = (srMngId) => {
  //     let srManagerId = srMngId;
  //     setSrManager(srManagerId);
  //     let filterTeam = team.filter((el) => {
  //         return el?.srManager?._id === srManagerId
  //     })
  //     const newArray = Array.from(
  //         new Set(filterTeam.flatMap(obj =>
  //             Object.values(obj).flatMap(value =>
  //                 (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null))
  //                     ? value.flatMap(agent => JSON.stringify(agent))
  //                     : [JSON.stringify(value)]
  //             )
  //         ))
  //     ).map(str => JSON.parse(str)).filter(obj => typeof (obj) !== 'string' && !!obj).map((el) => {
  //         return {
  //             ...el,
  //             name: `${el.name} (${el?.role})`,
  //             nameR: el?.name
  //         }
  //     });
  //     setAssignUserList(newArray)
  // }
  const onModalClose = () => {
    toggleModal();
    setAssign("");
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || !assign) return;

    try {
      setIsLoading(true);
      const sendData = {
        leads: selected,
        assign,
      };

      const resAssignLead = await leadAssignById(sendData);
      queryClient.invalidateQueries({
        queryKey: [queryKeyCRM.getLead],
      });
      queryClient.invalidateQueries({
        queryKey: ["leadFolders"],
      });

      const message =
        resAssignLead?.data?.message || "Lead(s) assigned successfully";
      setSnackBar({
        visible: true,
        text: message,
        error: false,
      });
      setSelected([]);
      onModalClose();
    } catch (err) {
      myConsole("errorAssignLead", err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Error assigning lead",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onModalClose}
      hasBackdrop={true}
      minHeightPercent={70}
    >
      <View
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 10,
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <View>
            <CustomText
              fontSize={20}
              marginBottom={15}
              fontWeight="500"
              color={color.mainTxtColor}
            >
              Assign Lead
            </CustomText>
            <DropdownRNE
              label="Select Team Member"
              placeholder="Select Team Member"
              containerStyle={{ marginBottom: 10 }}
              arrOfObj={teamMembersOptions}
              keyValueShowInBox="label"
              keyValueGetOnSelect="value"
              onChange={(v) => setAssign(v)}
              initialValue={assign}
              // dropdownPosition={"top"}
              isSearch
            />
          </View>
          <CustomBtn
            title="Save"
            containerStyle={{ margin: 20 }}
            disabled={!assign}
            onPress={handleSubmit}
            isLoading={isLoading}
          />
        </View>
      </View>
    </CustomModal>
  );
};

export default MultipleLeadAssign;
