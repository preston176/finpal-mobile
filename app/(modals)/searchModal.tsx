import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import { ScrollView } from 'react-native'
import * as Icons from "phosphor-react-native"
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { TransactionType, WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/context/authContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'
import { limit, orderBy, Transaction, where } from '@firebase/firestore'
import { transactionTypes } from '@/constants/data'
import useFetchData from '@/hooks/useFetchData'
import TransactionList from '@/components/TransactionList'


const searchModal = () => {

    const { user, updateUserData } = useAuth()


    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')


    const router = useRouter()

    const constraints = [
        where("uid", "==", user?.uid),
        orderBy("date", "desc"),
        limit(30)
    ]

    const {
        data: allTransactions,
        error,
        loading: transactionsLoading,
    } = useFetchData<TransactionType>("transactions", constraints)


    const filteredTransactions = allTransactions.filter((item) => {
        if (search.length > 1) {
            if (item.category?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()) ||
                item.type?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()) ||
                item.description?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase())) {

                return true
            }
            return false;
        }
        return true
    })

    return (
        <ModalWrapper style={{ backgroundColor: colors.neutral900 }}>
            <View style={styles.container}>
                <Header title={"Search"} leftIcon={<BackButton />
                }
                    style={{
                        marginBottom: spacingY._10
                    }} />

                <ScrollView contentContainerStyle={styles.form}>

                    <View style={styles.inputContainer}>
                        <Input
                            placeholder='Type to search ...'
                            value={search}
                            placeholderTextColor={colors.neutral400}
                            containerStyle={{ backgroundColor: colors.neutral800 }}
                            onChangeText={(value) => setSearch(value)}
                        />
                    </View>
                    <View>
                        <TransactionList
                            loading={transactionsLoading}
                            data={filteredTransactions}
                            emptyListMessage='No transactions match your search keywords'
                        />
                    </View>

                </ScrollView>
            </View>


        </ModalWrapper>
    )
}

export default searchModal

const styles = StyleSheet.create({
    inputContainer: {
        gap: spacingY._10,
    },
    editIcon: {
        position: "absolute",
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 100,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._10,
    },
    avatar: {
        alignSelf: "center",
        backgroundColor: colors.neutral300,
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200,
        borderWidth: 1,
        borderColor: colors.neutral500
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center"
    },
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._5,
        borderTopWidth: 1,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._20
    }
})