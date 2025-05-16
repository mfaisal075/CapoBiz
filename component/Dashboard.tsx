import {
  StyleSheet,
  Text,
  SafeAreaView,
  ImageBackground,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ScrollView} from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import {useDrawer} from './DrawerContext';

export default function Dashboard() {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const {openDrawer} = useDrawer();

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <ScrollView
          style={{
            marginBottom: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity onPress={openDrawer}>
              <Image
                source={require('../assets/menu.png')}
                style={{
                  width: 40,
                  height: 40,
                  tintColor: 'white',
                  marginLeft: 5,
                }}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: 'white',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              CapoBiz
            </Text>
            <TouchableOpacity onPress={toggleModal}>
              <Image
                source={require('../assets/user.png')}
                style={{
                  width: 30,
                  height: 30,
                  tintColor: 'white',
                  marginRight: 5,
                }}
              />
            </TouchableOpacity>
          </View>
          {/*cards*/}

          <View style={styles.card}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
              }}>
              <Image
                style={{
                  width: 50,
                  height: 50,
                  tintColor: 'white',
                  alignSelf: 'center',
                  marginRight: 10,
                  marginLeft: 10,
                }}
                source={require('../assets/customer.png')}
              />
              <View>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  Customers
                </Text>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                  12
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.card}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
              }}>
              <Image
                style={{
                  width: 50,
                  height: 50,
                  tintColor: 'white',
                  alignSelf: 'center',
                  marginRight: 10,
                  marginLeft: 10,
                }}
                source={require('../assets/product.png')}
              />
              <View>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  Products
                </Text>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                  20
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
              }}>
              <Image
                style={{
                  width: 50,
                  height: 50,
                  tintColor: 'white',
                  alignSelf: 'center',
                  marginRight: 5,
                  marginLeft: 5,
                }}
                source={require('../assets/sale.png')}
              />
              <View>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  Sale Invoices
                </Text>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                  40
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
              }}>
              <Image
                style={{
                  width: 50,
                  height: 50,
                  tintColor: 'white',
                  alignSelf: 'center',
                  marginRight: 10,
                  marginLeft: 10,
                }}
                source={require('../assets/purchase.png')}
              />
              <View>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  Purchases
                </Text>
                <Text
                  style={{
                    marginRight: 40,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}>
                  70
                </Text>
              </View>
            </View>
          </View>

          {/*graphs*/}
          <View style={styles.graph}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                marginTop: 20,
                color: 'white',
                fontWeight: 'bold',
              }}>
              Monthly Sale Report
            </Text>
            <Image
              style={{
                width: 270,
                height: 180,
                marginTop: 20,
                alignSelf: 'center',
              }}
              source={require('../assets/barchart.png')}
            />
          </View>

          <View style={styles.graph}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                marginTop: 20,
                color: 'white',
                fontWeight: 'bold',
              }}>
              Purchase Report
            </Text>
            <Image
              style={{
                width: 270,
                height: 180,
                marginTop: 20,
                alignSelf: 'center',
              }}
              source={require('../assets/barchart.png')}
            />
          </View>
        </ScrollView>
      </ImageBackground>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        backdropOpacity={0.3}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={{margin: 0, position: 'absolute', top: '8%', right: 10}}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            width: 250,
            padding: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
            }}>
            <Image
              style={{
                width: 45,
                height: 45,
                marginRight: 10,

                tintColor: '#144272',
              }}
              source={require('../assets/user.png')}
            />

            <View
              style={{
                marginTop: 2,
              }}>
              <Text
                style={{
                  color: '#144272',
                  fontWeight: 'bold',
                }}>
                Admin
              </Text>
              <Text
                style={{
                  color: '#144272',
                }}>
                pos@technicmentors.com
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}>
            <View
              style={{
                backgroundColor: '#144272',
                width: '95%',
                alignSelf: 'center',
                marginTop: 10,
                borderRadius: 5,
                height: 25,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginTop: 2,
                }}>
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
  card: {
    width: '93%',
    height: 80,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 5,
  },
  graph: {
    width: '93%',
    height: 250,
    alignSelf: 'center',
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  menuItem: {
    fontSize: 16,
    color: '#144272',
    marginVertical: 8,
    fontWeight: '600',
    marginHorizontal: 25,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#144272',
  },
  menuModal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContent: {
    width: 260,
    flex: 1,
    backgroundColor: 'white',
  },
});
