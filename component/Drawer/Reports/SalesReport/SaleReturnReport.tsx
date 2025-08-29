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
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';

interface ProductDropdown {
  id: number;
  prod_name: string;
}

interface DataWiseList {
  prod_name: string;
  salrd_invoice_no: string;
  salrd_return_qty: string;
  salrd_price: string;
  salrd_total_price: string;
  created_at: string;
}

export default function SaleReturnReport() {
  const {openDrawer} = useDrawer();
  const [prodOpen, setProdOpen] = useState(false);
  const [prodValue, setProdValue] = useState('');
  const [prodDropdown, setProdDropdown] = useState<ProductDropdown[]>([]);
  const transformedProd = prodDropdown.map(prod => ({
    label: prod.prod_name,
    value: prod.id.toString(),
  }));
  const [dataWiseList, setDataWiseList] = useState<DataWiseList[]>([]);
  const [prodWiseList, setProdWiseList] = useState<DataWiseList[]>([]);
  const [selectionMode, setSelectionMode] = useState<
    'allemployees' | 'singleemployee' | ''
  >('allemployees');
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

  // Product Dropdown
  const fetchProdDropdown = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetchproductsdropdown`);
      setProdDropdown(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Data Wise Sales Return
  const fetchDataSaleReturn = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchsalereturn`, {
        from,
        to,
        product: prodValue,
      });
      setDataWiseList(res.data.sales_return);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Data Wise Total Return
  const calculateDataWiseTotal = () => {
    let totalReturn = 0;
    let totalReturnQty = 0;

    dataWiseList.forEach(data => {
      const returnAmount = parseFloat(data.salrd_total_price) || 0;
      const qty = parseFloat(data.salrd_return_qty) || 0;

      totalReturn += returnAmount;
      totalReturnQty += qty;
    });

    return {
      totalReturn: totalReturn.toFixed(2),
      totalReturnQty: totalReturnQty.toFixed(0),
    };
  };

  // Fetch Product Wise Sales Return
  const fetchProductSaleReturn = async () => {
    try {
      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/fetchprodsalereturn`, {
        from,
        to,
        product: prodValue,
      });
      setProdWiseList(res.data.sales_return);
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Product Wise Total Return
  const calculateProductWiseTotal = () => {
    let totalReturn = 0;
    let totalReturnQty = 0;

    prodWiseList.forEach(data => {
      const returnAmount = parseFloat(data.salrd_total_price) || 0;
      const qty = parseFloat(data.salrd_return_qty) || 0;

      totalReturn += returnAmount;
      totalReturnQty += qty;
    });

    return {
      totalReturn: totalReturn.toFixed(2),
      totalReturnQty: totalReturnQty.toFixed(0),
    };
  };

  useEffect(() => {
    fetchProdDropdown();
    fetchDataSaleReturn();
    fetchProductSaleReturn();
  }, [startDate, endDate, prodValue]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/screen.jpg')}
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
              source={require('../../../../assets/menu.png')}
              style={{width: 30, height: 30, tintColor: 'white'}}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>
              Sale Return Report
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
                source={require('../../../../assets/calendar.png')}
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
                source={require('../../../../assets/calendar.png')}
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

        <View style={[styles.dropDownContainer, {marginTop: 10}]}>
          <DropDownPicker
            items={transformedProd}
            open={prodOpen}
            setOpen={setProdOpen}
            value={prodValue}
            setValue={setProdValue}
            placeholder="Select Product"
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
            style={[styles.dropdown, {zIndex: 999}]}
            dropDownContainerStyle={{
              backgroundColor: 'white',
              borderColor: '#144272',
              width: '100%',
              marginTop: 8,
            }}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
          />
        </View>

        <View style={[styles.row]}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              setSelectionMode('allemployees');
              setProdValue('');
            }}>
            <RadioButton
              value="allemployees"
              status={
                selectionMode === 'allemployees' ? 'checked' : 'unchecked'
              }
              color="white"
              uncheckedColor="white"
              onPress={() => {
                setSelectionMode('allemployees');
                setProdValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Data Wise Return
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              setSelectionMode('singleemployee');
              setProdValue('');
            }}>
            <RadioButton
              value="singleemployee"
              color="white"
              uncheckedColor="white"
              status={
                selectionMode === 'singleemployee' ? 'checked' : 'unchecked'
              }
              onPress={() => {
                setSelectionMode('singleemployee');
                setProdValue('');
              }}
            />
            <Text
              style={{
                color: 'white',
              }}>
              Product Wise Report
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={selectionMode === 'allemployees' ? dataWiseList : prodWiseList}
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
                    {item.salrd_invoice_no}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Return Date:</Text>
                    <Text style={styles.text}>
                      {new Date(item.created_at)
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
                    <Text style={styles.text}>Product:</Text>
                    <Text style={styles.text}>{item.prod_name}</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>QTY:</Text>
                    <Text style={styles.text}>{item.salrd_return_qty}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}>
                    <Text style={styles.text}>Price:</Text>
                    <Text style={styles.text}>{item.salrd_price}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}>
                    <Text style={styles.text}>Total Price:</Text>
                    <Text style={styles.text}>{item.salrd_total_price}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View
              style={{
                height: 200,
                width: '100%',
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>
                No record found.
              </Text>
            </View>
          }
        />

        {selectionMode === 'allemployees' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{dataWiseList.length}</Text>
            </View>
            {(() => {
              const {totalReturn, totalReturnQty} = calculateDataWiseTotal();

              return (
                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Return QTY: </Text>
                    <Text style={styles.totalText}>{totalReturnQty}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Return: </Text>
                    <Text style={styles.totalText}>{totalReturn}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}
        {selectionMode === 'singleemployee' && (
          <View style={styles.totalContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.totalText}>Total Records:</Text>
              <Text style={styles.totalText}>{prodWiseList.length}</Text>
            </View>
            {(() => {
              const {totalReturn, totalReturnQty} = calculateProductWiseTotal();

              return (
                <View
                  style={{
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Return QTY: </Text>
                    <Text style={styles.totalText}>{totalReturnQty}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.totalText}>Total Return: </Text>
                    <Text style={styles.totalText}>{totalReturn}</Text>
                  </View>
                </View>
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
    paddingHorizontal: 15,
    paddingVertical: 20,
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
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-around',
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
