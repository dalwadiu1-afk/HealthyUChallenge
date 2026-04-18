import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, fontFamily } from '../../constant';

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

export default function NewPassword({ navigation }) {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid = newPass.length >= 6 && newPass === confirmPass;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
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

        {/* Lock icon */}
        <View style={styles.iconWrap}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z"
              stroke={colors.secondary}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M7 11V7a5 5 0 0110 0v4"
              stroke={colors.secondary}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text style={styles.title}>Create new{'\n'}password</Text>
        <Text style={styles.desc}>
          Your new password must be unique from those previously used.
        </Text>

        {/* New Password */}
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="Enter new password"
              placeholderTextColor="rgba(255,255,255,0.2)"
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNew(v => !v)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{showNew ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={confirmPass}
              onChangeText={setConfirmPass}
              placeholder="Re-enter new password"
              placeholderTextColor="rgba(255,255,255,0.2)"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(v => !v)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>{showConfirm ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          {confirmPass.length > 0 && newPass !== confirmPass && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        {/* Reset button */}
        <TouchableOpacity
          style={[styles.resetBtn, !isValid && styles.resetBtnDisabled]}
          activeOpacity={0.85}
          disabled={!isValid}
          onPress={() => navigation?.navigate('success')}
        >
          {isValid && (
            <GradientBg
              id="resetGrad"
              c1="#6A9455"
              c2="#3A5A2A"
              r={16}
              horizontal
            />
          )}
          <Text
            style={[
              styles.resetBtnText,
              !isValid && styles.resetBtnTextDisabled,
            ]}
          >
            Reset Password
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dark },
  scroll: {
    paddingTop: (StatusBar.currentHeight || 44) + 12,
    paddingHorizontal: 24,
    paddingBottom: 48,
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
    marginBottom: 32,
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(143,175,120,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    color: colors.white,
    fontSize: 30,
    fontFamily: fontFamily.montserratBold,
    marginBottom: 10,
    lineHeight: 38,
  },
  desc: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontFamily: fontFamily.montserratRegular,
    lineHeight: 22,
    marginBottom: 36,
  },

  inputWrap: { marginBottom: 20 },
  inputLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.montserratMedium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 52,
    color: colors.white,
    fontSize: 15,
    fontFamily: fontFamily.montserratRegular,
  },
  eyeBtn: { paddingLeft: 10 },
  eyeText: { fontSize: 16 },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: fontFamily.montserratRegular,
    marginTop: 6,
  },

  resetBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  resetBtnDisabled: {},
  resetBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.montserratSemiBold,
  },
  resetBtnTextDisabled: { color: 'rgba(255,255,255,0.3)' },
});
