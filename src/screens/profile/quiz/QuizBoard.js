import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Wrapper, Header } from '../../../components';
import { BONUS_DAY, colors, fontFamily } from '../../../constant';
import { useDispatch, useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import BonusCountdown from './../../../components/profile/BonusCountdown';
import { getDynamicWeekId } from '../../../utils/helper';
import { setUserData } from '../../../redux/slices/userSlice';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function QuizBoard({ navigation, route }) {
  const userData = useSelector(state => state.user);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const userId = auth()?.currentUser?.uid;
  const userRef = useRef(null);
  const [quizDays, setQuizDays] = useState({});
  const [weakQuestions, setWeakQuestions] = useState({});
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTodayQuiz, setShowTodayQuiz] = useState(false);
  const [showBonusQuiz, setShowBonusQuiz] = useState(false);
  const todayKey = moment().format('YYYY-MM-DD');
  const todayQuiz = quizDays?.[todayKey] || {};
  const normalQuiz = todayQuiz?.normalQuiz || null;
  const bonusQuiz = todayQuiz?.bonusQuizzes || null;
  const monthKey = moment().format('MM_YYYY');
  const dynamicWeekId = getDynamicWeekId();
  const anim = useRef(new Animated.Value(0)).current;

  const refreshQuizState = async () => {
    try {
      const snap = await database()
        .ref(`/users/${userId}/quizzes/days/${todayKey}`)
        .once('value');

      const latestTodayQuiz = snap.val() || {};

      setQuizDays(prev => ({
        ...prev,
        [todayKey]: latestTodayQuiz,
      }));
    } catch (e) {
      console.log('REFRESH ERROR:', e);
    }
  };

  const toggleAnalytics = () => {
    const toValue = showAnalytics ? 0 : 1;

    Animated.timing(anim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();

    setShowAnalytics(!showAnalytics);
  };

  // =========================
  // NORMAL QUIZ
  // =========================

  const quizMode = useMemo(() => {
    if (!todayQuiz?.bonusQuizzes) return 'normal';

    const unresolvedWeak = Object.values(weakQuestions || {}).filter(
      w => w?.isSolved !== true,
    );

    if (unresolvedWeak.length === 0) return 'normal';

    return 'combine';
  }, [weakQuestions, todayQuiz]);

  const isCombine = quizMode === 'combine';

  const questions = todayQuiz?.questions || [];
  const answers = todayQuiz?.answers || [];

  const correct =
    normalQuiz?.correctAnswers ||
    questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0),
      0,
    );

  const total = normalQuiz?.totalQuestions || questions.length || 0;

  const wrong =
    normalQuiz?.wrongAnswers != null
      ? normalQuiz?.wrongAnswers
      : total - correct;

  const percent =
    normalQuiz?.percentage != null
      ? normalQuiz.percentage / 100
      : total
      ? correct / total
      : 0;

  const passed = percent >= 0.6;

  const totalSec = Math.max(0, Math.floor(normalQuiz?.quizTakenTime || 0));

  const avgSec =
    normalQuiz?.avgAnswerTime || (total ? Math.round(totalSec / total) : 0);

  // =========================
  // BONUS QUIZ
  // =========================

  const bonusCorrect = bonusQuiz?.correctAnswers || 0;

  const bonusTotal = bonusQuiz?.totalQuestions || 0;

  const bonusWrong = bonusQuiz?.wrongAnswers || 0;

  const bonusPercent =
    bonusQuiz?.percentage != null ? bonusQuiz.percentage / 100 : 0;

  const bonusPassed = bonusPercent >= 0.6;

  const bonusTotalSec = Math.max(0, Math.floor(bonusQuiz?.quizTakenTime || 0));

  const bonusAvgSec =
    bonusTotal > 0 ? Math.round(bonusTotalSec / bonusTotal) : 0;

  const todayDate = moment().format('MMMM DD, YYYY');

  const buildQuizResult = (questions = [], attendedQues = {}) => {
    const result = questions.reduce(
      (acc, q) => {
        const selected = attendedQues?.[q.id]?.selected;

        if (typeof selected === 'number') {
          acc.questions.push(q);
          acc.answers.push(selected);
        }

        return acc;
      },
      { questions: [], answers: [] },
    );

    return result;
  };

  const fetchQuizBoardData = async () => {
    try {
      setLoading(true);

      // 1. QUIZ DAYS
      const quizSnap = await database()
        .ref(`/users/${userId}/quizzes/days`)
        .once('value');

      const quizDaysData = quizSnap.val() || {};

      // 4. other data
      const weakSnap = await database()
        .ref(`/users/${userId}/quizzes/weakQuestions`)
        .once('value');

      const weakData = weakSnap.val() || {};

      const leaderboardSnap = await database()
        .ref(`/leaderboards`)
        .once('value');

      const usersPoints = leaderboardSnap.val() || null;
      const leaderboard = leaderboardSnap.val()?.[userId] || null;

      setQuizDays(quizDaysData);
      setWeakQuestions(weakData);
      setLeaderboardData(leaderboard);
      getUserRank(usersPoints, userId);
    } catch (e) {
      console.log('QUIZ BOARD ERROR:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchQuizBoardData();
        refreshQuizState();
      }
    }, [userId]),
  );

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (userRef.current) {
      userRef.current.off();
    }

    const ref = database().ref(`users/${userId}`);
    userRef.current = ref;

    const listener = ref.on('value', async snapshot => {
      const userData = snapshot.val();

      if (!userData) {
        dispatch(clearUser());
        return;
      }

      try {
        const stats = {
          totalQuizzes,
          totalCorrectAnswers,
          totalQuestionsAnswered,
          overallAccuracy,
          totalQuizTime,
          avgQuizTime,
          weakQuestionsCount,
          lifeTimeWrongAns,
          currentStreak,
          longestStreak,
          totalPoints,
          firstTimeClearanceRatio,
        };
        // =========================
        // REDUX SYNC
        // =========================
        dispatch(
          setUserData({
            uid: userId,
            profile: userData?.profile || {},
            habits: userData?.habits || {},
            goal: userData?.goal || {},
            posts: userData?.posts || {},
            snacks: userData?.snacks || {},
            activities: userData?.activities || {},
            challenges: userData?.challenges || {},

            // stats: {
            //   ...(userData?.stats || {}),
            //   ...stats,
            // },
          }),
        );
      } catch (err) {
        console.log('APP SYNC ERROR:', err);
      }
    });

    return () => {
      ref.off('value', listener);
    };
  }, [dispatch, isFocused]);

  const getUserRank = (leaderboards, userId) => {
    if (!leaderboards || !userId) return null;

    const users = Object.entries(leaderboards).map(([uid, data]) => ({
      uid,
      points: data?.challenge?.totalChallengePoints || 0,
    }));

    users.sort((a, b) => b.points - a.points);

    const rankIndex = users.findIndex(u => u.uid === userId);

    if (rankIndex === -1) return null;

    const rank = rankIndex + 1;

    setLeaderboardData(prev => ({
      ...(prev || {}),
      rank,
    }));
  };

  const fmt = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;

    if (m === 0) return `${s}s`;

    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const onQuizReview = async ({ isBonus = false } = {}) => {
    const todayKey = moment().format('YYYY-MM-DD');
    const todayQuiz = quizDays?.[todayKey];

    // FIRESTORE QUESTIONS
    const docSnap = await firestore()
      .collection(isBonus ? 'BonusQuizes' : 'quizCategories')
      .doc(isBonus ? dynamicWeekId : monthKey)
      .get();

    const firestoreData = docSnap.exists ? docSnap.data() : {};

    const questions = firestoreData?.questions || [];

    // BUILD RESULT
    const result = buildQuizResult(questions, todayQuiz?.attendedQues || {});

    console.log('result :>> ', result);

    navigation.navigate('QuizReview', {
      ...result,
      isBonus,
    });
  };

  const getNextBonusDate = () => {
    const now = moment();
    let target = moment().day(BONUS_DAY);

    if (target.isBefore(now, 'minute')) {
      target.add(7, 'days');
    }

    target.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    return target;
  };

  const bonusDate = useRef(getNextBonusDate()).current;

  const formatHHMMSS = useCallback((h, m, s) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(
      2,
      '0',
    )}:${String(s).padStart(2, '0')}`;
  }, []);

  const allQuizDays = Object.entries(quizDays || {})
    .filter(([_, item]) => item)
    .sort((a, b) => moment(b[0]).valueOf() - moment(a[0]).valueOf());

  const totalQuizzes = allQuizDays.reduce((acc, [, item]) => {
    let count = 0;

    if (item?.normalQuiz) count += 1;

    if (item?.bonusQuizzes) count += 1;

    return acc + count;
  }, 0);

  const totalCorrectAnswers = allQuizDays.reduce((acc, [, item]) => {
    const normalCorrect = item?.normalQuiz?.correctAnswers || 0;

    const bonusCorrect = item?.bonusQuizzes?.correctAnswers || 0;

    return acc + normalCorrect + bonusCorrect;
  }, 0);

  const totalQuestionsAnswered = allQuizDays.reduce((acc, [, item]) => {
    const normalTotal = item?.normalQuiz?.totalQuestions || 0;

    const bonusTotal = item?.bonusQuizzes?.totalQuestions || 0;

    return acc + normalTotal + bonusTotal;
  }, 0);

  const overallAccuracy = totalQuestionsAnswered
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
    : 0;

  const totalQuizTime = allQuizDays.reduce((acc, [, item]) => {
    const normalTime = item?.normalQuiz?.quizTakenTime || 0;

    const bonusTime = item?.bonusQuizzes?.quizTakenTime || 0;

    return acc + normalTime + bonusTime;
  }, 0);

  const avgQuizTime = totalQuizzes
    ? Math.round(totalQuizTime / totalQuizzes)
    : 0;

  const weakQuestionsCount = Object.values(weakQuestions || {}).filter(
    item => item?.isSolved !== true,
  ).length;

  const lifeTimeWrongAns = Object.values(weakQuestions || {}).length;

  const challenge = leaderboardData?.challenge || {};

  const currentStreak = challenge?.streak || 0;

  const longestStreak = challenge?.longestStreak || 0;

  const totalPoints = challenge?.totalChallengePoints || 0;
  const firstTimeClearanceRatio =
    totalCorrectAnswers + lifeTimeWrongAns > 0
      ? Math.round(
          (totalCorrectAnswers / (totalCorrectAnswers + lifeTimeWrongAns)) *
            100,
        )
      : 0;

  // ===============================
  // UPDATED QUIZ TIME LOGIC
  // Includes BOTH:
  // 1. Normal Quiz
  // 2. Bonus Quiz
  // ===============================

  // -------------------------------
  // GET AVERAGE QUIZ TIME TAKEN
  // -------------------------------

  const calculateAverageQuizTime = challengeDays => {
    if (!challengeDays) return 0;

    let totalTime = 0;
    let totalQuizzes = 0;

    Object.values(challengeDays).forEach(dayData => {
      // =========================
      // NORMAL QUIZ TIME
      // =========================
      if (dayData?.normalQuiz?.quizTakenTime) {
        totalTime += Number(dayData.normalQuiz.quizTakenTime);
        totalQuizzes += 1;
      }

      // =========================
      // BONUS QUIZ TIME
      // =========================
      if (dayData?.bonusQuizzes?.quizTakenTime) {
        totalTime += Number(dayData.bonusQuizzes.quizTakenTime);
        totalQuizzes += 1;
      }
    });

    if (totalQuizzes === 0) return 0;

    return Math.round(totalTime / totalQuizzes);
  };

  const formatDuration = totalSeconds => {
    const seconds = Number(totalSeconds || 0);

    // =========================
    // LESS THAN 60 SEC
    // =========================
    if (seconds < 60) {
      return `${seconds} sec`;
    }

    // =========================
    // MINUTES
    // =========================
    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      const remainingSeconds = seconds % 60;

      return remainingSeconds > 0
        ? `${minutes} min ${remainingSeconds} sec`
        : `${minutes} min`;
    }

    // =========================
    // HOURS
    // =========================
    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      const remainingMinutes = minutes % 60;

      return remainingMinutes > 0
        ? `${hours} hr ${remainingMinutes} min`
        : `${hours} hr`;
    }

    // =========================
    // DAYS
    // =========================
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;

    return remainingHours > 0
      ? `${days} day ${remainingHours} hr`
      : `${days} day`;
  };

  // ===============================
  // USAGE
  // ===============================

  const challengeDays = leaderboardData?.challenge?.days || {};

  const QuizTime = calculateAverageQuizTime(challengeDays);

  const averageQuizTime = formatDuration(QuizTime);

  // ===============================
  // DISPLAY
  // ===============================

  const bonusUnlocked = moment().isSameOrAfter(bonusDate);
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark }}>
      <Header header="Quiz Hub" headerContainer={{ paddingHorizontal: 23 }} />
      <Wrapper orbsRight safeAreaPops={{ edges: ['bottom'] }}>
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.white,
                fontFamily: fontFamily.montserratMedium,
              }}
            >
              Loading Quiz Data...
            </Text>
          </View>
        ) : (
          <Animated.View style={[styles.body, { opacity: fade }]}>
            <View style={styles.heroCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Today's Quiz Score</Text>

                <Text style={styles.heroSub}>
                  Track your daily quiz performance & challenge progress
                </Text>
              </View>

              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {normalQuiz?.percentage || 0}%
                </Text>
              </View>
            </View>

            {/* QUIZ LEADERBOARD CARD */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.leaderboardCard}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <View style={styles.leaderboardGlow} />

              <View style={styles.leaderboardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.leaderboardMini}>GLOBAL RANKING</Text>

                  <Text style={styles.leaderboardTitle}>Quiz Leaderboard</Text>

                  <Text style={styles.leaderboardSub}>
                    Compete with challengers and climb the weekly rankings
                  </Text>
                </View>

                <View style={styles.leaderboardBadge}>
                  <Text style={styles.leaderboardBadgeEmoji}>🏆</Text>
                </View>
              </View>

              <View style={styles.leaderboardStats}>
                <View style={styles.leaderboardStatItem}>
                  <Text style={styles.leaderboardStatNumber}>
                    #{leaderboardData?.rank || '--'}
                  </Text>

                  <Text style={styles.leaderboardStatLabel}>Your Rank</Text>
                </View>

                <View style={styles.leaderboardDivider} />

                <View style={styles.leaderboardStatItem}>
                  <Text style={styles.leaderboardStatNumber}>
                    {totalPoints}
                  </Text>

                  <Text style={styles.leaderboardStatLabel}>Points</Text>
                </View>

                <View style={styles.leaderboardDivider} />

                <View style={styles.leaderboardStatItem}>
                  <Text style={styles.leaderboardStatNumber}>
                    🔥 {currentStreak}
                  </Text>

                  <Text style={styles.leaderboardStatLabel}>Streak</Text>
                </View>
              </View>

              <View style={styles.leaderboardBottom}>
                <Text style={styles.leaderboardBottomText}>
                  Tap to view full leaderboard
                </Text>

                <Text style={styles.leaderboardArrow}>→</Text>
              </View>
            </TouchableOpacity>

            {/* TODAY QUIZ CARD */}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                // =========================
                // BONUS LOCKED
                // =========================
                if (!bonusUnlocked && !bonusQuiz) {
                  return;
                }

                // =========================
                // START BONUS QUIZ
                // =========================
                if (!bonusQuiz) {
                  navigation.navigate('QuizStart', {
                    isBonus: true,
                    isCombine: false,
                  });
                  return;
                }

                // =========================
                // SHOW DETAILS
                // =========================
                setShowBonusQuiz(!showBonusQuiz);
              }}
              style={[
                styles.bonusCard,
                !bonusUnlocked &&
                  !bonusQuiz && {
                    opacity: 0.8,
                  },
              ]}
            >
              <View style={styles.todayTop}>
                <View>
                  <Text style={styles.bonusTitle}>BONUS QUIZ</Text>

                  <Text style={styles.bonusSub}>
                    {bonusQuiz
                      ? 'Weekly bonus challenge completed'
                      : 'Unlocks on Wednesdays'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.todayScorePill,
                    {
                      backgroundColor: 'rgba(255,215,0,0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.todayScoreText,
                      {
                        color: '#FFD700',
                      },
                    ]}
                  >
                    {!bonusUnlocked && !bonusQuiz
                      ? 'LOCKED'
                      : !bonusQuiz
                      ? 'START'
                      : `${bonusCorrect}/${bonusTotal}`}
                  </Text>
                </View>
              </View>

              {!bonusQuiz ? (
                <BonusCountdown
                  targetDate={bonusDate}
                  textStyle={styles.bonusCountdown}
                />
              ) : (
                <Text style={styles.todayTap}>
                  {showBonusQuiz ? 'Hide Details' : 'View Details'}
                </Text>
              )}
            </TouchableOpacity>

            {/* BONUS DETAILS */}

            {showBonusQuiz && bonusQuiz && (
              <>
                <View
                  style={[
                    styles.scoreCard,
                    {
                      marginTop: 18,
                      borderColor: 'rgba(255,215,0,0.25)',
                      backgroundColor: 'rgba(255,215,0,0.05)',
                    },
                  ]}
                >
                  <View style={styles.scoreCopy}>
                    <Text style={[styles.congrats, { color: '#FFD700' }]}>
                      BONUS QUIZ
                    </Text>

                    <Text style={styles.scoreMsg}>
                      {bonusPassed ? (
                        <>
                          You passed the bonus quiz with{' '}
                          <Text style={styles.passWord}>
                            {Math.round(bonusPercent * 100)}%
                          </Text>
                        </>
                      ) : (
                        <>
                          You scored{' '}
                          <Text style={styles.passWord}>
                            {Math.round(bonusPercent * 100)}%
                          </Text>{' '}
                          in the bonus quiz
                        </>
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View style={[styles.statBox, styles.statBoxGreen]}>
                    <Text style={styles.statBigNum}>{bonusCorrect}</Text>

                    <Text style={styles.statBigLabel}>Correct Answers</Text>
                  </View>

                  <View style={[styles.statBox, styles.statBoxRed]}>
                    <Text style={styles.statBigNum}>{bonusWrong}</Text>

                    <Text style={styles.statBigLabel}>Wrong Answers</Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View style={[styles.statBox, styles.statBoxBlue]}>
                    <Text style={styles.statTimeIcon}>⏱</Text>

                    <Text style={styles.statBigNum}>{fmt(bonusTotalSec)}</Text>

                    <Text style={styles.statBigLabel}>Total Time</Text>
                  </View>

                  <View style={[styles.statBox, styles.statBoxOrange]}>
                    <Text style={styles.statTimeIcon}>⚡</Text>

                    <Text style={styles.statBigNum}>{fmt(bonusAvgSec)}</Text>

                    <Text style={styles.statBigLabel}>Avg / Answer</Text>
                  </View>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Bonus Quiz Summary</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Questions</Text>

                    <Text style={styles.summaryValue}>{bonusTotal}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Accuracy</Text>

                    <Text style={styles.summaryValue}>
                      {Math.round(bonusPercent * 100)}%
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  activeOpacity={0.85}
                  onPress={() => onQuizReview({ isBonus: true })}
                >
                  <Text style={styles.actionBtnSecondaryText}>
                    Check Bonus Answers
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.todayQuizCard}
              onPress={() => {
                // if no today quiz -> open quiz screen
                if (!normalQuiz || Object.keys(normalQuiz).length === 0) {
                  navigation.navigate('QuizStart', {
                    isBonus: false,
                    isCombine: quizMode === 'combine',
                  });
                  return;
                }

                // if completed -> expand details
                setShowTodayQuiz(!showTodayQuiz);
              }}
            >
              <View style={styles.todayTop}>
                <View>
                  <Text style={styles.todayLabel}>TODAY'S QUIZ</Text>

                  <Text style={styles.todayDate}>{todayDate}</Text>
                </View>

                <View style={styles.todayScorePill}>
                  <Text style={styles.todayScoreText}>
                    {!normalQuiz || Object.keys(normalQuiz).length === 0
                      ? 'PENDING'
                      : `${correct}/${total}`}
                  </Text>
                </View>
              </View>

              <Text style={styles.todayTap}>
                {!normalQuiz || Object.keys(normalQuiz).length === 0
                  ? 'Start Today Quiz'
                  : showTodayQuiz
                  ? 'Hide Details'
                  : 'View Details'}
              </Text>
            </TouchableOpacity>

            {/* EXPANDED DETAILS */}

            {showTodayQuiz && (
              <>
                <View style={styles.scoreCard}>
                  <View style={styles.scoreCopy}>
                    <Text style={styles.congrats}>
                      {passed ? 'Congratulations!' : 'Nice try!'}
                    </Text>

                    <Text style={styles.scoreMsg}>
                      {passed ? (
                        <>
                          You passed today's quiz with{' '}
                          <Text style={styles.passWord}>
                            {Math.round(percent * 100)}%
                          </Text>
                        </>
                      ) : (
                        <>
                          You scored{' '}
                          <Text style={styles.passWord}>
                            {Math.round(percent * 100)}%
                          </Text>
                        </>
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View style={[styles.statBox, styles.statBoxGreen]}>
                    <Text style={styles.statBigNum}>{correct}</Text>

                    <Text style={styles.statBigLabel}>Correct Answers</Text>
                  </View>

                  <View style={[styles.statBox, styles.statBoxRed]}>
                    <Text style={styles.statBigNum}>{wrong}</Text>

                    <Text style={styles.statBigLabel}>Wrong Answers</Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View style={[styles.statBox, styles.statBoxBlue]}>
                    <Text style={styles.statTimeIcon}>⏱</Text>

                    <Text style={styles.statBigNum}>{fmt(totalSec)}</Text>

                    <Text style={styles.statBigLabel}>Total Time</Text>
                  </View>

                  <View style={[styles.statBox, styles.statBoxOrange]}>
                    <Text style={styles.statTimeIcon}>⚡</Text>

                    <Text style={styles.statBigNum}>{fmt(avgSec)}</Text>

                    <Text style={styles.statBigLabel}>Avg / Answer</Text>
                  </View>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Quiz Summary</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Questions</Text>

                    <Text style={styles.summaryValue}>{total}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Accuracy</Text>

                    <Text style={styles.summaryValue}>
                      {Math.round(percent * 100)}%
                    </Text>
                  </View>

                  {/* <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Status</Text>

                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: passed ? colors.secondary : '#FF8A80',
                      },
                    ]}
                  >
                    {passed ? 'PASSED' : 'FAILED'}
                  </Text>
                </View> */}
                </View>

                <TouchableOpacity
                  style={styles.actionBtnSecondary}
                  activeOpacity={0.85}
                  onPress={onQuizReview}
                >
                  <Text style={styles.actionBtnSecondaryText}>
                    Check Answers
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.historyCard}>
              {/* HEADER (click to expand/collapse) */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleAnalytics}
                style={styles.analyticsHeader}
              >
                <Text style={styles.historyTitle}>Quiz Analytics</Text>

                <Text style={styles.analyticsToggle}>
                  {showAnalytics ? 'Hide ▲' : 'Show ▼'}
                </Text>
              </TouchableOpacity>

              {/* COLLAPSIBLE CONTENT */}
              <Animated.View
                style={{
                  opacity: anim,
                  maxHeight: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }),
                  overflow: 'hidden',
                }}
              >
                {/* GRID */}
                <View style={styles.analyticsGrid}>
                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>{totalQuizzes}</Text>
                    <Text style={styles.analyticsLabel}>Total Quizzes</Text>
                  </View>

                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>
                      {overallAccuracy}%
                    </Text>
                    <Text style={styles.analyticsLabel}>Accuracy</Text>
                  </View>

                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>{currentStreak}</Text>
                    <Text style={styles.analyticsLabel}>Current Streak</Text>
                  </View>

                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>{longestStreak}</Text>
                    <Text style={styles.analyticsLabel}>Best Streak</Text>
                  </View>

                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>
                      {weakQuestionsCount}
                    </Text>
                    <Text style={styles.analyticsLabel}>Weak Questions</Text>
                  </View>

                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>{totalPoints}</Text>
                    <Text style={styles.analyticsLabel}>Total Points</Text>
                  </View>

                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>
                      {averageQuizTime}
                    </Text>
                    <Text style={styles.analyticsLabel}>Avg Time</Text>
                  </View>

                  <View style={styles.analyticsItem}>
                    <Text style={styles.analyticsNumber}>
                      {firstTimeClearanceRatio}
                    </Text>
                    <Text style={styles.analyticsLabel}>
                      First Try Accuracy
                    </Text>
                  </View>
                </View>

                {/* HISTORY */}
                <Text style={styles.recentTitle}>Recent Quiz History</Text>

                {allQuizDays.length === 0 ? (
                  <Text style={styles.emptyHistory}>
                    No quizzes completed yet
                  </Text>
                ) : (
                  allQuizDays.slice(0, 10).map(([date, item]) => {
                    const normalAccuracy = item?.normalQuiz?.percentage || 0;
                    const bonusAccuracy =
                      item?.bonusQuizzes?.percentage || null;

                    return (
                      <View key={date} style={styles.historyRow}>
                        <View>
                          <Text style={styles.historyDate}>
                            {moment(date).format('MMM DD, YYYY')}
                          </Text>

                          <Text style={styles.historyMeta}>
                            Normal:{' '}
                            {item?.normalQuiz
                              ? `${item.normalQuiz.correctAnswers}/${item.normalQuiz.totalQuestions}`
                              : 'Not Played'}
                          </Text>

                          {item?.bonusQuizzes && (
                            <Text
                              style={[styles.historyMeta, { color: '#FFD700' }]}
                            >
                              Bonus:{' '}
                              {`${item.bonusQuizzes.correctAnswers}/${item.bonusQuizzes.totalQuestions}`}
                            </Text>
                          )}
                        </View>

                        <View style={styles.historyRight}>
                          <Text style={styles.historyPercent}>
                            {normalAccuracy}%
                          </Text>

                          {bonusAccuracy !== null && (
                            <Text
                              style={[styles.historyTime, { color: '#FFD700' }]}
                            >
                              Bonus {bonusAccuracy}%
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </Animated.View>
            </View>
          </Animated.View>
        )}
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    marginTop: 6,
    paddingBottom: height / 12,
  },
  titleCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  titleText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratBold,
  },
  subText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 4,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    borderRadius: 18,
    marginTop: 14,
  },
  scoreCopy: {
    flex: 1,
    paddingLeft: 16,
  },
  congrats: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 4,
  },
  scoreMsg: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: fontFamily.montserratMedium,
  },
  passWord: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
  },
  statRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statBoxGreen: {
    backgroundColor: 'rgba(107,158,110,0.18)',
    borderColor: 'rgba(107,158,110,0.45)',
  },
  statBoxRed: {
    backgroundColor: 'rgba(192,108,91,0.18)',
    borderColor: 'rgba(192,108,91,0.45)',
  },
  statBoxBlue: {
    backgroundColor: 'rgba(90,150,255,0.14)',
    borderColor: 'rgba(90,150,255,0.4)',
  },
  statBoxOrange: {
    backgroundColor: 'rgba(255,165,90,0.16)',
    borderColor: 'rgba(255,165,90,0.42)',
  },
  statBigNum: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },
  statBigLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    marginTop: 2,
  },
  statTimeIcon: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionsRow: {
    marginTop: 18,
    gap: 10,
  },
  actionBtnSecondary: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: 'rgba(90,150,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(90,150,255,0.4)',
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    color: '#8FB7FF',
    fontSize: 13.5,
    fontFamily: fontFamily.montserratSemiBold,
  },
  actionBtnPrimary: {
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  actionBtnPrimaryText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },
  backToHabits: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  analyticsItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
  },

  analyticsNumber: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  analyticsToggle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },
  analyticsLabel: {
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    fontSize: 11,
  },

  recentTitle: {
    color: colors.white,
    fontSize: 15,
    marginTop: 14,
    marginBottom: 14,
    fontFamily: fontFamily.montserratBold,
  },

  emptyHistory: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },

  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  historyDate: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fontFamily.montserratSemiBold,
  },

  historyMeta: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 4,
    fontFamily: fontFamily.montserratMedium,
  },
  bonusCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },

  bonusTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },

  bonusSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    fontFamily: fontFamily.montserratMedium,
  },

  bonusCountdown: {
    marginTop: 10,
    color: colors.white,
    fontFamily: fontFamily.montserratSemiBold,
  },

  bonusReady: {
    marginTop: 10,
    color: '#FFD700',
    fontFamily: fontFamily.montserratBold,
  },
  historyRight: {
    alignItems: 'flex-end',
  },

  historyPercent: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
    fontSize: 14,
  },

  historyTime: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 3,
  },
  backToHabitsText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12.5,
    fontFamily: fontFamily.montserratSemiBold,
    textDecorationLine: 'underline',
  },
  heroCard: {
    backgroundColor: 'rgba(143,175,120,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.3)',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },

  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fontFamily.montserratBold,
  },

  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 6,
    width: '90%',
    fontFamily: fontFamily.montserratMedium,
  },

  heroBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroBadgeText: {
    color: colors.secondary,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
  },

  todayQuizCard: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  todayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  todayLabel: {
    color: colors.secondary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: fontFamily.montserratBold,
  },

  todayDate: {
    color: colors.white,
    marginTop: 5,
    fontSize: 15,
    fontFamily: fontFamily.montserratSemiBold,
  },

  todayScorePill: {
    backgroundColor: 'rgba(143,175,120,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  todayScoreText: {
    color: colors.secondary,
    fontFamily: fontFamily.montserratBold,
  },

  todayTap: {
    color: 'rgba(255,255,255,0.45)',
    marginTop: 14,
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
  },

  summaryCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  summaryTitle: {
    color: colors.white,
    fontSize: 15,
    marginBottom: 14,
    fontFamily: fontFamily.montserratBold,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  summaryLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },

  summaryValue: {
    color: colors.white,
    fontFamily: fontFamily.montserratBold,
  },

  historyCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  historyTitle: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratBold,
  },

  historySub: {
    color: 'rgba(255,255,255,0.45)',
    marginTop: 6,
    fontSize: 12,
  },
  leaderboardCard: {
    marginTop: 18,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(120,90,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(140,120,255,0.28)',
    position: 'relative',
  },

  leaderboardGlow: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(140,120,255,0.18)',
  },

  leaderboardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leaderboardMini: {
    color: '#B8A9FF',
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: fontFamily.montserratBold,
  },

  leaderboardTitle: {
    color: colors.white,
    fontSize: 22,
    marginTop: 6,
    fontFamily: fontFamily.montserratBold,
  },

  leaderboardSub: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    width: '92%',
    fontFamily: fontFamily.montserratMedium,
  },

  leaderboardBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  leaderboardBadgeEmoji: {
    fontSize: 34,
  },

  leaderboardStats: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },

  leaderboardStatItem: {
    flex: 1,
    alignItems: 'center',
  },

  leaderboardStatNumber: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fontFamily.montserratBold,
  },

  leaderboardStatLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 5,
    fontFamily: fontFamily.montserratMedium,
  },

  leaderboardDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  leaderboardBottom: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leaderboardBottomText: {
    color: '#CBBEFF',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  leaderboardArrow: {
    color: '#CBBEFF',
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
  },
});
