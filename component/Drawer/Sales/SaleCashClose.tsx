import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useDrawer} from '../../DrawerContext';
import React, {useState} from 'react';
import Modal from 'react-native-modal';

export default function SaleCashClose() {
  const {openDrawer} = useDrawer();
  const [btnproduct, setbtnproduct] = useState(false);

  const togglebtnproduct = () => {
    setbtnproduct(!btnproduct);
  };
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
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
              <Text
                style={{
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 'bold',
                }}>
                Cash Close
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>User:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Cash In Hand:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Total Sales:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Total Return:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>
            <View style={styles.inputSmall}>
              <Text style={[{color: 'white'}]}>Closing Amount:</Text>
              <Text style={[{color: 'white'}]}>0000</Text>
            </View>

            <TouchableOpacity onPress={togglebtnproduct}>
              <View
                style={{
                  width: 340,
                  height: 30,
                  backgroundColor: 'white',
                  borderRadius: 15,
                  marginTop: 10,
                  alignSelf: 'center',
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#144272',
                    marginTop: 5,
                  }}>
                  Close
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
              Closed
            </Text>
            <Text
              style={{
                color: '#144272',
                textAlign: 'center',
              }}>
              Cash Close has been closed successfully
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
  section: {
    borderColor: 'white',
    height: 'auto',
    borderRadius: 12,
    elevation: 15,
    marginBottom: -13,
    padding: 10,
    justifyContent: 'center',
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
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  addButton: {
    marginLeft: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 100,
  },
});
