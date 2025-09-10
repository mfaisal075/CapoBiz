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
import React, {useEffect, useState} from 'react';
import {useDrawer} from '../../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BASE_URL from '../../../BASE_URL';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useUser} from '../../../CTX/UserContext';

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
  const {token} = useUser();
  const {openDrawer} = useDrawer();
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [areaDropdown, setAreaDropdown] = useState<AreaDropDown[]>([]);
  const transformedLabArea = areaDropdown.map(area => ({
    label: area.area_name,
    value: area.id.toString(),
  }));
  const [areaList, setAreaList] = useState<AreaList[]>([]);

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
              Area Wise Customer
            </Text>
          </View>
        </View>

        <DropDownPicker
          items={transformedLabArea}
          open={areaOpen}
          setOpen={setAreaOpen}
          value={areaValue}
          setValue={setAreaValue}
          placeholder="Select Customer Area"
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
          style={[styles.dropdown]}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: 'white',
            width: '90%',
            marginTop: 8,
            alignSelf: 'center',
          }}
          labelStyle={{color: 'white', fontWeight: 'bold'}}
          listItemLabelStyle={{color: '#144272'}}
          listMode="SCROLLVIEW"
        />

        <ScrollView>
          <FlatList
            data={areaList}
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
                      {item.cust_name}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>CNIC:</Text>
                      <Text style={styles.text}>{item.cust_cnic}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Contact:</Text>
                      <Text style={styles.text}>{item.cust_contact}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Email:</Text>
                      <Text style={styles.text}>{item.cust_email}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Area:</Text>
                      <Text style={styles.text}>{item.area_name}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 20}}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  No record found.
                </Text>
              </View>
            }
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
    minHeight: 39,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
    backgroundColor: 'transparent',
    width: '90%',
    alignSelf: 'center',
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
