import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Category {
  id: number;
  expc_name: string;
}

interface ExpanseData {
  id: number;
  exp_date: string;
  expc_name: string;
  exp_addedby: string;
  exp_desc: string;
  exp_amount: string;
}

interface CategoryWiseExpanseData {
  id: number;
  exp_amount: string;
  exp_addedby: string;
  exp_desc: string;
  exp_date: string;
}

export default function ExpenseReport() {
  const {openDrawer} = useDrawer();
  const [categoryDropdown, setCategoryDropdown] = useState<Category[]>([]);
  const transformedCategory = categoryDropdown.map(cat => ({
    label: cat.expc_name,
    value: cat.id.toString(),
  }));
  const [catOpen, setCatOpen] = useState(false);
  const [catValue, setCatValue] = useState('');
  const [expanseData, setExpanseData] = useState<ExpanseData[]>([]);
  const [cateWiseexpanseData, setCateWiseExpanseData] = useState<
    CategoryWiseExpanseData[]
  >([]);

  const [selectionMode, setSelectionMode] = useState<
    'allExpenses' | 'categoryWiseExpenses' | ''
  >('allExpenses');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  // Fetch Expanse Category
  const fetchExpanseCatDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchexpensecategorydropdown`);
      setCategoryDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Expanses
  const fetchExpanses = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchexpense`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        cat_id: catValue,
      });
      setExpanseData(res.data.expense);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Category Wise Expanses
  const fetchCateWiseExpanses = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/fetchcatexpense`, {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
        cat_id: catValue,
      });
      setCateWiseExpanseData(res.data.expense);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate All Expanse Total
  const calculateAllExpanseTotal = () => {
    let totalAmount = 0;

    expanseData.forEach(exp => {
      const amount = parseFloat(exp.exp_amount) || 0;

      totalAmount += amount;
    });

    return {
      totalExpanse: totalAmount.toFixed(2),
    };
  };

  // Calculate Category Wise Expanse Total
  const calculateCategoryExpanseTotal = () => {
    let totalAmount = 0;

    cateWiseexpanseData.forEach(exp => {
      const amount = parseFloat(exp.exp_amount) || 0;

      totalAmount += amount;
    });

    return {
      totalExpanse: totalAmount.toFixed(2),
    };
  };

  useEffect(() => {
    fetchExpanseCatDropdown();
    fetchCateWiseExpanses();
    fetchExpanses();
  }, [startDate, endDate, catValue]);

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
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              Expense Report
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
              width: '46%',
            }}>
            <Text style={{marginLeft: 10, color: 'white'}}>
              {`${startDate.toLocaleDateString()}`}
            </Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <Image
                style={{
                  height: 20,
                  width: 20,
                  marginLeft: 10,
                  tintColor: 'white',
                }}
                source={require('../../../assets/calendar.png')}
              />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                testID="startDatePicker"
                value={startDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onStartDateChange}
              />
            )}
          </View>

          {/* To Date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: 'white',
              borderRadius: 5,
              padding: 5,
              height: 38,
              width: '46%',
            }}>
            <Text style={{marginLeft: 10, color: 'white'}}>
              {`${endDate.toLocaleDateString()}`}
            </Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <Image
                style={{
                  height: 20,
                  width: 20,
                  marginLeft: 10,
                  tintColor: 'white',
                }}
                source={require('../../../assets/calendar.png')}
              />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={endDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onEndDateChange}
              />
            )}
          </View>
        </View>

        <View style={styles.dropDownContainer}>
          <DropDownPicker
            items={transformedCategory}
            open={catOpen}
            setOpen={setCatOpen}
            value={catValue}
            setValue={setCatValue}
            placeholder="Select Category"
            disabled={selectionMode === 'allExpenses'}
            placeholderStyle={{color: 'white'}}
            textStyle={{color: 'white'}}
            ArrowUpIconComponent={() => (
              <Text>
                <Icon name="chevron-up" size={15} color="white" />
              </Text>
            )}
            ArrowDownIconComponent={() => (
              <Text>
                <Icon name="chevron-down" size={15} color="white" />
              </Text>
            )}
            style={[
              styles.dropdown,
              selectionMode === 'allExpenses' && {
                backgroundColor: 'gray',
              },
            ]}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: '#144272',
              width: '100%',
              marginTop: 8,
              zIndex: 1000,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
          />
        </View>

        <View style={[styles.row]}>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => {
              setSelectionMode('allExpenses');
              setCategoryDropdown([]);
            }}>
            <RadioButton
              value="allExpenses"
              status={selectionMode === 'allExpenses' ? 'checked' : 'unchecked'}
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('allExpenses');
                setCategoryDropdown([]);
              }}
            />
            <Text style={{color: 'white', marginTop: 10}}>All Expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => {
              setSelectionMode('categoryWiseExpenses');
              setCategoryDropdown([]);
            }}>
            <RadioButton
              value="categoryWiseExpenses"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'categoryWiseExpenses'
                  ? 'checked'
                  : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('categoryWiseExpenses');
              }}
            />
            <Text style={{color: 'white', marginTop: 10}}>
              Category Wise Expense
            </Text>
          </TouchableOpacity>
        </View>

        {selectionMode === 'allExpenses' && (
          <FlatList
            data={expanseData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.exp_addedby}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Category:</Text>
                      <Text style={styles.text}>{item.expc_name}</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.exp_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>

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
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Note:</Text>
                      <Text style={styles.text}>{item.exp_desc}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  height: 300,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                  No data found.
                </Text>
              </View>
            }
          />
        )}
        {selectionMode === 'categoryWiseExpenses' && (
          <FlatList
            data={cateWiseexpanseData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.exp_addedby}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Date:</Text>
                      <Text style={styles.text}>
                        {new Date(item.exp_date)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')}
                      </Text>
                    </View>

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
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Note:</Text>
                      <Text style={styles.text}>{item.exp_desc}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View
                style={{
                  height: 300,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                  No data found.
                </Text>
              </View>
            }
          />
        )}

        {selectionMode === 'allExpenses' && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total Records: {expanseData.length}
            </Text>

            {(() => {
              const {totalExpanse} = calculateAllExpanseTotal();
              return (
                <Text style={styles.totalText}>
                  Total Expense Amount: {totalExpanse}
                </Text>
              );
            })()}
          </View>
        )}
        {selectionMode === 'categoryWiseExpenses' && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total Records: {cateWiseexpanseData.length}
            </Text>

            {(() => {
              const {totalExpanse} = calculateCategoryExpanseTotal();
              return (
                <Text style={styles.totalText}>
                  Total Expense Amount: {totalExpanse}
                </Text>
              );
            })()}
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
    backgroundColor: 'white',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
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
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 38,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '100%',
  },
  totalContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    marginTop: 6,
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
  dropDownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
});
