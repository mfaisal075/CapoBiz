import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import backgroundColors from '../Colors';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';

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

const AccountsDetails = ({navigation, route}: any) => {
  const {id} = route.params;
  const {token} = useUser();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);

  // Get Profile Details
  const fetchProfileDetails = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/expenseprofileshow?id=${id}&_token=${token}`,
      );

      setProfile(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Fixed Account');
            }}>
            <Icon
              name="chevron-left"
              size={28}
              color={backgroundColors.light}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Details</Text>
        </View>
      </View>

      {/* Details */}
      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          <Image
            source={require('../../assets/man.png')}
            style={styles.avatar}
          />
          <Text style={styles.custName}>
            {profile?.expenseprofile.fixprf_title}
          </Text>
        </View>

        <View style={styles.innerDetails}>
          <View style={styles.innerHeader}>
            <Text style={styles.headerText}>Profile Details</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.label}>Business Account</Text>
            <Text style={styles.value}>
              {profile?.expenseprofile.fixprf_business_account_name ?? '--'}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>
              {profile?.expenseprofile.fixprf_title ?? '--'}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>
              {profile?.expenseprofile.fixprf_mobile ?? '--'}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Area</Text>
            <Text style={styles.value}>{profile?.area ?? '--'}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Tehsil</Text>
            <Text style={styles.value}>
              {profile?.expenseprofile.fixprf_tehsil ?? '--'}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.label}>District</Text>
            <Text style={styles.value}>
              {profile?.expenseprofile.fixprf_district ?? '--'}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{profile?.expenseprofile.fixprf_business_address ?? '--'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountsDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: backgroundColors.primary,
  },
  headerCenter: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Details container
  detailsContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  avatarBox: {
    marginVertical: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: 125,
    width: 125,
  },
  custName: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    color: backgroundColors.primary,
  },

  // Inner Details
  innerDetails: {
    backgroundColor: backgroundColors.light,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  innerHeader: {
    width: '100%',
    height: 50,
    borderBottomColor: backgroundColors.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: backgroundColors.dark,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  detailsView: {
    flex: 1,
  },
  detailsRow: {
    alignItems: 'baseline',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: backgroundColors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.primary,
  },
  value: {
    fontSize: 16,
    color: backgroundColors.dark,
  },
});
