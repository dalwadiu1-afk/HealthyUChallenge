import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';

const FeaturedCarousel = ({ flyers = [], onPress }) => {
  const [index, setIndex] = useState(0);

  const fade = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (flyers.length <= 1) return;

    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex(i => (i + 1) % flyers.length);

        translate.setValue(20);

        Animated.parallel([
          Animated.timing(fade, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(translate, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [flyers]);

  if (!flyers.length) return null;

  const item = flyers[index];

  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateX: translate }],
        paddingHorizontal: 20, // <-- iOS/Android spacing
        marginBottom: 24,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => onPress(item)}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.emoji || '📄'}</Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.desc}>{item.desc}</Text>

        <View style={styles.bottom}>
          <Text style={styles.time}>📖 {item.readTime}</Text>

          <View style={styles.button}>
            <Text style={styles.buttonText}>Learn More →</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default memo(FeaturedCarousel);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(77,102,68,0.35)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    padding: 22,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,193,90,0.15)',
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },

  badgeText: {
    fontSize: 22,
  },

  title: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 10,
  },

  desc: {
    color: 'rgba(255,255,255,.65)',
    lineHeight: 22,
    marginBottom: 20,
  },

  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  time: {
    color: 'rgba(255,255,255,.5)',
  },

  button: {
    backgroundColor: '#6CB33F',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 40,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
