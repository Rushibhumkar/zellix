import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Container from '../../myComponents/Container/Container'
import Header from '../../components/Header'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useGetProjectById } from './useQuery/useProject'
import { myConsole } from '../../hooks/useConsole'
import RowItem from '../../myComponents/RowItem/RowItem'
import MainTitle from '../../myComponents/MainTitle/MainTitle'
import moment from 'moment'
import CustomText from '../../myComponents/CustomText/CustomText'
import EditIcon from '../../assets/svg/EditIcon'
import { routeProject } from '../../utils/routes'

const ProjectDetail = () => {
    const { params } = useRoute();
    let details = params?.item;
    const { navigate } = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    const { data, isLoading, refetch } = useGetProjectById(params?.item?._id);
    myConsole('data', data)

    const onRefresh = () => {
        setRefreshing(true);
        refetch && refetch();
        setRefreshing(false);
    };
    return (
        <Container>
            <Header title={"Project Details"} />
            <ScrollView style={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <MainTitle
                    title={"Project Details"}
                    containerStyle={{ marginBottom: 20 }}
                    icon={<Pressable
                        onPress={() => navigate(routeProject.ProjectForm, { detail: data })}
                        style={{ padding: 5, paddingRight: 0 }}
                    >
                        <EditIcon />
                    </Pressable>}
                />
                <RowItem
                    title={"Project Name"}
                    value={data?.projectName}
                    containerStyle={{ marginBottom: 10 }}
                />
                <RowItem
                    title={"Page Name"}
                    value={data?.pageName}
                    containerStyle={{ marginBottom: 10 }}
                />
                <RowItem
                    title={"Source"}
                    value={data?.source}
                    containerStyle={{ marginBottom: 10 }}
                />
                <RowItem
                    title={"Creation Date"}
                    value={moment(data?.createdAt).format('DD-MM-YYYY')}
                    containerStyle={{ marginBottom: 10 }}
                />
                <RowItem
                    title={"Total Leads"}
                    value={data?.totalLeads || '0'}
                    containerStyle={{ marginBottom: 10 }}
                />
                <RowItem
                    title={"Form ID"}
                    value={data?.formId}
                    containerStyle={{ marginBottom: 10 }}
                />
                <RowItem
                    title={"Sr. Manager"}
                    value={data?.srManager?.name}
                    containerStyle={{ marginBottom: 10 }}
                />
                <RowItem
                    title={"Team Members"}
                    // value={data?.source}
                    containerStyle={{ marginBottom: 10 }}
                    component={<View style={{ flexDirection: 'row' }}>
                        {data?.members?.map((x, i, a) => {
                            return <CustomText key={x?._id}>{x?.name} {a?.length - 1 !== i ? ',' : ''}</CustomText>
                        })}
                    </View>}
                />

                <RowItem
                    title={"Total Members"}
                    value={data?.totalMembers || '0'}
                    containerStyle={{ marginBottom: 10 }}
                />

            </ScrollView>
        </Container>
    )
}

export default ProjectDetail

const styles = StyleSheet.create({})