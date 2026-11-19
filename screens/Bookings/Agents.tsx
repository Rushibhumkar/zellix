import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import { useAppToast } from "../../components/AppToast";
import { selectUser } from "../../redux/userSlice";
import { axiosInstance } from "../../services/authApi/axiosInstance";
import { bookingCommand, bookingError, previewBookingAllocation, refreshBookingQueries } from "../../utils/bookingWorkflow";
import { routeBooking } from "../../utils/routes";
import { getTeam } from "../../services/rootApi/api";
const fieldStyle = {
  borderWidth: 1,
  borderColor: "#CBD5E1",
  borderRadius: 8,
  padding: 10,
  marginVertical: 10
};
const initialAgent = () => ({
  _id: "",
  inputMode: "percentage",
  commissionPerc: "",
  commission: "",
  creditPerc: 100,
  overrideReason: ""
});
export default function Agents() {
  const {
    params
  } = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const {
    user
  } = useSelector(selectUser);
  const toast = useAppToast();
  const previous = params?.data?.initialValues;
  const admin = ["sup_admin", "sub_admin", "developer"].includes(user?.role);
  const [rows, setRows] = useState<any[]>(previous?.agents?.length ? previous.agents.map((row: any) => ({
    ...row,
    _id: row._id?._id || row._id,
    inputMode: row.inputMode || "percentage",
    creditPerc: row.creditPerc ?? (previous.agents.length === 1 ? 100 : "")
  })) : [initialAgent()]);
  const [correctionReason, setCorrectionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const commands = useRef({});
  const options = useQuery({
    queryKey: ["bookingAgentOptions", user?._id],
    staleTime: 60_000,
    queryFn: () => axiosInstance.get("/api/booking/agent-options").then(res => res.data.data)
  });
  const settings = useQuery({
    queryKey: ["bookingShareSettings", user?._id],
    staleTime: 60_000,
    queryFn: () => axiosInstance.get("/api/booking/share-settings").then(res => res.data)
  });
  const teams = useQuery({
    queryKey: ["bookingHistoricalTeams", user?._id],
    staleTime: 60_000,
    queryFn: getTeam,
    enabled: admin
  });
  const suggested = useRef(Boolean(previous));
  useEffect(() => {
    if (suggested.current || !options.data || !settings.data) return;
    suggested.current = true;
    const owner = options.data.find((employee: any) => employee._id === params?.data?.sourceResponsibleUserId);
    if (owner) chooseEmployee(0, owner);
  }, [options.data, settings.data]);
  const {
    agents: allocation,
    net,
    allocated,
    credit
  } = previewBookingAllocation(params?.data || {}, rows);
  const update = (index: number, changes: any) => setRows(current => current.map((row, i) => i === index ? {
    ...row,
    ...changes
  } : row));
  function chooseEmployee(index: number, employee: any) {
    const date = new Date(params?.data?.date || Date.now());
    const price = Number(params?.data?.total);
    const rule = settings.data?.rules?.find((rule: any) => rule.role === employee.role && price >= rule.minDeal && price < rule.maxDeal && date >= new Date(rule.effectiveFrom) && date < new Date(rule.effectiveUntil) && (rule.minExperience == null || employee.experienceYears >= rule.minExperience) && (rule.maxExperience == null || employee.experienceYears < rule.maxExperience));
    update(index, {
      _id: employee._id,
      inputMode: "percentage",
      commissionPerc: rule ? String(rule.percentage) : "",
      overrideReason: ""
    });
  }
  async function submit() {
    if (submitting.current) return;
    if (!rows.length || rows.some(row => !row._id) || new Set(rows.map(row => row._id)).size !== rows.length) {
      toast.error("Select each recipient once.");
      return;
    }
    if (!Number.isFinite(net) || net < 0 || allocation.some(row => !Number.isFinite(row.commission) || row.commission < 0 || !Number.isFinite(row.creditPerc) || row.creditPerc < 0 || row.creditPerc > 100) || rows.some(row => row.inputMode === "percentage" && (row.commissionPerc === "" || Number(row.commissionPerc) > 100)) || allocated > net || Math.abs(credit - 100) > 0.00001) {
      toast.error("Check revenue shares. Payouts must fit net revenue and sales credit must total 100%.");
      return;
    }
    if (previous?.status === "approved" && !correctionReason.trim()) {
      toast.error("Enter a reason for this approved booking correction.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const {
        initialValues,
        clients,
        paymentStatus,
        status,
        ...values
      } = params.data;
      const body = {
        ...values,
        ownerShipDetails: clients || previous?.ownerShipDetails || [],
        agents: allocation,
        ...(previous?.status === "approved" && {
          reason: correctionReason
        }),
        ...(previous && {
          expectedVersion: previous.__v ?? 0
        })
      };
      await axiosInstance.post(previous?._id ? `/api/booking/updateBookingByIdV2/${previous._id}` : "/api/booking/V2", bookingCommand(commands.current, previous?._id ? "edit" : "create", body));
      refreshBookingQueries(queryClient);
      toast.success(previous ? "Booking updated successfully." : "Booking added successfully.");
      navigation.navigate(routeBooking.allBookings);
    } catch (error) {
      toast.error(bookingError(error));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return <>
      <Header title={previous ? "Update Revenue Allocation" : "Revenue Allocation"} />
      <Container>
        <ScrollViewWithKeyboardAvoid>
          <View style={{
          padding: 20,
          paddingBottom: 100,
          gap: 16
        }}>
            <Text style={{
            fontWeight: "700",
            fontSize: 18
          }}>Net Revenue · AED {Number.isFinite(net) ? net.toFixed(2) : "—"}</Text>
            {(options.isPending || settings.isPending) && <ActivityIndicator color="#2E67BE" />}
            {(options.isError || settings.isError) && <Pressable onPress={() => {
            void options.refetch();
            void settings.refetch();
          }}>
              <Text>Could not load allocation options. Tap to retry.</Text>
            </Pressable>}
            {rows.map((row, index) => <View key={index} style={{
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 12,
            padding: 14,
            gap: 8
          }}>
                <Text style={{
              fontWeight: "600"
            }}>Recipient {index + 1}</Text>
                <Dropdown style={fieldStyle} data={(options.data || []).map((employee: any) => ({
              ...employee,
              label: [employee.name, employee.lastName].filter(Boolean).join(" ") + " · " + employee.role
            }))} labelField="label" valueField="_id" value={row._id} disable={busy} placeholder="Select recipient" search searchPlaceholder="Search employees" mode="modal" onChange={employee => chooseEmployee(index, employee)} />
                {admin && <Dropdown style={fieldStyle} data={[{
              label: "Percentage",
              value: "percentage"
            }, {
              label: "Amount (AED)",
              value: "amount"
            }]} labelField="label" valueField="value" value={row.inputMode} disable={busy} onChange={option => update(index, {
              inputMode: option.value
            })} />}
                <CustomInput label={row.inputMode === "amount" ? "Payout (AED)" : "Share of net revenue (%)"} value={String(row.inputMode === "amount" ? row.commission : row.commissionPerc)} onChangeText={value => update(index, {
              [row.inputMode === "amount" ? "commission" : "commissionPerc"]: value
            })} props={{
              keyboardType: "decimal-pad",
              editable: !busy && (admin || row.inputMode !== "amount")
            }} />
                <Text>Payout · AED {Number.isFinite(allocation[index].commission) ? allocation[index].commission.toFixed(2) : "—"}</Text>
                <CustomInput label="Sales credit (%)" value={rows.length === 1 ? "100" : String(row.creditPerc)} onChangeText={value => update(index, {
              creditPerc: value
            })} props={{
              keyboardType: "decimal-pad",
              editable: !busy && rows.length > 1
            }} />
                {admin && <CustomInput label="Override reason" value={row.overrideReason || ""} onChangeText={value => update(index, {
              overrideReason: value
            })} props={{
              editable: !busy
            }} />}
                {admin && <>
                  <Dropdown style={fieldStyle} data={[{
                _id: "",
                name: "At entry / needs review"
              }, ...(teams.data || [])]} labelField="name" valueField="_id" value={row.historicalTeamId || ""} disable={busy} placeholder="Historical team (optional)" mode="modal" search onChange={team => update(index, {
                historicalTeamId: team._id
              })} />
                  <CustomInput label="Historical team review reason" value={row.historicalReason || ""} onChangeText={value => update(index, {
                historicalReason: value
              })} props={{
                editable: !busy
              }} />
                </>}
                <CustomBtn title="Remove recipient" disabled={busy} onPress={() => setRows(current => current.filter((_, i) => i !== index))} />
              </View>)}
            <CustomBtn title="Add recipient" disabled={busy || rows.length >= 100} onPress={() => setRows(current => [...current, {
            ...initialAgent(),
            creditPerc: ""
          }])} />
            <Text>Allocated · AED {Number.isFinite(allocated) ? allocated.toFixed(2) : "—"}</Text>
            <Text>Company remainder · AED {Number.isFinite(net - allocated) ? (net - allocated).toFixed(2) : "—"}</Text>
            <Text>Sales credit · {Number.isFinite(credit) ? credit + "%" : "—"}</Text>
            {previous?.status === "approved" && <CustomInput label="Correction reason" value={correctionReason} onChangeText={setCorrectionReason} props={{
            editable: !busy
          }} />}
            <CustomBtn title={previous ? "Save Changes" : "Submit Booking"} onPress={submit} isLoading={busy} disabled={busy || options.isPending || settings.isPending || options.isError || settings.isError} />
          </View>
        </ScrollViewWithKeyboardAvoid>
      </Container>
    </>;
}
