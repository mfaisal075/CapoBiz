import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import BottomBar from './BottomBar';
import {useDrawer} from './DrawerContext';
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  NotificationItem,
} from './NotificationService';
import Modal from 'react-native-modal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const {width} = Dimensions.get('window');

// --- THEME ---
const THEME = {
  primary: '#1A5D1A', // Deep Forest Green
  primaryDark: '#0D3B0D',
  primaryLight: '#E3F2E3',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textMain: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const {openDrawer} = useDrawer();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();

    const backAction = () => {
      navigation.navigate('Dashboard' as never);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAllAsRead = async () => {
    const updated = await markAllAsRead();
    setNotifications(updated);
  };

  const handleNotificationPress = async (item: NotificationItem) => {
    setSelectedNotification(item);
    setModalVisible(true);
    if (!item.isRead) {
      const updated = await markAsRead(item.id);
      setNotifications(updated);
    }
  };

  const renderNotification = ({item}: {item: NotificationItem}) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.circle,
            {backgroundColor: !item.isRead ? THEME.primaryLight : '#F3F4F6'},
          ]}>
          <Icon
            name={
              item.type === 'low_stock'
                ? 'package-variant'
                : item.type === 'expiry'
                ? 'calendar-alert'
                : 'bell-outline'
            }
            size={24}
            color={!item.isRead ? THEME.primary : THEME.textSecondary}
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.timeText}>{dayjs(item.time).fromNow()}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME.primaryDark}
        translucent={true}
      />

      {/* --- HEADER --- */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[THEME.primary, THEME.primaryDark]}
          style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconBtn}>
              <Icon name="arrow-left" size={24} color={THEME.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {loading && !notifications.length ? (
        <ActivityIndicator
          size="large"
          color={THEME.primary}
          style={{marginTop: 50}}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadNotifications}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name="bell-off-outline"
                size={80}
                color={THEME.textSecondary}
              />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}

      {/* --- NOTIFICATION DETAIL MODAL --- */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalIconContainer,
                {
                  backgroundColor:
                    selectedNotification?.type === 'expiry'
                      ? '#FEF2F2'
                      : THEME.primaryLight,
                },
              ]}>
              <Icon
                name={
                  selectedNotification?.type === 'low_stock'
                    ? 'package-variant'
                    : 'calendar-alert'
                }
                size={30}
                color={
                  selectedNotification?.type === 'expiry'
                    ? '#EF4444'
                    : THEME.primary
                }
              />
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}>
              <Icon name="close" size={24} color={THEME.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
          <Text style={styles.modalTime}>
            {dayjs(selectedNotification?.time).format('MMMM D, YYYY h:mm A')}
          </Text>

          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>
              {selectedNotification?.message}
            </Text>

            {selectedNotification?.fullDetails && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Product:</Text>
                  <Text style={styles.detailValue}>
                    {selectedNotification.fullDetails.prod_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SKUs/UPC:</Text>
                  <Text style={styles.detailValue}>
                    {selectedNotification.fullDetails.prod_UPC_EAN}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>
                    {selectedNotification.fullDetails.pcat_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Current Qty:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {color: THEME.primary, fontWeight: '700'},
                    ]}>
                    {selectedNotification.fullDetails.prod_qty}{' '}
                    {selectedNotification.fullDetails.ums_name}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.okBtn}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.okBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerWrapper: {
    zIndex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.white,
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  markAllText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  iconContainer: {
    marginRight: 16,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingRight: 20, // Space for absolute unread dot
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textMain,
  },
  timeText: {
    fontSize: 11,
    color: THEME.textSecondary,
  },
  messageText: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.primary,
    position: 'absolute',
    top: 20,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  modal: {
    margin: 20,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textMain,
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 13,
    color: THEME.textLight,
    marginBottom: 20,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: THEME.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: THEME.textMain,
    fontWeight: '600',
  },
  okBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  okBtnText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
