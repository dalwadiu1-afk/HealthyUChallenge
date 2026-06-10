import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import { Wrapper, Header } from '../../components/index';
import { colors, fontFamily } from '../../constant/index';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import moment from 'moment';
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getGoalIcon = key => {
  switch (key) {
    case 'halfPlateChallenge':
      return '🥗';

    case 'meatLess':
      return '🌱';

    case 'drinkWater':
      return '💧';

    case 'sleepChallenge':
      return '😴';

    case 'exerciseChallenge':
      return '🏃';

    default:
      return '🎯';
  }
};

const getGoalColor = category => {
  switch (category) {
    case 'Nutrition':
      return '#6B9E6E';

    case 'Fitness':
      return '#F97316';

    case 'Sleep':
      return '#8B5CF6';

    case 'Hydration':
      return '#3B82F6';

    default:
      return '#8FAF78';
  }
};

export default function ArchivedGoals({ navigation }) {
  const [archiveData, setArchiveData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState({});

  const fetchArchivedGoals = async () => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) return;

      const snapshot = await database()
        .ref(`/users/${uid}/previousGoals`)
        .once('value');

      const data = snapshot.val() || {};

      const formattedData = {};

      // 🔥 sort months DESC (latest first)
      Object.entries(data)
        .sort(
          ([a], [b]) =>
            moment(b, 'MMMM_YYYY').valueOf() - moment(a, 'MMMM_YYYY').valueOf(),
        )
        .forEach(([monthKey, monthData]) => {
          formattedData[monthKey] = Array.isArray(monthData?.goals)
            ? monthData.goals.map(goal => ({
                ...goal,
                archivedAt: monthData.archivedAt,
                startDate: monthData.startDate,
                endDate: monthData.endDate,
              }))
            : [];
        });

      setArchiveData(formattedData);

      // Auto open latest month
      const firstMonth = Object.keys(formattedData)[0];

      if (firstMonth) {
        setExpandedMonths({
          [firstMonth]: false,
        });
      }
    } catch (error) {
      console.log('ARCHIVE ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedGoals();
  }, []);

  const toggleMonth = month => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  return (
    <Wrapper orbsRight>
      <Header header="Goal Archive" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>🏆 Goal Archive</Text>

            <Text style={styles.heroSub}>
              Review your completed challenge journey and celebrate your
              progress.
            </Text>
          </View>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeNumber}>
              {Object.values(archiveData).flat().length}
            </Text>

            <Text style={styles.heroBadgeLabel}>Goals</Text>
          </View>
        </View>
        {Object.keys(archiveData).map(month => {
          const expanded = expandedMonths[month];

          return (
            <View key={month}>
              {/* MONTH */}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleMonth(month)}
                style={styles.monthCard}
              >
                <View>
                  <Text style={styles.monthTitle}>
                    🗓 {month?.replace('_', ' ')}
                  </Text>

                  <Text style={styles.monthSub}>
                    {archiveData[month].length} Archived Goals
                  </Text>
                </View>

                <Text style={styles.monthArrow}>{expanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {/* GOALS */}

              {expanded &&
                archiveData[month].map(goal => {
                  const color = getGoalColor(goal?.category);
                  const icon = getGoalIcon(goal?.key);

                  return (
                    <TouchableOpacity
                      key={goal.title}
                      activeOpacity={0.85}
                      style={[
                        styles.goalCard,
                        {
                          borderColor: color,
                          backgroundColor: `${color}15`,
                        },
                      ]}
                      onPress={() =>
                        navigation.navigate('Habits', {
                          screen: goal?.screenName,
                          params: {
                            readOnly: true,
                            archivedGoal: goal,
                            monthKey: month,
                          },
                        })
                      }
                    >
                      <View style={styles.goalTop}>
                        <Text style={styles.goalEmoji}>{icon}</Text>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.goalTitle}>{goal.title}</Text>

                          <Text style={styles.goalCategory}>
                            {goal.category}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.checkCircle,
                            {
                              borderColor: color,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color,
                              fontSize: 16,
                            }}
                          >
                            ✓
                          </Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.goalBottom}>
                        <View>
                          <Text style={styles.statValue}>
                            {goal.completedDays}
                          </Text>

                          <Text style={styles.statLabel}>Days Completed</Text>
                        </View>

                        <View>
                          <Text style={styles.statValue}>{goal.endDate}</Text>

                          <Text style={styles.statLabel}>Finished</Text>
                        </View>
                      </View>

                      <View style={styles.viewRow}>
                        <Text style={styles.viewText}>View History →</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          );
        })}
      </ScrollView>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },

  heroCard: {
    marginTop: 10,
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(143,175,120,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.30)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroTitle: {
    color: colors.white,
    fontSize: 24,
    fontFamily: fontFamily.montserratBold,
  },

  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    lineHeight: 18,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  heroBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroBadgeNumber: {
    color: colors.secondary,
    fontSize: 28,
    fontFamily: fontFamily.montserratBold,
  },

  heroBadgeLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },

  monthCard: {
    marginTop: 18,
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  monthTitle: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fontFamily.montserratBold,
  },

  monthSub: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },

  monthArrow: {
    color: colors.secondary,
    fontSize: 18,
  },

  goalCard: {
    marginTop: 12,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },

  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  goalEmoji: {
    fontSize: 32,
    marginRight: 14,
  },

  goalTitle: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },

  goalCategory: {
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    fontSize: 12,
  },

  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },

  goalBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statValue: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },

  statLabel: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },

  viewRow: {
    marginTop: 14,
    alignItems: 'flex-end',
  },

  viewText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
});
