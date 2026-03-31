import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Button, Header, Hyperlink, Wrapper } from '../../components';
import { colors } from '../../constant/colors';
import InputBox from '../../components/common/InputBox';
import { fontFamily } from '../../constant';

const { height, width } = Dimensions.get('window');
export default function OTP({ navigation }) {
  const [count, setCount] = useState(120);
  const [disabled, setDisabled] = useState(false);
  const otpRef = useRef(null);
  const intervalRef = useRef();
  useEffect(() => {
    if (count > 0) {
      setDisabled(true);
      intervalRef.current = setInterval(() => {
        setCount(count => count - 1);
      }, 1000);
    } else {
      setDisabled(false);
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [count]);

  const otpTimerCounter = seconds => {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return `${m}:${s}`;
  };

  return (
    <Wrapper>
      <Header disableLeft={false} leftBtnStyle={styles.leftBtnStyle} />
      <View style={{ marginTop: height * 0.05, flex: 0.9 }}>
        <Text style={styles.forgotPassword}>OTP Verification</Text>
        <Text style={styles.forgotDesc}>
          Enter the verification code we just sent on your email address.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <InputBox
            mainContainer={{ ...styles.otpInput }}
            placeholderTextColor={'white'}
            maxLength={1}
            textAlign="center"
          />
          <InputBox
            mainContainer={{ ...styles.otpInput }}
            placeholderTextColor={'white'}
            maxLength={1}
            textAlign="center"
          />
          <InputBox
            mainContainer={{ ...styles.otpInput }}
            placeholderTextColor={'white'}
            maxLength={1}
            textAlign="center"
          />
          <InputBox
            mainContainer={{ ...styles.otpInput }}
            placeholderTextColor={'white'}
            maxLength={1}
            textAlign="center"
          />
        </View>

        <Button
          title="Verify"
          buttonStyle={styles.buttonStyle}
          textStyle={{ color: colors.black }}
          onPress={() => navigation.navigate('newPassword')}
        />
      </View>

      <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontFamily: fontFamily.montserratRegular,
          }}
        >
          {count === 0 ? 'Didn’t received code? ' : 'Resend in '}
        </Text>
        {count === 0 ? (
          <Hyperlink
            title="Resend"
            linkStyle={{ alignSelf: 'center' }}
            textStyle={{ textDecorationLine: 'none', color: '#F5F3BC' }}
            onPress={() => setCount(120)}
          />
        ) : (
          <Text
            style={{
              textDecorationLine: 'none',
              color: '#F5F3BC',
              fontFamily: fontFamily.montserratBold,
            }}
          >
            {otpTimerCounter(count)}
          </Text>
        )}
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
    marginTop: height * 0.08,
    borderRadius: 27.5,
  },
  otpInput: {
    width: width * 0.18,
    borderRadius: 12,
    marginTop: height * 0.03,
    textAlign: 'center',
  },
});
