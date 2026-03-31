import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constant/colors';
import { Button, Header, SvgImg } from '../../components';
import { success } from '../../assets/images';
import { fontFamily } from '../../constant';

const { height, width } = Dimensions.get('window');
export default function Success({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.primary,
        paddingHorizontal: 23,
      }}
    >
      <Header disableLeft={false} leftBtnStyle={styles.leftBtnStyle} />

      <View
        style={{
          justifyContent: 'center',
          flex: 0.8,
        }}
      >
        <View
          style={{
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <SvgImg
            iconName={success}
            height={height * 0.15}
            width={width * 0.3}
            style={{ alignSelf: 'center' }}
          />
          <Text style={styles.forgotPassword}>Password Changed!</Text>
          <Text style={styles.forgotDesc}>
            Your password has been changed {`\n`}successfully.
          </Text>

          <Button
            title="Back to Login"
            buttonStyle={{
              marginTop: height * 0.06,
              backgroundColor: colors.white,
            }}
            textStyle={{ color: colors.black }}
            onPress={() => navigation.navigate('login')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    color: 'white',
    fontSize: 30,
    textAlign: 'center',
    marginTop: height * 0.03,
    fontFamily: fontFamily.montserratBold,
  },
  forgotDesc: {
    marginTop: height * 0.01,
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: fontFamily.montserratMedium,
  },
});
