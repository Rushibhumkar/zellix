import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SingleCard } from './CardHRM'
import { useGetAgentLeaveCount } from '../../hooks/useGetQuerryHRM'

const CardAgentLeaveCount = () => {
    const { data, isLoading } = useGetAgentLeaveCount({
        isEnable: true
    });

    return (
        <View
            style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 10,
                    paddingHorizontal: 10,
                    marginBottom: 15
                }}
            >
                <SingleCard
                    title={'Total Leaves'}
                    number={data?.totalLeaves ?? 0}
                />
                <SingleCard
                    title={'Unused Leaves'}
                    number={data?.unusedLeaves ?? 0}
                />
            </View>
            <SingleCard
                title={'Used Leaves'}
                number={data?.usedLeaves ?? 0}
            />
        </View>
    )
}

export default CardAgentLeaveCount
