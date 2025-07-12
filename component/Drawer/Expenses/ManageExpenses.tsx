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
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import {useUser} from '../../CTX/UserContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Expenses {
  expc_name: string;
  id: number;
  exp_amount: string;
  exp_addedby: string;
  exp_date: string;
  exp_desc: string;
  exp_expc_id: number;
}

interface ExpenseCategories {
  id: string;
  expc_name: string;
}

interface AddExpense {
  category: string;
  amount: string;
  addedBy: string;
  date: Date;
  description: string;
}

const initialAddExpense: AddExpense = {
  addedBy: '',
  amount: '',
  category: '',
  date: new Date(),
  description: '',
};

interface EditExpense {
  category: string;
  amount: string;
  addedBy: string;
  date: Date;
  description: string;
}

const initialEditExpense: EditExpense = {
  addedBy: '',
  amount: '',
  category: '',
  date: new Date(),
  description: '',
};

export default function ManageExpenses() {
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [totalExpense, setTotalExpense] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expenses[]>([]);
  const [modalVisible, setModalVisible] = useState('');
  const [expCategories, setExpCategories] = useState<ExpenseCategories[]>([]);
  const transformedCategories = expCategories.map(cat => ({
    label: cat.expc_name,
    value: cat.id.toString(),
  }));
  const [addFrom, setAddFrom] = useState<AddExpense>(initialAddExpense);
  const [editFrom, setEditFrom] = useState<EditExpense>(initialEditExpense);
  const [categoryValue, setCategoryValue] = useState('');
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [customerType, setcustomerType] = useState(false);
  const [showorderDatePicker, setShoworderDatePicker] = useState(false);
  const [showeditDatePicker, setShoweditDatePicker] = useState(false);

  // Add Form OnChange
  const addOnChnage = (field: keyof AddExpense, value: string | Date) => {
    setAddFrom(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Edit Form OnChange
  const editOnChnage = (field: keyof EditExpense, value: string | Date) => {
    setEditFrom(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Date On Change
  const onorderDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || addFrom.date;
    setShoworderDatePicker(false);
    addOnChnage('date', currentDate);
  };

  const oneditDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || editFrom.date;
    setShoweditDatePicker(false);
    editOnChnage('date', currentDate);
  };

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpenses`);
      setExpenses(res.data.exp);
      setTotalExpense(res.data.total);
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Expense
  const handleDelete = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/expdelete`, {
        id: selectedExpense[0].id,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted!',
          text2: 'Expense has been Deleted successfully',
          visibilityTime: 1500,
        });
      }
      fetchExpenses();
      setSelectedExpense([]);
      setModalVisible('');
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Expenses Dropdown
  const getExpenseDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpensecategorydropdown`);
      setExpCategories(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Add Expense
  const handleAddExpense = async () => {
    if (!categoryValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select expanse category',
        visibilityTime: 1500,
      });
      return;
    }

    if (!addFrom.amount || !addFrom.addedBy || !addFrom.description) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all fields!',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/addexpense`, {
        cat_id: categoryValue,
        exp_amount: addFrom.amount,
        exp_addedby: addFrom.addedBy.trim(),
        exp_date: addFrom.date.toISOString().split('T')[0],
        exp_desc: addFrom.description,
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Expense has been added successfully',
          visibilityTime: 1500,
        });
        fetchExpenses();
        setAddFrom(initialAddExpense);
        setModalVisible('');
        setCategoryValue('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Edit Expense
  const handleEditExpense = async () => {
    if (!editCategoryValue) {
      Toast.show({
        type: 'error',
        text1: 'Please select expanse category',
        visibilityTime: 1500,
      });
      return;
    }

    if (!editFrom.amount || !editFrom.addedBy || !editFrom.description) {
      Toast.show({
        type: 'error',
        text1: 'Please fill all fields!',
        visibilityTime: 1500,
      });
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/updateexpenses`, {
        cat_id: editCategoryValue,
        exp_id: selectedExpense[0]?.id,
        exp_amount: editFrom.amount,
        exp_addedby: editFrom.addedBy.trim(),
        exp_date: editFrom.date.toISOString().split('T')[0],
        exp_desc: editFrom.description,
        _method: 'PUT',
      });

      const data = res.data;

      if (res.status === 200 && data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Added!',
          text2: 'Expense has been added successfully',
          visibilityTime: 1500,
        });
        fetchExpenses();
        setEditFrom(initialAddExpense);
        setModalVisible('');
        setEditCategoryValue('');
        setSelectedExpense([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    getExpenseDropdown();
  }, []);

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
              Manage Expenses
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setModalVisible('Add');
            }}>
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

        <FlatList
          data={expenses}
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
                    {item.expc_name}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('View');
                        setSelectedExpense([item]);
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
                        source={require('../../../assets/show.png')}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Edit');
                        setEditFrom({
                          addedBy: item.exp_addedby,
                          amount: item.exp_amount,
                          category: '',
                          date: new Date(item.exp_date),
                          description: item.exp_desc,
                        });
                        setEditCategoryValue(item.exp_expc_id.toString());
                        setSelectedExpense([item]);
                      }}>
                      <Image
                        style={{
                          tintColor: '#144272',
                          width: 15,
                          height: 15,
                          alignSelf: 'center',
                          marginTop: 8,
                        }}
                        source={require('../../../assets/edit.png')}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible('Delete');
                        setSelectedExpense([item]);
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
                        source={require('../../../assets/delete.png')}
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
                    <Text style={styles.text}>Amount:</Text>
                    <Text style={styles.text}>{item.exp_amount}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      Expense Added By:
                    </Text>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      {item.exp_addedby}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      Expense Date:
                    </Text>
                    <Text style={[styles.value, {marginBottom: 5}]}>
                      {new Date(item.exp_date)
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                        .replace(/\//g, '-')}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 30}}>
              <Text style={{color: 'white', fontSize: 16}}>
                No expense found.
              </Text>
            </View>
          }
        />

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Expense Amount:</Text>
          <Text style={styles.totalText}>{totalExpense ?? '0'}</Text>
        </View>

        {/*Add Expense*/}
        <Modal isVisible={modalVisible === 'Add'}>
          <ScrollView
            style={{
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '45%',
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
                margin: 15,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Add Expense
              </Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <DropDownPicker
                items={transformedCategories}
                open={customerType}
                setOpen={setcustomerType}
                value={categoryValue}
                setValue={setCategoryValue}
                placeholder="Select Expense Name"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: '100%',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
            </View>

            <View style={[styles.row]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Expense Amount"
                keyboardType="numeric"
                value={addFrom.amount}
                onChangeText={t => addOnChnage('amount', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Added By"
                value={addFrom.addedBy}
                onChangeText={t => addOnChnage('addedBy', t)}
              />
            </View>

            <View style={styles.dateContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderColor: '#144272',
                }}>
                <Text style={{marginLeft: 10, color: '#144272'}}>
                  {`${addFrom.date.toLocaleDateString()}`}
                </Text>

                <TouchableOpacity onPress={() => setShoworderDatePicker(true)}>
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'stretch',
                      alignItems: 'center',
                      marginLeft: 195,
                      tintColor: '#144272',
                      alignSelf: 'flex-end',
                    }}
                    source={require('../../../assets/calendar.png')}
                  />
                  {showorderDatePicker && (
                    <DateTimePicker
                      testID="startDatePicker"
                      value={addFrom.date}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={onorderDateChange}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.row]}>
              <TextInput
                style={[
                  styles.productinput,
                  {width: '100%', height: 85, textAlignVertical: 'top'},
                ]}
                placeholderTextColor={'#144272'}
                placeholder="Description"
                value={addFrom.description}
                onChangeText={t => addOnChnage('description', t)}
                numberOfLines={3}
                multiline
              />
            </View>

            <TouchableOpacity onPress={handleAddExpense}>
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
                  Add Expense
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*Delete Expense*/}
        <Modal isVisible={modalVisible === 'Delete'}>
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
              source={require('../../../assets/info.png')}
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
                  setSelectedExpense([]);
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

              <TouchableOpacity onPress={handleDelete}>
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

        {/*Edit Modal*/}
        <Modal isVisible={modalVisible === 'Edit'}>
          <ScrollView
            style={{
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '45%',
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
                margin: 15,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                Update Expense
              </Text>
              <TouchableOpacity onPress={() => setModalVisible('')}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <DropDownPicker
                items={transformedCategories}
                open={editCatOpen}
                setOpen={setEditCatOpen}
                value={editCategoryValue}
                setValue={setEditCategoryValue}
                placeholder="Select Expense Name"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                ArrowUpIconComponent={() => (
                  <Icon name="keyboard-arrow-up" size={18} color="#144272" />
                )}
                ArrowDownIconComponent={() => (
                  <Icon name="keyboard-arrow-down" size={18} color="#144272" />
                )}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: '100%',
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: '100%',
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
                listMode="SCROLLVIEW"
              />
            </View>

            <View style={[styles.row]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Expense Amount"
                keyboardType="numeric"
                value={editFrom.amount}
                onChangeText={t => editOnChnage('amount', t)}
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Added By"
                value={editFrom.addedBy}
                onChangeText={t => editOnChnage('addedBy', t)}
              />
            </View>

            <View style={styles.dateContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 5,
                  borderColor: '#144272',
                }}>
                <Text style={{marginLeft: 10, color: '#144272'}}>
                  {`${editFrom.date.toLocaleDateString()}`}
                </Text>

                <TouchableOpacity onPress={() => setShoweditDatePicker(true)}>
                  <Image
                    style={{
                      height: 20,
                      width: 20,
                      resizeMode: 'stretch',
                      alignItems: 'center',
                      marginLeft: 195,
                      tintColor: '#144272',
                      alignSelf: 'flex-end',
                    }}
                    source={require('../../../assets/calendar.png')}
                  />
                  {showeditDatePicker && (
                    <DateTimePicker
                      testID="startDatePicker"
                      value={editFrom.date}
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={oneditDateChange}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.row]}>
              <TextInput
                style={[
                  styles.productinput,
                  {width: '100%', height: 85, textAlignVertical: 'top'},
                ]}
                placeholderTextColor={'#144272'}
                placeholder="Description"
                value={editFrom.description}
                onChangeText={t => editOnChnage('description', t)}
                numberOfLines={3}
                multiline
              />
            </View>

            <TouchableOpacity onPress={handleEditExpense}>
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
                  Update Expense
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*View Expense*/}
        <Modal isVisible={modalVisible === 'View'}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: '98%',
              maxHeight: '55%',
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
                Expense Detail
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible('');
                  setSelectedExpense([]);
                }}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedExpense}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <ScrollView
                  style={{
                    padding: 5,
                  }}>
                  <View style={styles.table}>
                    <View style={[styles.cardContainer]}>
                      <View style={styles.infoGrid}>
                        <Text style={styles.labl}>Expense Name:</Text>
                        <Text style={styles.valu}>{item.expc_name}</Text>

                        <Text style={styles.labl}>Expense Amount:</Text>
                        <Text style={styles.valu}>{item.exp_amount}</Text>

                        <Text style={styles.labl}>Added By:</Text>
                        <Text style={styles.valu}>{item.exp_addedby}</Text>

                        <Text style={styles.labl}>Date:</Text>
                        <Text style={styles.valu}>
                          {new Date(item.exp_date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </Text>

                        <Text style={styles.labl}>Description:</Text>
                        <Text style={styles.valu}>{item.exp_desc}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'transparent',
    width: '100%',
  },
  productinput: {
    borderWidth: 1,
    borderColor: '#144272',
    borderRadius: 6,
    padding: 8,
    color: '#144272',
    height: 38,
    width: '46%',
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
  totalContainer: {
    padding: 7,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#144272',
    height: 38,
    marginHorizontal: 12,
    marginTop: 10,
  },
});
