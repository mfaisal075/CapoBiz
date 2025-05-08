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
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import Modal from 'react-native-modal';
import {RadioButton} from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function CustomerPeople() {
  const Information = [
    {
      Name: 'Kunafa Bar',
      Barcode: '1',
      Category: '34',
      Cost: '89',
      RetailPrice: '56',
      Quantity: '00',
      Expiry: '790',
    },
  ];

  {
    /*view modal*/
  }
  const ViewModal = [
    {
      ProductName: 'Kunafa Bar',
      SecondName: null,
      UPC_EAN: '836256',
      ExpiryDate: '2025-06-15',
      Reorder: 'abc',
      Category: 'Chocolate',
      UOM: 'Box',
      SubUOM: 'Pieces',
      MasterUOM: 'Box',
      SubtoMasterUOMEquivalent: 10,
      SubUOMPrice: 599.0,
      ManageStock: 'Y',
      OpeningQuantity: 6503,
      CostPrice: 500.0,
      RetailPrice: 599.0,
      'Discount(%)': 0.0,
      FinalPrice: 599.0,
      SupplierName: 'abc',
      CustomerPicture: null,
    },
  ];

  const [view, setview] = useState(false);

  const toggleview = () => {
    setview(!view);
  };

  const [isModalV, setModalV] = useState(false);
  const tglModal = () => {
    setModalV(!isModalV);
  };

  const {openDrawer} = useDrawer();

  const [addproduct, setaddproduct] = useState(false);

  const toggleproduct = () => {
    setaddproduct(!addproduct);
  };
  const [Type, setType] = React.useState<'GenerateAutoBarCode' | 'number'>(
    'GenerateAutoBarCode',
  );

  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };
  const [category, setcategory] = useState(false);
  const [currentcategory, setCurrentcategory] = useState<string | null>('');
  const categoryItem = [
    {
      label: 'Chocolate',
      value: 'Chocolate',
    },
    {label: 'Jelly', value: 'Jelly'},
    {label: 'Oil', value: 'Oil'},
    {label: 'Flour', value: 'Flour'},
  ];

  const [uom, setuom] = useState(false);
  const [currentuom, setCurrentuom] = useState<string | null>('');
  const uomItem = [
    {
      label: 'Pieces',
      value: 'Pieces',
    },
    {label: 'Kg', value: 'Kg'},
    {label: 'Box', value: 'Box'},
    {label: 'Inches', value: 'Inches'},
  ];
  const [stock, setstock] = React.useState<'managestock' | 'number'>(
    'managestock',
  );

  const [expire, setexpire] = React.useState<'applyexpiry' | 'number'>(
    'applyexpiry',
  );

  const [supplier, setsupplier] = React.useState<'supplier' | 'number'>(
    'supplier',
  );

  const [issupplier, setissupplier] = useState(false);
  const [currentsupplier, setCurrentsupplier] = useState<string | null>('');
  const supplierItem = [{label: '', value: ''}];

  const [subuom, setsubuom] = React.useState<'subuom' | 'number'>('subuom');
  const [issubuom, setissubuom] = useState(false);
  const [currentsub, setCurrentsub] = useState<string | null>('');
  const subuomItem = [
    {
      label: 'Pieces',
      value: 'Pieces',
    },
    {label: 'Kg', value: 'Kg'},
    {label: 'Box', value: 'Box'},
    {label: 'Inches', value: 'Inches'},
  ];

  const [btnproduct, setbtnproduct] = useState(false);

  const togglebtnproduct = () => {
    setbtnproduct(!btnproduct);
  };

  const [addcategory, setaddcategory] = useState(false);

  const toggleaddcategory = () => {
    setaddcategory(!addcategory);
  };

  const [btncategory, setbtncategory] = useState(false);

  const togglebtncategory = () => {
    setbtncategory(!btncategory);
  };

  const [adduom, setadduom] = useState(false);

  const toggleadduom = () => {
    setadduom(!adduom);
  };

  const [btnuom, setbtnuom] = useState(false);

  const togglebtnuom = () => {
    setbtnuom(!btnuom);
  };

  {
    /*edit*/
  }

  const [editproduct, seteditproduct] = useState(false);

  const toggleeditproduct = () => {
    seteditproduct(!editproduct);
  };

  const [editType, seteditType] = React.useState<
    'GenerateAutoBarCode' | 'number'
  >('GenerateAutoBarCode');

  const [editstock, seteditstock] = React.useState<'managestock' | 'number'>(
    'managestock',
  );

  const [editexpire, seteditexpire] = React.useState<'applyexpiry' | 'number'>(
    'applyexpiry',
  );

  const [editsupplier, seteditsupplier] = React.useState<'supplier' | 'number'>(
    'supplier',
  );

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const [editsubuom, seteditsubuom] = React.useState<'subuom' | 'number'>(
    'subuom',
  );

  const [editcategory, seteditcategory] = useState(false);
  const [currenteditcategory, seteditCurrentcategory] = useState<string | null>(
    '',
  );
  const editcategoryItem = [
    {
      label: 'Chocolate',
      value: 'Chocolate',
    },
    {label: 'Jelly', value: 'Jelly'},
    {label: 'Oil', value: 'Oil'},
    {label: 'Flour', value: 'Flour'},
  ];

  const [edit, setedit] = useState(false);

  const toggleeditcategory = () => {
    setedit(!edit);
  };

  const [editbtncategory, seteditbtncategory] = useState(false);

  const toggleeditbtncategory = () => {
    seteditbtncategory(!editbtncategory);
  };

  const [edituom, setedituom] = useState(false);
  const [editcurrentuom, seteditCurrentuom] = useState<string | null>('');
  const edituomItem = [
    {
      label: 'Pieces',
      value: 'Pieces',
    },
    {label: 'Kg', value: 'Kg'},
    {label: 'Box', value: 'Box'},
    {label: 'Inches', value: 'Inches'},
  ];

  const [uomd, setuomd] = useState(false);

  const toggleedituom = () => {
    setuomd(!uomd);
  };

  const [btnedituom, setbtnedituom] = useState(false);

  const togglebtnedituom = () => {
    setbtnedituom(!btnedituom);
  };

  const [iseditsupplier, setiseditsupplier] = useState(false);
  const [currenteditsupplier, setCurrenteditsupplier] = useState<string | null>(
    '',
  );
  const editsupplierItem = [{label: '', value: ''}];

  const [iseditsubuom, setiseditsubuom] = useState(false);
  const [currenteditsub, setCurrenteditsub] = useState<string | null>('');
  const editsubuomItem = [
    {
      label: 'Pieces',
      value: 'Pieces',
    },
    {label: 'Kg', value: 'Kg'},
    {label: 'Box', value: 'Box'},
    {label: 'Inches', value: 'Inches'},
  ];

  const [btneditproduct, setbtneditproduct] = useState(false);

  const togglebtneditproduct = () => {
    setbtneditproduct(!btneditproduct);
  };
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
              Products
            </Text>
          </View>
          <TouchableOpacity onPress={toggleproduct}>
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

        <ScrollView>
          <View>
            <FlatList
              data={Information}
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
                        {item.Name}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <TouchableOpacity onPress={toggleview}>
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
                        <TouchableOpacity onPress={toggleeditproduct}>
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

                        <TouchableOpacity onPress={tglModal}>
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
                        <Text style={styles.text}>
                          Barcode:
                        </Text>
                        <Text style={styles.text}>
                         {item.Barcode}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>
                          Category:
                      
                        </Text>
                        <Text style={styles.text}>
                      
                          {item.Category}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>Cost:
                          
                        </Text>
                        <Text style={styles.text}>{item.Cost}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>
                          Retail Price:
                         
                        </Text>
                        <Text style={styles.text}>
                      {item.RetailPrice}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={styles.text}>
                          Quantity:
                     
                        </Text>
                        <Text style={styles.text}>
                      
                          {item.Quantity}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Expiry :
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                       {item.Expiry}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </ScrollView>

        {/*delete*/}
        <Modal isVisible={isModalV}>
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
              <TouchableOpacity onPress={() => setModalV(!isModalV)}>
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

              <TouchableOpacity>
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

        {/*view modal*/}
        <Modal isVisible={view}>
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
                Product's Detail
              </Text>
              <TouchableOpacity onPress={() => setview(!view)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View>
              <View>
                <FlatList
                  data={ViewModal}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <ScrollView
                      style={{
                        padding: 5,
                      }}>
                      <View style={styles.table}>
                        <View style={[styles.cardContainer]}>
                          <View
                            style={{alignItems: 'center', marginBottom: 16}}>
                            {item.CustomerPicture ? (
                              <Image
                                source={{uri: item.CustomerPicture}}
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
                            <Text style={styles.labl}>Product Name:</Text>
                            <Text style={styles.valu}>{item.ProductName}</Text>
                            <Text style={styles.labl}>Second Name:</Text>
                            <Text style={styles.valu}>
                              {item.SecondName ?? 'N/A'}
                            </Text>
                            <Text style={styles.labl}>UPC_EAN:</Text>
                            <Text style={styles.valu}>{item.UPC_EAN}</Text>
                            <Text style={styles.labl}>Expiry Date:</Text>
                            <Text style={styles.valu}>{item.ExpiryDate}</Text>
                            <Text style={styles.labl}>Reorder:</Text>
                            <Text style={styles.valu}>{item.Reorder}</Text>
                            <Text style={styles.labl}>Category:</Text>
                            <Text style={styles.valu}>
                              {item.Category ?? 'N/A'}
                            </Text>
                            <Text style={styles.labl}>UOM:</Text>
                            <Text style={styles.valu}>{item.UOM ?? 'N/A'}</Text>
                            <Text style={styles.labl}>Sub UOM:</Text>
                            <Text style={styles.valu}>
                              {item.SubUOM ?? 'N/A'}
                            </Text>
                            <Text style={styles.labl}>Master UOM:</Text>
                            <Text style={styles.valu}>
                              {item.MasterUOM ?? 'N/A'}
                            </Text>
                            <Text style={styles.labl}>
                              Sub To Master UOM Equivalent:
                            </Text>
                            <Text style={styles.valu}>
                              {item.SubtoMasterUOMEquivalent}
                            </Text>
                            <Text style={styles.labl}>Sub UOM Price:</Text>
                            <Text style={styles.valu}>{item.SubUOMPrice}</Text>
                            <Text style={styles.labl}>Manage Stock:</Text>
                            <Text style={styles.valu}>{item.ManageStock}</Text>
                            <Text style={styles.labl}>Opening Quantity:</Text>
                            <Text style={styles.valu}>
                              {item.OpeningQuantity}
                            </Text>
                            p<Text style={styles.labl}>Cost Price:</Text>
                            <Text style={styles.valu}>
                              {item.CostPrice ?? 'N/A'}
                            </Text>
                            <Text style={styles.labl}>Retail Price:</Text>
                            <Text style={styles.valu}>
                              {item.RetailPrice ?? 'N/A'}
                            </Text>
                            <Text style={styles.labl}>Discount(%):</Text>
                            <Text style={styles.valu}>
                              {item['Discount(%)'] ?? 'N/A'}
                            </Text>
                            <Text style={styles.labl}>Final Price:</Text>
                            <Text style={styles.valu}>{item.FinalPrice}</Text>
                            <Text style={styles.labl}>Supplier Name:</Text>
                            <Text style={styles.valu}>{item.SupplierName}</Text>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  )}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/*Add Product*/}
        <Modal isVisible={addproduct}>
          <ScrollView
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
                Add New Product
              </Text>
              <TouchableOpacity onPress={() => setaddproduct(!addproduct)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Product Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Second Name"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="GenerateAutoBarCode"
                status={
                  Type === 'GenerateAutoBarCode' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setType('GenerateAutoBarCode')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Generate Auto BarCode
              </Text>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="applyexpiry"
                status={expire === 'applyexpiry' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setexpire('applyexpiry')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Apply Expiry
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  width: 168,
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                  borderRadius: 5,
                  borderColor: '#144272',
                  marginLeft: hp('2%'),
                  height: 30,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: '#144272',
                  }}>
                  <Text style={{marginLeft: 10, color: '#144272'}}>
                    {`${startDate.toLocaleDateString()}`}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}>
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'stretch',
                        alignItems: 'center',
                        marginLeft: 60,
                        tintColor: '#144272',
                      }}
                      source={require('../../../assets/calendar.png')}
                    />
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
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={categoryItem}
                open={category}
                setOpen={setcategory}
                value={currentcategory}
                setValue={setCurrentcategory}
                placeholder="Select Category"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={toggleaddcategory}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={uomItem}
                open={uom}
                setOpen={setuom}
                value={currentuom}
                setValue={setCurrentuom}
                placeholder="Select UOM"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[styles.dropdown, {borderColor: '#144272', 
                  width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={toggleadduom}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.row,
                {marginLeft: 10, marginRight: 10, marginTop: -8},
              ]}>
              <RadioButton
                value="managestock"
                status={stock === 'managestock' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setstock('managestock')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Don't Manage Stock
              </Text>
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Opening Quantity"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Re Order Level"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Cost Price"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Retail Price"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Discount"
              />
              <Text style={[styles.productinput, {color: '#144272'}]}>
                Final Price:000
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="supplier"
                status={supplier === 'supplier' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => setsupplier('supplier')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Enable Supplier
              </Text>

              <DropDownPicker
                items={supplierItem}
                open={issupplier}
                setOpen={setissupplier}
                value={currentsupplier}
                setValue={setCurrentsupplier}
                placeholder="Select"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: 140,
                    marginLeft: 18,
                    marginTop: 1,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 140,marginLeft:18
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
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
                      marginLeft: 18,
                      marginRight: 10,
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
              <View style={[styles.row, {marginLeft: 11, marginRight: 10}]}>
                <RadioButton
                  value="subuom"
                  status={subuom === 'subuom' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => setsubuom('subuom')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -10,
                  }}>
                  Have Sub UOM?
                </Text>
              </View>
            </View>

            <DropDownPicker
              items={subuomItem}
              open={issubuom}
              setOpen={setissubuom}
              value={currentsub}
              setValue={setCurrentsub}
              placeholder="Select Sub UOM"
              placeholderStyle={{color: '#144272'}}
              textStyle={{color: '#144272'}}
              arrowIconStyle={{tintColor: '#144272'}}
              style={[
                styles.dropdown,
                {
                  borderColor: '#144272',
                  width: 295,
                  alignSelf: 'center',
                },
              ]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 295,marginLeft:11
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
            />
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <Text
                style={[
                  styles.productinput,
                  {color: '#144272', marginBottom: 8},
                ]}>
                Master UOM:
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Equivalence"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Sale Price"
              />
            </View>
            <TouchableOpacity onPress={togglebtnproduct}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 290,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignSelf:'center'
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Product
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*add product btn*/}
        <Modal isVisible={btnproduct}>
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
              Product has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnproduct(!btnproduct)}>
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

        {/*add category modal*/}
        <Modal isVisible={addcategory}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
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
                Add New Category
              </Text>
              <TouchableOpacity onPress={() => setaddcategory(!addcategory)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="Category Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtncategory}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Category
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/*Add btn category*/}
        <Modal isVisible={btncategory}>
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
              Category has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtncategory(!btncategory)}>
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

        <Modal isVisible={adduom}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
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
                Add New UOM
              </Text>
              <TouchableOpacity onPress={() => setadduom(!adduom)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="UOM Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtnuom}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add UOM
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/*Add btn uom*/}
        <Modal isVisible={btnuom}>
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
              UOM has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnuom(!btnuom)}>
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

        {/*edit product*/}
        <Modal isVisible={editproduct}>
          <ScrollView
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
                Update Product
              </Text>
              <TouchableOpacity onPress={() => seteditproduct(!editproduct)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Product Name"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Second Name"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="GenerateAutoBarCode"
                status={
                  editType === 'GenerateAutoBarCode' ? 'checked' : 'unchecked'
                }
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => seteditType('GenerateAutoBarCode')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Generate Auto BarCode
              </Text>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="applyexpiry"
                status={editexpire === 'applyexpiry' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => seteditexpire('applyexpiry')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Apply Expiry
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  width: 165,
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                  borderRadius: 5,
                  borderColor: '#144272',
                  marginLeft: hp('2%'),
                  height: 30,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 5,
                    borderColor: '#144272',
                  }}>
                  <Text style={{marginLeft: 10, color: '#144272'}}>
                    {`${date.toLocaleDateString()}`}
                  </Text>

                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Image
                      style={{
                        height: 20,
                        width: 20,
                        resizeMode: 'stretch',
                        alignItems: 'center',
                        marginLeft: 60,
                        tintColor: '#144272',
                      }}
                      source={require('../../../assets/calendar.png')}
                    />
                    {showDatePicker && (
                      <DateTimePicker
                        testID="DatePicker"
                        value={date}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={editcategoryItem}
                open={editcategory}
                setOpen={seteditcategory}
                value={currenteditcategory}
                setValue={seteditCurrentcategory}
                placeholder="Select Category"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={toggleeditcategory}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
              }}>
              <DropDownPicker
                items={edituomItem}
                open={edituom}
                setOpen={setedituom}
                value={editcurrentuom}
                setValue={seteditCurrentuom}
                placeholder="Select UOM"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[styles.dropdown, {borderColor: '#144272', width: 265}]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 265,
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
              <TouchableOpacity onPress={toggleedituom}>
                <Image
                  style={{
                    tintColor: '#144272',
                    width: 22,
                    height: 17,
                    alignSelf: 'center',
                    marginLeft: -26,
                    marginTop: 17,
                  }}
                  source={require('../../../assets/add.png')}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.row,
                {marginLeft: 10, marginRight: 10, marginTop: -8},
              ]}>
              <RadioButton
                value="managestock"
                status={editstock === 'managestock' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => seteditstock('managestock')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Don't Manage Stock
              </Text>
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Opening Quantity"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Re Order Level"
              />
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Cost Price"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Retail Price"
              />
            </View>
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Discount"
              />
              <Text style={[styles.productinput, {color: '#144272'}]}>
                Final Price:000
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 7, marginRight: 10}]}>
              <RadioButton
                value="supplier"
                status={editsupplier === 'supplier' ? 'checked' : 'unchecked'}
                color="#144272"
                uncheckedColor="#144272"
                onPress={() => seteditsupplier('supplier')}
              />
              <Text
                style={{
                  color: '#144272',
                  marginTop: 7,
                  marginLeft: -10,
                }}>
                Enable Supplier
              </Text>

              <DropDownPicker
                items={editsupplierItem}
                open={iseditsupplier}
                setOpen={setiseditsupplier}
                value={currenteditsupplier}
                setValue={setCurrenteditsupplier}
                placeholder="Select"
                placeholderStyle={{color: '#144272'}}
                textStyle={{color: '#144272'}}
                arrowIconStyle={{tintColor: '#144272'}}
                style={[
                  styles.dropdown,
                  {
                    borderColor: '#144272',
                    width: 140,
                    marginLeft: 18,
                    marginTop: 1,
                  },
                ]}
                dropDownContainerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#144272',
                  width: 140,marginLeft:18
                }}
                labelStyle={{color: '#144272'}}
                listItemLabelStyle={{color: '#144272'}}
              />
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
                      marginLeft: 17,
                      marginRight: 10,
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
              <View style={[styles.row, {marginLeft: 13, marginRight: 10}]}>
                <RadioButton
                  value="subuom"
                  status={editsubuom === 'subuom' ? 'checked' : 'unchecked'}
                  color="#144272"
                  uncheckedColor="#144272"
                  onPress={() => seteditsubuom('subuom')}
                />
                <Text
                  style={{
                    color: '#144272',
                    marginTop: 7,
                    marginLeft: -10,
                  }}>
                  Have Sub UOM?
                </Text>
              </View>
            </View>

            <DropDownPicker
              items={editsubuomItem}
              open={iseditsubuom}
              setOpen={setiseditsubuom}
              value={currenteditsub}
              setValue={setCurrenteditsub}
              placeholder="Select Sub UOM"
              placeholderStyle={{color: '#144272'}}
              textStyle={{color: '#144272'}}
              arrowIconStyle={{tintColor: '#144272'}}
              style={[
                styles.dropdown,
                {
                  borderColor: '#144272',
                  width: 290,
                  alignSelf: 'center',
                },
              ]}
              dropDownContainerStyle={{
                backgroundColor: 'white',
                borderColor: '#144272',
                width: 290,marginLeft:14,
              }}
              labelStyle={{color: '#144272'}}
              listItemLabelStyle={{color: '#144272'}}
            />
            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <Text
                style={[
                  styles.productinput,
                  {color: '#144272', marginBottom: 8},
                ]}>
                Master UOM:
              </Text>
            </View>

            <View style={[styles.row, {marginLeft: 10, marginRight: 10}]}>
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Equivalence"
              />
              <TextInput
                style={styles.productinput}
                placeholderTextColor={'#144272'}
                placeholder="Sale Price"
              />
            </View>
            <TouchableOpacity onPress={togglebtneditproduct}>
              <View
                style={{
                  backgroundColor: '#144272',
                  height: 30,
                  width: 290,
                  margin: 10,
                  borderRadius: 10,
                  justifyContent: 'center',alignSelf:'center'
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Update Product
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/*add category modal*/}
        <Modal isVisible={edit}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
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
                Add New Category
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
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="Category Name"
              />
            </View>
            <TouchableOpacity onPress={toggleeditbtncategory}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add Category
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        {/*Add btn category*/}
        <Modal isVisible={editbtncategory}>
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
              Category has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => seteditbtncategory(!editbtncategory)}>
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

        {/*uom*/}
        <Modal isVisible={uomd}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              width: 'auto',
              maxHeight: 135,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#144272',
              overflow: 'hidden',
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
                Add New UOM
              </Text>
              <TouchableOpacity onPress={() => setuomd(!uomd)}>
                <Image
                  style={{
                    width: 15,
                    height: 15,
                  }}
                  source={require('../../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.search}
                placeholderTextColor={'#144272'}
                placeholder="UOM Name"
              />
            </View>
            <TouchableOpacity onPress={togglebtnedituom}>
              <View
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#144272',
                  height: 30,
                  borderRadius: 10,
                  width: 100,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Add UOM
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/*Add btn uom*/}
        <Modal isVisible={btnedituom}>
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
              UOM has been added successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setbtnedituom(!btnedituom)}>
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

        {/*edit product btn*/}
        <Modal isVisible={btneditproduct}>
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
              Updated
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Product has been updated successfully
            </Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => setbtneditproduct(!btneditproduct)}>
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
