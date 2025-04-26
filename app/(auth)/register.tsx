import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import BackButton from '@/components/BackButton'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import * as Icons from "phosphor-react-native"
import Button from '@/components/Button'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/authContext'

const login = () => {


    const nameRef = useRef("")
    const emailRef = useRef("")
    const passwordRef = useRef("")

    const [isLoading, setIsloading] = useState(false)

    const router = useRouter()
    const { register: RegisterUser } = useAuth();

    const handleSubmit = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("Login", "please fill in your email and password");
            return;
        }
        setIsloading(true);
        const res = await RegisterUser(emailRef.current, passwordRef.current, nameRef.current)
        setIsloading(false)
        if (!res.success) {
            Alert.alert("Sign up", res.msg)
        }
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton iconSize={28} />
                <View style={{ gap: 5, marginTop: spacingY._20 }}>
                    <Typo size={30} fontWeight={"800"}>
                        Let's
                    </Typo>
                    <Typo size={30} fontWeight={"800"}>
                        Get Started
                    </Typo>
                </View>


                <View style={styles.form}>
                    <Typo size={16} color={colors.textLighter}>
                        Create an account to track your expenses                    </Typo>
                    <Input
                        placeholder='Your name'
                        onChangeText={value => nameRef.current = value}
                        icon={<Icons.Person size={verticalScale(26)} color={colors.neutral300} weight='fill' />}
                    />
                    <Input
                        placeholder='Your email address'
                        onChangeText={value => emailRef.current = value}
                        icon={<Icons.At size={verticalScale(26)} color={colors.neutral300} weight='fill' />}
                    />
                    <Input
                        placeholder='Your password'
                        secureTextEntry
                        onChangeText={value => passwordRef.current = value}
                        icon={<Icons.Lock size={verticalScale(26)} color={colors.neutral300} weight='fill' />}
                    />


                    <Button loading={isLoading} onPress={handleSubmit}>
                        <Typo fontWeight={"700"} color={colors.black} size={21}>
                            Create Account
                        </Typo>
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Typo size={15}>Already have an account?</Typo>
                    <Pressable onPress={() => router.navigate("/(auth)/register")}>
                        <Typo size={15} fontWeight={"700"} color={colors.primary}>
                            Sign up
                        </Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacingY._40,
        paddingHorizontal: spacingX._20,

    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: "bold",
        color: colors.text,
    },
    form: {
        gap: spacingY._20,
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: "500",
        color: colors.text
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 5,
    },
    footerText: {
        textAlign: "center",
        color: colors.text,
        fontSize: verticalScale(15)
    }
})