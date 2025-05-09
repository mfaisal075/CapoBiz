import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import React, {useState} from 'react';
import {useDrawer} from '../../DrawerContext';
import RadioForm from 'react-native-simple-radio-button';
import DropDownPicker from 'react-native-dropdown-picker';

type TabType = 'receivables' | 'payables' | 'balances';

type CustomerData = {
  id: string;
  CustomerBalance?: number;
  Contact1?: number;
  Contact2?: number;
  Contact3?: number;
  Address?: string;

  TotalBillAmount?: number;
  Paidamount?: number;
  Balance?: number;
};

const customers = [
  'Naeem s/o NILL',
  'walk_in_customer s/o Nill | NILL',
  'Khalid s/o | NILL',
  'a s/o | NILL',
  'Asif Ali Zardari s/o NILL',
];

const areas = ['Gujranwala', 'Lahore'];

const mockData: Record<TabType, {all: CustomerData[]; single: CustomerData[]}> =
  {
    receivables: {
      all: [
        {
          id: '1',
          CustomerBalance: 33,
          Contact1: 1200,
          Contact2: 3,
          Contact3: 8,
          Address: 'hhh',
        },
      ],
      single: [{id: '1', TotalBillAmount: 23, Paidamount: 1200, Balance: 88}],
    },
    payables: {
      all: [
        {
          id: '1',
          CustomerBalance: 33,
          Contact1: 1200,
          Contact2: 3,
          Contact3: 8,
          Address: 'hhh',
        },
      ],
      single: [{id: '1', TotalBillAmount: 23, Paidamount: 1200, Balance: 88}],
    },
    balances: {
      all: [
        {
          id: '1',
          CustomerBalance: 33,
          Contact1: 1200,
          Contact2: 3,
          Contact3: 8,
          Address: 'hhh',
        },
      ],
      single: [{id: '1', TotalBillAmount: 23, Paidamount: 1200, Balance: 88}],
    },
  };

export default function CustomerBalances() {
  const [selectedTab, setSelectedTab] = useState<TabType>('receivables');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedRadio, setSelectedRadio] = useState<number>(0);
  const [data, setData] = useState<CustomerData[]>([]);

  const [customerOpen, setCustomerOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);

  const [customerItems, setCustomerItems] = useState(
    customers.map(c => ({label: c, value: c})),
  );
  const [areaItems, setAreaItems] = useState(
    areas.map(a => ({label: a, value: a})),
  );

  const {openDrawer} = useDrawer();

  const handleLoadReport = () => {
    const tabData = mockData[selectedTab];
    setData(selectedRadio === 0 ? tabData.all : tabData.single);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Balances</Text>
        </View>

        <View style={styles.toggleRow}>
          {(['receivables', 'payables', 'balances'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.toggleButton,
                selectedTab === tab && styles.activeButton,
              ]}>
              <Text
                style={[
                  styles.toggleText,
                  selectedTab === tab && styles.activeText,
                ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{zIndex: 3000, marginHorizontal: 12, marginTop: 10}}>
          <DropDownPicker
            open={customerOpen}
            value={selectedCustomer}
            items={customerItems}
            setOpen={setCustomerOpen}
            setValue={setSelectedCustomer}
            setItems={setCustomerItems}
            placeholder="Select Customer"
            style={styles.dropdown}
            textStyle={{color: 'white'}}
            dropDownContainerStyle={styles.dropdownContainer}
            labelStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
            arrowIconStyle={{tintColor: 'white'}}
          />
        </View>

        <View style={{zIndex: 2000, marginHorizontal: 12}}>
          <DropDownPicker
            open={areaOpen}
            value={selectedArea}
            items={areaItems}
            setOpen={setAreaOpen}
            setValue={setSelectedArea}
            setItems={setAreaItems}
            placeholder="Select Area"
            style={styles.dropdown}
            labelStyle={{color: 'white'}}
            textStyle={{color: 'white'}}
            listItemLabelStyle={{color: '#144272'}}
            arrowIconStyle={{tintColor: 'white'}}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        <View style={styles.form}>
          <RadioForm
            radio_props={[
              {label: 'All Customers', value: 0},
              {label: 'Single Customer', value: 1},
            ]}
            initial={0}
            onPress={value => setSelectedRadio(value)}
            buttonColor="white"
            selectedButtonColor="white"
            labelStyle={styles.radioLabel}
            style={{margin: -10, marginLeft: 1}}
          />

          <TouchableOpacity
            style={styles.loadButton}
            onPress={handleLoadReport}>
            <Text style={styles.loadButtonText}>Load Report</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 50}}
          renderItem={({item}) =>
            selectedRadio === 0 ? (
              <View style={styles.table}>
                <View style={styles.tablehead}>
                  <Text
                    style={{
                      color: '#144272',
                      fontWeight: 'bold',
                      marginLeft: 5,
                      marginTop: 5,
                    }}>
                    {item.CustomerBalance}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.row}>
                    <Text style={styles.text}>Contact 1:</Text>
                    <Text style={styles.text}>{item.Contact1}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Contact 2:</Text>
                    <Text style={styles.text}>{item.Contact2}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Contact 3:</Text>
                    <Text style={styles.text}>{item.Contact3}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Address:</Text>
                    <Text style={styles.text}>{item.Address}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.table}>
                <View style={styles.tablehead}>
                  <Text
                    style={{
                      color: '#144272',
                      fontWeight: 'bold',
                      marginLeft: 5,
                      marginTop: 5,
                    }}>
                    {item.Balance}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.row}>
                    <Text style={styles.text}>Total Bill Amount:</Text>
                    <Text style={styles.text}>{item.TotalBillAmount}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.text}>Paid Amount:</Text>
                    <Text style={styles.text}>{item.Paidamount}</Text>
                  </View>
                </View>
              </View>
            )
          }
        />
        {selectedRadio === 0 && data.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total Records: {data.length}</Text>
            <Text style={styles.totalText}>
  {`Total ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}:`}{' '}
  {data.reduce((sum, item) => sum + (item.Balance || 0), 0)}
</Text>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  menuIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 30,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginHorizontal: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 8,
    borderColor: '#144272',
    borderWidth: 1,
    marginHorizontal: 4,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#144272',
  },
  toggleText: {
    textAlign: 'center',
    color: '#144272',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  form: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: 'white',
  },
  dropdown: {
    marginBottom: 10,
    zIndex: 1000,
    backgroundColor: 'transparent',
    color: 'white',
    borderWidth: 1,
    borderColor: 'white',
    minHeight: 35,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
  dropdownContainer: {
    borderColor: 'white',
    backgroundColor: '#fff',
    zIndex: 999,
    color: '#144272',
  },
  radioLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: 'white',
  },
  loadButton: {
    marginTop: 15,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 6,
  },
  loadButtonText: {
    color: '#144272',
    textAlign: 'center',
    fontWeight: '600',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 12,
    borderRadius: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
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
    marginRight: 5,
  },
  infoRow: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginVertical: 2,
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
});
