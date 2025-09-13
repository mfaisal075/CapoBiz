import React, {useState} from 'react';
import Modal from 'react-native-modal';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDrawer} from './DrawerContext';
import {useNavigation} from '@react-navigation/native';
import {useUser} from './CTX/UserContext';

const {width, height} = Dimensions.get('window');

const icons: {[key: string]: any} = {
  Dashboard: require('../assets/dashboard.png'),
  'Point of Sale': require('../assets/pos.png'),
  People: require('../assets/customer.png'),
  Products: require('../assets/product.png'),
  Stock: require('../assets/stocks.png'),
  Purchase: require('../assets/purchase.png'),
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
  'Point of Sale': [],
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
  Trading: ['Trade', 'Trading List'],
  Expenses: ['Expense Categories', 'Manage Expenses'],
  Accounts: [
    'Customer Account',
    'Supplier Account',
    'Transporter Account',
    'Labour Account',
    'Employee Account',
    'Fixed Accounts',
  ],
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
    'Trade',
    'General Ledger',
    'Day Book',
    'Stock Movement',
  ],
  Attendance: ['All Employees Attendance', 'All Employees Attendance List'],
  'System Users': ['Users', 'Roles'],
  Configuration: [
    'Customer Type',
    'Areas',
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
  const {userName, userEmail} = useUser();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedReportSubmenu, setExpandedReportSubmenu] = useState<
    string | null
  >(null);

  const handleMainPress = (key: string) => {
    if (menuData[key].length === 0) {
      closeDrawer();
      navigation.navigate(key as never);
    } else {
      setExpandedItem(prev => (prev === key ? null : key));
      setExpandedReportSubmenu(null);
    }
  };

  const handleSubPress = (screen: string) => {
    closeDrawer();
    navigation.navigate(screen as never);
  };

  const handleReportSubmenuPress = (sub: string) => {
    setExpandedReportSubmenu(prev => (prev === sub ? null : sub));
  };

  const renderMenuItem = (mainItem: string, index: number) => {
    const isExpanded = expandedItem === mainItem;
    const hasSubmenu = menuData[mainItem].length > 0;

    return (
      <View key={index} style={styles.menuItemContainer}>
        <TouchableOpacity
          style={[
            styles.menuRow,
            isExpanded && styles.menuRowExpanded
          ]}
          onPress={() => handleMainPress(mainItem)}
          activeOpacity={0.7}>
          <View style={styles.menuItemContent}>
            <View style={[
              styles.iconContainer,
              isExpanded && styles.iconContainerExpanded
            ]}>
              {icons[mainItem] && (
                <Image 
                  source={icons[mainItem]} 
                  style={[
                    styles.icon,
                    isExpanded && styles.iconExpanded
                  ]} 
                />
              )}
            </View>
            <Text style={[
              styles.menuItemText,
              isExpanded && styles.menuItemTextExpanded
            ]}>
              {mainItem}
            </Text>
            {hasSubmenu && (
              <View style={styles.expandIcon}>
                <Text style={[
                  styles.expandIconText,
                  isExpanded && styles.expandIconTextExpanded
                ]}>
                  {isExpanded ? '−' : '+'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Submenu Items */}
        {isExpanded && mainItem !== 'Reports' && (
          <View style={styles.submenuContainer}>
            {menuData[mainItem].map((subItem, subIndex) => (
              <TouchableOpacity
                key={subIndex}
                style={styles.submenuItem}
                onPress={() => handleSubPress(subItem)}
                activeOpacity={0.7}>
                <View style={styles.submenuItemContent}>
                  <View style={styles.submenuDot} />
                  <Text style={styles.submenuText}>{subItem}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Special Reports Submenu */}
        {mainItem === 'Reports' && isExpanded && (
          <View style={styles.submenuContainer}>
            {['People', 'Products', 'Accounts', 'Sales Reports'].map((sub, idx) => (
              <View key={idx}>
                <TouchableOpacity
                  style={styles.submenuItem}
                  onPress={() => handleReportSubmenuPress(sub)}
                  activeOpacity={0.7}>
                  <View style={styles.submenuItemContent}>
                    <View style={styles.submenuDot} />
                    <Text style={styles.submenuText}>{sub}</Text>
                    <View style={styles.expandIcon}>
                      <Text style={styles.miniExpandIcon}>
                        {expandedReportSubmenu === sub ? '−' : '+'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {expandedReportSubmenu === sub && (
                  <View style={styles.subSubmenuContainer}>
                    {reportSubScreens[sub].map((screen, sIdx) => (
                      <TouchableOpacity
                        key={sIdx}
                        style={styles.subSubmenuItem}
                        onPress={() => handleSubPress(screen)}
                        activeOpacity={0.7}>
                        <View style={styles.subSubmenuContent}>
                          <View style={styles.subSubmenuDot} />
                          <Text style={styles.subSubmenuText}>{screen}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* Direct Report Items */}
            {[
              'Cheque List',
              'Profit Loss Report',
              'Expense Report',
              'Business Capital',
              'Customer Balances',
              'Supplier Balances',
              'Cash Register',
              'Trade',
              'General Ledger',
              'Day Book',
              'Stock Movement',
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.submenuItem}
                onPress={() => handleSubPress(item)}
                activeOpacity={0.7}>
                <View style={styles.submenuItemContent}>
                  <View style={styles.submenuDot} />
                  <Text style={styles.submenuText}>{item}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      isVisible={menuVisible}
      onBackdropPress={closeDrawer}
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      animationInTiming={300}
      animationOutTiming={250}
      backdropOpacity={0.5}
      style={styles.menuModal}>
      <View style={styles.drawerContainer}>
        {/* Header Section */}
        <LinearGradient
          colors={['#144272', '#1e5799', '#205295']}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.userAvatarContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.userAvatar}>
                <Image
                  style={styles.userAvatarImage}
                  source={require('../assets/user.png')}
                />
              </LinearGradient>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName || 'User Name'}</Text>
              <Text style={styles.userEmail}>{userEmail || 'user@example.com'}</Text>
            </View>
          </View>
          <View style={styles.headerDivider} />
        </LinearGradient>

        {/* Menu Content */}
        <ScrollView 
          style={styles.menuContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.menuList}>
            {Object.keys(menuData).map((mainItem, index) => 
              renderMenuItem(mainItem, index)
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeDrawer}
            activeOpacity={0.7}>
            <LinearGradient
              colors={['#f8f9fa', '#e9ecef']}
              style={styles.closeButtonGradient}>
              <Text style={styles.closeButtonText}>Close Menu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menuModal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  drawerContainer: {
    width: width * 0.75,
    height: height,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 5, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  
  // Header Styles
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    marginRight: 15,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userAvatarImage: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 15,
  },

  // Menu Content
  menuContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  menuList: {
    paddingVertical: 10,
  },

  // Menu Items
  menuItemContainer: {
    marginBottom: 2,
  },
  menuRow: {
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuRowExpanded: {
    backgroundColor: '#144272',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerExpanded: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: '#144272',
  },
  iconExpanded: {
    tintColor: 'white',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  menuItemTextExpanded: {
    color: 'white',
    fontWeight: 'bold',
  },
  expandIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIconText: {
    fontSize: 16,
    color: '#144272',
    fontWeight: 'bold',
  },
  expandIconTextExpanded: {
    color: '#144272',
  },

  // Submenu Styles
  submenuContainer: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 12,
    paddingVertical: 8,
  },
  submenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  submenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submenuDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#144272',
    marginRight: 12,
    marginLeft: 25,
  },
  submenuText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  miniExpandIcon: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: 'bold',
  },

  // Sub-submenu Styles
  subSubmenuContainer: {
    paddingLeft: 20,
    marginTop: 5,
  },
  subSubmenuItem: {
    paddingVertical: 6,
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
    backgroundColor: '#6c757d',
    marginRight: 10,
    marginLeft: 35,
  },
  subSubmenuText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '400',
  },

  // Footer
  footer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  closeButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DrawerModal;