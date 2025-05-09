import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';
import {RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

export default function AccessControl() {
  const {openDrawer} = useDrawer();
  const Info = [
    {
      CustomerName: 'Accountant',
    },
    {
      CustomerName: 'Manager',
    },
  ];

  {
    /*customer*/
  }
  const [customer, setcustomer] = useState(false);

  const togglecustomer = () => {
    setcustomer(!customer);
  };

  const [customerType, setcustomerType] = useState(false);
  const [currentcustomer, setCurrentcustomer] = useState<string | null>('');
  const customerItem = [
    {label: 'Accountant', value: 'Accountant'},
    {label: 'Manager', value: 'Manager'},
  ];

  const [btncustomerarea, setbtncustomerarea] = useState(false);

  const togglebtncustomerarea = () => {
    setbtncustomerarea(!btncustomerarea);
  };

  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleedit = () => {
    setedit(!edit);
  };

  const [btncustomeraditarea, setbtncustomereditarea] = useState(false);
  const togglebtn = () => {
    setbtncustomereditarea(!btncustomeraditarea);
  };
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const modules = [
    'People',
    'Customer',
    'Suppliers',
    'Employees',
    'Transporter',
    'Labour',
    'Order Booker',
    'Fixed Accounts',
    'Attendance',
    'All Employees Attendance',
    'All Employees Attendance List',
    'Products',
    'Categories',
    'Uoms',
    'Deleted Products',
    'Stock',
    'Current Stock',
    'Reorder Products',
    'Expire Products',
    'Sales',
    'Sale Order',
    'Order List',
    'Point of sale',
    'Invoice List',
    'Dispatch List',
    'Sale Return',
    'Sale Return List',
    'Cash Close',
    'Purchase',
    'Purchase Order',
    'Purchase Order List',
    'Purchase/Add Stock',
    'Purchase List',
    'Purchase Return',
    'Purchase Return List',
    'Trading',
    'Trade',
    'Trading List',
    'Accounts',
    'Customer Account',
    'Supplier Account',
    'Transporter Account',
    'Labour Account',
    'Employee Account',
    'Fixed Accounts',
    'Reports',
    'Products Report',
    'Sales Reports',
    'Cheque List',
    'Profit Loss Report',
    'Expense Report',
    'Business Capital',
    'Customer Balances',
    'Supplier Balances',
    'Cash Register',
    'Trade Report',
    'General Ledger',
    'Day Book',
    'System Users',
    'Users',
    'Roles',
    'Expenses',
    'Expense Categories',
    'Manage Expenses',
    'Configurations',
    'Customer Type',
    'Areas',
    'Print Barcode',
    'Password Reset',
    'Business Variables',
    'Sale Invoice',
    'Access Control',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={{
                width: 30,
                height: 30,
                tintColor: 'white',
              }}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Access Control
            </Text>
          </View>
          <TouchableOpacity onPress={togglecustomer}>
            <Image
              style={{
                tintColor: 'white',
                width: 18,
                height: 18,
                alignSelf: 'center',
                marginRight: 5,
              }}
              source={require('../../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View>
            <FlatList
              data={Info}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <ScrollView
                  style={{
                    padding: 5,
                  }}>
                  <View style={styles.table}>
                    <View style={styles.tablehead}>
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        {item.CustomerName}
                      </Text>

                      <TouchableOpacity onPress={toggleedit}>
                        <Image
                          style={{
                            tintColor: 'white',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginTop: 8,
                            marginRight: 5,
                          }}
                          source={require('../../../assets/edit.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </ScrollView>

        {/*access control*/}
        <Modal isVisible={customer}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 450,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: 10,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add Access Control
              </Text>
              <TouchableOpacity onPress={() => setcustomer(!customer)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <DropDownPicker
              items={customerItem}
              open={customerType}
              setOpen={setcustomerType}
              value={currentcustomer}
              setValue={setCurrentcustomer}
              placeholder="Select Role"
              placeholderStyle={{color: '#144272'}}
              textStyle={{color: '#144272'}}
              arrowIconStyle={{tintColor: '#144272'}}
              style={[
                styles.dropdown,
                {
                  borderColor: '#144272',
                  width: 265,
                  alignSelf: 'center',
                },
              ]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 265,
                alignSelf: 'center',
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
            />

            <Text
              style={{
                color: '#144272',
                fontWeight: 'bold',
                fontSize: 16,
                marginLeft: 15,
                marginBottom: 10,
                marginTop: 10,
              }}>
              Select Module
            </Text>

            <ScrollView style={{maxHeight: 250, marginHorizontal: 10}}>
              {modules.map(module => (
                <TouchableOpacity
                  key={module}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                  onPress={() => setSelectedModule(module)}>
                  <RadioButton
                    value={module}
                    status={selectedModule === module ? 'checked' : 'unchecked'}
                    color="#144272"
                    uncheckedColor="#144272"
                    onPress={() => setSelectedModule(module)}
                  />
                  <Text style={{fontSize: 16, color: '#144272'}}>{module}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={togglebtncustomerarea}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 80,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Save
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*btn customer*/}
        <Modal isVisible={btncustomerarea}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 220,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Added
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Access Control has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomerarea(!btncustomerarea)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*edit*/}
        {/*edit*/}
<Modal isVisible={edit}>
  <ScrollView
    style={{
      flex: 1,
      backgroundColor: 'white',
      width: '98%',
      maxHeight: 450,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#144272',
      overflow: 'hidden',
      alignSelf: 'center',
    }}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 10,
      }}>
      <Text
        style={{
          color: '#144272',
          fontWeight: 'bold',
          fontSize: 16,
        }}>
        Edit Access Control
      </Text>
      <TouchableOpacity onPress={() => setedit(!edit)}>
        <Image
          style={{
            width: 15,
            height: 15,
          }}
          source={require('../../../assets/cross.png')}
        />
      </TouchableOpacity>
    </View>
    <DropDownPicker
      items={customerItem}
      open={customerType}
      setOpen={setcustomerType}
      value={currentcustomer}
      setValue={setCurrentcustomer}
      placeholder="Select Role"
      placeholderStyle={{color: '#144272'}}
      textStyle={{color: '#144272'}}
      arrowIconStyle={{tintColor: '#144272'}}
      style={[
        styles.dropdown,
        {
          borderColor: '#144272',
          width: 265,
          alignSelf: 'center',
        },
      ]}
      dropDownContainerStyle={{
        backgroundColor: 'white',
        borderColor: '#144272',
        width: 265,
        alignSelf: 'center',
      }}
      labelStyle={{color: '#144272'}}
      listItemLabelStyle={{color: '#144272'}}
    />

    <Text
      style={{
        color: '#144272',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 15,
        marginBottom: 10,
        marginTop: 10,
      }}>
      Select Module
    </Text>

    <ScrollView style={{maxHeight: 250, marginHorizontal: 10}}>
      {modules.map(module => (
        <TouchableOpacity
          key={module}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={() => setSelectedModule(module)}>
          <RadioButton
            value={module}
            status={selectedModule === module ? 'checked' : 'unchecked'}
            color="#144272"
            uncheckedColor="#144272"
            onPress={() => setSelectedModule(module)}
          />
          <Text style={{fontSize: 16, color: '#144272'}}>{module}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

    <TouchableOpacity onPress={togglebtn}>
      <View
        style={{
          backgroundColor: '#144272',
          height: 30,
          width: 80,
          margin: 10,
          borderRadius: 10,
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
          }}>
          Update
        </Text>
      </View>
    </TouchableOpacity>
  </ScrollView>
</Modal>


        {/*btn customer*/}
        <Modal isVisible={btncustomeraditarea}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 230,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
              alignSelf: 'center',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../../assets/tick.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Updated
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Access Control has been updated successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtncustomereditarea(!btncustomeraditarea)}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 50,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    OK
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
  },
  tablehead: {
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 5,
    borderTopLeftRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  value: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  lastrow: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderBottomEndRadius: 10,
    borderBottomLeftRadius: 10,
  },
  card: {
    borderColor: '#144272',
    backgroundColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: 5,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    color: 'white',
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
    padding: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  addButton: {
    marginLeft: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 60,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 320,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  productinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
  },
  cardContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    paddingBottom: 24,
    marginBottom: 40,
  },
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#144272',
  },
  noImageText: {
    color: '#144272',
    fontStyle: 'italic',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  labl: {
    width: '68%',
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 4,
  },
  valu: {
    width: '68%',
    marginBottom: 8,
    color: '#144272',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  exportBtn: {
    backgroundColor: '#144272',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
