import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './BASE_URL';
import dayjs from 'dayjs';

const NOTIFICATIONS_KEY = '@notifications';

// Helper to get notifee safely
const getNotifee = () => {
  try {
    const notifee = require('@notifee/react-native');
    // Return the default export if it exists, otherwise return the whole object
    return notifee.default ? notifee.default : notifee;
  } catch (e) {
    console.warn('Notifee module loading failed:', e);
    return null;
  }
};

const getAndroidImportance = () => {
  try {
    const notifee = require('@notifee/react-native');
    return notifee.AndroidImportance || { HIGH: 4 };
  } catch (e) {
    return { HIGH: 4 }; // Fallback
  }
};

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'low_stock' | 'expiry' | 'general';
  fullDetails?: any;
}

export const fetchStockAndNotify = async () => {
  try {
    // UPDATED: Changed to fetchproductlist as per user request
    const response = await axios.get(`${BASE_URL}/fetchproductlist`);
    const products = response.data?.product || [];

    const existingNotificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    let notifications: NotificationItem[] = existingNotificationsJson
      ? JSON.parse(existingNotificationsJson)
      : [];

    const newAlerts: NotificationItem[] = [];

    products.forEach((item: any) => {
      // 1. Check Low Stock (Current Qty <= Reorder Qty)
      const qty = parseFloat(item.prod_qty) || 0;
      const reorderQty = parseFloat(item.prod_reorder_qty) || 0;

      // Condition: qty <= reorderQty AND reorderQty > 0
      if (reorderQty > 0 && qty <= reorderQty) {
        const id = `low_stock_${item.prod_UPC_EAN}`;
        if (!notifications.find(n => n.id === id)) {
          const alert: NotificationItem = {
            id,
            title: item.prod_name,
            message: `Product is at or below reorder level (${qty} ${item.ums_name || 'Units'} remaining, Reorder: ${reorderQty}).`,
            time: new Date().toISOString(),
            isRead: false,
            type: 'low_stock',
            fullDetails: item,
          };
          newAlerts.push(alert);
        }
      }

      // 2. Check Expiry (within 30 days)
      if (item.prod_expirydate) {
        const expiryDate = dayjs(item.prod_expirydate);
        const today = dayjs();
        const diffDays = expiryDate.diff(today, 'day');

        if (diffDays <= 30) {
          const id = `expiry_${item.prod_UPC_EAN}`;
          if (!notifications.find(n => n.id === id)) {
            const message = diffDays < 0 
              ? `Product has expired on ${item.prod_expirydate}.`
              : `Product will expire on ${item.prod_expirydate} (${diffDays} days left).`;
            
            const alert: NotificationItem = {
              id,
              title: item.prod_name,
              message,
              time: new Date().toISOString(),
              isRead: false,
              type: 'expiry',
              fullDetails: item,
            };
            newAlerts.push(alert);
          }
        }
      }
    });

    if (newAlerts.length > 0) {
      notifications = [...newAlerts, ...notifications];
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

      // Show Push Notification for the new alerts
      for (const alert of newAlerts) {
        await displayPushNotification(alert);
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error in fetchStockAndNotify:', error);
    return [];
  }
};

const displayPushNotification = async (alert: NotificationItem) => {
  try {
    const notifee = getNotifee();
    const AndroidImportance = getAndroidImportance();

    if (!notifee || !notifee.displayNotification) {
      console.warn('Notifee native module not fully loaded. Skipping push notification.');
      return;
    }

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'stock_alerts',
      name: 'Stock Alerts',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title: alert.title,
      body: alert.message,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
        importance: AndroidImportance.HIGH,
      },
      ios: {
        critical: true,
      }
    });
  } catch (error) {
    console.error('Failed to display push notification:', error);
  }
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const json = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
  let notifications: NotificationItem[] = json ? JSON.parse(json) : [];
  
  // Migration: Update old generic titles to product names if fullDetails are available
  let updated = false;
  notifications = notifications.map(n => {
    if ((n.title === 'Low Stock Alert' || n.title === 'Product Expired' || n.title === 'Expiry Warning') && n.fullDetails?.prod_name) {
      updated = true;
      return { ...n, title: n.fullDetails.prod_name };
    }
    return n;
  });

  if (updated) {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  return notifications;
};

export const markAllAsRead = async () => {
  const notifications = await getNotifications();
  const updated = notifications.map(n => ({ ...n, isRead: true }));
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  return updated;
};

export const markAsRead = async (id: string) => {
  const notifications = await getNotifications();
  const updated = notifications.map(n => 
    n.id === id ? { ...n, isRead: true } : n
  );
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  return updated;
};
