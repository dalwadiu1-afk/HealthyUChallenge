import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';

import { colors, fontFamily } from '../../constant/index';
import { Header, Wrapper } from '../../components';
import { docJen, docJes, docsheri } from '../../assets/images';

export default function Social() {
  const INSTAGRAM_URL = 'https://www.instagram.com/montclair_dietitian/';
  const WEBSITE_URL =
    'https://dineoncampus.com/montclair/wellness--dietitian-services';
  const EMAIL = 'NourishMontclairDietitian@cpgplc.onmicrosoft.com';

  const openLink = async url => {
    try {
      const supported = await Linking.canOpenURL(url);
      console.log('supported :>> ', supported);
      if (!supported) {
        Alert.alert(
          'Unable to Open',
          'No application found to handle this link.',
        );
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log('Open URL Error:', error);
      Alert.alert('Error', 'Something went wrong while opening the link.');
    }
  };

  const openEmail = async (email, subject = '') => {
    try {
      const url = `${email}?subject=${encodeURIComponent(subject)}`;

      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          'No Email App',
          'No email application is installed on this device.',
        );
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  const { height } = Dimensions.get('window');

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark }}>
      <Header header="Info" headerContainer={{ paddingHorizontal: 23 }} />
      <Wrapper orbsRight safeAreaPops={{ edges: ['bottom'] }}>
        <View style={styles.container}>
          {/* Hero Card */}
          <View style={styles.profileCard}>
            <Image source={docJen} style={styles.avatar} />

            <Text style={styles.name}>Jennifer Bostedo, RDN </Text>

            <Text style={styles.role}>
              Director of Dining and Wellness | Freeman
            </Text>

            {/* <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openEmail('mailto:jbostedo@gourmetdiningllc.com')}
            > */}
            <Text selectable style={styles.contactText}>
              ✉️ jbostedo@gourmetdiningllc.com
            </Text>
            {/* </TouchableOpacity> */}

            {/* <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openEmail('tel:+19736554414')}
          >
            <Text style={styles.contactText}>📞 (973) 655-4414</Text>
          </TouchableOpacity> */}
          </View>

          <View style={styles.profileCard}>
            <Image source={docsheri} style={styles.avatar} />

            <Text style={styles.name}>Sheridan Van Biert, MS, RDN</Text>

            <Text style={styles.role}>Campus Dietitian | Sam's</Text>

            {/* <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openEmail('mailto:jbostedo@gourmetdiningllc.com')}
            > */}
            <Text selectable style={styles.contactText}>
              ✉️ swheeler@gourmetdiningllc.com
            </Text>
            {/* </TouchableOpacity> */}

            {/* <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openEmail('tel:+19736554414')}
          >
            <Text style={styles.contactText}>📞 (973) 655-4414</Text>
          </TouchableOpacity> */}
          </View>

          <View style={styles.profileCard}>
            <Image source={docJes} style={styles.avatar} />

            <Text style={styles.name}>Jessica Carr, MS, RDN</Text>

            <Text style={styles.role}>Senior Campus Dietitian | Freeman</Text>
            {/* 
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openEmail('mailto:jcarr@gourmetdiningllc.com')}
            > */}
            <Text selectable style={styles.contactText}>
              ✉️ jcarr@gourmetdiningllc.com
            </Text>
            {/* </TouchableOpacity> */}

            {/* <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openLink('tel:+19736554414')}
          >
            <Text style={styles.contactText}>📞 (973) 655-4414</Text>
          </TouchableOpacity> */}
          </View>

          {/* Quick Actions */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => openLink(INSTAGRAM_URL)}
            >
              <Text style={styles.actionText}>📸 Follow on Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() =>
                openEmail(`mailto:${EMAIL}`, 'Nutrition Consultation Request')
              }
            >
              <Text style={styles.actionText}>📧 Book An Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => openLink(WEBSITE_URL)}
            >
              <Text style={styles.actionText}>🌐 Visit Website</Text>
            </TouchableOpacity>
          </View>

          {/* Meet The Team */}
          {/* <View style={styles.teamCard}>
            <Text style={styles.teamTitle}>👩‍⚕️ Meet the Dietitian Team</Text>

            <Text style={styles.teamDescription}>
              Learn more about our registered dietitians, wellness educators,
              and nutrition professionals.
            </Text>

            <TouchableOpacity
              style={styles.teamButton}
              activeOpacity={0.8}
              onPress={() => openLink(WEBSITE_URL)}
            >
              <Text style={styles.teamButtonText}>View Team</Text>
            </TouchableOpacity>
          </View> */}
          {/* Services */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Services</Text>

            <View style={styles.servicesWrap}>
              <View style={styles.serviceChip}>
                <Text style={styles.serviceText}>🥗 Dietitian Services</Text>
              </View>

              <View style={styles.serviceChip}>
                <Text style={styles.serviceText}>
                  🎓 Student Success & Wellness
                </Text>
              </View>

              <View style={styles.serviceChip}>
                <Text style={styles.serviceText}>🍎 Nutrition Counseling</Text>
              </View>

              <View style={styles.serviceChip}>
                <Text style={styles.serviceText}>🎯 Goal Setting</Text>
              </View>

              <View style={styles.serviceChip}>
                <Text style={styles.serviceText}>🏫 Campus Dining Support</Text>
              </View>
            </View>
          </View>

          {/* Why Connect */}
          <View style={{ ...styles.card, paddingBottom: height / 13 }}>
            <Text style={styles.sectionTitle}>Why Connect With Us?</Text>

            <Text style={styles.bullet}>
              ✓ Evidence-Based Nutrition Guidance
            </Text>

            <Text style={styles.bullet}>✓ Personalized Wellness Support</Text>

            <Text style={styles.bullet}>✓ Trusted Health Resources</Text>

            <Text style={styles.bullet}>✓ Healthy Habit Building</Text>
          </View>
        </View>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingBottom: 30,
  },
  contactText: {
    color: colors.secondary,
    fontSize: 13,
    marginTop: 8,
    fontFamily: fontFamily.montserratSemiBold,
    textAlign: 'center',
  },

  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: colors.secondary,
  },

  name: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fontFamily.montserratBold,
    textAlign: 'center',
  },

  role: {
    color: colors.secondary,
    fontSize: 13,
    marginTop: 4,
    fontFamily: fontFamily.montserratSemiBold,
    textAlign: 'center',
  },

  bio: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    fontFamily: fontFamily.montserratRegular,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 14,
    fontFamily: fontFamily.montserratBold,
  },

  actionButton: {
    backgroundColor: 'rgba(143,175,120,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },

  actionText: {
    color: colors.secondary,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },

  teamCard: {
    backgroundColor: 'rgba(143,175,120,0.12)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(143,175,120,0.25)',
  },

  teamTitle: {
    color: colors.white,
    fontSize: 17,
    marginBottom: 8,
    fontFamily: fontFamily.montserratBold,
  },

  teamDescription: {
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: fontFamily.montserratRegular,
  },

  teamButton: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  teamButtonText: {
    color: colors.dark,
    fontSize: 14,
    fontFamily: fontFamily.montserratBold,
  },

  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  serviceChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },

  serviceText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.montserratSemiBold,
  },

  bullet: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 10,
    fontFamily: fontFamily.montserratMedium,
  },
});
