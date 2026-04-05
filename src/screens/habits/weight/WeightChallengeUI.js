import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const screenWidth = Dimensions.get('window').width;

export default function WeightChallengeUI() {
  const [step, setStep] = useState(0);

  const Labels = [
    { key: 'start', label: 'Start Weight' },
    { key: 'week1', label: 'Week 1' },
    { key: 'week2', label: 'Week 2' },
    { key: 'week3', label: 'Week 3' },
    { key: 'week4', label: 'Week 4' },
    { key: 'end', label: 'End Weight' },
  ];

  const [weights, setWeights] = useState({
    start: '',
    week1: '',
    week2: '',
    week3: '',
    week4: '',
    end: '',
  });

  // ✅ SAFE PARSE
  const parseWeight = val => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const weightArray = Labels.map(item => parseWeight(weights[item.key]));

  const validWeights = weightArray.filter(w => w > 0);

  let totalLoss = 0;
  let weeksTracked = 0;
  let avgLoss = 0;

  if (validWeights.length > 1) {
    totalLoss = validWeights[0] - validWeights[validWeights.length - 1];
    weeksTracked = validWeights.length - 1;

    const calc = totalLoss / weeksTracked;
    avgLoss = isNaN(calc) ? 0 : calc;
  }

  const goal = 2;

  const safeToFixed = num => (!num || isNaN(num) ? '0.0' : num.toFixed(1));

  const getFeedback = () => {
    if (avgLoss === 0) {
      return 'Start logging your weight to track progress 📊';
    }

    if (avgLoss > 2) {
      return '⚠️ You’re losing weight a bit too fast. Consider a more sustainable pace to maintain muscle and energy.';
    }

    if (avgLoss < 1) {
      return '🐢 Progress is slower than expected. Try adjusting nutrition or activity to stay on track.';
    }

    return '✅ You’re on a healthy and sustainable pace. Keep it up!';
  };

  const updateWeight = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < Labels.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const data = {
    labels: ['Start', 'W1', 'W2', 'W3', 'W4', 'End'],
    datasets: [{ data: weightArray }],
  };

  return (
    <Wrapper>
      <Header />
      <ScrollView style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 22,
            fontFamily: fontFamily.montserratSemiBold,
            marginVertical: 20,
            color: colors.white,
          }}
        >
          Weight Challenge
        </Text>

        <Text
          style={{
            marginBottom: 20,
            color: colors.white,
            fontFamily: fontFamily.montserratMedium,
          }}
        >
          Lose no more than 2 lbs per week over 4 weeks
        </Text>

        {/* 🔥 ALWAYS VISIBLE CHART */}
        <View
          style={{
            paddingTop: 20,
            backgroundColor: '#fff',
            borderRadius: 15,
          }}
        >
          <LineChart
            data={data}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => '#000',
              labelColor: () => '#555',
            }}
            style={{
              borderRadius: 12,
              marginVertical: 20,
              marginRight: 20,
            }}
          />
        </View>

        {/* 🔥 ALWAYS VISIBLE CARD */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>📉 Avg Loss / Week</Text>
            <Text style={styles.value}>{safeToFixed(avgLoss)} lbs</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>🎯 Goal</Text>
            <Text style={styles.value}>≤ {goal} lbs/week</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>🧠 Feedback</Text>
            <Text style={{ ...styles.value, width: screenWidth * 0.65 }}>
              {getFeedback()}
            </Text>
          </View>
        </View>

        {/* 🔥 STEP INPUT */}
        <View
          style={{
            marginTop: 10,
            padding: 20,
            backgroundColor: '#fff',
            borderRadius: 15,
          }}
        >
          <Text
            style={{
              marginBottom: 10,
              fontFamily: fontFamily.montserratSemiBold,
            }}
          >
            {Labels[step].label} ({step + 1}/{Labels.length})
          </Text>

          <TextInput
            value={weights[Labels[step].key]}
            onChangeText={val => updateWeight(Labels[step].key, val)}
            keyboardType="numeric"
            style={styles.input}
            placeholder={`Enter ${Labels[step].label}`}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {step > 0 && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {step === Labels.length - 1 ? 'Done' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Wrapper>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  button: {
    flex: 1,
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  backBtn: {
    flex: 1,
    backgroundColor: '#888',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontFamily: fontFamily.montserratSemiBold,
  },

  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    color: '#555',
    fontFamily: fontFamily.montserratSemiBold,
  },

  value: {
    fontFamily: fontFamily.montserratSemiBold,
    // width: screenWidth * 0.6,
    paddingLeft: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
};
