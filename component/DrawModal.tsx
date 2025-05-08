import React, {useState} from 'react';
import Modal from 'react-native-modal';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import {useDrawer} from './DrawerContext';
import {useNavigation} from '@react-navigation/native';

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
  'Point of Sale':[],

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
    'Print Barcode',
    'Password Reset',
    'Business Variables',
    'Access Control',
    'Sale Invoice',
  ],
};

const DrawerModal = () => {
  
  const {menuVisible, closeDrawer} = useDrawer();
  const navigation = useNavigation();
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

  return (
    <Modal
      isVisible={menuVisible}
      onBackdropPress={closeDrawer}
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      style={styles.menuModal}>
      <ScrollView style={styles.menuContent}>
        <View
          style={{
            backgroundColor: '#144272',
            height: 120,
          }}>
          <Image
            style={{
              width: 30,
              height: 30,
              tintColor: 'white',
              marginHorizontal: 25,
              marginTop: 37,
            }}
            source={require('../assets/user.png')}
          />

          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              marginHorizontal: 25,
              fontSize: 17,
              marginTop: 6,
            }}>
            Technic Mentors
          </Text>
          <Text style={{color: 'white', marginHorizontal: 25}}>
            POS@technicmentors.com
          </Text>
        </View>

        {Object.keys(menuData).map((mainItem, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => handleMainPress(mainItem)}>
              {icons[mainItem] && (
                <Image source={icons[mainItem]} style={styles.icon} />
              )}
              <Text style={styles.menuItem}>{mainItem}</Text>
            </TouchableOpacity>

            {expandedItem === mainItem &&
              mainItem !== 'Reports' &&
              menuData[mainItem].map((subItem, subIndex) => (
                <TouchableOpacity
                  key={subIndex}
                  onPress={() => handleSubPress(subItem)}>
                <View style={{
                          flexDirection:'row',marginHorizontal:60
                        }}>
                      
                          <Image
                        style={{width:10,height:10,marginTop:10}} source={require('../assets/handarrow.png')}/>
                  <Text style={styles.subMenuItem}>{subItem}</Text>
               </View>
                </TouchableOpacity>
              ))}

            {mainItem === 'Reports' && expandedItem === 'Reports' && (
              <View style={styles.subMenu}>
                {['People', 'Products', 'Accounts', 'Sales Reports'].map(
                  (sub, idx) => (
                    <View key={idx}>
                      <TouchableOpacity
                        onPress={() => handleReportSubmenuPress(sub)}>
                           <View style={{
                          flexDirection:'row',marginHorizontal:60
                        }}>
                      
                          <Image
                        style={{width:10,height:10,marginTop:10}} source={require('../assets/handarrow.png')}/>
                        <Text style={styles.subMenuItem}>{sub}</Text></View>
                      </TouchableOpacity>
                      {expandedReportSubmenu === sub && (
                        <View style={styles.subSubMenu}>
                          {reportSubScreens[sub].map((screen, sIdx) => (
                            <TouchableOpacity
                              key={sIdx}
                              onPress={() => handleSubPress(screen)}>
                              <Text style={styles.subSubMenuItem}>
                              > {screen}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ),
                )}

                {[
                  'Cheque List',
                  'Profit Loss Report',
                  'Expense Report',
                  'Business Capital',
                  'Customer Balances',
                  'Supplier Balances',
                  'Cash Register',
                  'Trades',
                  'General Ledger',
                  'Day Book',
                  'Stock Movement',
                ].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSubPress(item)}>
                        <View style={{
                          flexDirection:'row',marginHorizontal:60
                        }}>
                      
                          <Image
                        style={{width:10,height:10,marginTop:10}} source={require('../assets/handarrow.png')}/>
                    <Text style={styles.subMenuItem}>{item}</Text></View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </Modal>
  );
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

export default DrawerModal;

const styles = StyleSheet.create({
  menuItem: {
    fontSize: 16,
    color: '#144272',
    marginVertical: 3,
    marginHorizontal: 25,
  },
  subMenuItem: {
    fontSize: 14,
    color: '#144272',
    marginVertical: 5,
    marginHorizontal: 4,
  },
  subSubMenu: {
    paddingLeft: 15,
  },
  subSubMenuItem: {
    fontSize: 13,
    color: '#144272',
    marginVertical: 5,
    marginHorizontal: 40,
  },
  menuModal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContent: {
    width: 260,
    flex: 1,
    backgroundColor: 'white',
  },
  subMenu: {
    paddingLeft: 15,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 25,
    marginVertical: 8,
  },

  icon: {
    width: 18,
    height: 18,
    marginRight: -15,
    resizeMode: 'contain',
    tintColor: '#144272',
  },
});
