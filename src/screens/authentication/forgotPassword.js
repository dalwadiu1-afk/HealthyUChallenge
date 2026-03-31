import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constant/colors';
import { Button, Header, Hyperlink, Wrapper } from '../../components';
import InputBox from '../../components/common/InputBox';
import { fontFamily } from '../../constant';

const { height, width } = Dimensions.get('window');
export default function ForgotPassword({ navigation }) {
  return (
    <Wrapper>
      <Header disableLeft={false} leftBtnStyle={styles.leftBtnStyle} />
      <View style={{ marginTop: height * 0.05, flex: 0.9 }}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
        <Text style={styles.forgotDesc}>
          Don't worry! It occurs. Please enter the email address linked with
          your account.
        </Text>

        <InputBox
          mainContainer={{ marginTop: height * 0.03 }}
          placeHolder="Email"
          placeholderTextColor={'white'}
        />

        <Button
          title="Send Code"
          buttonStyle={styles.buttonStyle}
          textStyle={{ color: colors.black }}
          onPress={() => navigation.navigate('otp')}
        />
      </View>
      <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontFamily: fontFamily.urbanistRegular,
          }}
        >
          Remember Password?{' '}
        </Text>
        <Hyperlink
          title="Login"
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
  forgotPassword: {
    color: 'white',
    fontSize: 30,
    marginTop: height * 0.03,
    fontFamily: fontFamily.montserratBold,
  },
  forgotDesc: {
    marginTop: height * 0.01,
    color: 'white',
    fontSize: 14,
    paddingRight: 50,
    fontFamily: fontFamily.montserratMedium,
  },
  buttonStyle: {
    backgroundColor: colors.white,
    marginTop: height * 0.05,
    borderRadius: 27.5,
  },
});
