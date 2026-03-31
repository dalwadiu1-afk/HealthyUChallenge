import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

const { height } = Dimensions.get('window');
export default function SessionConfirmation() {
  const [currentDateIndex, setCurrentDateIndex] = useState(5);
  const menus = [
    {
      label: 'Patients',
      counts: '116+',
    },
    {
      label: 'Patients',
      counts: '116+',
    },
    {
      label: 'Patients',
      counts: '116+',
    },
    {
      label: 'Patients',
      counts: '116+',
    },
  ];

  const dates = [
    {
      label: 'Mon',
      date: '12',
      timeSlots: [
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
      ],
    },
    {
      label: 'Mon',
      date: '12',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
    {
      label: 'Mon',
      date: '12',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
    {
      label: 'Mon',
      date: '12',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
    {
      label: 'Mon',
      date: '12',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
    {
      label: 'Mon',
      date: '12',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
    {
      label: 'Mon',
      date: '12',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM'],
    },
  ];
  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor={'transparent'} />

      <View style={{ flex: 0.4 }}>
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
            fontFamily: fontFamily.montserratSemiBold,
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
          <Text style={{ ...styles.name, fontSize: 20 }}>Appointment</Text>

          <View style={styles.datesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dates.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => setCurrentDateIndex(index)}
                    style={{
                      backgroundColor:
                        currentDateIndex == index
                          ? colors.primary
                          : 'transparent',

                      elevation: currentDateIndex == index ? 5 : 0,
                      ...styles.dateSlider,
                    }}
                    key={index}
                  >
                    <Text
                      style={{
                        ...styles.name,
                        fontSize: 16,
                        color:
                          currentDateIndex == index ? 'white' : colors.black,
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        ...styles.name,
                        fontSize: 14,
                        marginVertical: 8,
                        color:
                          currentDateIndex == index ? 'white' : colors.black,
                      }}
                    >
                      {item.date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={{ marginTop: 5 }}>
          <Text style={{ ...styles.name, fontSize: 20 }}>Available Time</Text>
          {/* <View
            style={{
              marginTop: 10,
              height: 1,
              backgroundColor: colors.grey,
            }}
              
          /> */}
          <ScrollView>
            <View
              contentContainerStyle={{
                flexDirection: 'row',
                marginTop: 10,
                // justifyContent: 'center',
              }}
            >
              {dates[currentDateIndex].timeSlots.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      // marginTop: 10,
                      paddingHorizontal: 20,
                      backgroundColor: 'red',
                      marginHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.name,
                        fontSize: 16,
                        color: colors.primary,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.btnContainer}>
          <Button
            title="Book An Appointment"
            containerStyle={{ marginTop: 20 }}
          />
        </View>
      </View>
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
    fontFamily: fontFamily.montserratSemiBold,
  },
  specialty: {
    fontSize: 14,
    color: colors.grey,
    fontFamily: fontFamily.montserratMedium,
  },
  menuContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 15,
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
    top: height / 3,
    zIndex: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  profileDetailsContainer: {
    flex: 0.6,
    backgroundColor: '#DBD9EC',
    paddingHorizontal: 15,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginTop: 10,
    paddingVertical: 13,
    backgroundColor: '#9795aa',
    borderRadius: 24,
    elevation: 10,
  },
  dateSlider: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 11,
  },
});
