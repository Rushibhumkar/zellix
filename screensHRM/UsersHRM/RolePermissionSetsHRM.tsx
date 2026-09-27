import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ContainerHRM from "../../myComponentsHRM/ContainerHRM/ContainerHRM";
import CustomText from "../../myComponents/CustomText/CustomText";
import { selectUser } from "../../redux/userSlice";
import { ASSIGNABLE_ROLE_OPTIONS, UserRole } from "../../utils/roles";
import { getRolePermissionSet, updateRolePermissionSet } from "../../services/hrmApi/userHrmApi";
import { useAppToast } from "../../components/AppToast";

type Permission = { value: boolean; label?: string; description?: string };
type PermissionGroups = Record<string, Record<string, Permission>>;

const readable = (value: string) => value
  .replace(/([a-z])([A-Z])/g, "$1 $2")
  .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const RolePermissionSetsHRM = () => {
  const { goBack } = useNavigation();
  const { user } = useSelector(selectUser);
  const toast = useAppToast();
  const insets = useSafeAreaInsets();
  const canEdit = [UserRole.sup_admin, UserRole.sub_admin, UserRole.office_admin, UserRole.developer].includes(user?.role);
  const [role, setRole] = useState<string>(ASSIGNABLE_ROLE_OPTIONS[0]?.value || UserRole.agent);
  const [permissions, setPermissions] = useState<PermissionGroups | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canEdit) return;
    let cancelled = false;
    if (!refreshing) {
      setPermissions(null);
      setLoading(true);
    }
    getRolePermissionSet(role)
      .then((data) => {
        if (cancelled) return;
        setPermissions(data?.permissions ? JSON.parse(JSON.stringify(data.permissions)) : null);
      })
      .catch((error) => {
        if (!cancelled) toast.error(error?.response?.data?.message || "Unable to load role permissions");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => { cancelled = true; };
  }, [role, canEdit, refreshKey]);

  const onRefresh = () => {
    if (loading || refreshing || saving) return;
    setRefreshing(true);
    setRefreshKey((current) => current + 1);
  };

  const toggle = (moduleName: string, key: string) => {
    setPermissions((current) => current ? {
      ...current,
      [moduleName]: {
        ...current[moduleName],
        [key]: { ...current[moduleName][key], value: !current[moduleName][key].value },
      },
    } : current);
  };

  const save = async () => {
    if (!permissions || saving) return;
    setSaving(true);
    try {
      const result = await updateRolePermissionSet(role, permissions);
      setPermissions(result?.data?.permissions ? JSON.parse(JSON.stringify(result.data.permissions)) : permissions);
      toast.success(result?.message || "Role permissions saved");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to save role permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContainerHRM
      isBAck={{ title: "Role Permission Sets", isGoBack: goBack }}
      childStyle={{ height: "auto", flex: 1, minHeight: 0 }}
    >
      {!canEdit ? (
        <View style={{ padding: 24 }}><CustomText>You do not have access to role permission sets.</CustomText></View>
      ) : (
        <View style={{ flex: 1, backgroundColor: "#F6F8FC" }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E67BE" colors={["#2E67BE"]} />}
          >
            <CustomText style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 8 }}>Select role</CustomText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {ASSIGNABLE_ROLE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => { if (!saving) { setRefreshing(false); setRole(option.value); } }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                    backgroundColor: role === option.value ? "#2E67BE" : "#fff",
                    borderWidth: 1, borderColor: role === option.value ? "#2E67BE" : "#DCE5F2",
                  }}
                >
                  <CustomText style={{ color: role === option.value ? "#fff" : "#334155", fontWeight: "600" }}>{option.label}</CustomText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <CustomText style={{ color: "#64748B", fontSize: 13, marginBottom: 18 }}>
              Changes apply to users created after saving. Existing user permissions stay unchanged.
            </CustomText>

            {loading ? <ActivityIndicator size="large" color="#2E67BE" /> : !permissions ? (
              <CustomText style={{ color: "#64748B" }}>No permissions found for this role.</CustomText>
            ) : Object.entries(permissions).map(([moduleName, group]) => {
              const isOpen = expanded === moduleName;
              const enabled = Object.values(group).filter((item) => item.value).length;
              return (
                <View key={moduleName} style={{ backgroundColor: "#fff", borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden" }}>
                  <TouchableOpacity onPress={() => setExpanded(isOpen ? null : moduleName)} style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
                    <CustomText style={{ flex: 1, fontWeight: "700", color: "#1E293B" }}>{readable(moduleName)}</CustomText>
                    <CustomText style={{ color: "#64748B", marginRight: 10 }}>{enabled}/{Object.keys(group).length}</CustomText>
                    <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#64748B" />
                  </TouchableOpacity>
                  {isOpen && Object.entries(group).map(([key, permission]) => (
                    <View key={key} style={{ paddingHorizontal: 15, paddingVertical: 9, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexDirection: "row", alignItems: "center" }}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <CustomText style={{ color: "#334155", fontWeight: "600" }}>{permission.label || readable(key)}</CustomText>
                        {!!permission.description && <CustomText style={{ color: "#94A3B8", fontSize: 12 }}>{permission.description}</CustomText>}
                      </View>
                      <Switch value={Boolean(permission.value)} onValueChange={() => toggle(moduleName, key)} disabled={saving || refreshing} trackColor={{ true: "#93B9F8" }} thumbColor={permission.value ? "#2E67BE" : "#E2E8F0"} />
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E2E8F0" }}>
            <TouchableOpacity disabled={!permissions || loading || refreshing || saving} onPress={save} style={{ backgroundColor: "#2E67BE", borderRadius: 12, padding: 15, alignItems: "center", opacity: !permissions || loading || refreshing || saving ? 0.5 : 1 }}>
              {saving ? <ActivityIndicator color="#fff" /> : <CustomText style={{ color: "#fff", fontWeight: "700" }}>Save Default Permissions</CustomText>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ContainerHRM>
  );
};

export default RolePermissionSetsHRM;
