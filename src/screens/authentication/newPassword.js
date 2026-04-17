import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, fontFamily } from '../../constant';
import { Button, Header, Wrapper } from '../../components';
import InputBox from '../../components/common/InputBox';
import { AuthBtn } from '../../components/common/authBtn';
import { eyeIcon } from '../../assets/images';

const { height } = Dimensions.get('window');

export default function NewPassword({ navigation }) {
  const [newPassword, setNewPassword] = useState('');
  const [secureNewPass, setSecureNewPass] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureConfirmPass, setConfirmSecurePass] = useState(true);
  return (
    <View style={styles.container}>
      <Wrapper>
        <Header disableLeft={false} />
        <View style={{ marginTop: height * 0.05, flex: 0.9 }}>
          <Text style={styles.title}>Create new {`\n`}password</Text>
          <Text style={styles.desc}>
            Your new password must be unique from those previously used.
          </Text>
          <View>
            <InputBox
              mainContainer={styles.inputWrapper}
              value={newPassword}
              onChangeText={setNewPassword}
              label="New Password"
              placeholderTextColor="rgba(255,255,255,0.3)"
              returnKeyType="done"
              textIcon={eyeIcon}
              secureTextEntry={secureNewPass}
              onRightIconPress={() => setSecureNewPass(!secureNewPass)}
            />
            <InputBox
              mainContainer={styles.inputWrapper}
              value={confirmPassword}
              label="Confirm Password"
              onChangeText={setConfirmPassword}
              placeholderTextColor="rgba(255,255,255,0.3)"
              returnKeyType="done"
              textIcon={eyeIcon}
              secureTextEntry={secureConfirmPass}
              onRightIconPress={() => setConfirmSecurePass(!secureConfirmPass)}
            />
          </View>
          <AuthBtn
            btnStyle={{ marginTop: 20 }}
            isComplete
            onPress={() => navigation.navigate('success')}
            title="Reset Password"
          />
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
    marginTop: height * 0.03,
    fontFamily: fontFamily.montserratSemiBold,
  },
  desc: {
    marginTop: height * 0.01,
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.montserratMedium,
  },
  inputWrapper: {
    marginTop: 20,
  },
});
