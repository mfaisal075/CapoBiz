import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import BottomBar from '../BottomBar';

// --- THEME ---
const THEME = {
  primary: '#2A652B',
  primaryLight: '#E8F5E9',
  primarySoft: 'rgba(42, 101, 43, 0.1)',
  gradientStart: '#143D15',
  gradientEnd: '#2A652B',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textDark: '#1F2937',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

interface ProfileDetails {
  expenseprofile: {
    id: number;
    fixprf_area_id: number;
    fixprf_business_account_name: string;
    fixprf_title: string;
    fixprf_business_address: string;
    fixprf_tehsil: string;
    fixprf_district: string;
    fixprf_mobile: string;
    fixprf_status: string;
  };
  area: string;
}

// --- HELPER COMPONENT: Detail Row ---
const DetailRow = ({
  label,
  value,
  icon,
  isLast,
}: {
  label: string;
  value: string;
  icon: string;
  isLast?: boolean;
}) => (
  <View style={[styles.detailRow, isLast && {borderBottomWidth: 0}]}>
    <View style={styles.iconBox}>
      <Icon name={icon} size={20} color={THEME.primary} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '--'}</Text>
    </View>
  </View>
);

const AccountsDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Get Profile Details
  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/expenseprofileshow?id=${id}&_token=${token}`,
      );

      setProfile(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();

    const backKey = () => {
      navigation.navigate('Fixed Account');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backKey,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.gradientStart}
        translucent={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}>
        {/* --- HEADER BACKGROUND --- */}
        <LinearGradient
          colors={[THEME.gradientStart, THEME.gradientEnd]}
          style={styles.headerContainer}>
          {/* Nav Bar */}
          <SafeAreaView style={styles.navBar}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Fixed Account')}
              style={styles.navBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Fixed Account Details</Text>
            <View style={{width: 40}} />
          </SafeAreaView>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require('../../assets/man.png')}
                style={styles.avatar}
              />
            </View>

            <Text style={styles.profileName}>
              {profile?.expenseprofile.fixprf_business_account_name ||
                'Loading...'}
            </Text>

            {/* Badge Row */}
            <View style={styles.badgeRow}>
              <View style={styles.capsuleBadge}>
                <Icon
                  name="card-account-details-outline"
                  size={14}
                  color={THEME.white}
                />
                <Text style={styles.capsuleText}>
                  {profile?.expenseprofile.fixprf_title || 'Title'}
                </Text>
              </View>
              <View style={styles.capsuleBadge}>
                <Icon name="map-marker-outline" size={14} color={THEME.white} />
                <Text style={styles.capsuleText}>
                  {profile?.area || 'General'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* --- CONTENT CARDS --- */}
        <View style={styles.contentContainer}>
          {/* Profile Details */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Profile Details</Text>
            </View>
            <DetailRow
              icon="briefcase-account"
              label="Business Account"
              value={profile?.expenseprofile.fixprf_business_account_name!}
            />
            <DetailRow
              icon="card-text-outline"
              label="Title"
              value={profile?.expenseprofile.fixprf_title!}
            />
            <DetailRow
              icon="phone"
              label="Contact"
              value={profile?.expenseprofile.fixprf_mobile!}
            />
            <DetailRow icon="map-marker" label="Area" value={profile?.area!} />
            <DetailRow
              icon="city-variant-outline"
              label="Tehsil"
              value={profile?.expenseprofile.fixprf_tehsil!}
            />
            <DetailRow
              icon="map-marker-radius"
              label="District"
              value={profile?.expenseprofile.fixprf_district!}
            />
            <DetailRow
              icon="map-marker"
              label="Address"
              value={profile?.expenseprofile.fixprf_business_address!}
              isLast
            />
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <LottieView
              source={require('../../assets/Loading-Dots.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        )}
      </ScrollView>
      <BottomBar />
    </View>
  );
};

export default AccountsDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // --- HEADER & PROFILE ---
  headerContainer: {
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 30 : 0,
    marginBottom: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  avatarWrapper: {
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: THEME.white,
    backgroundColor: THEME.white,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  capsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    gap: 4,
  },
  capsuleText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // --- CONTENT SECTION ---
  contentContainer: {
    marginTop: -24, // Pulls content up to overlap header
    paddingHorizontal: 12,
    gap: 10,
  },
  sectionCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: THEME.textGray,
    marginBottom: 0,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: THEME.textDark,
    fontWeight: '600',
  },

  // --- LOADING OVERLAY ---
  loadingOverlay: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lottie: {
    width: 100,
    height: 100,
  },
});
