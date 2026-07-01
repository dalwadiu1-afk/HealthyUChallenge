import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { colors, fontFamily } from '../../constant';
import { Wrapper } from '../../components';
import firestore from '@react-native-firebase/firestore';

const CATEGORIES = ['All', 'Articles', 'Podcasts', 'Flyers'];

const CATEGORY_COLOR = {
  Articles: { bg: 'rgba(90,150,255,0.15)', text: '#5A96FF' },
  Videos: { bg: 'rgba(255,100,130,0.15)', text: '#FF6482' },
  Tips: { bg: 'rgba(143,175,120,0.2)', text: '#8FAF78' },
  Podcasts: { bg: 'rgba(167,130,255,0.15)', text: '#A782FF' },
};

export default function ResourcesList({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [resources, setResources] = useState([]);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [flyers, setFlyers] = useState([]);
  const [featured, setFeatured] = useState(null);

  const animation = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const animationIndex = useRef(0);
  const flyerIndex = useRef(0);

  const fadeAnimation = () => {
    animation.setValue(0);

    Animated.timing(animation, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  const slideAnimation = () => {
    slide.setValue(80);

    Animated.timing(slide, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  const bounceAnimation = () => {
    scale.setValue(0.7);

    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const scaleAnimation = () => {
    scale.setValue(0.8);

    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('resources')
      .onSnapshot(snapshot => {
        let allResources = [];
        let flyerItems = [];

        snapshot.forEach(doc => {
          const data = doc.data();

          if (data.items && Array.isArray(data.items)) {
            const items = data.items.map((item, index) => ({
              ...item,
              category: doc.id,
              id: `${doc.id}-${index}`,
            }));

            allResources.push(...items);

            if (doc.id.toLowerCase() === 'flyers') {
              flyerItems = items;
            }
          }
        });

        setResources(allResources);
        setFlyers(flyerItems);

        if (flyerItems.length > 0) {
          setFeatured(flyerItems[0]);
        }
      });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!flyers.length) return;

    const animations = [
      fadeAnimation,
      slideAnimation,
      scaleAnimation,
      bounceAnimation,
    ];

    fadeAnimation();

    const timer = setInterval(() => {
      flyerIndex.current = (flyerIndex.current + 1) % flyers.length;

      setFeatured(flyers[flyerIndex.current]);

      animations[animationIndex.current]();

      animationIndex.current = (animationIndex.current + 1) % animations.length;
    }, 10000);

    return () => clearInterval(timer);
  }, [flyers]);

  const filtered =
    activeCategory === 'all'
      ? resources
      : resources.filter(r => r.category === activeCategory);

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
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => openLink(item?.link)}
        >
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

  const openLink = async url => {
    console.log('url :>> ', url);
    try {
      const supported = await Linking.canOpenURL(url);
      console.log('supported :>> ', supported);
      if (!supported) {
        Alert.alert(
          'Unable to Open',
          'No application found to handle this link.',
        );
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log('Open URL Error:', error);
      Alert.alert('Error', 'Something went wrong while opening the link.');
    }
  };

  return (
    <View style={styles.container}>
      <Wrapper>
        <FlatList
          data={filtered}
          keyExtractor={item => item?.id}
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
              {featured && (
                <Animated.View
                  style={{
                    opacity: animation,
                    transform: [{ translateX: slide }, { scale }],
                  }}
                >
                  <TouchableOpacity
                    style={styles.featuredCard}
                    activeOpacity={0.88}
                    onPress={() => openLink(featured?.link)}
                  >
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>
                        {featured.emoji || '📄 Flyer'}
                      </Text>
                    </View>

                    <Text style={styles.featuredTitle}>{featured.title}</Text>

                    <Text style={styles.featuredDesc}>{featured.desc}</Text>

                    <View style={styles.featuredMeta}>
                      <Text style={styles.featuredMetaText}>
                        📖 {featured.readTime}
                      </Text>

                      <View style={styles.featuredBtn}>
                        <Text style={styles.featuredBtnText}>Learn More →</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Category filter */}
              <FlatList
                data={CATEGORIES}
                horizontal
                keyExtractor={c => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: cat }) => {
                  const isActive = cat?.toLowerCase() === activeCategory;
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
                      onPress={() => setActiveCategory(cat?.toLowerCase())}
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
                {activeCategory === 'all' ? 'Resources' : activeCategory}
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
    fontSize: 20,
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
