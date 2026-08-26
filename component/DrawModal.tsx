import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDrawer} from './DrawerContext';
import {useNavigation} from '@react-navigation/native';
import {useUser} from './CTX/UserContext';
import backgroundColors from './Colors';
import {CommonActions} from '@react-navigation/native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.82;

// Support both Images and Vector Icons
const icons: {[key: string]: any} = {
  Dashboard: require('../assets/dashboard.png'),
  'Point of Sale': require('../assets/pos.png'),
  People: require('../assets/customer.png'),
  Products: {type: 'ionicon', name: 'cube-outline'}, // Updated to Vector Icon
  Stock: require('../assets/stocks.png'),
  Purchase: {type: 'ionicon', name: 'cart-outline'}, // Updated to Vector Icon
  Sales: require('../assets/sales.png'),
  Trading: require('../assets/trading.png'),
  Expenses: require('../assets/expenses.png'),
  Accounts: require('../assets/accounts.png'),
  Reports: require('../assets/report.png'),
  Attendance: require('../assets/attendance.png'),
  'System Users': require('../assets/user.png'),
  Configuration: require('../assets/configuration.png'),
};

const menuData: {[key: string]: string[]} = {
  Dashboard: [],
  People: [
    'Customer',
    'Suppliers',
    'Employees',
    'Transporter',
    'Labour',
    'Order Booker',
    'Fixed Account',
  ],
  Products: ['Products', 'Category', 'UOMs', 'Deleted Products'],
  Stock: ['Current Stock', 'Reorder Products', 'Expire Products'],
  Purchase: [
    'Purchase Order',
    'Purchase Order List',
    'Purchase /Add Stock',
    'Purchase List',
    'Purchase Return',
    'Purchase Return List',
  ],
  Sales: [
    'Sale Order',
    'Order List',
    'Point of Sale',
    'Invoice List',
    'Dispatch List',
    'Sale Return',
    'Sale Return List',
    'Cash Close',
  ],
  Expenses: ['Expense Categories', 'Manage Expenses'],
  Accounts: [
    'Customer Account',
    'Supplier Account',
    'Transporter Account',
    'Labour Account',
    'Employee Account',
    'Fixed Accounts',
  ],
  Attendance: ['All Employees Attendance', 'All Employees Attendance List'],
  'System Users': ['Users', 'Roles'],
  Reports: [
    'People',
    'Products',
    'Accounts',
    'Sales Reports',
    'Cheque List',
    'Profit Loss Report',
    'Expense Report',
    'Business Capital',
    'Customer Balances',
    'Supplier Balances',
    'Cash Register',
    'Trading Report',
    'General Ledger',
    'Day Book',
    'Stock Movement',
  ],
  Configuration: [
    'Customer Type',
    'Areas',
    'Print Barcode',
    'Biometric',
    'Password Reset',
    'Business Variables',
    'Sale Invoice',
  ],
};

const reportSubScreens: Record<string, string[]> = {
  People: [
    'Customer List',
    'Area Wise Customer',
    'Type Wise Customer',
    'Inactive Customer',
    'Supplier List',
    'Employee List',
  ],
  Products: [
    'List Of Items',
    'Below Reorder Products',
    'Expire Product',
    'Purchase/Return Stock',
    'Purchase Order Stock',
  ],
  Accounts: [
    'Customer Accounts',
    'Supplier Accounts',
    'Transporter Accounts',
    'Labour Accounts',
    'Employee Accounts',
    'Fix Accounts',
  ],
  'Sales Reports': [
    'All User Sales',
    'Single User Sales',
    'Sale Return Report',
    'Sale & Sale Return Report',
    'Sale Order Reports',
    'Daily Sales Reports',
    'Single User Daily Sales',
  ],
};

