import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from "expo-image"
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import ScreenWrapper from '@/components/ScreenWrapper'
import Header from '@/components/Header'
import { useAuth } from '@/context/authContext'
import Typo from '@/components/Typo'
import { getProfileImage } from '@/services/imageService'
import { accountOptionType } from '@/types'
import * as Icons from "phosphor-react-native"
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useRouter } from 'expo-router'

const profile = () => {
    const { user } = useAuth()
    const router = useRouter()

    const accountOptions: accountOptionType[] = [
        {
            title: 'Edit Profile',
            icon: (<Icons.User size={26} color={colors.white} weight='fill' />),
            routeName: "/(modals)/profileModal",
            bgColor: "#6366f1"
        },
        {
            title: 'Settings',
            icon: (<Icons.GearSix size={26} color={colors.white} weight='fill' />),
            // routeName: "/(modals)/profileModal",
            bgColor: "#059669"
        },
        {
            title: 'Privacy Policy',
            icon: (<Icons.Lock size={26} color={colors.white} weight='fill' />),
            // routeName: "/(modals)/profileModal",
            bgColor: colors.neutral600
        },
        {
            title: 'LogOut',
            icon: (<Icons.Power size={26} color={colors.white} weight='fill' />),
            // routeName: "/(modals)/profileModal",
            bgColor: "#e11d48"
        },
    ]

    const handleLogout = async () => {
        await signOut(auth)
    }

    const showLogoutAlert = () => {
        Alert.alert("Confirm", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Logout"),
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: () => handleLogout(),
                style: "destructive",
            },

        ])
    }

    const handlePress = async (item: accountOptionType) => {
        if (item.title == "LogOut") {
            showLogoutAlert();
        }
        if (item.routeName) {
router.push(item.routeName)
        }
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}><Header title='Profile' style={{ marginVertical: spacingY._10 }} />

                {/* User information */}
                <View style={styles.userInfo}>
                    {/* Avatar */}

                    <View>
                        {/* user image */}
                        <Image source={getProfileImage(user?.image)} style={styles.avatar} contentFit='cover' transition={100} />
                    </View>


                    {/* Name and email */}
                    <View style={styles.nameContainer}>
                        <Typo size={24} fontWeight={"600"} color={colors.neutral100}>{user?.name}</Typo>
                        <Typo size={15} color={colors.neutral400}>{user?.email}</Typo>
                    </View>

                </View>
                {/* Account options */}
                <View style={styles.accountOptions}>
                    {
                        accountOptions.map((item, index) => (

                            <View key={index} style={styles.listItem}>
                                <TouchableOpacity onPress={() => handlePress(item)} style={styles.flexRow}>
                                    <View style={[styles.listIcon, { backgroundColor: item?.bgColor }]}>
                                        {item.icon && <Typo>{item.icon}</Typo>}
                                    </View>

                                    <Typo size={16} style={{ flex: 1 }} fontWeight={"500"}>
                                        {item.title}
                                    </Typo>

                                    <Icons.CaretRight
                                        size={verticalScale(20)}
                                        weight='bold'
                                        color={colors.white}
                                    />
                                </TouchableOpacity>
                            </View>


                        ))
                    }
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingX._20,

    },
    userInfo: {
        marginTop: verticalScale(30),
        alignItems: "center",
        gap: spacingY._15,
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center",
    },
    avatar: {
        alignSelf: "center",
        backgroundColor: colors.neutral300,
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200
    },
    editIcon: {
        position: "absolute",
        bottom: 5,
        right: 8,
        borderRadius: 50,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: 5
    },
    nameContainer: {
        gap: verticalScale(4),
        alignItems: "center",
    },
    listIcon: {
        height: verticalScale(44),
        width: verticalScale(44),
        backgroundColor: colors.neutral500,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius._15,
        borderCurve: "continuous"
    },
    listItem: {
        marginBottom: verticalScale(17),
    },
    accountOptions: {
        marginTop: spacingY._35,
    },
    flexRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._10
    }
})