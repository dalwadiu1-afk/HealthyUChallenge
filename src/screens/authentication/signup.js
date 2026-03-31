import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import { colors } from '../../constant/colors';
import { Button, Header, Hyperlink, SvgImg, Wrapper } from '../../components';
import InputBox from '../../components/common/InputBox';
import { fontFamily } from '../../constant';
import { appIcon, eyeIcon } from '../../assets/images';

const { height, width } = Dimensions.get('window');
export default function Signup({ navigation }) {
  return (
    <Wrapper>
      <Header disableLeft={false} leftBtnStyle={styles.leftBtnStyle} />
      <View style={{ marginTop: height * 0.03, flex: 0.9 }}>
        <SvgImg
          style={styles.container}
          iconName={appIcon}
          height={height * 0.08}
          width={width * 0.18}
        />
        <Text style={styles.welcomeText}>
          Hello! Register to get {`\n`}started
        </Text>

        <>
          <InputBox
            mainContainer={{ marginTop: height * 0.03 }}
            placeHolder="Username"
            placeholderTextColor={'white'}
          />
          <InputBox
            mainContainer={{ ...styles.input }}
            placeHolder="Email"
            placeholderTextColor={'white'}
          />
          <InputBox
            textIcon={eyeIcon}
            mainContainer={{ ...styles.input }}
            placeHolder="Password"
            placeholderTextColor={'white'}
          />
          <InputBox
            textIcon={eyeIcon}
            mainContainer={{ ...styles.input }}
            placeHolder="Confirm Password"
            placeholderTextColor={'white'}
          />
        </>

        <Button
          title="Register"
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
          Already have an account?{'  '}
        </Text>
        <Hyperlink
          title="Login Now"
          linkStyle={{ alignSelf: 'center' }}
          textStyle={{ textDecorationLine: 'none', color: '#F5F3BC' }}
          onPress={() => navigation.navigate('login')}
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
    marginTop: height * 0.015,
    fontFamily: fontFamily.montserratBold,
  },
  input: {
    marginTop: height * 0.018,
  },
});
