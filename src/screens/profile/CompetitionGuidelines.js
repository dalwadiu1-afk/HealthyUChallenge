import React from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { Instructions } from '../../assets/images';
import { colors } from '../../constant';
import { Header, Wrapper } from '../../components';

const { width, height } = Dimensions.get('window');

export default function CompetitionGuidelines() {
  return (
    <View style={styles.container}>
      <Header header="Guidelines" headerContainer={{ paddingHorizontal: 23 }} />
      <Wrapper
        orbsRight
        containerStyle={{ paddingHorizontal: 0 }}
        safeAreaPops={{ edges: ['bottom'] }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          maximumZoomScale={4}
          minimumZoomScale={1}
          bouncesZoom
          pinchGestureEnabled
          centerContent
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Image
            source={Instructions}
            resizeMode="stretch"
            style={styles.image}
          />
        </ScrollView>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    height: height / 1.3, // Adjust to your image aspect ratio
  },
});
