import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import ScreenWrapper from '@/components/ScreenWrapper'

const Home = () => {
    // const { user } = useAuth()

    // console.log(user)

    const handleLogout = async () => {
        signOut(auth)
        console.log("logged out")
    }

    return (
        <ScreenWrapper>
            <Typo>Home</Typo>
            {/* <Button onPress={handleLogout}>
                <Typo color={colors.black}>
                    LogOut
                </Typo>
            </Button> */}
        </ScreenWrapper>
    )
}

export default Home

const styles = StyleSheet.create({})