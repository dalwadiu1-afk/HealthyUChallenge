import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constant/colors';
import { Button, Header, Wrapper } from '../../components';
import InputBox from '../../components/common/InputBox';
import { fontFamily } from '../../constant';

const { height, width } = Dimensions.get('window');
export default function NewPassword({ navigation }) {
  return (
    <Wrapper>
      <Header disableLeft={false} leftBtnStyle={styles.leftBtnStyle} />
      <View style={{ marginTop: height * 0.05, flex: 0.9 }}>
        <Text style={styles.forgotPassword}>Create new {`\n`}password</Text>
        <Text style={styles.forgotDesc}>
          Your new password must be unique from those previously used.
        </Text>
        <>
          <InputBox
            mainContainer={{ marginTop: height * 0.03 }}
            placeHolder="New Password"
            placeholderTextColor={'white'}
          />
          <InputBox
            mainContainer={{ marginTop: height * 0.018 }}
            placeHolder="Confirm Password"
            placeholderTextColor={'white'}
          />
        </>
        <Button
          title="Reset Password"
          buttonStyle={styles.buttonStyle}
          textStyle={{ color: colors.black }}
          onPress={() => navigation.navigate('success')}
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
    fontFamily: fontFamily.montserratMedium,
  },
  buttonStyle: {
    backgroundColor: colors.white,
    marginTop: height * 0.05,
    borderRadius: 27.5,
  },
});