const DrawerModal = () => {
  const {menuVisible, closeDrawer} = useDrawer();
  const navigation = useNavigation();
  const {
    userName,
    userEmail,
    setToken,
    setUserName,
    setUserEmail,
    setBussName,
    setBussAddress,
    setBussContact,
  } = useUser();

  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedReportSubmenu, setExpandedReportSubmenu] = useState<
    string | null
  >(null);
  const [isVisible, setIsVisible] = useState(menuVisible);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    if (menuVisible) {
      setIsVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [menuVisible]);
  const handleMainPress = (key: string) => {
    if (menuData[key].length === 0) {
      handleClose(() => navigation.navigate(key as never));
    } else {
      setExpandedItem(prev => (prev === key ? null : key));
      setExpandedReportSubmenu(null);
    }
  };

  const handleSubPress = (screen: string) => {
    handleClose(() => navigation.navigate(screen as never));
  };

  const handleReportSubmenuPress = (sub: string) => {
    setExpandedReportSubmenu(prev => (prev === sub ? null : sub));
  };

  const handleClose = (callback?: () => void) => {
    closeDrawer();
    if (callback) {
      setTimeout(callback, 210); // Wait for animation to finish
    }
  };

  const handleLogout = () => {
    handleClose(() => {
      // Clear User Context
      setToken(null);
      setUserName('');
      setUserEmail('');
      setBussName('');
      setBussAddress('');
      setBussContact('');

      // Reset Navigation to Login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );
    });
  };

  if (!isVisible) return null;

  return (
    <View style={styles.modalWrapper}>
      <View style={styles.overlay}>
        {/* Transparent Backdrop */}
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sidebar Content */}
        <Animated.View
          style={[
            styles.menuContainer,
            {transform: [{translateX: slideAnim}]},
          ]}>
          {/* --- Header Section --- */}
          <View style={styles.header}>
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Close Button - Top Right */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => handleClose()}
              activeOpacity={0.7}>
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Profile Info */}
            <View style={styles.profileContainer}>
              <View style={styles.avatarWrapper}>
                {/* Changed to Icon for User Avatar */}
                <Icon
                  name="person"
                  size={36}
                  color={backgroundColors.primary}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {userName || 'User Name'}
                </Text>
                <Text style={styles.userId}>
                  {userEmail || 'user@example.com'}
                </Text>
              </View>
            </View>
          </View>

          {/* --- Menu Items --- */}
          <ScrollView
            style={styles.menuScrollView}
            contentContainerStyle={{paddingTop: 10, paddingBottom: 20}}
            showsVerticalScrollIndicator={false}>
            {Object.keys(menuData).map((mainItem, index) => {
              const isExpanded = expandedItem === mainItem;
              return (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.6}
                    onPress={() => handleMainPress(mainItem)}>
                    <View style={styles.menuItemLeft}>
                      {icons[mainItem] ? (
                        icons[mainItem].type === 'ionicon' ? (
                          <View
                            style={[
                              styles.menuIcon,
                              {justifyContent: 'center', alignItems: 'center'},
                            ]}>
                            <Icon
                              name={icons[mainItem].name}
                              size={22}
                              // Always Primary Color
                              color={backgroundColors.primary}
                            />
                          </View>
                        ) : (
                          <Image
                            source={icons[mainItem]}
                            style={[
                              styles.menuIcon,
                              // Always Primary Color
                              {tintColor: backgroundColors.primary},
                            ]}
                          />
                        )
                      ) : null}
                      <Text
                        style={[
                          styles.menuText,
                          isExpanded && {
                            color: backgroundColors.primary,
                            fontWeight: 'bold',
                          },
                        ]}>
                        {mainItem}
                      </Text>
                    </View>
                    {menuData[mainItem].length > 0 && (
                      <Text
                        style={[
                          styles.chevron,
                          isExpanded && {color: backgroundColors.primary},
                        ]}>
                        {isExpanded ? '−' : '+'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.submenuContainer}>
                      {mainItem === 'Reports' ? (
                        // Reports Logic
                        <>
                          {[
                            'People',
                            'Products',
                            'Accounts',
                            'Sales Reports',
                          ].map((sub, idx) => (
                            <View key={idx}>
                              <TouchableOpacity
                                style={styles.submenuItem}
                                onPress={() => handleReportSubmenuPress(sub)}>
                                <View style={styles.submenuItemContent}>
                                  <View style={styles.submenuDot} />
                                  <Text style={styles.submenuText}>{sub}</Text>
                                  <Text style={styles.miniChevron}>
                                    {expandedReportSubmenu === sub ? '−' : '+'}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                              {expandedReportSubmenu === sub && (
                                <View style={styles.subSubmenuContainer}>
                                  {reportSubScreens[sub].map((screen, sIdx) => (
                                    <TouchableOpacity
                                      key={sIdx}
                                      style={styles.subSubmenuItem}
                                      onPress={() => handleSubPress(screen)}>
                                      <View style={styles.subSubmenuContent}>
                                        <View style={styles.subSubmenuDot} />
                                        <Text style={styles.subSubmenuText}>
                                          {screen}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>
                          ))}
                          {/* Direct Reports */}
                          {[
                            'Cheque List',
                            'Profit Loss Report',
                            'Expense Report',
                            'Business Capital',
                            'Customer Balances',
                            'Supplier Balances',
                            'Cash Register',
                            'Trading Report',
                            'General Ledger',
                            'Day Book',
                            'Stock Movement',
                          ].map((item, i) => (
                            <TouchableOpacity
                              key={i}
                              style={styles.submenuItem}
                              onPress={() => handleSubPress(item)}>
                              <View style={styles.submenuItemContent}>
                                <View style={styles.submenuDot} />
                                <Text style={styles.submenuText}>{item}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </>
                      ) : (
                        // Standard Submenu
                        menuData[mainItem].map((subItem, subIndex) => (
                          <TouchableOpacity
                            key={subIndex}
                            style={styles.submenuItem}
                            onPress={() => handleSubPress(subItem)}>
                            <View style={styles.submenuItemContent}>
                              <View style={styles.submenuDot} />
                              <Text style={styles.submenuText}>{subItem}</Text>
                            </View>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* --- Footer Actions --- */}
          <View style={styles.footerContainer}>
            {/* Logout Button */}
            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => handleLogout()}>
              <Icon
                name="log-out-outline"
                size={22}
                color={backgroundColors.danger}
                style={{marginRight: 10}}
              />
              <Text
                style={[styles.footerText, {color: backgroundColors.danger}]}>
                Logout
              </Text>
            </TouchableOpacity>

            {/* Version */}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 99,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },

  // --- Header Styles ---
  header: {
    backgroundColor: backgroundColors.primary,
    height: SCREEN_HEIGHT * 0.15, // Slightly taller for circles
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 15,
    padding: 5,
    zIndex: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'white',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },

  // --- Menu List ---
  menuScrollView: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },

  // --- Submenu ---
  submenuContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 5,
  },
  submenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  submenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submenuDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: backgroundColors.primary,
    marginRight: 12,
  },
  submenuText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  miniChevron: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // --- Sub-Submenu ---
  subSubmenuContainer: {
    paddingLeft: 15,
    marginTop: 2,
  },
  subSubmenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  subSubmenuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subSubmenuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginRight: 10,
    marginLeft: 20,
  },
  subSubmenuText: {
    fontSize: 13,
    color: '#6B7280',
  },

  // --- Footer ---
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 10, // Small text for version
    color: '#9CA3AF',
  },
});

export default DrawerModal;
