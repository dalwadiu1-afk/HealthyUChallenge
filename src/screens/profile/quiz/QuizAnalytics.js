import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated } from 'react-native';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { Header, Wrapper } from '../../../components';
import moment from 'moment';

// 🔥 Top 10 hardest questions

// 📈 difficulty score (auto ranking)

// 🏆 user leaderboard accuracy system

export default function QuizAnalytics() {
  const [mode, setMode] = useState('normal'); // normal | bonus
  const [normalQ, setNormalQ] = useState([]);
  const [expandedStats, setExpandedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [data, setData] = useState([]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const heroHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [360, 0],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });

  const fetchAllUsers = async () => {
    const snap = await database().ref('/users').once('value');
    return snap.val() || {};
  };

  const heroScale = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const fetchQuestions = async mode => {
    const monthKey = moment().format('MM_YYYY');

    const collection = mode === 'bonus' ? 'BonusQuizes' : 'quizCategories';

    const doc = await firestore().collection(collection).doc(monthKey).get();

    return doc.data()?.questions || [];
  };

  const buildAnalytics = (questions, users, mode = 'normal') => {
    const map = {};
    // ==========================
    // INIT QUESTIONS
    // ==========================
    questions.forEach(q => {
      map[String(q.id)] = {
        id: String(q.id),
        question: q.question,
        options: q.options || [],
        answer: q.answer,

        correct: 0,
        wrong: 0,
        total: 0,

        weak: false,

        wrongUsers: [],
        correctUsers: [],
      };
    });

    console.log('TOTAL QUESTIONS:', Object.keys(map).length);

    // ==========================
    // LOOP USERS
    // ==========================
    Object.entries(users || {}).forEach(([uid, user]) => {
      const days = user?.quizzes?.days || {};

      Object.entries(days).forEach(([dayKey, day]) => {
        const attended = day?.attendedQues || {};

        Object.entries(attended).forEach(([qid, val]) => {
          const questionId = String(qid);

          // DEBUG
          // console.log('Question Attempt:', questionId, JSON.stringify(val));

          if (!map[questionId]) {
            console.log('QUESTION NOT FOUND:', questionId);
            return;
          }

          map[questionId].total += 1;

          // ==========================
          // HANDLE DIFFERENT STRUCTURES
          // ==========================

          // Case 1:
          // { correct: true }
          if (typeof val === 'object' && val !== null) {
            if (val.correct === true) {
              map[questionId].correct += 1;

              map[questionId].correctUsers.push({
                uid,
                name:
                  user?.fullName || user?.name || user?.displayName || 'User',
              });
            } else {
              map[questionId].wrong += 1;
              map[questionId].wrongUsers.push({
                uid,
                name:
                  user?.profile?.fullName ||
                  user?.profile?.name ||
                  user?.profile?.username ||
                  user?.profile?.displayName ||
                  'User',

                selected:
                  val.selected || val.selectedAnswer || val.answer || 'N/A',
              });
            }
          }

          // Case 2:
          // qid: true
          else if (val === true) {
            map[questionId].correct += 1;
            map[questionId].correctUsers.push({
              uid,
              name: user?.fullName || user?.name || user?.displayName || 'User',
            });
          }

          // Case 3:
          // qid: false
          else if (val === false) {
            map[questionId].wrong += 1;

            map[questionId].wrongUsers.push({
              uid,
              name: user?.fullName || user?.name || user?.displayName || 'User',

              selected: 'N/A',
            });
          }
        });
      });

      // ==========================
      // WEAK QUESTIONS
      // ==========================
      const weakQuestions = user?.quizzes?.weakQuestions || {};

      Object.entries(weakQuestions).forEach(([qid, weakData]) => {
        const questionId = String(qid);

        if (map[questionId] && weakData?.wrongCount > 0) {
          map[questionId].weak = true;
        }
      });
    });

    const result = Object.values(map);

    console.log(
      'ANALYTICS RESULT:',
      result.map(q => ({
        wrongUsers: q.wrongUsers,
      })),
    );

    return result;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const users = await fetchAllUsers();

        const questions = await fetchQuestions(mode);

        const merged = buildAnalytics(questions, users, mode);

        setData(merged);
      } catch (e) {
        console.log('analytics error:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [mode]);

  const stats = useMemo(() => {
    let total = 0;
    let correct = 0;
    let wrong = 0;

    data.forEach(q => {
      total += q.total;
      correct += q.correct;
      wrong += q.wrong;
    });

    return {
      total,
      correct,
      wrong,
      accuracy: total ? ((correct / total) * 100).toFixed(1) : 0,
    };
  }, [data]);
  // =================================================
  // RENDER QUESTION CARD
  // =================================================

  const renderQues = ({ item }) => {
    const total = item.total || 0;
    const correct = item.correct || 0;
    const wrong = item.wrong || 0;

    const correctPct = total ? (correct / total) * 100 : 0;
    const wrongPct = total ? (wrong / total) * 100 : 0;

    const isOpen = expandedId === item.id;
    const statsOpen = expandedStats === item.id;

    return (
      <View style={styles.questionCard}>
        {/* Difficulty Badge */}
        <View
          style={[
            styles.badge,
            wrongPct >= 70
              ? styles.badgeHard
              : wrongPct >= 40
              ? styles.badgeMedium
              : styles.badgeEasy,
          ]}
        >
          <Text style={styles.badgeText}>
            {wrongPct >= 70
              ? '🔥 Hard'
              : wrongPct >= 40
              ? '⚡ Medium'
              : '✅ Easy'}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.questionTitle}>{item.question}</Text>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${correctPct}%`,
              },
            ]}
          />
        </View>

        {/* Stats Header */}
        <TouchableOpacity
          style={styles.statsHeader}
          onPress={() => setExpandedStats(statsOpen ? null : item.id)}
        >
          <View style={styles.quickStats}>
            <Text style={styles.quickStatsText}>
              {statsOpen
                ? 'Question Statistics '
                : correct +
                  '/' +
                  total +
                  ' Correct ' +
                  ' • ' +
                  wrongPct.toFixed(0) +
                  ' % Difficulty'}
            </Text>
          </View>
          <Text style={styles.statsArrow}>{statsOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* Stats Body */}
        {statsOpen && (
          <View style={styles.statsContainer}>
            <View style={styles.statMiniCard}>
              <Text style={styles.greenText}>{correct}</Text>
              <Text style={styles.statMiniLabel}>Correct</Text>
            </View>

            <View style={styles.statMiniCard}>
              <Text style={styles.redText}>{wrong}</Text>
              <Text style={styles.statMiniLabel}>Wrong</Text>
            </View>

            <View style={styles.statMiniCard}>
              <Text style={styles.whiteText}>{total}</Text>
              <Text style={styles.statMiniLabel}>Attempts</Text>
            </View>

            <View style={styles.statMiniCard}>
              <Text style={styles.whiteText}>{wrongPct.toFixed(0)}%</Text>
              <Text style={styles.statMiniLabel}>Difficulty</Text>
            </View>
          </View>
        )}

        {/* Expand */}
        {item.wrongUsers?.length > 0 && (
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setExpandedId(isOpen ? null : item.id)}
          >
            <Text style={styles.expandText}>
              {isOpen
                ? 'Hide Wrong Users ▲'
                : `View ${item.wrongUsers.length} Wrong Users ▼`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Users */}
        {isOpen && (
          <View style={styles.userList}>
            {item.wrongUsers.map((u, idx) => (
              <View key={`${u.uid}-${idx}`} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {u.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{u.name}</Text>

                  <Text style={styles.userUid}>{u.uid}</Text>

                  <Text style={styles.userAnswer}>Selected: {u.selected}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Wrapper orbsRight scrollEnable={false}  safeAreaPops={{ edges: ['bottom'] }}>
      <Header header="Quiz Analytics" />

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            mode === 'normal' && styles.toggleBtnActive,
          ]}
          onPress={() => setMode('normal')}
        >
          <Text style={styles.toggleText}>Normal Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'bonus' && styles.toggleBtnActive]}
          onPress={() => setMode('bonus')}
        >
          <Text style={styles.toggleText}>Bonus Quiz</Text>
        </TouchableOpacity>
      </View>

      {/* HERO */}

      <Animated.FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderQues}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <Animated.View
            style={{
              overflow: 'hidden',
              height: heroHeight,
              opacity: heroOpacity,
              transform: [{ translateY: heroTranslateY }],
            }}
          >
            <View style={styles.heroCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Quiz Analytics</Text>

                <Text style={styles.heroSub}>
                  Discover question difficulty, weak areas and overall
                  performance
                </Text>
              </View>

              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{stats.accuracy}%</Text>
              </View>
            </View>

            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{stats.correct}</Text>
                <Text style={styles.analyticsLabel}>Correct</Text>
              </View>

              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{stats.wrong}</Text>
                <Text style={styles.analyticsLabel}>Wrong</Text>
              </View>

              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{stats.total}</Text>
                <Text style={styles.analyticsLabel}>Attempts</Text>
              </View>

              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsNumber}>{stats.accuracy}%</Text>
                <Text style={styles.analyticsLabel}>Accuracy</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Question Performance</Text>
          </Animated.View>
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      />
    </Wrapper>
  );
}

const styles = {
  container: {
    flex: 1,
  },

  // ================= HERO =================

  heroCard: {
    backgroundColor: 'rgba(143,175,120,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 6,
  },

  heroBadge: {
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  heroBadgeText: {
    color: '#8FAF78',
    fontSize: 18,
    fontWeight: '700',
  },

  // ================= TOGGLE =================

  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },

  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    paddingVertical: 10,
  },

  quickStatsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  statsArrow: {
    color: '#8FB7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  toggleBtnActive: {
    backgroundColor: '#8FAF78',
  },

  toggleText: {
    color: '#fff',
    fontWeight: '600',
  },

  // ================= ANALYTICS =================

  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  analyticsItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 10,
  },

  analyticsNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  analyticsLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },

  // ================= QUESTION CARD =================

  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  badgeEasy: {
    backgroundColor: 'rgba(107,158,110,0.18)',
    borderColor: 'rgba(107,158,110,0.35)',
    borderWidth: 1,
  },

  badgeMedium: {
    backgroundColor: 'rgba(255,165,0,0.16)',
    borderColor: 'rgba(255,165,0,0.35)',
    borderWidth: 1,
  },

  badgeHard: {
    backgroundColor: 'rgba(255,90,90,0.16)',
    borderColor: 'rgba(255,90,90,0.35)',
    borderWidth: 1,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  questionTitle: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 16,
  },

  // ================= PROGRESS =================

  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#8FAF78',
    borderRadius: 20,
  },

  // ================= STATS =================

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statMiniCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  statMiniLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 4,
  },

  greenText: {
    color: '#8FAF78',
    fontSize: 18,
    fontWeight: '700',
  },

  redText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: '700',
  },

  whiteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // ================= EXPAND =================

  expandBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },

  expandText: {
    color: '#8FB7FF',
    fontSize: 12,
    fontWeight: '600',
  },

  // ================= WRONG USERS =================

  userList: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,90,90,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  userAvatarText: {
    color: '#ff6b6b',
    fontWeight: '700',
    fontSize: 14,
  },

  userName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  userUid: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    marginTop: 2,
  },

  userAnswer: {
    color: '#ff6b6b',
    fontSize: 11,
    marginTop: 3,
  },
};
