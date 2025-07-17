import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Container from '../../myComponents/Container/Container'
import Header from '../../components/Header'
import { routeIncentive } from '../../utils/routes'
import { useNavigation } from '@react-navigation/native'
import LeadPoolIcon from '../../assets/svg/LeadPoolIcon'
import InfiniteScroll from '../../myComponents/InfiniteScroll/InfiniteScroll'
import CardProject from '../Project/component/CardProject'
import useSelectList from '../../hooks/useSelectList'

const TeamIncentive = () => {
    const { navigate } = useNavigation();
    const { selected, handleSelect } = useSelectList();
    return (
        <Container>
            <Header
                title={'Team Incentive'}
            />
            <TouchableOpacity
                onPress={() => navigate(routeIncentive.IncentiveList)}
                activeOpacity={0.5}
                style={{
                    position: 'absolute',
                    bottom: 100,
                    right: 20,
                    zIndex: 5,
                }}>
                <LeadPoolIcon width={60} height={60} />
            </TouchableOpacity>
            <InfiniteScroll
                query={{}}
                renderItems={({ item, index }) => {
                    return <CardProject
                        index={index}
                        item={item}
                        selected={selected?.indexOf(item?._id) !== -1}
                        // bgColor={bgByStatus[item?.status]}
                        onPress={() => {
                            // if (true) {
                            selected?.length === 0
                                ? navigate(routeProject.ProjectNavigator)
                                : handleSelect(item._id)
                            // }
                        }}
                        onLongPress={() => handleSelect(item._id)}
                    />
                }}
            />
        </Container>
    )
}

export default TeamIncentive

const styles = StyleSheet.create({})