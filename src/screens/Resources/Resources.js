import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../constant';
import { Wrapper } from '../../components';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Articles', 'Videos', 'Tips', 'Podcasts'];

const RESOURCES = [
  {
    id: 1,
    category: 'Articles',
    emoji: '🥗',
    readTime: '5 min read',
    title: 'The Science of Balanced Nutrition',
    desc: 'Learn how macros and micros work together to fuel your body and mind throughout the day.',
  },
  {
    id: 2,
    category: 'Videos',
    emoji: '🏃',
    readTime: '12 min watch',
    title: '10-Minute Morning Mobility Routine',
    desc: 'Start your day with this guided mobility routine designed for all fitness levels.',
  },
  {
    id: 3,
    category: 'Tips',
    emoji: '💧',
    readTime: '2 min read',
    title: 'How Much Water Do You Really Need?',
    desc: 'Hydration myths debunked — find out the right daily water intake for your body type.',
  },
  {
    id: 4,
    category: 'Podcasts',
    emoji: '🧠',
    readTime: '28 min listen',
    title: 'Mental Health & Physical Wellness Link',
    desc: 'Explore the deep connection between your mental state and your ability to exercise.',
  },
  {
    id: 5,
    category: 'Articles',
    emoji: '😴',
    readTime: '6 min read',
    title: 'Sleep: The Ultimate Recovery Tool',
    desc: 'Why 7–9 hours is non-negotiable and how sleep directly affects your fitness goals.',
  },
  {
    id: 6,
    category: 'Tips',
    emoji: '🌿',
    readTime: '3 min read',
    title: '5 Stress-Reducing Habits for Busy People',
    desc: 'Simple daily habits that take under 10 minutes to dramatically lower cortisol levels.',
  },
  {
    id: 7,
    category: 'Videos',
    emoji: '💪',
    readTime: '18 min watch',
    title: 'Beginner Strength Training Guide',
    desc: 'No gym required — build real strength at home with just bodyweight exercises.',
  },
  {
    id: 8,
    category: 'Podcasts',
    emoji: '🍎',
    readTime: '35 min listen',
    title: 'Gut Health & Your Overall Wellbeing',
    desc: 'A deep dive into the microbiome and how your diet shapes your entire health system.',
  },
];

const CATEGORY_COLOR = {
  Articles: { bg: 'rgba(90,150,255,0.15)', text: '#5A96FF' },
  Videos: { bg: 'rgba(255,100,130,0.15)', text: '#FF6482' },
  Tips: { bg: 'rgba(143,175,120,0.2)', text: '#8FAF78' },
  Podcasts: { bg: 'rgba(167,130,255,0.15)', text: '#A782FF' },
};

function ResourceCard({ item, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  const cat = CATEGORY_COLOR[item.category] || CATEGORY_COLOR.Tips;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index * 70,
      useNativeDriver: true,
    }).start();
  }, []);

  const animStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.card} activeOpacity={0.85}>
        {/* Left emoji block */}
        <View style={[styles.emojiBox, { backgroundColor: cat.bg }]}>
          <Text style={styles.emojiText}>{item.emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
              <Text style={[styles.categoryText, { color: cat.text }]}>
                {item.category}
              </Text>
            </View>
            <Text style={styles.readTime}>{item.readTime}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.desc}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All');
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filtered =
    activeCategory === 'All'
      ? RESOURCES
      : RESOURCES.filter(r => r.category === activeCategory);

  return (
    <View style={styles.container}>
      <Wrapper>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Animated.View style={{ opacity: headerAnim }}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerSub}>Explore</Text>
                <Text style={styles.headerTitle}>Resources</Text>
                <Text style={styles.headerDesc}>
                  Articles, tips & guides to fuel your wellness journey.
                </Text>
              </View>

              {/* Featured card */}
              <TouchableOpacity
                style={styles.featuredCard}
                activeOpacity={0.88}
              >
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
                </View>
                <Text style={styles.featuredTitle}>
                  Building Healthy Habits{'\n'}That Actually Stick
                </Text>
                <Text style={styles.featuredDesc}>
                  Backed by behavioral science — the proven 3-step framework for
                  lasting change.
                </Text>
                <View style={styles.featuredMeta}>
                  <Text style={styles.featuredMetaText}>📖 8 min read</Text>
                  <View style={styles.featuredBtn}>
                    <Text style={styles.featuredBtnText}>Read →</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Category filter */}
              <FlatList
                data={CATEGORIES}
                horizontal
                keyExtractor={c => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: cat }) => {
                  const isActive = cat === activeCategory;
                  const cc = CATEGORY_COLOR[cat];
                  return (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        isActive && {
                          backgroundColor: cc ? cc.bg : 'rgba(143,175,120,0.2)',
                          borderColor: cc ? cc.text : colors.secondary,
                        },
                      ]}
                      onPress={() => setActiveCategory(cat)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          isActive && {
                            color: cc ? cc.text : colors.secondary,
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <Text style={styles.sectionLabel}>
                {filtered.length}{' '}
                {activeCategory === 'All' ? 'Resources' : activeCategory}
              </Text>
            </Animated.View>
          }
          renderItem={({ item, index }) => (
            <ResourceCard item={item} index={index} />
          )}
        />
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  listContent: {},
  header: {},
  headerSub: {
    color: colors.secondary,
    fontSize: 11,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 4,
    marginBottom: 6,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 30,
    fontFamily: fontFamily.montserratBold,
  },
  headerDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: 'rgba(77,102,68,0.35)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    padding: 20,
    marginBottom: 22,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,193,90,0.15)',
    borderRadius: 49,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#FFC15A',
    fontSize: 11,
    fontFamily: fontFamily.montserratSemiBold,
  },
  featuredTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    lineHeight: 28,
    marginBottom: 8,
  },
  featuredDesc: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMetaText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  featuredBtn: {
    backgroundColor: colors.primary,
    borderRadius: 49,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  featuredBtnText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 49,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: fontFamily.montserratMedium,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 14,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  emojiText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    borderRadius: 49,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: fontFamily.montserratSemiBold,
  },
  readTime: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontFamily: fontFamily.montserratMedium,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratSemiBold,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 18,
  },
});
