import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';

type Product = {
  CustomerName: string;
  CNIC: string;
  Contact: number;
  Email: string;
  Type: string;
  Balance: number;
};

type InfoType = {
  [key: string]: Product[];
};

export default function TypeWiseCustomer() {
  const {openDrawer} = useDrawer();
  const [editType, seteditType] = useState(false);
  const [currentedit, setCurrentedit] = useState<string>('Select Category');
  const editItem = [
    {label: 'Select Category', value: 'Select Category'},
    {label: 'New', value: 'New'},
    {label: 'Blue', value: 'Blue'},
    {label: 'Standard', value: 'Standard'},
  ];
  const Info: InfoType = {
    'Select Category': [
      {
        CustomerName: 'string',
        CNIC: 'string',
        Contact: 123,
        Email: '@g',
        Type: 'kkk',
        Balance: 1223,
      },
    ],

    New: [
      {
        CustomerName: 'gujranwala',
        CNIC: 'string',
        Contact: 123,
        Email: '@g',
        Type: 'kkk',
        Balance: 1223,
      },
    ],
    Blue: [
      {
        CustomerName: 'lahore',
        CNIC: 'string',
        Contact: 123,
        Email: '@g',
        Type: 'kkk',
        Balance: 1223,
      },
    ],
    Standard: [
      {
        CustomerName: 'standard',
        CNIC: 'string',
        Contact: 123,
        Email: '@g',
        Type: 'kkk',
        Balance: 1223,
      },
    ],
  };
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
              Type Wise Customer
            </Text>
          </View>
        </View>

        <DropDownPicker
          items={editItem}
          open={editType}
          setOpen={seteditType}
          value={currentedit}
          setValue={setCurrentedit}
          placeholder="Select Customer Type"
          placeholderStyle={{color: 'white'}}
          textStyle={{color: 'white'}}
          arrowIconStyle={{tintColor: 'white'}}
          style={[
            styles.dropdown,
            {
              borderColor: 'white',
              width: 330,
              alignSelf: 'center',
            },
          ]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#144272',
            width: 330,
            alignSelf: 'center',
          }}
          labelStyle={{color: 'white'}}
          listItemLabelStyle={{color: '#144272'}}
        />

        <ScrollView>
          <FlatList
            data={Info[currentedit] || []}
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
                      {item.CustomerName}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>CNIC:</Text>
                      <Text style={styles.text}>{item.CNIC}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Contact:</Text>
                      <Text style={styles.text}>{item.Contact}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Email:</Text>
                      <Text style={styles.text}>{item.Email}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Type:</Text>
                      <Text style={styles.text}>{item.Type}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                      }}>
                      <Text style={styles.text}>Balance:</Text>
                      <Text style={styles.text}>{item.Balance}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </ScrollView>
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
  dropdown: {
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
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
  infoRow: {
    marginTop: 5,
  },
});
