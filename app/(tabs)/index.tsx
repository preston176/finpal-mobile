import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import ScreenWrapper from '@/components/ScreenWrapper'
import { verticalScale } from '@/utils/styling'
import { useAuth } from '@/context/authContext'
import * as Icons from "phosphor-react-native"
import HomeCard from '@/components/HomeCard'
import TransactionList from '@/components/TransactionList'
import { useRouter } from 'expo-router'

const Home = () => {
    const { user } = useAuth()

    const router = useRouter()

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={{ gap: 4 }}>
                        <Typo size={16} color={colors.neutral400}>Hello,</Typo>
                        <Typo size={20} fontWeight={"500"}>{user?.name}</Typo>
                    </View>
                </View>
                <TouchableOpacity style={styles.searchIcon}>
                    <Icons.MagnifyingGlass
                        size={verticalScale(22)}
                        color={colors.neutral200}
                        weight='bold'
                    />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                {/* Card */}
                <View>
                    <HomeCard />
                </View>

                <TransactionList data={[]} loading={false} emptyListMessage='No transactions added yet' title='Recent Transactions' />
            </ScrollView>
            <Button style={styles.floatingButton} onPress={() => router.push("/(modals)/transactionModal")}>
                <Icons.Plus
                    color={colors.black}
                    weight='bold'
                    size={verticalScale(24)}
                />
            </Button>
        </ScreenWrapper>
    )
}

export default Home

const styles = StyleSheet.create({
    scrollViewStyle: {
        marginTop: spacingY._10,
        paddingBottom: verticalScale(100),
        gap: spacingY._25,
    },
    floatingButton: {
        height: verticalScale(50),
        width: verticalScale(50),
        borderRadius: 100,
        position: "absolute",
        bottom: verticalScale(30),
        right: verticalScale(30)
    },
    searchIcon: {
        backgroundColor: colors.neutral700,
        padding: spacingX._10,
        borderRadius: 50,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._10
    },
    container: {
        flex: 1,
        paddingHorizontal: spacingX._20,
        marginTop: verticalScale(8)
    }
})