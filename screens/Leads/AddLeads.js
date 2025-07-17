import React, { useState } from "react";
import Header from "../../components/Header";
import Container from "../../myComponents/Container/Container";
import AddSingleLead from "./AddSingleLead";
import MainTitle from "../../myComponents/MainTitle/MainTitle";
import UpDownIcon from "../../assets/svg/UpDownIcon";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { useRoute } from "@react-navigation/native";
import AddBulkLead from "./AddBulkLead";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";


const AddLeads = () => {
  const { user } = useSelector(selectUser)
  const { params } = useRoute();
  let data = params?.detail;
  //
  const [openLeadField, setOpenLeadField] = useState({
    bulk: false,
    single: !!data ? true : false
  })

  const handleOpenField = (key) => {
    setOpenLeadField((prev) => {
      return { ...prev, [key]: !prev[key] }
    })
  }
  return (
    <>
      <Header title={!!data ? 'Update Lead' : "Add Leads"} />
      <Container>
        <KeyboardAvoidingView
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView>
          <View
            style={{
              paddingBottom: 100,
              padding: 20
            }}
          >

            {(user?.isAdmin && !data) && <>
              <MainTitle
                title={'Add Leads In Bulk'}
                icon={<UpDownIcon
                  transform={[{ rotate: openLeadField.bulk ? '180deg' : '0deg' }]}
                />}
                containerStyle={{
                  marginBottom: openLeadField.bulk ? 20 : 30
                }}
                onPress={() => handleOpenField('bulk')}
              />
              {openLeadField.bulk && <View style={{ minHeight: 100 }}>
                <AddBulkLead />
              </View>}
            </>}

            <MainTitle
              title='Add SIngle Lead'
              icon={<UpDownIcon
                transform={[{ rotate: openLeadField.single ? '180deg' : '0deg' }]}
              />}
              containerStyle={{ marginBottom: 20 }}
              onPress={() => handleOpenField('single')}
            />
            {openLeadField.single && <AddSingleLead data={data ?? null} />}
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    </>
  );
};

export default AddLeads;
