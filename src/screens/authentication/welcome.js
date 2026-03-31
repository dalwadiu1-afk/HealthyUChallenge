import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Button, Hyperlink, SvgImg, Wrapper } from '../../components/index';
import { fontFamily } from '../../constant';
import { appIcon } from '../../assets/images/index';
const { height, width } = Dimensions.get('window');
export default function Welcome({ navigation }) {
  return (
    <Wrapper>
      <View style={{ flex: 1 }} />
      <View style={{ flex: 1 }}>
        <SvgImg
          style={styles.container}
          iconName={appIcon}
          height={height * 0.08}
          width={width * 0.18}
        />
        <View style={{ marginTop: 31 }}>
          <>
            <Text style={styles.welcomeText}>
              Start your {`\n`}
              <Text style={{ color: '#F3F1BB' }}>Fitness</Text> Journey
            </Text>
          </>

          <View style={{ marginTop: 49 }}>
            <Button
              title="Login"
              onPress={() => navigation.navigate('login')}
            />
            <Button
              title="Register"
              buttonStyle={{ backgroundColor: 'white', marginTop: 16 }}
              textStyle={{ color: 'black' }}
              onPress={() => navigation.navigate('signup')}
            />
          </View>

          <Hyperlink
            title="Continue as a guest"
            linkStyle={styles.guestLink}
            textStyle={{ color: 'white' }}
            // onPress={() => Linking.openURL('https://example.com')}
          />
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignSelf: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 33,
    textAlign: 'center',
    fontFamily: fontFamily.montserratMedium,
  },
  guestLink: {
    marginTop: 16,
    alignSelf: 'center',
  },
});
