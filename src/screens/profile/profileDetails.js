import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Header, Wrapper } from "../../components";
import { colors, fontFamily } from "../../constant";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
} from "react-native-reanimated";

import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import ChatCard from "../../components/social/chatCard";

const { height, width } = Dimensions.get("window");

export default function ProfileDetails({ navigation }) {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const options = [{ label: "Feeds" }, { label: "Stats" }, { label: "Stats" }];
  const translateY = useSharedValue(0);

  // ✅ Gesture handler (drag + snap)
  const gestureHandler = (event) => {
    let value = event.nativeEvent.translationY;

    // Clamp range
    if (value < -300) value = -300;
    if (value > 0) value = 0;

    translateY.value = value;
  };

  const handleEnd = () => {
    // Snap logic
    if (translateY.value < -150) {
      translateY.value = withSpring(-300);
    } else {
      translateY.value = withSpring(0);
    }
  };

  const imageStyle = useAnimatedStyle(() => {
    const size = interpolate(
      translateY.value,
      [-800, 0],
      [height * 0.07, width * 0.3],
      Extrapolate.CLAMP,
    );

    const translateX = interpolate(
      translateY.value,
      [-300, 0],
      [-width * 0.35, 0],
      Extrapolate.CLAMP,
    );

    const translateYAnim = interpolate(
      translateY.value,
      [-300, 0],
      [0, 0],
      Extrapolate.CLAMP,
    );

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      transform: [{ translateX }, { translateY: translateYAnim }],
    };
  });

  const nameStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      translateY.value,
      [-300, 0],
      [-width * 0.05, 0],
      Extrapolate.CLAMP,
    );

    const translateYAnim = interpolate(
      translateY.value,
      [-300, 0],
      [-height * 0.14, 0],
      Extrapolate.CLAMP,
    );

    const fontSize = interpolate(
      translateY.value,
      [-300, 0],
      [18, 24],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ translateX }, { translateY: translateYAnim }],
      fontSize,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    const sheetHeight = interpolate(
      translateY.value,
      [-height * 0.3, height * 0.8],
      [height * 0.75, height * 0.5],
      Extrapolate.CLAMP,
    );

    return {
      height: sheetHeight,
    };
  });

  const chats = [
    {
      id: 1,
      name: "Linh Nguyen",
      message:
        "I am very happy to be with Cafit in training sessions and how about you and how about youand how about youand how about youand how about you?",
      time: "10:30 AM || 2s ago",
      picture:
        "https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=",
      likes: 20,
      comments: 10,
    },
    {
      id: 2,
      name: "Linh Nguyen",
      message:
        "I am very happy to be with Cafit in training sessions and how about you?",
      time: "10:30 AM || 2s ago",
      picture:
        "https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=",
      likes: 20,
      comments: 10,
    },
    {
      id: 3,
      name: "Linh Nguyen",
      message:
        "I am very happy to be with Cafit in training sessions and how about you?",
      time: "10:30 AM || 2s ago",
      picture:
        "https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=",
      likes: 20,
      comments: 10,
    },
  ];

  const TabOptions = ({ option, index }) => {
    return (
      <TouchableOpacity
        onPress={() => setCurrentTabIndex(index)}
        key={index}
        style={{
          flex: 1,
          alignItems: "center",
          backgroundColor:
            index != currentTabIndex ? "transparent" : colors.white,
          padding: 5,
          borderRadius: 100,
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.montserratSemiBold,
            color: index != currentTabIndex ? colors.black : "#F15223",
            fontSize: 14,
          }}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const onCardPress = () => {};

  const renderChats = ({ item, index }) => {
    return <ChatCard key={index} item={item} onCardPress={onCardPress} />;
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
        <Header
          header={`Profile`}
          showRightBtn={true}
          textStyle={styles.textStyle}
          disableLeft={false}
          headerContainer={{ paddingHorizontal: 23 }}
        />

        <View style={{ flex: 1 }}>
          {/* ✅ Profile Image */}
          <Animated.View style={[styles.profileContainer, imageStyle]}>
            <Animated.Image
              source={{
                uri: "https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg",
              }}
              style={{ width: "100%", height: "100%", borderRadius: 100 }}
            />
          </Animated.View>

          {/* ✅ Name */}
          <Animated.Text style={[styles.nameTag, nameStyle]}>
            Linh Nguyen
          </Animated.Text>

          {/* ✅ Bottom Sheet */}
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <PanGestureHandler
              onGestureEvent={gestureHandler}
              onEnded={handleEnd}
            >
              <Animated.View style={styles.notch} />
            </PanGestureHandler>

            {/* Content */}
            <View style={{ padding: 20, flex: 1 }}>
              <View
                style={[
                  styles.tabContainer,
                  { flexDirection: "row", marginBottom: 20 },
                ]}
              >
                {options.map((option, index) => (
                  <TabOptions key={index} option={option} index={index} />
                ))}
              </View>
              <FlatList
                style={{ flex: 1 }}
                data={chats}
                renderItem={renderChats}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Animated.View>
        </View>
      </Wrapper>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    fontFamily: fontFamily.montserratSemiBold,
  },

  profileContainer: {
    position: "absolute",
    top: height * 0.02,
    alignSelf: "center",
    height: height * 0.08,
    width: height * 0.08,
  },
  nameTag: {
    position: "absolute",
    top: height * 0.16,
    alignSelf: "center",
    fontFamily: fontFamily.montserratBold,
    color: colors.white,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  notch: {
    height: 6,
    width: width * 0.15,
    backgroundColor: colors.grey,
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  tabContainer: {
    backgroundColor: "#FFF1F3",
    padding: 5,
    width: "100%",
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
