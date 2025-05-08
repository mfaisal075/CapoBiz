import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  SafeAreaView,
  Image,
  FlatList,
} from 'react-native';
import React,{useState} from 'react';
import {useNavigation} from '@react-navigation/native';


export default function PurchaseAddStockDetails() {

  const navigation = useNavigation();
  const Info = [
    {
        ItemName: 'abc',
        QTY: '1',
        PurchasePrice: '4',
        RetailPrice: '9',
        totalPrice: '200',
        ExpiryDate: '33',
        total: '555',  
    },
    {
        ItemName: 'abc',
        QTY: '1',
        PurchasePrice: '4',
        RetailPrice: '9',
        totalPrice: '200',
        ExpiryDate: '33',
        total: '11',  
    }, 
    
    
  ];
   

  const total = Info.reduce((acc, item) => acc + parseFloat(item.total), 0);

  Info.forEach(item => {
    const qty = parseFloat(item.QTY);
    const purchasePrice = parseFloat(item.PurchasePrice);
    item.total = (qty * purchasePrice).toString();  
  });
  
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
            <TouchableOpacity
              onPress={() => navigation.navigate('Purchase /Add Stock' as never)}>
              <Image
                source={require('../../../assets/backarrow.png')}
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
            Purchase Stock 
              </Text>
            </View>
          </View>

          <View>
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
                          {item.ItemName}
                        </Text>
                        
                        <Image
                          style={{
                            tintColor: '#144272',
                            width: 15,
                            height: 15,
                            alignSelf: 'center',
                            marginRight: 5,
                          }}
                          source={require('../../../assets/show.png')}
                        />
                      </View>

                       <View style={styles.infoRow}>
                                           <View style={styles.rowt}>
                                             <Text style={styles.text}>Quantity:</Text>
                                             <Text style={styles.text}>{item.QTY}</Text>
                                          
                                           </View>
                                           <View style={styles.rowt}>
                                             <Text style={styles.text}>Purchase Price:</Text>
                                             <Text style={styles.text}>
                                               {item.PurchasePrice}
                                             </Text>
                                           
                                           </View>
                                           <View style={styles.rowt}>
                                             <Text style={styles.text}>Retail Price:</Text>
                                             <Text style={styles.text}>{item.RetailPrice}</Text>
                                           
                                           </View>
                                           <View style={styles.rowt}>
                                             <Text style={styles.text}>Total Price:</Text>
                                             <Text style={styles.text}>{item.totalPrice}</Text>
                                             
                                           </View>
                                           <View style={styles.rowt}>
                                             <Text style={[styles.text,{marginBottom:5}]}>Expiry Date:</Text>
                                             <Text style={[styles.text,{marginBottom:5}]}>{item.ExpiryDate}</Text>
                                             
                                           </View>
                                         </View>

                      
                    </View>
                  </ScrollView>
                )}
              />
            </View>
          </View>
          
        </ScrollView>
        <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalText}>{total}</Text>
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
    height: 143,
    width: 314,
    borderRadius: 10,
  },
  tablehead: {
    backgroundColor: 'white',
    height: 30,
    overflow: 'hidden',
    borderTopEndRadius: 10,
    borderTopLeftRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight:5
  },
  value: {
    marginLeft: 5,
    color: 'white',
    marginRight:5
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
    flexDirection:'row',
    justifyContent:'space-between',
    
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
  rowt:{
    flexDirection:'row',
    justifyContent:'space-between'
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
