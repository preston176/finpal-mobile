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
import { WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/context/authContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'


const walletModal = () => {

    const { user, updateUserData } = useAuth()

    const [wallet, setWallet] = useState<WalletType>({
        name: "",
        image: null
    })

    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const oldWallet: { name: string, image: string, id: string } = useLocalSearchParams();

    useEffect(() => {
        if (oldWallet?.id) {
            setWallet({
                name: oldWallet?.name,
                image: oldWallet?.image
            })
        }
    }, []);

    const onsubmit = async () => {

        let { name, image } = wallet
        if (!name.trim() || !image) {
            Alert.alert("User", "Please fill in all the required fields")
            return;
        }

        const data: WalletType = {
            name,
            image,
            uid: user?.uid
        }
        // TODO: incl wallet id if updating
        if (oldWallet?.id) data.id = oldWallet?.id

        setLoading(true);

        const res = await createOrUpdateWallet(data)

        // console.log("wallet", res)

        setLoading(false)

        if (res.success) {
            // update user

            updateUserData(user?.uid as string);
            router.back();
        } else {
            Alert.alert("user", res.msg)
        }

    }
    const onDelete = async () => {
        // console.log("deleting wallet", oldWallet?.id)
        if (!oldWallet?.id) return
        setLoading(true)
        const res = await deleteWallet(oldWallet?.id)
        setLoading(false)

        if(res.success){
            router.back()
        } else {
            Alert.alert("Wallet", res.msg)
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
                <Header title={oldWallet?.id ? 'Update Wallet' : 'New Wallet'} leftIcon={<BackButton />
                }
                    style={{
                        marginBottom: spacingY._10
                    }} />

                <ScrollView contentContainerStyle={styles.form}>

                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Name</Typo>
                        <Input
                            placeholder='Name'
                            value={wallet.name}
                            onChangeText={(value) => setWallet({ ...wallet, name: value })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Icon</Typo>

                        {/* Icon input */}
                        <ImageUpload file={wallet.image} onClear={() => setWallet({ ...wallet, image: null })} onSelect={file => setWallet({ ...wallet, image: file })} placeholder='Upload Image' />
                    </View>
                </ScrollView>
            </View>

            <View style={styles.footer}>
                {
                    oldWallet?.id && !loading && (
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
                        oldWallet?.id ? "Update Wallet" : "Add Wallet"}</Typo>
                </Button>
            </View>
        </ModalWrapper>
    )
}

export default walletModal

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