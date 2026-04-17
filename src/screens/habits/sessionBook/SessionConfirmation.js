import React, { useState, useEffect } from 'react';
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
import { generateDaysFromToday } from '../../../utils/helper';

const { height } = Dimensions.get('window');
export default function SessionConfirmation({ navigation }) {
  const [dates, setDates] = useState([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [currentTimeSlotIndex, setCurrentTimeSlotIndex] = useState(0);

  // make date and timeslot object booked:{} , unbooked:{}

  useEffect(() => {
    const date = generateDaysFromToday();
    setDates(date);
  }, []);

  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor={'#ffdfff'} />

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
          <Text style={{ ...styles.name, fontSize: 20 }}>Appointment</Text>

          <View style={styles.datesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dates.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => setCurrentDateIndex(index)}
                    style={{
                      marginLeft: index == 0 ? 15 : 0,
                      marginRight: index == dates.length - 1 ? 15 : 0,
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

        <View style={{ marginTop: 25 }}>
          <Text style={{ ...styles.name, fontSize: 20 }}>Available Time</Text>

          <View
            style={{
              marginTop: 10,
              // justifyContent: 'center',
            }}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dates?.length ? (
                dates[currentDateIndex].timeSlots.map((item, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => setCurrentTimeSlotIndex(index)}
                      key={index}
                      style={{
                        ...styles.timeSlider,
                        backgroundColor:
                          index == currentTimeSlotIndex
                            ? colors.primary
                            : 'transparent',
                        elevation: index == currentTimeSlotIndex ? 5 : 0,
                        borderWidth: 1,
                      }}
                    >
                      <Text
                        style={{
                          ...styles.timeSlots,
                          color:
                            index == currentTimeSlotIndex
                              ? 'white'
                              : colors.primary,
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View />
              )}
            </ScrollView>
          </View>
        </View>

        <View style={styles.btnContainer}>
          <Button
            onPress={() => navigation.navigate('ConfirmationCode')}
            title="Confirm"
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
    fontFamily: fontFamily.poppinsSemiBold,
  },
  specialty: {
    fontSize: 14,
    color: colors.grey,
    fontFamily: fontFamily.poppinsMedium,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginTop: 10,
    paddingVertical: 13,
    backgroundColor: colors.secondary,
    borderRadius: 24,
    elevation: 10,
  },
  dateSlider: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 11,
  },
  timeSlots: {
    marginTop: 0,
    fontSize: 16,
    color: colors.primary,
    textAlignVertical: 'center',
    fontFamily: fontFamily.poppinsSemiBold,
  },
  timeSlider: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 11,
  },
});
