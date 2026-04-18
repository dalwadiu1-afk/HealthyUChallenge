// import React from 'react';
// import { View, Text, StyleSheet, TextInput } from 'react-native';
// import { Header, SvgImg, Wrapper } from '../../components';
// import ChatCard from '../../components/social/chatCard';
// import { colors, fontFamily } from '../../constant';
// import { attachIcon, chatIcon, uploadIcon } from '../../assets/images';

// export default function AddPost() {
//   const posts = [
//     {
//       id: 1,
//       name: 'Linh Nguyen',
//       message:
//         'I am very happy to be with Cafit in training sessions and how about you?',
//       time: '10:30 AM || 2s ago',
//       picture:
//         'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
//     },
//     // {
//     //   id: 2,
//     //   name: 'John Doe',
//     //   message:
//     //     'I am very happy to be with Cafit in training sessions and how about you?',
//     //   time: '10:30 AM || 2s ago',
//     //   picture:
//     //     'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
//     // },
//   ];
//   return (
//     <View style={{ flex: 1, backgroundColor: colors.dark }}>
//       <Wrapper>
//         <Header
//           header={`Linh's Post`}
//           showRightBtn={true}
//           textStyle={styles.textStyle}
//         />
//         <View style={{ flex: 1 }}>
//           {posts.map((item, index) => (
//             <ChatCard key={index} item={item} />
//           ))}
//         </View>

//         <View style={styles.commentContainer}>
//           <View style={styles.attachBtn}>
//             <SvgImg iconName={attachIcon} height={24} width={24} />
//           </View>
//           <TextInput
//             placeholder="Write a comment..."
//             style={styles.textInput}
//           />
//           <View
//             style={{
//               ...styles.attachBtn,
//               backgroundColor: colors.primary,
//               borderColor: colors.primary,
//             }}
//           >
//             <SvgImg iconName={uploadIcon} height={24} width={24} />
//           </View>
//         </View>
//       </Wrapper>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   textStyle: {
//     fontFamily: fontFamily.montserratBold,
//     fontSize: 16,
//     lineHeight: 26,
//     textAlign: 'center',
//     color: colors.white,
//   },
//   attachBtn: {
//     width: 45,
//     height: 45,
//     borderRadius: 50,
//     borderWidth: 1,
//     borderColor: colors.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   textInput: {
//     flex: 1,
//     marginHorizontal: 12,
//     backgroundColor: colors.white,
//     paddingVertical: 15,
//     borderRadius: 50,
//     paddingHorizontal: 20,
//     fontFamily: fontFamily.montserratMedium,
//   },
//   commentContainer: {
//     paddingVertical: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import ChatCard from '../../components/social/chatCard';
import { colors, fontFamily } from '../../constant';
import { SvgImg } from '../../components';
import { attachIcon, uploadIcon } from '../../assets/images';

function GradientBg({ id, c1, c2, r = 16, horizontal = false }) {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2={horizontal ? '1' : '0'}
          y2={horizontal ? '0' : '1'}
        >
          <Stop offset="0" stopColor={c1} stopOpacity="1" />
          <Stop offset="1" stopColor={c2} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} rx={r} />
    </Svg>
  );
}

export default function AddPost({ navigation }) {
  const [comment, setComment] = useState('');

  const posts = [
    {
      id: 1,
      name: 'Linh Nguyen',
      message:
        'I am very happy to be with Cafit in training sessions and how about you?',
      time: '10:30 AM || 2s ago',
      picture:
        'https://media.istockphoto.com/id/1319764741/photo/mature-people-jogging-in-park.jpg?s=1024x1024&w=is&k=20&c=p5rgI1p3LMXMOg10h6E5UzZH1orsneAg6MQKKFdsM64=',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Svg width={9} height={16} viewBox="0 0 9 16" fill="none">
            <Path
              d="M8 1L1 8L8 15"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linh's Post</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {posts.map((item, index) => (
          <ChatCard key={index} item={item} />
        ))}
      </ScrollView>

      {/* Comment input bar */}
      <View style={styles.inputBar}>
        {/* Attach */}
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
          <SvgImg iconName={attachIcon} height={22} width={22} />
        </TouchableOpacity>

        {/* Text field */}
        <TextInput
          style={styles.textInput}
          placeholder="Write a comment..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={comment}
          onChangeText={setComment}
          multiline
        />

        {/* Send */}
        <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85}>
          <GradientBg
            id="sendGrad"
            c1="#6A9455"
            c2="#3A5A2A"
            r={14}
            horizontal
          />
          <SvgImg iconName={uploadIcon} height={20} width={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
    paddingTop: (StatusBar.currentHeight || 44) + 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamily.montserratSemiBold,
    color: colors.white,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 10,
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    maxHeight: 80,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
