import { StyleSheet, Text } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'

const welcome = () => {
    return (
        <ScreenWrapper>
            <Text style={{ color: "white" }}>welcome</Text>
        </ScreenWrapper>
    )
}

export default welcome

const styles = StyleSheet.create({})