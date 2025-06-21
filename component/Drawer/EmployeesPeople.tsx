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
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../DrawerContext';
import Modal from 'react-native-modal';
import {RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../BASE_URL';
import {useUser} from '../CTX/UserContext';
import Toast from 'react-native-toast-message';

interface Employee {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
  emp_email: string;
}

interface EmployeeView {
  id: number;
  emp_name: string;
  emp_address: string;
  emp_contact: string;
  emp_cnic: string;
  emp_email: string;
  emp_fathername: string;
  emp_sec_contact: string;
  emp_third_contact: string;
  emp_contact_person_one: string;
  emp_contact_person_two: string;
  emp_opening_balance: string;
  emp_transaction_type: string;
  emp_payment_type: string;
  emp_status: string;
  emp_image: string;
  emp_type: string;
  created_at: string;
  updated_at: string;
}

export default function EmployeesPeople() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [viewEmp, setViewEmp] = useState<EmployeeView[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<number | null>(null);

  const [btncustomerarea, setbtncustomerarea] = useState(false);

  const togglebtncustomerarea = () => {
    setbtncustomerarea(!btncustomerarea);
  };
  const [Type, setType] = React.useState<'EnableOpeningBalance' | 'number'>(
    'EnableOpeningBalance',
  );

  const [paymentType, setpaymentType] = useState(false);
  const [current, setcurrentpaymentType] = useState<string | null>('');
  const paymentTypeItem = [
    {label: 'Payable', value: 'Payable'},
    {label: 'Recievable', value: 'Recievable'},
  ];
  const [Worker, setWorker] = React.useState<'Worker' | 'number'>('Worker');

  const [Other, setOther] = React.useState<'Other' | 'number'>('Other');
  {
    /*edit*/
  }
  const [edit, setedit] = useState(false);

  const toggleedit = () => {
    setedit(!edit);
  };

  const [btncustomeraditarea, setbtncustomereditarea] = useState(false);

  const togglebtncustomereditarea = () => {
    setbtncustomereditarea(!btncustomeraditarea);
  };

  const [EditWorker, setEditWorker] = React.useState<'Worker' | 'number'>(
    'Worker',
  );

  const [EditOther, setEditOther] = React.useState<'Other' | 'number'>('Other');

  // Fetch Employee
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchemployeedata`);
      setEmployeeData(res.data.emp);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Employee
  const delEmployee = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/employeedelete`, {
        id: selectedEmp,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Employee has been Deleted successfully!',
          visibilityTime: 1500,
        });

        setSelectedEmp(null);
        setModalVisible('');
        fetchEmployees();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/screen.jpg')}
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
              source={require('../../assets/menu.png')}
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
              Employees
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible('AddEmp')}>
            <Image
              style={{
                tintColor: 'white',
                width: 18,
                height: 18,
                alignSelf: 'center',
                marginRight: 5,
              }}
              source={require('../../assets/add.png')}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Print</Text>
          </TouchableOpacity>
        </View>

        <View>
          <FlatList
            data={employeeData}
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
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.emp_name}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible('View Employee');
                          const fetchDetails = async (id: number) => {
                            try {
                              const res = await axios.get(
                                `${BASE_URL}/employeesshow?id=${id}&_token=${token}`,
                              );
                              setViewEmp([res.data]);
                            } catch (error) {
                              console.log(error);
                            }
                          };

                          fetchDetails(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginRight: 5,
                            marginTop: 9,
                          }}
                          source={require('../../assets/show.png')}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={toggleedit}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginTop: 8,
                          }}
                          source={require('../../assets/edit.png')}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible('EmpDelete');
                          setSelectedEmp(item.id);
                        }}>
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginRight: 5,
                            marginTop: 8,
                          }}
                          source={require('../../assets/delete.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Email:</Text>
                      <Text style={styles.text}>{item.emp_email ?? 'N/A'}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Contact:</Text>
                      <Text style={styles.text}>
                        {item.emp_contact ?? 'N/A'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>CNIC:</Text>
                      <Text style={styles.text}>{item.emp_cnic ?? 'N/A'}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        Address:
                      </Text>
                      <Text style={[styles.value, {marginBottom: 5}]}>
                        {item.emp_address ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  No Employee found.
                </Text>
              </View>
            }
          />
        </View>

        {/*Add Employee*/}
        <Modal isVisible={modalVisible === 'AddEmp'}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 550,
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
                Add New Employee
              </Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Employee Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Father Name"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 1"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 2"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={13}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: -10,
                marginBottom: -10,
              }}>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 6,
                  marginRight: 50,
                }}>
                <RadioButton
                  value="Worker"
                  status={Worker === 'Worker' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setWorker('Worker')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Worker
                </Text>
              </View>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 28,
                }}>
                <RadioButton
                  value="Other"
                  status={Other === 'Other' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setOther('Other')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Other
                </Text>
              </View>
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Other"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <Text style={[styles.productinput, {color: '#144272'}]}>
                Worker
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity>
                <View
                  style={[
                    styles.row,
                    {
                      marginLeft: 10,
                      backgroundColor: '#144272',
                      borderRadius: 10,
                      width: 120,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.productinput,
                      {color: 'white', textAlign: 'center'},
                    ]}>
                    Choose Image
                  </Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 35,
                }}>
                <RadioButton
                  value="EnableOpeningBalance"
                  status={
                    Type === 'EnableOpeningBalance' ? 'checked' : 'unchecked'
                  }
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setType('EnableOpeningBalance')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Enable Balance
                </Text>
              </View>
            </View>
            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Opening balance"
                keyboardType="numeric"
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={paymentTypeItem}
                open={paymentType}
                setOpen={setpaymentType}
                value={current}
                setValue={setcurrentpaymentType}
                placeholder="Payment Type"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: 295,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 295,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
            </View>
            <View
              style={[
                styles.row,
                {marginLeft: 7, marginRight: 10, marginTop: -1},
              ]}>
              <Text style={[styles.productinput, {color: '#144272'}]}>
                Balance
              </Text>
            </View>
            <TouchableOpacity onPress={togglebtncustomerarea}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 120,
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
                  Add Employee
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*btn employee*/}
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
              source={require('../../assets/tick.png')}
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
              Employee has been added successfully
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

        {/*Epmloyee Delete*/}
        <Modal isVisible={modalVisible === 'EmpDelete'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 220,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
            }}>
            <Image
              style={{
                width: 60,
                height: 60,
                tintColor: '#144272',
                alignSelf: 'center',
                marginTop: 30,
              }}
              source={require('../../assets/info.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 22,
                textAlign: 'center',
                marginTop: 10,
                color: '#144272',
              }}>
              Are you sure?
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              You won't be able to revert this record!
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSelectedEmp(null);
                }}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                    marginRight: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={delEmployee}>
                <View
                  style={{
                    backgroundColor: '#144272',
                    borderRadius: 5,
                    width: 100,
                    height: 30,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                    }}>
                    Yes, delete it
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*edit*/}
        <Modal isVisible={edit}>
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 480,
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
                Edit Employee
              </Text>
              <TouchableOpacity onPress={() => setedit(!edit)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Customer Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Father Name"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Email"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Address"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 1"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact Person 2"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 1"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 2"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Contact 3"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="CNIC"
                keyboardType="numeric"
                maxLength={13}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: -10,
                marginBottom: -10,
              }}>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 6,
                  marginRight: 50,
                }}>
                <RadioButton
                  value="Worker"
                  status={EditWorker === 'Worker' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setEditWorker('Worker')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Worker
                </Text>
              </View>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  marginLeft: 30,
                }}>
                <RadioButton
                  value="Other"
                  status={EditOther === 'Other' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setEditOther('Other')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -5,
                  }}>
                  Other
                </Text>
              </View>
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Other"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <Text style={[styles.productinput, {color: '#144272'}]}>
                Worker
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity>
                <View
                  style={[
                    styles.row,
                    {
                      marginLeft: 10,
                      backgroundColor: '#144272',
                      borderRadius: 10,
                      width: 295,
                      alignSelf: 'center',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.productinput,
                      {color: 'white', textAlign: 'center'},
                    ]}>
                    Choose Image
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={togglebtncustomereditarea}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 120,
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
                  Update Employee
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
              source={require('../../assets/tick.png')}
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
              Employee has been added successfully
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

        {/*Employee View Modal*/}
        <Modal isVisible={modalVisible === 'View Employee'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: 500,
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
                Employee's Detail
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setViewEmp([]);
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View>
              <FlatList
                data={viewEmp}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <ScrollView
                    style={{
                      padding: 5,
                    }}>
                    <View style={styles.table}>
                      <View style={[styles.cardContainer]}>
                        <View style={{alignItems: 'center', marginBottom: 16}}>
                          {item.emp_image ? (
                            <Image
                              source={{uri: item.emp_image}}
                              style={styles.customerImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.noImageText}>
                              No Image Provided
                            </Text>
                          )}
                        </View>

                        <View style={styles.infoGrid}>
                          <Text style={styles.labl}>Employee Name:</Text>
                          <Text style={styles.valu}>{item.emp_name}</Text>

                          <Text style={styles.labl}>Father Name:</Text>
                          <Text style={styles.valu}>
                            {item.emp_fathername ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact:</Text>
                          <Text style={styles.valu}>
                            {item.emp_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Email:</Text>
                          <Text style={styles.valu}>
                            {item.emp_email ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Second Contact:</Text>
                          <Text style={styles.valu}>
                            {item.emp_sec_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Third Contact:</Text>
                          <Text style={styles.valu}>
                            {item.emp_third_contact ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Person One:</Text>
                          <Text style={styles.valu}>
                            {item.emp_contact_person_one ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Contact Person Two:</Text>
                          <Text style={styles.valu}>
                            {item.emp_contact_person_two ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>CNIC:</Text>
                          <Text style={styles.valu}>
                            {item.emp_cnic ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Address:</Text>
                          <Text style={styles.valu}>
                            {item.emp_address ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Employee Type:</Text>
                          <Text style={styles.valu}>
                            {item.emp_type ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Opening Balance:</Text>
                          <Text style={styles.valu}>
                            {item.emp_opening_balance ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Payment Type:</Text>
                          <Text style={styles.valu}>
                            {item.emp_payment_type ?? 'N/A'}
                          </Text>

                          <Text style={styles.labl}>Transaction Type:</Text>
                          <Text style={styles.valu}>
                            {item.emp_transaction_type ?? 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                )}
              />
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
    backgroundColor: 'white',
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
