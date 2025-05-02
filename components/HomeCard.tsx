import { StyleSheet, View } from 'react-native'
import React from 'react'
import Typo from './Typo'
import { scale, verticalScale } from '@/utils/styling'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { ImageBackground } from 'expo-image'
import * as Icons from 'phosphor-react-native'
import { useAuth } from '@/context/authContext'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { orderBy, where } from '@firebase/firestore'

const HomeCard = () => {
const {user} = useAuth()

const {data:wallets, error, loading:walletLoading} = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc")
])

const getTotals = () => {

    return wallets.reduce((totals:any, item: WalletType) => {
        totals.balance = totals.balance + Number(item.amount)
        totals.income =totals.income + Number(item.amount)
        totals.expenses =totals.expenses + Number(item.amount)

        return totals
    }, {balance: 0, income:0, expenses: 0})
}

    return (
        <ImageBackground
            source={require("../assets/images/card.png")}
            resizeMode="stretch"
            style={styles.bgImage}
        >
            <View style={styles.container}>
                {/* Top Section - Balance */}
                <View style={styles.topSection}>
                    <View style={styles.totalBalanceRow}>
                        <Typo color={colors.neutral800} size={17} fontWeight="500">
                            Total Balance
                        </Typo>
                        <Icons.DotsThreeOutline
                            size={verticalScale(23)}
                            color={colors.black}
                            weight="fill"
                        />
                    </View>
                    <Typo color={colors.black} size={30} fontWeight="bold">
                        Kes {getTotals()?.balance?.toFixed(2)}
                    </Typo>
                </View>

                {/* Bottom Section - Income and Expense */}
                <View style={styles.bottomSection}>
                    {/* Income */}
                    <View style={styles.statBlock}>
                        <View style={styles.incomeExpense}>
                            <View style={styles.statsIcon}>
                                <Icons.ArrowDown
                                    size={verticalScale(15)}
                                    color={colors.black}
                                    weight="bold"
                                />
                            </View>
                            <Typo size={16} color={colors.neutral700} fontWeight="600">
                                Income
                            </Typo>
                        </View>
                        <Typo size={17} color={colors.green} fontWeight="bold">
                           Kes  {getTotals()?.income?.toFixed(2)}
                        </Typo>
                    </View>

                    {/* Expense */}
                    <View style={styles.statBlock}>
                        <View style={styles.incomeExpense}>
                            <View style={styles.statsIcon}>
                                <Icons.ArrowUp
                                    size={verticalScale(15)}
                                    color={colors.black}
                                    weight="bold"
                                />
                            </View>
                            <Typo size={16} color={colors.neutral700} fontWeight="500">
                                Expense
                            </Typo>
                        </View>
                        <Typo size={17} color={colors.rose} fontWeight="bold">
                        Kes {getTotals()?.expenses?.toFixed(2)}
                        </Typo>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
}

export default HomeCard

const styles = StyleSheet.create({
    bgImage: {
        height: scale(210),
        width: "100%",
    },
    container: {
        flex: 1,
        padding: spacingX._20,
        justifyContent: "space-between",
    },
    topSection: {
        width: "100%",
    },
    bottomSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    totalBalanceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacingY._5,
    },
    incomeExpense: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._10,

    },
    statsIcon: {
        backgroundColor: colors.neutral350,
        padding: spacingY._5,
        borderRadius: 50,
    },
    statBlock: {
        alignItems: "center",
        marginBottom: 25,
    },
})
