import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useDrawer} from '../../DrawerContext';
import DropDownPicker from 'react-native-dropdown-picker';

type Employee = {
  id: string;
  name: string;
  cnic: string;
  clockIn: Date;
  clockOut: Date;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
};

const initialData: Employee[] = [
  {
    id: '1',
    name: 'Haroon',
    cnic: '11111-1111111-1',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Leave',
  },
  {
    id: '2',
    name: 'Tahir',
    cnic: '11111-1111444-4',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Absent',
  },
  {
    id: '3',
    name: 'Furqan',
    cnic: '22222-2222222-2',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Present',
  },
  {
    id: '4',
    name: 'Fakhar',
    cnic: '12345-6789999-9',
    clockIn: new Date(),
    clockOut: new Date(),
    date: '08-05-2025',
    status: 'Present',
  },
];

export default function AllEmployeeAttendance() {
  const {openDrawer} = useDrawer();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [mode, setMode] = useState<'clockIn' | 'clockOut'>('clockIn');

  const updateTime = (id: string, selectedTime: Date) => {
    const updated = employees.map(emp => {
      if (emp.id === id) {
        return mode === 'clockIn'
          ? {...emp, clockIn: selectedTime}
          : {...emp, clockOut: selectedTime};
      }
      return emp;
    });
    setEmployees(updated);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/screen.jpg')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../assets/menu.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>All Employees Attendance</Text>
          </View>
        </View>

        <View style={styles.topButtons}>
          <TouchableOpacity
            style={styles.loadButton}
            onPress={() => {
              setEmployees(initialData);
              setDataLoaded(true);
            }}>
            <Text style={styles.buttonText}>Load Employees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setEmployees([]);
              setDataLoaded(false);
            }}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {dataLoaded && (
          <FlatList
            data={employees}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <ScrollView style={{padding: 5}}>
                <View style={styles.table}>
                  <View style={styles.tablehead}>
                    <Text
                      style={{
                        color: '#144272',
                        fontWeight: 'bold',
                        marginLeft: 5,
                        marginTop: 5,
                      }}>
                      {item.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.text, {marginTop: 5}]}>CNIC</Text>
                    <Text style={[styles.text, {marginTop: 5}]}>
                      {item.cnic}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentId(item.id);
                      setMode('clockIn');
                      setShowPicker(true);
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Clock In:</Text>
                      <Text style={styles.text}>
                        {formatTime(item.clockIn)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setCurrentId(item.id);
                      setMode('clockOut');
                      setShowPicker(true);
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.text}>Clock Out:</Text>
                      <Text style={styles.text}>
                        {formatTime(item.clockOut)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.text}>Date</Text>
                    <Text style={styles.text}>{item.date}</Text>
                  </View>

                  {openDropdownId === item.id && (
                    <DropDownPicker
                      open={true}
                      value={item.status}
                      items={[
                        {label: 'Present', value: 'Present'},
                        {label: 'Absent', value: 'Absent'},
                        {label: 'Leave', value: 'Leave'},
                      ]}
                      setOpen={() => setOpenDropdownId(null)}
                      setValue={callback => {
                        const newValue = callback(item.status);
                        setEmployees(prev =>
                          prev.map(emp =>
                            emp.id === item.id
                              ? {...emp, status: newValue}
                              : emp,
                          ),
                        );
                      }}
                      setItems={() => {}}
                      style={{
                        backgroundColor: 'white',
                      }}
                      dropDownContainerStyle={{
                        backgroundColor: 'white',
                      }}
                      textStyle={{color: '#144272'}}
                      listItemLabelStyle={{
                        color: '#144272',
                      }}
                      placeholder="Select status"
                    />
                  )}

                  {openDropdownId !== item.id && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedEmployeeId(item.id);
                        setStatusModalVisible(true);
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 5,
                        }}>
                        <Text style={styles.text}>Status</Text>
                        <Text style={styles.text}>{item.status}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          />
        )}

        {showPicker && currentId && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'android' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) updateTime(currentId, selectedDate);
            }}
          />
        )}

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
        {statusModalVisible && (
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              padding: 20,

              bottom: 0,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: '#144272',
              }}>
              Select Status
            </Text>

            {['Present', 'Absent', 'Leave'].map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  setEmployees(prev =>
                    prev.map(emp =>
                      emp.id === selectedEmployeeId
                        ? {...emp, status: status as Employee['status']}
                        : emp,
                    ),
                  );
                  setStatusModalVisible(false);
                  setSelectedEmployeeId(null);
                }}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                }}>
                <Text style={{fontSize: 16, color: '#144272'}}>{status}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setStatusModalVisible(false)}
              style={{
                marginTop: 10,
                alignItems: 'center',
                paddingVertical: 10,
                backgroundColor: '#144272',
                borderRadius: 8,
              }}>
              <Text style={{color: 'white'}}>Cancel</Text>
            </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    justifyContent: 'space-between',
  },
  menuIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  loadButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#144272',
  },
  row: {
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  text: {
    marginLeft: 5,
    color: 'white',
    marginRight: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    marginTop: -6,
  },
  timeBox: {
    color: 'white',
    borderRadius: 4,
    marginBottom: 6,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  submitText: {
    color: '#144272',
  },
  table: {
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
    height: 'auto',
    width: 314,
    borderRadius: 5,
    marginTop: 10,
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
});
