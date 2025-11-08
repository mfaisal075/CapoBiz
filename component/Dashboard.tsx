import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useDrawer} from './DrawerContext';
import {useUser} from './CTX/UserContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import BASE_URL from './BASE_URL';
import backgroundColors from './Colors';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import RNPrint from 'react-native-print';

const {width} = Dimensions.get('window');

// Type definitions
interface StatItem {
  title: string;
  icon: any;
  screen: string;
  count?: string | number;
}

type RootStackParamList = {
  Login: undefined;
};

type DashboardNavigationProp = NavigationProp<RootStackParamList>;

interface Counts {
  customer: number;
  suppliers: number;
  employees: number;
  product: number;
  currentstockqty: number;
  currentstocksubqty: number;
  expenseamount: number;
  sale: number;
  purchase: number;
  current_month_sale: number;
}

interface InvoiceList {
  id: number;
  sal_date: string;
  sal_order_total: string;
  sal_invoice_no: string;
  sal_payment_method: string;
  slcust_name: string;
  name: string;
}

interface SingleInvoice {
  config: {
    bus_name: string;
    bus_address: string;
    bus_contact1: string;
  };
  sale: {
    cust_name: string;
    name: string;
    slcust_address: string;
    sal_builty_contact: string;
    sal_builty_address: string;
    contact: string;
    sal_change_amount: string;
    created_at: string;
    sal_freight_exp: string;
    sal_labr_exp: string;
    sal_discount: string;
    sal_payment_amount: string;
    sal_total_amount: string;
    sal_order_total: string;
    note: string;
  };
  prev_balance: string;
}

interface InvoiceSaleDetails {
  prod_name: string;
  sald_qty: string;
  sald_fretail_price: string;
  sald_total_fretailprice: string;
  ums_name: string;
}

