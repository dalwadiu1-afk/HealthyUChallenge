import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Button, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';
import moment from 'moment';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import InputBox from '../../../components/common/InputBox';
const { height, width } = Dimensions.get('window');
export default function SessionConfirmation() {
  const actionSheetRef = useRef(null);

  const onActionOpen = () => {
    actionSheetRef.current?.show();
  };

  const onActionClose = () => {
    actionSheetRef.current?.hide();
  };
  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <StatusBar barStyle="dark-content" />

      <View style={{ flex: 0.5 }}>
        <Image
          source={{
            uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
          }}
          style={styles.profile}
          resizeMode="cover"
        />
      </View>

      <View style={styles.floatingContainer}>
        <Text
          style={{
            fontFamily: fontFamily.poppinsSemiBold,
            color: 'white',
            fontSize: 24,
            marginTop: 0,
          }}
        >
          Dr. Smith Sras
        </Text>
        <Text
          style={{
            ...styles.specialty,
            color: 'white',
            fontSize: 14,
            marginVertical: 4,
          }}
        >
          Cardiologist Specialist
        </Text>
        <Text style={{ ...styles.specialty, color: 'white', fontSize: 15 }}>
          Montclair State University
        </Text>
      </View>

      <View style={styles.profileDetailsContainer}>
        <View style={{ marginTop: height * 0.08 }}>
          <Text style={{ ...styles.name, fontSize: 20 }}>
            Appointment Booked
          </Text>

          <View style={styles.datesContainer}>
            <Text
              style={{
                ...styles.name,
                marginTop: 0,
                fontSize: 16,
                color: 'white',
              }}
            >
              {moment().format('MMMM Do YYYY')}
            </Text>
            <Text
              style={{
                ...styles.name,
                fontSize: 16,
                color: 'white',
              }}
            >
              {moment().format('kk : mm A')}
            </Text>
          </View>
        </View>

        <View style={styles.btnContainer}>
          <Button
            title="Attended"
            containerStyle={{ marginTop: 20 }}
            onPress={onActionOpen}
          />
        </View>
      </View>

      <ActionSheet
        containerStyle={{ height: height / 3.5 }}
        gestureEnabled
        ref={actionSheetRef}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: fontFamily.poppinsSemiBold,
            marginLeft: 20,
            marginTop: 20,
          }}
        >
          Confirmation Code
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <InputBox
            mainContainer={{ ...styles.otpInput, marginLeft: 25 }}
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
            mainContainer={{ ...styles.otpInput, marginRight: 25 }}
            placeholderTextColor={'white'}
            maxLength={1}
            textAlign="center"
          />
        </View>

        <Button
          title="Confirm"
          buttonStyle={{ marginTop: 40, marginHorizontal: 20 }}
        />
      </ActionSheet>
      {/* </View> */}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  profile: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 16,
    marginTop: 12,
    fontFamily: fontFamily.poppinsSemiBold,
  },
  specialty: {
    fontSize: 14,
    color: colors.grey,
    fontFamily: fontFamily.poppinsMedium,
  },

  btnContainer: {
    flex: 1,
    flexDirection: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  floatingContainer: {
    position: 'absolute',
    backgroundColor: colors.primary,
    height: height * 0.12,
    marginHorizontal: 37,
    right: 0,
    left: 0,
    top: height / 2.95,
    zIndex: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  profileDetailsContainer: {
    backgroundColor: colors.accent,
    paddingHorizontal: 15,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    position: 'absolute',
    width: '100%',
    bottom: 0,
    height: height / 2,
  },
  datesContainer: {
    marginHorizontal: 5,
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 24,
    elevation: 10,
    marginTop: 10,
  },
  otpInput: {
    width: width * 0.18,
    borderRadius: 12,
    marginTop: height * 0.01,
    textAlign: 'center',
    // marginHorizontal: 20,
  },
});
