import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUser} from '../../../CTX/UserContext';
import RNPrint from 'react-native-print';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import backgroundColors from '../../../Colors';

interface AreaDropDown {
  id: number;
  area_name: string;
}

interface AreaList {
  id: string;
  area_name: string;
  cust_cnic: string;
  cust_email: string;
  cust_contact: string;
  cust_name: string;
}

export default function AreaWiseCustomer() {
  const {token, bussName, bussAddress} = useUser();
  const {openDrawer} = useDrawer();
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[]>([]);
  const transformedLabArea = areaDropdown.map(area => ({
    label: area.area_name,
    value: area.id.toString(),
  }));
  const [areaList, setAreaList] = useState<AreaList[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = areaList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = areaList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handlePrint = async () => {
    if (areaList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No records found to print.',
        visibilityTime: 2000,
      });
      return;
    }

    // Get current date
    const dateStr = new Date().toLocaleDateString();

    // Build HTML table rows
    const rows = areaList
      .map(
        (item, index) => `
      <tr>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word; text-align:center;">${
          index + 1
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_name
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_cnic
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_contact
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.cust_email
        }</td>
        <td style="border:1px solid #000; padding:4px; word-wrap:break-word; white-space:normal; word-break:break-word;">${
          item.area_name
        }</td>
      </tr>`,
      )
      .join('');

    // HTML Template
    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Customer Report</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:12px;">Date: ${dateStr}</div>
          <div style="text-align:center; flex:1; font-size:16px; font-weight:bold;">Point of Sale System</div>
        </div>

        <div style="text-align:center; margin-bottom:20px;">
          <div style="font-size:18px; font-weight:bold;">${bussName}</div>
          <div style="font-size:14px;">${bussAddress}</div>
          <div style="font-size:14px; font-weight:bold; text-decoration:underline;">
            Customer Area Report
          </div>
        </div>

        <table style="border-collapse:collapse; width:100%; font-size:12px;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="border:1px solid #000; padding:6px;">Sr#</th>
              <th style="border:1px solid #000; padding:6px;">Customer Name</th>
              <th style="border:1px solid #000; padding:6px;">CNIC</th>
              <th style="border:1px solid #000; padding:6px;">Contact</th>
              <th style="border:1px solid #000; padding:6px;">Email</th>
              <th style="border:1px solid #000; padding:6px;">Area</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

    await RNPrint.print({html});
  };

  // Fetch Area dropdown
  const fetchAreaDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchareadata`);
      setAreaDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Area Wise List
  const fetchAreaList = async () => {
    if (areaValue) {
      try {
        const res = await axios.get(
          `${BASE_URL}/fetchcustareareport?area=${areaValue}&_token=${token}`,
        );
        setAreaList(res.data.area);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchAreaDropdown();
    fetchAreaList();
  }, [areaValue]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Image
              source={require('../../../../assets/menu.png')}
              tintColor="white"
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Area Wise Customer</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{paddingHorizontal: '3%', marginTop: 10, marginBottom: 5}}>
          <DropDownPicker
            items={transformedLabArea}
            open={areaOpen}
            setOpen={setAreaOpen}
            value={areaValue}
            setValue={setAreaValue}
            placeholder="Select Customer Area"
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color={backgroundColors.dark} />
            )}
            ArrowDownIconComponent={() => (
              <Icon
                name="chevron-down"
                size={18}
                color={backgroundColors.dark}
              />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
            listItemLabelStyle={{
              color: backgroundColors.dark,
              fontWeight: '500',
            }}
            labelStyle={{
              color: backgroundColors.dark,
              fontSize: 16,
              fontWeight: '500',
            }}
            searchable
            searchTextInputStyle={{
              borderWidth: 0,
              width: '100%',
            }}
            searchContainerStyle={{
              borderColor: backgroundColors.gray,
            }}
          />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name + Actions */}
                <View style={styles.row}>
                  <View style={styles.avatarBox}>
                    <Image
                      source={require('../../../../assets/man.png')}
                      style={styles.avatar}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.cust_name}</Text>
                    {/* small details inline */}
                    <Text style={styles.subText}>
                      <Icon name="phone" size={12} color="#666" />{' '}
                      {item.cust_contact || 'No contact'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={48} color="#666" />
                <Text style={styles.emptyText}>No record found.</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 90}}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Pagination Controls */}
        {totalRecords > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(prev => prev - 1)}
              style={[
                styles.pageButton,
                currentPage === 1 && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === 1 && styles.pageButtonTextDisabled,
                ]}>
                Prev
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page <Text style={styles.pageCurrent}>{currentPage}</Text> of{' '}
                {totalPages}
              </Text>
              <Text style={styles.totalText}>
                Total: {totalRecords} Customers
              </Text>
            </View>

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(prev => prev + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.pageButtonText,
                  currentPage === totalPages && styles.pageButtonTextDisabled,
                ]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: backgroundColors.primary,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradientBackground: {
    flex: 1,
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: backgroundColors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: -2},
    elevation: 6,
  },
  pageButton: {
    backgroundColor: backgroundColors.info,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: '#eee',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#777',
  },
  pageIndicator: {
    paddingHorizontal: 10,
  },
  pageIndicatorText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  pageCurrent: {
    fontWeight: '700',
    color: '#FFD166',
  },
  totalText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },

  // FlatList Styling
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
    marginTop: 10,
  },
  card: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    height: 45,
    width: 45,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    width: '96%',
    alignSelf: 'center',
    marginTop: 60,
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Dropdown
  dropdown: {
    backgroundColor: backgroundColors.light,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    height: 48,
    marginBottom: 4,
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    maxHeight: 200,
  },
});