export default function Dashboard(): JSX.Element {
  const {userName, userEmail} = useUser();
  const {
    setUserEmail,
    setUserName,
    setBussName,
    setBussAddress,
    setBussContact,
  } = useUser();
  const navigation = useNavigation<DashboardNavigationProp>();
  const [isModalVisible, setModalVisible] = useState(false);
  const {openDrawer} = useDrawer();
  const [date, setDate] = useState(dayjs());
  const [count, setCount] = useState<Counts | null>(null);
  const [invcList, setInvcList] = useState<InvoiceList[]>([]);
  const [modal, setModal] = useState('');
  const [invcSaleDetails, setInvcSaleDetails] = useState<InvoiceSaleDetails[]>(
    [],
  );
  const [invoiceData, setInvoiceData] = useState<SingleInvoice | null>(null);
  const [selectedInvc, setSelectedInvc] = useState('');

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Fetch Sale Invoice List
  const fetchinvcList = async () => {
    try {
      const from = '2024-11-07';
      const to = new Date().toISOString().split('T')[0];
      const res = await axios.post(`${BASE_URL}/getinvoices`, {
        from,
        to,
      });

      setInvcList(res.data.inv_data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Single Invoice
  const singleInvc = async (inv: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/invoiceprint`, {
        invoice: inv,
      });

      setInvoiceData(res.data);
      setInvcSaleDetails(res.data.saledetail);
    } catch (error) {
      console.log();
    }
  };

  useEffect(() => {
    setInterval(() => {
      setDate(dayjs());
    }, 1000 * 1);

    const fetchUserData = async () => {
      try {
        // Only proceed with the second request if login was successful
        const res = await axios.get(`${BASE_URL}/poscashregister`);

        setUserName(res.data?.authenticated_user?.name ?? '');
        setUserEmail(res.data?.authenticated_user?.email ?? '');

        // Getting bussiness details
        const bus = await axios.get(`${BASE_URL}/dashboaddata`);
        setCount(bus.data);

        setBussName(bus.data?.businessdata?.bus_name ?? '');
        setBussAddress(bus.data?.businessdata?.bus_address ?? '');
        setBussContact(bus.data?.businessdata?.bus_contact1 ?? '');
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
    fetchinvcList();
  }, []);

  function formatNumber(num: number): string {
    if (num >= 100000) {
      return (num / 100000).toFixed(num % 100000 === 0 ? 0 : 2) + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 2) + 'K';
    } else {
      return num.toString();
    }
  }

  const generateReceiptHTML = () => {
    if (!invoiceData) return '';

    const itemsHTML = invcSaleDetails
      .map(
        item => `
    <tr>
      <td style="padding: 8px 4px; font-size: 13px;">${item.prod_name}</td>
      <td style="padding: 8px 4px; text-align: center; font-size: 13px;">${
        item.sald_qty
      }</td>
      <td style="padding: 8px 4px; text-align: center; font-size: 13px;">${
        item.ums_name
      }</td>
      <td style="padding: 8px 4px; text-align: right; font-size: 13px;">${parseFloat(
        item.sald_fretail_price,
      ).toFixed(2)}</td>
      <td style="padding: 8px 4px; text-align: right; font-size: 13px;">${parseFloat(
        item.sald_total_fretailprice,
      ).toFixed(2)}</td>
    </tr>
  `,
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt ${selectedInvc}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          margin: 0; 
          padding: 20px; 
          max-width: 400px;
          margin: 0 auto;
        }
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
          padding-bottom: 15px;
          border-bottom: 2px dashed #000;
        }
        .shop-name { 
          font-weight: bold; 
          font-size: 24px;
          margin-bottom: 8px;
        }
        .shop-address { 
          font-size: 14px;
          margin: 5px 0;
        }
        .shop-phone { 
          font-size: 14px;
          margin: 5px 0;
        }
        .divider {
          border-bottom: 2px dashed #000;
          margin: 15px 0;
        }
        .receipt-info { 
          display: flex; 
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 13px;
        }
        .customer-details { 
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px dashed #000;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 13px;
        }
        .detail-label {
          font-weight: 600;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th { 
          text-align: center;
          padding: 8px 4px;
          border-bottom: 2px dashed #000;
          font-size: 13px;
          font-weight: 600;
        }
        th:first-child,
        td:first-child {
          text-align: left;
        }
        th:last-child,
        td:last-child {
          text-align: right;
        }
        .table-footer {
          border-top: 2px dashed #000;
          padding-top: 10px;
        }
        .summary { 
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        .summary-row { 
          display: flex; 
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .summary-label {
          font-weight: 400;
        }
        .summary-value {
          text-align: right;
        }
        .total-row { 
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 8px;
          font-weight: bold;
          font-size: 14px;
        }
        .footer { 
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        .thank-you { 
          text-align: center;
          margin: 20px 0 15px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .developer-info {
          font-size: 12px;
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${invoiceData.config.bus_name}</div>
        <div class="shop-address">${invoiceData.config.bus_address}</div>
        <div class="shop-phone">${invoiceData.config.bus_contact1}</div>
      </div>
      
      <div class="receipt-info">
        <span><strong>Receipt#:</strong> ${selectedInvc}</span>
      </div>
      <div class="receipt-info">
        <span><strong>Date:</strong> ${new Date(
          invoiceData.sale.created_at,
        ).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}</span>
      </div>
      <div class="receipt-info">
        <span><strong>Maker:</strong> ${invoiceData.sale.name}</span>
      </div>
      
      <div class="divider"></div>
      
      <div class="customer-details">
        <div class="detail-row">
          <span class="detail-label">Customer:</span>
          <span>${invoiceData.sale.cust_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact#:</span>
          <span>${invoiceData.sale.contact || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span>${invoiceData.sale.slcust_address || 'NILL'}</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>UOM</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="table-footer">
        <div class="summary-row">
          <span class="summary-label"><strong>Total Items</strong></span>
          <span class="summary-value">${invcSaleDetails.length}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label"></span>
          <span class="summary-value"><strong>Subtotal ${
            invoiceData.sale.sal_order_total
          }</strong></span>
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Order Total:</span>
          <span class="summary-value">${invoiceData.sale.sal_order_total}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Discount:</span>
          <span class="summary-value">${invoiceData.sale.sal_discount}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Previous Balance:</span>
          <span class="summary-value">${invoiceData.prev_balance}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label">Payable:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_total_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Paid:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_payment_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Balance:</span>
          <span class="summary-value">${
            invoiceData.sale.sal_change_amount
          }</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Note:</span>
          <span class="summary-value">${invoiceData.sale.note || 'NILL'}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="thank-you">Software Developed</div>
        <div class="developer-info">
          <div>with love by</div>
          <div style="margin-top: 5px;"><strong>Technic Mentors</strong></div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  // Print Receipt
  const printReceipt = async () => {
    try {
      // Generate HTML content for the receipt
      const htmlContent = generateReceiptHTML();

      // Print the receipt
      await RNPrint.print({
        html: htmlContent,
      });

      Toast.show({
        type: 'success',
        text1: 'Receipt printed successfully',
      });
    } catch (error) {
      console.error('Failed to print receipt:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to print receipt',
      });
    }
  };

  // POS Dashboard Stats (static for now)
  const stats: StatItem[] = [
    {
      title: 'Customers',
      icon: require('../assets/users.png'),
      screen: 'Customer',
      count: count?.customer,
    },
    {
      title: 'Suppliers',
      icon: require('../assets/truck.png'),
      screen: 'Suppliers',
      count: count?.suppliers,
    },
    {
      title: 'Employees',
      icon: require('../assets/name-tag.png'),
      screen: 'Employees',
      count: count?.employees,
    },
    {
      title: 'Current Stock',
      icon: require('../assets/stock.png'),
      screen: 'Current Stock',
      count: `${formatNumber(Number(count?.currentstockqty))} - ${formatNumber(
        Number(count?.currentstocksubqty),
      )}`,
    },
    {
      title: 'Products',
      icon: require('../assets/product.png'),
      screen: 'Products',
      count: count?.product,
    },
    {
      title: 'Sale Invoices',
      icon: require('../assets/receipt.png'),
      screen: 'Invoice List',
      count: count?.sale,
    },
    {
      title: 'Purchases',
      icon: require('../assets/purchase.png'),
      screen: 'Purchase List',
      count: count?.purchase,
    },
    {
      title: 'Expenses',
      icon: require('../assets/payment.png'),
      screen: 'Manage Expenses',
      count: formatNumber(Number(count?.expenseamount)),
    },
  ];

  const renderStatCard = (item: StatItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.card,
        {backgroundColor: backgroundColors.light},
        // Apply special styling to first two cards
        index < 2 && styles.overlappingCard,
      ]}
      onPress={() => {
        navigation.navigate(item.screen as never);
      }}>
      <View style={[styles.iconContainer]}>
        <Image source={item.icon} style={styles.cardIcon} />
        <Text style={styles.count}>{item.count}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.innerHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.headerButton}>
            <View>
              <Image
                source={require('../assets/menu.png')}
                style={styles.menuIcon}
                tintColor="white"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>CapoBiz POS</Text>
          </View>

          <TouchableOpacity onPress={toggleModal} style={styles.headerButton}>
            <View style={styles.profileBadge}>
              <Icon name="account" size={28} color={backgroundColors.dark} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          <Text style={styles.time}>{date.format('hh:mm:ss')}</Text>
        </View>
      </View>

      <View style={{zIndex: 1000}}>
        {/* Dashboard Stats */}
        <View style={styles.statsGrid}>
          {stats.map((item, index) => renderStatCard(item, index))}
        </View>
      </View>

      {/* Latest Invoices */}
      <View style={styles.invcContainer}>
        <View style={styles.invcHeader}>
          <Text style={styles.invcTitle}>Latest 5 Sales</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Invoice List' as never)}>
            <Text style={styles.seeMoreBtnText}>See More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={invcList.slice(0, 5)}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <View style={styles.invcCard}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.sal_invoice_no}</Text>
                    <Text style={styles.subText}>
                      <Icon name="cash-multiple" size={12} color="#666" />{' '}
                      {item.sal_order_total}
                    </Text>
                    <Text style={styles.subText}>
                      <Icon name="account" size={12} color="#666" />{' '}
                      {item.slcust_name || 'N/A'}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-start'}}>
                    <Text style={[styles.subText, {fontWeight: '700'}]}>
                      <Icon name="calendar" size={12} color="#666" />{' '}
                      {new Date(item.sal_date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{alignSelf: 'flex-end', marginTop: -20}}
                  onPress={() => {
                    setModal('View');
                    singleInvc(item.sal_invoice_no);
                    setSelectedInvc(item.sal_invoice_no);
                  }}>
                  <Icon
                    name="receipt"
                    size={18}
                    color={backgroundColors.dark}
                  />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{paddingBottom: 40}}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* User Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}>
        <TouchableOpacity
          style={styles.modalOverlayUser}
          activeOpacity={1}
          onPress={toggleModal}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.userAvatarContainer}>
                <Image
                  style={styles.userAvatar}
                  source={require('../assets/user.png')}
                  tintColor={backgroundColors.light}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {userName ?? 'Store Manager'}
                </Text>
                <Text style={styles.userEmail}>
                  {userEmail ?? 'manager@capobiz.com'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate('Login')}>
              <Icon name="logout" size={22} color={backgroundColors.light} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Receipt View Modal */}
      <Modal
        visible={modal === 'View'}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModal('');
          setInvoiceData(null);
          setInvcSaleDetails([]);
          setSelectedInvc('');
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.receiptModalHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.invoiceIconContainer}>
                  <Icon name="receipt" size={24} color="#144272" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Sale Invoice</Text>
                  <Text style={styles.modalSubtitle}>Invoice Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModal('');
                  setInvoiceData(null);
                  setInvcSaleDetails([]);
                  setSelectedInvc('');
                }}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.receiptModalContent}
              showsVerticalScrollIndicator={false}>
              {/* Company Info Card */}
              <View style={styles.companyCard}>
                <View style={styles.companyHeader}>
                  <Text style={styles.companyName}>
                    {invoiceData?.config?.bus_name || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.companyAddress}>
                  {invoiceData?.config?.bus_address || 'N/A'}
                </Text>
                <Text style={styles.companyContact}>
                  {invoiceData?.config?.bus_contact1 || 'Contact: N/A'}
                </Text>
              </View>

              {/* Order Info Grid */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Receipt#:</Text>
                  <Text style={styles.infoValue}>{selectedInvc ?? 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.created_at
                      ? new Date(invoiceData?.sale.created_at)
                          .toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                          .replace(/ /g, '-')
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Maker:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.name ?? 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Customer:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.cust_name ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Contact:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.contact ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale.slcust_address ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Order Table Section */}
              <View style={styles.tableSection}>
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.col1]}>
                      Item
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col2]}>
                      Qty
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col3]}>
                      UOM
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col4]}>
                      Price
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.col5]}>
                      Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  <FlatList
                    data={invcSaleDetails}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({item, index}) => (
                      <View style={[styles.tableRow]}>
                        <Text style={[styles.tableCell, styles.col1]}>
                          {item.prod_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col2]}>
                          {item.sald_qty}
                        </Text>
                        <Text style={[styles.tableCell, styles.col3]}>
                          {item.ums_name}
                        </Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                          {Number(item.sald_fretail_price).toLocaleString()}
                        </Text>
                        <Text style={[styles.tableCell, styles.col5]}>
                          {Number(
                            item.sald_total_fretailprice,
                          ).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    scrollEnabled={false}
                    ListFooterComponent={
                      <View
                        style={{
                          borderTopWidth: 1.5,
                          borderTopColor: backgroundColors.dark,
                          flexDirection: 'row',
                          paddingVertical: 2.5,
                        }}>
                        <Text
                          style={[
                            styles.tableHeaderText,
                            {flex: 0.2, textAlign: 'left'},
                          ]}>
                          Total Items
                        </Text>
                        <Text style={[styles.tableCell, {flex: 0.15}]}>
                          {invcSaleDetails.length}
                        </Text>
                        <Text style={[styles.tableHeaderText, {flex: 0.2}]}>
                          Subtotals
                        </Text>
                        <View style={{flex: 0.2}} />
                        <Text style={[styles.tableCell, {flex: 0.2}]}>
                          {invoiceData?.sale?.sal_order_total}
                        </Text>
                      </View>
                    }
                  />
                </View>
              </View>

              <View style={styles.orderInfoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Total Order:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_order_total ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Discount:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_discount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Previous Bal.:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.prev_balance ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Payable:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_total_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Paid:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_payment_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Balance:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.sal_change_amount ?? 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Note:</Text>
                  <Text style={styles.infoValue}>
                    {invoiceData?.sale?.note ?? 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.thankYou}>Thank you for your visit</Text>
                <View style={styles.developerInfo}>
                  <Text style={styles.developerText}>
                    Software Developed with ❤️ by
                  </Text>
                  <Text style={styles.companyContact}>
                    Technic Mentors | +923111122144
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.printBtn}
                  onPress={printReceipt}>
                  <Icon
                    name="printer"
                    size={20}
                    color={backgroundColors.light}
                  />
                  <Text style={styles.printBtnText}>Print</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColors.gray,
  },
  header: {
    height: '20%',
    backgroundColor: backgroundColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 999,
  },
  innerHeader: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerSection: {
    marginTop: '5%',
    paddingHorizontal: '2%',
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: backgroundColors.light,
    textAlign: 'right',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 24,
    marginTop: -40,
    marginBottom: -20,
  },
  card: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  overlappingCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 80,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 36,
    height: 36,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  cardTitle: {
    fontSize: 16,
    color: backgroundColors.dark,
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalOverlayUser: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userAvatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 35,
    backgroundColor: '#777',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: backgroundColors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: backgroundColors.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: backgroundColors.danger,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  invcContainer: {
    flex: 1,
  },
  invcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  invcTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: backgroundColors.dark,
  },
  seeMoreBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: backgroundColors.primary,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: '3%',
  },
  invcCard: {
    backgroundColor: backgroundColors.light,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    borderWidth: 0.8,
    borderColor: '#00000036',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 2, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#144272',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  receiptModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#2a652b24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: backgroundColors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyCard: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#144272',
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  companyContact: {
    fontSize: 12,
    color: backgroundColors.dark,
    fontWeight: '600',
    textAlign: 'center',
  },
  orderInfoGrid: {
    marginTop: 10,
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    marginHorizontal: 20,
  },
  infoCard: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: backgroundColors.dark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: backgroundColors.dark,
    fontWeight: '400',
  },
  tableSection: {
    marginTop: 20,
    marginHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: backgroundColors.dark,
    borderStyle: 'dotted',
  },
  tableContainer: {
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: backgroundColors.dark,
    borderBottomWidth: 1.5,
    paddingBottom: 5,
  },
  tableHeaderText: {
    color: backgroundColors.dark,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: backgroundColors.dark,
    textAlign: 'center',
  },
  col1: {
    flex: 0.2,
    textAlign: 'left',
  },
  col2: {
    flex: 0.15,
  },
  col3: {
    flex: 0.22,
  },
  col4: {
    flex: 0.18,
  },
  col5: {
    flex: 0.2,
  },
  modalFooter: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  thankYou: {
    fontSize: 16,
    color: backgroundColors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  developerInfo: {
    alignItems: 'center',
  },
  developerText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  receiptModalContent: {
    flex: 1,
  },
  printBtn: {
    backgroundColor: backgroundColors.primary,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignSelf: 'center',
    gap: 5,
    marginVertical: 5,
    borderRadius: 10,
  },
  printBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
