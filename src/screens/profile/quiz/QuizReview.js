import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Wrapper, Header } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizReview({ route }) {
  const { questions = [], answers = [] } = route?.params || {};

  console.log('route?.params :>> ', route?.params);

  return (
    <Wrapper scrollEnable={false} orbsRight>
      <Header header="Check Answers" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {questions.map((q, qi) => {
          const userIdx = answers[qi];
          const isCorrect = userIdx === q.answer;
          return (
            <View key={q.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.qLabel}>Q.{qi + 1}</Text>
                <View
                  style={[
                    styles.statusPill,
                    isCorrect ? styles.statusPillOk : styles.statusPillBad,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: isCorrect ? colors.success : colors.danger,
                      },
                    ]}
                  >
                    {userIdx === null
                      ? 'Skipped'
                      : isCorrect
                      ? 'Correct'
                      : 'Wrong'}
                  </Text>
                </View>
              </View>
              <Text style={styles.qText}>{q.question}</Text>

              <View style={styles.optionsList}>
                {q.options.map((opt, oi) => {
                  const isAnswer = oi === q.answer;
                  const isUserPick = oi === userIdx;
                  const tone = isAnswer ? 'ok' : isUserPick ? 'bad' : 'neutral';
                  return (
                    <View
                      key={oi}
                      style={[
                        styles.optionRow,
                        tone === 'ok' && styles.optionOk,
                        tone === 'bad' && styles.optionBad,
                      ]}
                    >
                      <View
                        style={[
                          styles.letter,
                          tone === 'ok' && { backgroundColor: colors.success },
                          tone === 'bad' && { backgroundColor: colors.danger },
                        ]}
                      >
                        <Text
                          style={[
                            styles.letterText,
                            (tone === 'ok' || tone === 'bad') && {
                              color: colors.white,
                            },
                          ]}
                        >
                          {OPTION_LETTERS[oi]}
                        </Text>
                      </View>
                      <Text style={styles.optionText}>{opt}</Text>
                      {tone === 'ok' && <Text style={styles.trail}>✓</Text>}
                      {tone === 'bad' && <Text style={styles.trailBad}>✕</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  qLabel: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratBold,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillOk: {
    borderColor: 'rgba(107,158,110,0.5)',
    backgroundColor: 'rgba(107,158,110,0.15)',
  },
  statusPillBad: {
    borderColor: 'rgba(192,108,91,0.5)',
    backgroundColor: 'rgba(192,108,91,0.15)',
  },
  statusPillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.montserratSemiBold,
  },
  qText: {
    color: colors.white,
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: fontFamily.montserratSemiBold,
    marginBottom: 10,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  optionOk: {
    borderColor: 'rgba(107,158,110,0.55)',
    backgroundColor: 'rgba(107,158,110,0.12)',
  },
  optionBad: {
    borderColor: 'rgba(192,108,91,0.55)',
    backgroundColor: 'rgba(192,108,91,0.12)',
  },
  letter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  letterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: fontFamily.montserratBold,
  },
  optionText: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
    fontFamily: fontFamily.montserratMedium,
  },
  trail: {
    color: colors.success,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  trailBad: {
    color: colors.danger,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
});
