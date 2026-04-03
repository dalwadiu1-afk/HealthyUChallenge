import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Button, Header, Wrapper } from '../../../components';
import { colors, fontFamily } from '../../../constant';

export default function BookAnAppointment({ navigation }) {
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
  return (
    <Wrapper containerStyle={{ paddingHorizontal: 0 }}>
      <Header
        header="Book A Session"
        headerContainer={{ paddingHorizontal: 23 }}
      />

      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.4, paddingHorizontal: 15 }}>
          <Image
            source={{
              uri: 'https://www.newdirectionsforwomen.org/wp-content/uploads/2021/02/Woman-smiling-sunlight-768x510.jpg',
            }}
            style={styles.profile}
            resizeMode="cover"
          />
        </View>
        <View
          style={{
            flex: 0.7,
            backgroundColor: '#DBD9EC',
            paddingHorizontal: 15,
          }}
        >
          <Text style={styles.name}>Dr. Smith Sras</Text>
          <Text style={styles.specialty}>Dr. Smith Sras</Text>

          <View style={styles.menuContainer}>
            {menus.map((item, index) => {
              return (
                <View key={index} style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      height: 50,
                      width: 50,
                      backgroundColor: colors.secondary,
                      borderRadius: 100,
                    }}
                  />
                  <Text style={styles.name}>{item.counts}</Text>
                  <Text style={styles.specialty}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: 5 }}>
            <Text style={{ ...styles.name, fontSize: 20 }}>About Me</Text>
            <Text style={{ ...styles.specialty }} numberOfLines={3}>
              Dr. Ali Uzair is the top most cardiologist specialist in Crist
              Hospital in London, UK. He achived several awards for her
              wonderful contribution
              {/* <Pressable style={{ alignSelf: 'center' }} onPress={() => {}}> */}
              <Text style={{ color: 'blue' }}> Read More...</Text>
              {/* </Pressable> */}
            </Text>
          </View>

          <View style={styles.btnContainer}>
            <Button
              onPress={() => navigation.navigate('SessionConfirmation')}
              title="Book An Appointment"
              containerStyle={{ marginTop: 20 }}
            />
          </View>
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  profile: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
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
});
