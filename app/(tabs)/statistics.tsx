import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import ScreenWrapper from '@/components/ScreenWrapper'
import Header from '@/components/Header'
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts"
import Loading from '@/components/Loading'
import { useAuth } from '@/context/authContext'
import { fetchWeeklyStats } from '@/services/transactionService'
import TransactionList from '@/components/TransactionList'

const barData = [
  {
    value: 40,
    label: "Mon",
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: colors.primary,
  },
  {
    value: 20,
    frontColor: colors.rose,
  },
  {
    value: 50,
    label: "Tue",
    spacing: scale(4),
    labelWidth: scale(30),
    frontColor: colors.primary
  },
  { value: 40, frontColor: colors.rose }
]


const statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const { user } = useAuth()

  const [chartdata, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(false)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {

    if (activeIndex == 0) {
      getWeeklyStats();
    }
    if (activeIndex == 1) {
      getMonthlyStats();
    }
    if (activeIndex == 2) {
      getYearlyStats();
    }
  }, [activeIndex]);


  const getWeeklyStats = async () => {
    setChartLoading(true)
    let res = await fetchWeeklyStats(user?.uid as string)
    setChartLoading(false)
    if (res.success) {
      setChartData(res?.data?.stats)
      setTransactions(res?.data?.transactions)
    } else {
      Alert.alert("Error", res.msg)
    }
  }

  const getMonthlyStats = async () => {

  }

  const getYearlyStats = async () => {

  }



  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title='Statistics' />
        </View>
        <ScrollView contentContainerStyle={{
          gap: spacingY._20,
          paddingTop: spacingY._5,
          paddingBottom: verticalScale(100)
        }} showsVerticalScrollIndicator={false}>
          <SegmentedControl
            values={['Weekly', 'Monthly', "Yearly"]}
            selectedIndex={activeIndex}
            onChange={(event) => {
              setActiveIndex(event.nativeEvent.selectedSegmentIndex)
            }}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance='dark'
            activeFontStyle={styles.segmentedFontStyle}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentedFontStyle, color: colors.white }}
          />
          <View style={styles.chartContainer}>
            {
              chartdata.length > 0 ? (
                <BarChart barWidth={scale(12)} spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)} data={chartdata} roundedTop roundedBottom hideRules yAxisLabelPrefix='Kes' yAxisThickness={0} xAxisThickness={0} yAxisLabelWidth={[1, 2].includes(activeIndex) ? scale(38) : scale(35)} yAxisTextStyle={{ color: colors.neutral350 }} hideYAxisText xAxisLabelTextStyle={{ color: colors.neutral350, fontSize: verticalScale(12) }}
                  noOfSections={3} minHeight={5} isAnimated={true} animationDuration={1000}
                // maxValue={100}

                />
              ) : (
                <View style={styles.noChart} />
              )
            }
            {
              chartLoading && (
                <View style={styles.chartLoadingContainer}>
                  <Loading color={colors.white} />
                </View>
              )
            }
          </View>
          {/* Transactions */}
          <View>
            <TransactionList
              title='Transactions'
              emptyListMessage='No transactions found'
              data={transactions}
            />
          </View>
        </ScrollView>
      </View >
    </ScreenWrapper >
  )
}

export default statistics

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10

  },
  segmentedFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black
  },
  segmentStyle: {
    height: scale(37),
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous"
  },
  noChart: {
    backgroundColor: "rgba(0,0,0, 0.6)",
    height: verticalScale(210)
  },
  header: {},
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0, 0.6)"
  },
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center"
  }
})