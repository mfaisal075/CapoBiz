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
import React from 'react';
import {useDrawer} from '../../../DrawerContext';

export default function EmployeeList() {
  const {openDrawer} = useDrawer();
  const Info = [
    {
      sr: '1',
      Employee: 'abc',
      Type: 'Worker',
      Address: 'Daska',
      Contact: '098765',
      Email: '@gmail.com',
    },
    {
      sr: '2',
      Employee: 'abc',
      Type: 'Worker',
      Address: 'Daska',
      Contact: '098765',
      Email: '@gmail.com',
    },
    {
      sr: '3',
      Employee: 'abc',
      Type: 'Worker',
      Address: 'Daska',
      Contact: '098765',
      Email: '@gmail.com',
    },
  ];

  const totalEmployee = Info.length;

  console.log('Total Employees:', totalEmployee);

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
              Employee List
            </Text>
          </View>
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
                          color: '#144272',
                          fontWeight: 'bold',
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        {item.Employee}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}></View>
                    </View>

                    <View style={styles.infoRow}>
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
                        }}>
                        <Text style={styles.text}>Contact:</Text>
                        <Text style={styles.text}>{item.Contact}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          Email:
                        </Text>
                        <Text style={[styles.value, {marginBottom: 5}]}>
                          {item.Email}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={[
                            styles.value,
                            {marginBottom: 5, marginTop: -5},
                          ]}>
                          Address:
                        </Text>
                        <Text
                          style={[
                            styles.value,
                            {marginBottom: 5, marginTop: -5},
                          ]}>
                          {item.Address}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            />
          </View>
        </ScrollView>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Employees:</Text>
          <Text style={styles.totalText}>{totalEmployee}</Text>
        </View>
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

  totalContainer: {
    padding: 7,
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
});
