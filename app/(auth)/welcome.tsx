import { StyleSheet, Text } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'

const welcome = () => {
    return (
        <ScreenWrapper>

            <Typo>Welcome</Typo>
        </ScreenWrapper>
    )
}

export default welcome

const styles = StyleSheet.create({})