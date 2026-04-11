import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Header, Wrapper, Button } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const BodyFatGoalScreen = () => {
  const [goalType, setGoalType] = useState('decrease');
  const [startBFP, setStartBFP] = useState(25);
  const [targetBFP, setTargetBFP] = useState(18);

  const difference = Math.abs(targetBFP - startBFP);

  const getValidation = () => {
    if (difference === 0) return '⚠️ Start and target cannot be same';

    if (difference > 15) return '⚠️ This goal is very aggressive';

    if (goalType === 'decrease' && targetBFP >= startBFP)
      return '⚠️ Target should be lower than start';

    if (goalType === 'increase' && targetBFP <= startBFP)
      return '⚠️ Target should be higher than start';

    return null;
  };

  const validationMsg = getValidation();

  return (
    <Wrapper>
      <Header header="Body Fat Goal" />

      <View style={styles.container}>
        <Text style={styles.title}>Set Your Body Fat Goal</Text>

        {/* 🔘 Goal Type */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.option,
              goalType === 'decrease' && styles.activeOption,
            ]}
            onPress={() => setGoalType('decrease')}
          >
            <Text style={styles.optionText}>⬇️ Cut Fat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              goalType === 'increase' && styles.activeOption,
            ]}
            onPress={() => setGoalType('increase')}
          >
            <Text style={styles.optionText}>⬆️ Gain Fat</Text>
          </TouchableOpacity>
        </View>

        {/* 📊 CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Body Fat Range</Text>

          {/* START */}
          <Text style={styles.label}>Current: {startBFP.toFixed(1)}%</Text>
          <Slider
            value={startBFP}
            onValueChange={setStartBFP}
            minimumValue={5}
            maximumValue={50}
            step={0.5}
          />

          {/* TARGET */}
          <Text style={styles.label}>Target: {targetBFP.toFixed(1)}%</Text>
          <Slider
            value={targetBFP}
            onValueChange={setTargetBFP}
            minimumValue={5}
            maximumValue={50}
            step={0.5}
          />

          {/* RESULT */}
          <Text style={styles.result}>
            {goalType === 'decrease'
              ? `⬇️ Reduce ${difference.toFixed(1)}%`
              : `⬆️ Increase ${difference.toFixed(1)}%`}
          </Text>

          {/* VALIDATION */}
          {validationMsg && <Text style={styles.warning}>{validationMsg}</Text>}
        </View>

        {/* CTA */}
        <Button
          title="Save Goal"
          onPress={() => {}}
          disabled={!!validationMsg}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 22,
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
    textAlign: 'center',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  option: {
    flex: 1,
    padding: 14,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },

  activeOption: {
    backgroundColor: '#6a4c93',
  },

  optionText: {
    fontWeight: '600',
    color: '#000',
  },

  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  label: {
    marginTop: 10,
    fontWeight: '600',
  },

  result: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d6a4f',
  },

  warning: {
    marginTop: 8,
    color: 'red',
    textAlign: 'center',
  },
});

export default BodyFatGoalScreen;
