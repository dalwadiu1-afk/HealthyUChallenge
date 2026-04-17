import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, fontFamily } from '../../constant';
import { Button, Header, SvgImg, Wrapper } from '../../components';
import { success } from '../../assets/images';
import { AuthBtn } from '../../components/common/authBtn';

const { height, width } = Dimensions.get('window');

export default function Success({ navigation }) {
  return (
    <View style={styles.container}>
      <Wrapper>
        <View style={{ justifyContent: 'center', flex: 0.8 }}>
          <View style={{ justifyContent: 'center', flex: 1 }}>
            <SvgImg
              iconName={success}
              height={height * 0.15}
              width={width * 0.3}
              style={{ alignSelf: 'center' }}
            />
            <Text style={styles.title}>Password Changed!</Text>
            <Text style={styles.desc}>
              Your password has been changed {`\n`}successfully.
            </Text>
            <AuthBtn
              title="Back to Login"
              btnStyle={{
                marginTop: height * 0.06,
                backgroundColor: colors.primary,
              }}
              textStyle={{ color: colors.textPrimary }}
              onPress={() => navigation.navigate('login')}
            />
          </View>
        </View>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    overflow: 'hidden',
  },
  title: {
    color: colors.white,
    fontSize: 30,
    textAlign: 'center',
    marginTop: height * 0.03,
    fontFamily: fontFamily.montserratSemiBold,
  },
  desc: {
    marginTop: height * 0.01,
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: fontFamily.montserratRegular,
  },
});
