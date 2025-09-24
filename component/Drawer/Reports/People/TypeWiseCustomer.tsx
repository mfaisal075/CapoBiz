import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUser} from '../../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';

interface TypeDropDown {
  id: number;
  custtyp_name: string;
}

interface TypeWiseList {
  id: string;
  cust_name: string;
  cust_contact: string;
  cust_cnic: string;
  cust_email: string;
  custtyp_name: string;
}

export default function TypeWiseCustomer() {
  const {token} = useUser();
  const {bussName, bussAddress} = useUser();
  const {openDrawer} = useDrawer();
  const [typeDropdown, setTypeDropdown] = useState<TypeDropDown[]>([]);
  const transformedType = typeDropdown.map(type => ({
    label: type.custtyp_name,
    value: type.id.toString(),
  }));
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState('');
  const [typeList, setTypeList] = useState<TypeWiseList[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalRecords = typeList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Slice data for pagination
  const currentData = typeList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handlePrint = async () => {
    if (typeList.length === 0) {
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
    const rows = typeList
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
          item.custtyp_name
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
                  Customer Type Report
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
                    <th style="border:1px solid #000; padding:6px;">Type</th>
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

  // Fetch Type dropdown
  const fetchTypeDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchtypedata`);
      setTypeDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Type Wise List
  const fetchAreaList = async () => {
    if (typeValue) {
      try {
        const res = await axios.get(
          `${BASE_URL}/fetchcusttypereport?type=${typeValue}&_token=${token}`,
        );
        setTypeList(res.data.type);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchTypeDropdown();
    fetchAreaList();
  }, [typeValue]);
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerBtn}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Type Wise Customer</Text>
          </View>

          <TouchableOpacity style={[styles.headerBtn]} onPress={handlePrint}>
            <Icon name="printer" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{paddingHorizontal: 15, marginVertical: 8}}>
          <DropDownPicker
            items={transformedType}
            open={typeOpen}
            setOpen={setTypeOpen}
            value={typeValue}
            setValue={setTypeValue}
            placeholder="Select Customer Type"
            placeholderStyle={{color: '#666'}}
            textStyle={{color: '#144272'}}
            ArrowUpIconComponent={() => (
              <Icon name="chevron-up" size={18} color="#144272" />
            )}
            ArrowDownIconComponent={() => (
              <Icon name="chevron-down" size={18} color="#144272" />
            )}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropDownContainer}
          />
        </View>

        <View>
          <FlatList
            data={currentData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.card}>
                {/* Avatar + Name */}
                <View style={styles.headerRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {item.cust_name?.charAt(0) || 'C'}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.name}>{item.cust_name}</Text>
                    <Text style={styles.subText}>
                      {item.cust_contact || 'No contact'}
                    </Text>
                  </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="card-account-details"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>CNIC</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.cust_cnic || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="phone"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Contact</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.cust_contact || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="email"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Email</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.cust_email || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.labelRow}>
                      <Icon
                        name="tag"
                        size={20}
                        color={'#144272'}
                        style={styles.infoIcon}
                      />
                      <Text style={styles.labelText}>Type</Text>
                    </View>
                    <Text style={styles.valueText}>
                      {item.custtyp_name || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No record found.
                </Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 180}}
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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
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

  // FlatList Styling
  card: {
    backgroundColor: '#ffffffde',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
    marginHorizontal: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#144272',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIcon: {
    tintColor: '#144272',
    width: 20,
    height: 20,
    marginHorizontal: 4,
  },
  infoBox: {
    marginTop: 10,
    backgroundColor: '#F6F9FC',
    borderRadius: 12,
    padding: 10,
  },
  infoText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  infoIcon: {
    width: 18,
    height: 18,
    tintColor: '#144272',
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    color: '#144272',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 13,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Dropdown
  dropdown: {
    borderWidth: 1,
    borderColor: '#144272',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  dropDownContainer: {
    backgroundColor: '#fff',
    borderColor: '#144272',
  },

  // Pagination Component
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#144272',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#ddd',
  },
  pageButtonText: {
    color: '#144272',
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
});
