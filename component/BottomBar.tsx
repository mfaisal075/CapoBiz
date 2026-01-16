import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

// --- Theme Constants (Green Palette from LoginScreen) ---
const COLORS = {
  primary: '#2A652B',
  primaryDark: '#2A652B',
  white: '#FFFFFF',
  textLight: '#9CA3AF',
};

const BottomBar = () => {
  const BottomNavItem = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Icon name={icon} size={24} color={COLORS.textLight} />
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.bottomNav}>
      <BottomNavItem
        icon="call-outline"
        label="Contact Us"
        onPress={() => openLink('https://capobiz.com/contact')}
      />
      <BottomNavItem
        icon="information-circle-outline"
        label="About Us"
        onPress={() => openLink('https://capobiz.com/about')}
      />
      <BottomNavItem
        icon="headset-outline"
        label="Support"
        onPress={() => openLink('https://capobiz.com/contact')}
      />
      <BottomNavItem
        icon="help-circle-outline" // Using help-circle for FAQs
        label="FAQs"
        onPress={() => openLink('https://capobiz.com/faqs')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Reduced padding to fit 4 items comfortably
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
  },
});

export default BottomBar;
