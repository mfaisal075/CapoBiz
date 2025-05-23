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
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import {RadioButton} from 'react-native-paper';

interface EmployeeInfo {
  sr: number;
  invoice: number;
  customer: string;
  date: string;
  orderTable: number;
  discount: number;
  totalAmount: number;
  paid:number;
  balance:number;
  profit: number;
}

interface InfoObject {
  [key: string]: EmployeeInfo[];

  Chocolate: EmployeeInfo[];
  Oil: EmployeeInfo[];
  Flour: EmployeeInfo[];
  Jelly: EmployeeInfo[];
  'Murree Brwerry': EmployeeInfo[];

  'Chilli Milli': EmployeeInfo[];
  Cup: EmployeeInfo[];
  'Flour E': EmployeeInfo[];
  'Pizza Jelly': EmployeeInfo[];
  'Kunafa Bar': EmployeeInfo[];
}

export default function DailySaleReport() {
  const {openDrawer} = useDrawer();

  const Info: InfoObject = {
    saleReport: [
      {
        sr: 1,
        invoice: 7,
        customer: 'abc',
        date: '8-9-6',
        orderTable: 5,
        discount: 8,
        totalAmount: 67,
        paid:5,
        balance:6,
        profit: 9,
      },
    ],
    Chocolate: [],
    Flour: [],
    Jelly: [],
    Oil: [],
    'Murree Brwerry': [],
    'Kunafa Bar': [],
    'Flour E': [],
    'Pizza Jelly': [],
    'Chilli Milli': [],
    Cup: [],
  };

  const [category, setCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('Chocolate');

  const categoryItems = [
    {label: 'Chocolate', value: 'Chocolate'},
    {label: 'Oil', value: 'Oil'},
    {label: 'Flour', value: 'Flour'},
    {label: 'Jelly', value: 'Jelly'},
    {label: 'Murree Brwerry', value: 'Murree Brwerry'},
  ];

  const [product, setProduct] = useState(false);
  const [currentproduct, setCurrentProduct] = useState<string>('Chilli Milli');

  const productItems = [
    {label: 'Chilli Milli', value: 'Chilli Milli'},
    {label: 'Pizza Jelly', value: 'Pizza Jelly'},
    {label: 'Flour E', value: 'Flour E'},
    {label: 'Cup', value: 'Cup'},
    {label: 'Kunafa Bar', value: 'Kunafa Bar'},
  ];

  const [selectionMode, setSelectionMode] = useState<
    'salereport' | 'detailedsalereport' | ''
  >('');

  const totalProducts =
  selectionMode === 'salereport' || selectionMode === 'detailedsalereport'
    ? Object.values(Info).reduce((acc, list) => acc + list.length, 0)
    : currentCategory
      ? Info[currentCategory]?.length || 0
      : 0;

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
             Daily Sale Report
            </Text>
          </View>
        </View>

       

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            marginLeft: 25,
            marginRight: 25,
          }}>
          <View>
            <DropDownPicker
              items={categoryItems}
              open={category}
              setOpen={setCategory}
              value={currentCategory}
              setValue={setCurrentCategory}
              placeholder="Select Category"
              disabled={selectionMode === 'salereport'}
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              arrowIconStyle={{tintColor: 'white'}}
              style={[styles.dropdown, {borderColor: 'white', width: 146}]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 146,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
            />
          </View>

          <View>
            <DropDownPicker
              items={productItems}
              open={product}
              setOpen={setProduct}
              value={currentproduct}
              setValue={setCurrentProduct}
              placeholder="Select Product"
              disabled={selectionMode === 'salereport'}
              placeholderStyle={{color: 'white'}}
              textStyle={{color: 'white'}}
              arrowIconStyle={{tintColor: 'white'}}
              style={[styles.dropdown, {borderColor: 'white', width: 130}]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 130,
              }}
              labelStyle={{color: 'white'}}
              listItemLabelStyle={{color: '#144272'}}
            />
          </View>
        </View>

        <View
          style={[
            styles.row,
            {marginTop: -6, marginLeft: 20, justifyContent: 'space-between'},
          ]}>
          <RadioButton
            value="salereport"
            status={selectionMode === 'salereport' ? 'checked' : 'unchecked'}
            color="white"
            uncheckedColor="white"
            onPress={() => {
              setSelectionMode('salereport');
              setCurrentCategory('Chocolate');
            }}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -45,
              marginRight: 35,
            }}>
            Daily Report
          </Text>
          <RadioButton
            value="detailedsalereport"
            color="white"
            uncheckedColor="white"
            status={
              selectionMode === 'detailedsalereport' ? 'checked' : 'unchecked'
            }
            onPress={() => {
              setSelectionMode('detailedsalereport');
              setCurrentCategory('Chilli Milli');
            }}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 7,
              marginLeft: -40,
              marginRight: 27,
            }}>
            Detailed Report
          </Text>
        </View>

        <ScrollView>
          {selectionMode === 'salereport' && (
            <FlatList
              data={Object.values(Info).flat()}
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
                        {item.customer}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      {/*  Sale Report */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Invoice:</Text>
                        <Text style={styles.text}>{item.invoice}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Date:</Text>
                        <Text style={styles.text}>{item.date}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Order Table:</Text>
                        <Text style={styles.text}>{item.orderTable}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Discount:</Text>
                        <Text style={styles.text}>{item.discount}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Total Amount:</Text>
                        <Text style={styles.text}>{item.totalAmount}</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                     
                        }}>
                        <Text style={styles.text}>Paid:</Text>
                        <Text style={styles.text}>{item.paid}</Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                         
                        }}>
                        <Text style={styles.text}>Balance:</Text>
                        <Text style={styles.text}>{item.balance}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={styles.text}>Profit:</Text>
                        <Text style={styles.text}>{item.profit}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          {/* Detailed Report data */}
          {selectionMode === 'detailedsalereport' && currentCategory && (
            <FlatList
              data={Info[currentCategory] || []}
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
                        {item.customer}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Invoice:</Text>
                        <Text style={styles.text}>{item.invoice}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Date:</Text>
                        <Text style={styles.text}>{item.date}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </ScrollView>

        {(selectionMode === 'salereport' && Object.values(Info).flat().length > 0) ||
(selectionMode === 'detailedsalereport' && Info[currentCategory]?.length > 0) ? (
  <>
    <View style={styles.totalContainer}>
      <Text style={styles.totalText}>Total Records: {totalProducts}</Text>
      <Text style={styles.totalText}>Total Sales: 8</Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 3 }}>
      <Text style={styles.totalText}>Total Sale Profit: {totalProducts}</Text>
      <Text style={styles.totalText}>Total Cash Received: {totalProducts}</Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 3 }}>
      <Text style={styles.totalText}>Total Credit Sale:</Text>
      <Text style={styles.totalText}>{totalProducts}</Text>
    </View>
  </>
) : null}


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
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: 285,
  },
  totalContainer: {
    padding: 3,
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
