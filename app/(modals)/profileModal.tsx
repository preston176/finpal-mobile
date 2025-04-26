import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'

const profileModal = () => {
    return (
        <ModalWrapper>
            <View style={styles.container}></View>
        </ModalWrapper>
    )
}

export default profileModal

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