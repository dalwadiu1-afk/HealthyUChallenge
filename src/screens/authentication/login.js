import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, fontFamily } from '../../constant/index';
import { Button, Header, Hyperlink, SvgImg, Wrapper } from '../../components';
import InputBox from '../../components/common/InputBox';
import { appIcon, eyeIcon } from '../../assets/images';

const { height, width } = Dimensions.get('window');
export default function Login({ navigation }) {
  return (
    <Wrapper>
      <Header disableLeft={false} leftBtnStyle={styles.leftBtnStyle} />
      <View style={{ marginTop: height * 0.09, flex: 0.9 }}>
        <SvgImg
          style={styles.container}
          iconName={appIcon}
          height={height * 0.08}
          width={width * 0.18}
        />
        <Text style={styles.welcomeText}>
          Welcome back! Glad{`\n`}to see you, Again!
        </Text>

        <>
          <InputBox
            mainContainer={{ marginTop: height * 0.03 }}
            placeHolder="Enter your email"
            placeholderTextColor={'white'}
          />
          <InputBox
            textIcon={eyeIcon}
            mainContainer={{ marginTop: height * 0.018 }}
            placeHolder="Enter your password"
            placeholderTextColor={'white'}
          />

          <Hyperlink
            title="Forgot Password?"
            linkStyle={{
              alignSelf: 'flex-end',
              paddingHorizontal: 10,
              paddingTop: height * 0.01,
            }}
            textStyle={{ textDecorationLine: 'none' }}
            onPress={() => navigation.navigate('forgotPassword')}
          />
        </>

        <Button
          title="Login"
          buttonStyle={{ marginTop: 32, backgroundColor: colors.white }}
          textStyle={{ color: colors.black }}
        />
      </View>
      <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontFamily: fontFamily.montserratMedium,
          }}
        >
          Don’t have an account?{'  '}
        </Text>
        <Hyperlink
          title="Register Now"
          linkStyle={{ alignSelf: 'center' }}
          textStyle={{ textDecorationLine: 'none', color: '#F5F3BC' }}
          onPress={() => navigation.navigate('signup')}
        />
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: height * 0.07,
    width: height * 0.07,
    backgroundColor: 'white',
    borderRadius: 100,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 100,
  },
  welcomeText: {
    color: 'white',
    fontSize: 33,
    marginTop: height * 0.03,
    fontFamily: fontFamily.montserratBold,
  },
});
