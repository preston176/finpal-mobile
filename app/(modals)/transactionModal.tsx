import { Alert, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
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
import { deleteWallet } from '@/services/walletService'
import { Dropdown } from "react-native-element-dropdown"
import { expenseCategories, transactionTypes } from '@/constants/data'
import useFetchData from '@/hooks/useFetchData'
import { orderBy, where } from '@firebase/firestore'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService'

const transactionModal = () => {

    const { user, updateUserData } = useAuth()

    const [transaction, setTransaction] = useState<TransactionType>({
        type: "expense",
        amount: 0,
        description: "",
        date: new Date(),
        walletId: "",
        image: null

    })

    const [loading, setLoading] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)


    const router = useRouter()

    const {
        data: wallets, error: walletError, loading: walletLoading,
    } = useFetchData<WalletType>("wallets", [
        where("uid", "==", user?.uid), orderBy("created", "desc")
    ])


    type paramType = {
        id: string;
        type: string;
        amount: string;
        category?: string;
        date: string;
        description: string;
        image?: any;
        uid?: string;
        walletId: string;
    }


    const oldTransaction: paramType = useLocalSearchParams();

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || transaction.date
        setTransaction({ ...transaction, date: currentDate })
        setShowDatePicker(Platform.OS == "ios" ? true : false)
    }

    useEffect(() => {
        if (oldTransaction?.id) {
            setTransaction({
                type: oldTransaction?.type,
                amount: Number(oldTransaction.amount),
                description: oldTransaction.description || "",
                category: oldTransaction.category || "",
                date: new Date(oldTransaction.date),
                walletId: oldTransaction.walletId,
                image: oldTransaction?.image
            })
        }
    }, []);

    const onsubmit = async () => {
        const { type, amount, description, category, date, walletId, image } = transaction;
        if (!walletId || !date || !amount || (type == "expense" && !category)) {
            Alert.alert("Transaction", "Please fill in all the fields")
            return
        }

        let transactionData: TransactionType = {
            type, amount, description, category, date, walletId, image: image ? image : null, uid: user?.uid
        }

        if (oldTransaction?.id) transactionData.id = oldTransaction.id

        setLoading(true)
        const res = await createOrUpdateTransaction(transactionData)
        setLoading(false)

        if (res.success) {
            router.back()
        } else {
            Alert.alert("Transaction", res.msg)
        }


    }
    const onDelete = async () => {
        // console.log("deleting wallet", oldTransaction?.id)
        if (!oldTransaction?.id) return
        setLoading(true)
        const res = await deleteTransaction(oldTransaction?.id, oldTransaction.walletId)
        setLoading(false)

        if (res.success) {
            router.back()
        } else {
            Alert.alert("Transaction", res.msg)
        }
    }

    const showDeleteAlert = () => {
        Alert.alert("Confirm", `Are you sure you want to delete?`, [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: () => onDelete(),
                style: "destructive"
            },
        ])
    }

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <Header title={oldTransaction?.id ? 'Update Transaction' : 'New Transaction'} leftIcon={<BackButton />
                }
                    style={{
                        marginBottom: spacingY._10
                    }} />

                <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>Transaction Type</Typo>
                        {/* Dropdown */}
                        <Dropdown
                            style={styles.dropdownContainer}
                            // placeholderStyle={styles.dropdownPlaceholder}
                            activeColor={colors.neutral700}
                            selectedTextStyle={styles.dropdownSelectedText}
                            iconStyle={styles.dropdownIcon}
                            data={transactionTypes}

                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            itemTextStyle={styles.dropdownItemText}
                            itemContainerStyle={styles.dropdownItemContainer}
                            // placeholder={!isFocus ? 'Select item' : '...'}
                            value={transaction.type}

                            onChange={item => {
                                setTransaction({ ...transaction, type: item.value })
                            }}

                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet</Typo>
                        {/* Dropdown */}
                        <Dropdown
                            style={styles.dropdownContainer}
                            // placeholderStyle={styles.dropdownPlaceholder}
                            activeColor={colors.neutral700}
                            selectedTextStyle={styles.dropdownSelectedText}
                            iconStyle={styles.dropdownIcon}
                            data={wallets.map(wallet => ({
                                label: `${wallet?.name} (kes ${wallet.amount})`,
                                value: wallet?.id,
                            }))}

                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            itemTextStyle={styles.dropdownItemText}
                            itemContainerStyle={styles.dropdownItemContainer}
                            placeholder={"Select wallet"}
                            placeholderStyle={{ color: colors.white }}
                            value={transaction.walletId}

                            onChange={item => {
                                setTransaction({ ...transaction, walletId: item.value ?? "" })
                            }}

                        />
                    </View>
                    {/* Expense categories */}
                    {
                        transaction.type == "expense" && <View style={styles.inputContainer}>
                            <Typo color={colors.neutral200}>Expense Category</Typo>
                            {/* Dropdown */}
                            <Dropdown
                                style={styles.dropdownContainer}
                                // placeholderStyle={styles.dropdownPlaceholder}
                                activeColor={colors.neutral700}
                                selectedTextStyle={styles.dropdownSelectedText}
                                iconStyle={styles.dropdownIcon}
                                data={Object.values(expenseCategories)}

                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                itemTextStyle={styles.dropdownItemText}
                                itemContainerStyle={styles.dropdownItemContainer}
                                placeholder={"Select Category"}
                                placeholderStyle={{ color: colors.white }}
                                value={transaction.category}

                                onChange={item => {
                                    setTransaction({ ...transaction, category: item.value ?? "" })
                                }}

                            />
                        </View>
                    }
                    {/* Date picker */}

                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>Date</Typo>
                        {
                            !showDatePicker && (
                                <Pressable style={styles.iosDatePicker} onPress={() => setShowDatePicker(true)}>
                                    <Typo size={14}>
                                        {(transaction.date as Date).toLocaleString()}
                                    </Typo>

                                </Pressable>
                            )
                        }
                        {
                            showDatePicker && (
                                <View style={Platform.OS == "ios" && styles.iosDatePicker}>
                                    <DateTimePicker
                                        themeVariant={"dark"}
                                        value={transaction.date as Date}
                                        textColor={colors.white}
                                        mode={"date"}
                                        display={Platform.OS == "ios" ? "spinner" : "default"}
                                        onChange={onDateChange}
                                    />
                                    {
                                        Platform.OS == "ios" && (
                                            <TouchableOpacity
                                                // style={styles.datePickerButton}
                                                onPress={() => setShowDatePicker(false)}
                                            >
                                                <Typo size={15} fontWeight={"500"}>
                                                    Ok
                                                </Typo>
                                            </TouchableOpacity>
                                        )
                                    }
                                </View>
                            )
                        }

                        {/* Icon input */}
                    </View>
                    {/* Amount */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>Amount</Typo>
                        <Input
                            // placeholder='Name'
                            value={transaction?.amount.toString()}
                            keyboardType='numeric'
                            onChangeText={(value) => setTransaction({ ...transaction, amount: Number(value.replace(/[^0-9]/g, "")) })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={styles.flexRow}>
                            <Typo color={colors.neutral200} size={16}>Description</Typo>
                        </View>
                        <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                        <Input
                            // placeholder='Name'
                            value={transaction?.description}
                            multiline
                            containerStyle={{
                                flexDirection: "row",
                                height: verticalScale(100),
                                alignItems: "flex-start",
                                paddingVertical: 15
                            }}
                            onChangeText={(value) => setTransaction({ ...transaction, description: value })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={styles.flexRow}>
                            <Typo color={colors.neutral200} size={16}>Receipt</Typo>
                        </View>
                        <Typo color={colors.neutral500} size={14}>(optional)</Typo>

                        {/* Icon input */}
                        <ImageUpload file={transaction.image} onClear={() => setTransaction({ ...transaction, image: null })} onSelect={file => setTransaction({ ...transaction, image: file })} placeholder='Upload Image' />
                    </View>
                </ScrollView>
            </View>


            <View style={styles.footer}>
                {
                    oldTransaction?.id && !loading && (
                        <Button
                            onPress={showDeleteAlert}
                            style={{
                                backgroundColor: colors.rose,
                                paddingHorizontal: spacingX._15
                            }}>
                            <Icons.Trash
                                color={colors.white}
                                size={verticalScale(24)}
                                weight='bold'
                            />
                        </Button>
                    )
                }
                <Button onPress={onsubmit} loading={loading} style={{ flex: 1 }}>
                    <Typo color={colors.black} fontWeight={"700"} >{
                        oldTransaction?.id ? "Update" : "Submit"}</Typo>
                </Button>
            </View>
        </ModalWrapper>
    )
}

export default transactionModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingX._20,
    },
    form: {
        gap: spacingY._20,
        paddingVertical: spacingY._15,
        paddingBottom: spacingY._40,
    },
    footer: {
        flexDirection: 'row',
        gap: spacingX._10,
        padding: spacingY._10,
        backgroundColor: colors.neutral900,
        borderTopWidth: 1,
        borderColor: colors.neutral700,
    },
    dropdownContainer: {
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: colors.neutral300,
        backgroundColor: colors.neutral800, // Make input background dark
        paddingHorizontal: spacingX._15,
        borderRadius: radius._15,
        borderCurve: 'continuous',
        justifyContent: 'center',
    },
    dropdownPlaceholder: {
        color: colors.neutral400,
    },
    dropdownSelectedText: {
        color: colors.white,
        fontSize: scale(14),
    },
    dropdownIcon: {
        width: verticalScale(24),
        height: verticalScale(24),
        tintColor: colors.neutral300,
    },
    dropdownItemContainer: {
        backgroundColor: colors.neutral900, // Make item container dark
        borderRadius: radius._10,
        paddingHorizontal: spacingX._10,
        paddingVertical: spacingY._7,
    },
    dropdownItemText: {
        color: colors.white,
        fontSize: scale(14),
    },
    dropdownListContainer: {
        backgroundColor: colors.neutral900, // dropdown bg dark
        borderRadius: radius._10,
        paddingVertical: spacingY._7,
        marginTop: 5,
        borderColor: colors.neutral700,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    inputContainer: {
        gap: spacingY._5,
    },
    iosDatePicker: {
        backgroundColor: colors.neutral800,
        borderRadius: radius._10,
        padding: spacingY._10,
    },
    flexRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._5
    }
})
