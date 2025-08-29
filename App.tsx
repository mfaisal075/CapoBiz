import React from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './component/SplashScreen';
import {createNavigationContainerRef} from '@react-navigation/native';
import Dashboard from './component/Dashboard';
import LoginScreen from './component/LoginScreen';
import './gesture-handler';
import OrderTablePOS from './component/OrderTablePOS';
import ClosePosBtn from './component/ClosePosBtn';
import Toast from 'react-native-toast-message';

//Drawer
import POS from './component/Drawer/POS';
import CustomerPeople from './component/Drawer/CustomerPeople';
import SupplierPeople from './component/Drawer/SupplierPeople';
import EmployeesPeople from './component/Drawer/EmployeesPeople';
import TransporterPeople from './component/Drawer/TransporterPeople';
import LabourPeople from './component/Drawer/LabourPeople';
import OrderBookerPeople from './component/Drawer/OrderBookerPeople';
import FixedAccountsPeople from './component/Drawer/FixedAccountsPeople';

//Products
import ProductsProducts from './component/Drawer/Products/ProductsProducts';
import CategoryProducts from './component/Drawer/Products/CategoryProducts';
import UOMProducts from './component/Drawer/Products/UOMProducts';
import DeletedProducts from './component/Drawer/Products/DeletedProducts';

//Stock
import CurrentStock from './component/Drawer/Stocks/CurrentStock';
import ReOrderProductStock from './component/Drawer/Stocks/ReOrderProductStock';
import ExpiredProductStock from './component/Drawer/Stocks/ExpiredProductStock';

//Purchase
import PurchaseOrder from './component/Drawer/Purchase/PurchaseOrder';
import PurchaseOrderList from './component/Drawer/Purchase/PurchaseOrderList';
import PurchaseList from './component/Drawer/Purchase/PurchaseList';
import PurchaseReturnList from './component/Drawer/Purchase/PurchaseReturnList';
import PurchaseAddStock from './component/Drawer/Purchase/PurchaseAddStock';
import PurchaseReturn from './component/Drawer/Purchase/PurchaseReturn';
import PurchaseOrderTable from './component/Drawer/Purchase/PurchaseOrderTable';
import PurchaseAddStockDetails from './component/Drawer/Purchase/PurchaseAddStockDetails';

//Sale
import SalesOrderList from './component/Drawer/Sales/SalesOrderList';
import SaleInvoiceList from './component/Drawer/Sales/SaleInvoiceList';
import SaleDispatchList from './component/Drawer/Sales/SaleDispatchList';
import SalesReturnList from './component/Drawer/Sales/SalesReturnList';
import SaleOrder from './component/Drawer/Sales/SaleOrder';
import SaleReturn from './component/Drawer/Sales/SaleReturn';
import SaleCashClose from './component/Drawer/Sales/SaleCashClose';

//Trading
import Trade from './component/Drawer/Trading/Trade';
import TradingList from './component/Drawer/Trading/TradingList';

//Expenses
import ExpenseCategories from './component/Drawer/Expenses/ExpenseCategories';
import ManageExpenses from './component/Drawer/Expenses/ManageExpenses';

//Accounts
import CustomerAccount from './component/Drawer/Accounts/CustomerAccount';
import SupplierAccount from './component/Drawer/Accounts/SupplierAccount';
import TransporterAccount from './component/Drawer/Accounts/TransporterAccount';
import LabourAccount from './component/Drawer/Accounts/LabourAccount';
import EmployeeAccount from './component/Drawer/Accounts/EmployeeAccount';
import FixedAccounts from './component/Drawer/Accounts/FixedAccounts';

//Reports
//People
import CustomerList from './component/Drawer/Reports/People/CustomerList';
import SupplierList from './component/Drawer/Reports/People/SupplierList';
import EmployeeList from './component/Drawer/Reports/People/EmployeeList';
import InactiveCustomer from './component/Drawer/Reports/People/InactiveCustomer';
import AreaWiseCustomer from './component/Drawer/Reports/People/AreaWiseCustomer';
import TypeWiseCustomer from './component/Drawer/Reports/People/TypeWiseCustomer';

//Product
import ListofItems from './component/Drawer/Reports/Product/ListofItems';
import BelowReorderProducts from './component/Drawer/Reports/Product/BelowReorderProducts';
import ExpireProducts from './component/Drawer/Reports/Product/ExpireProducts';
import PurchaseReturnStock from './component/Drawer/Reports/Product/PurchaseReturnStock';
import PurchaseOrderStock from './component/Drawer/Reports/Product/PurchaseOrderStock';

//Accounts
import CustomerAccounts from './component/Drawer/Reports/Accounts/CustomerAccounts';
import SupplierAccounts from './component/Drawer/Reports/Accounts/SupplierAccounts';
import TransporterAccounts from './component/Drawer/Reports/Accounts/TransporterAccounts';
import LabourAccounts from './component/Drawer/Reports/Accounts/LabourAccounts';
import EmployeeAccounts from './component/Drawer/Reports/Accounts/EmployeeAccounts';
import FixAccounts from './component/Drawer/Reports/Accounts/FixAccounts';

//Sales Report
import AllUserSale from './component/Drawer/Reports/SalesReport/AllUserSale';
import SingleUserSale from './component/Drawer/Reports/SalesReport/SingleUserSale';
import SaleReturnReport from './component/Drawer/Reports/SalesReport/SaleReturnReport';
import SaleSaleReturnReport from './component/Drawer/Reports/SalesReport/SaleSaleReturnReport';
import SaleOrderReport from './component/Drawer/Reports/SalesReport/SaleOrderReport';
import DailySalesReport from './component/Drawer/Reports/SalesReport/DailySalesReport';
import SingleUserDailySales from './component/Drawer/Reports/SalesReport/SingleUserDailySales';

import ChequeList from './component/Drawer/Reports/ChequeList';
import ProfitLossReport from './component/Drawer/Reports/ProfitLossReport';
import ExpenseReport from './component/Drawer/Reports/ExpenseReport';
import BusinessCapital from './component/Drawer/Reports/BusinessCapital';
import Trading from './component/Drawer/Reports/Trading';
import CustomerBalances from './component/Drawer/Reports/CustomerBalances';
import Supplierbalances from './component/Drawer/Reports/Supplierbalances';
import CashRegister from './component/Drawer/Reports/CashRegister';
import GeneralLedger from './component/Drawer/Reports/GeneralLedger';
import DayBook from './component/Drawer/Reports/DayBook';
import Stockmovement from './component/Drawer/Reports/Stockmovement';

//Attendance
import AllEmployeeAttendance from './component/Drawer/Attendance/AllEmployeeAttendance';
import AllEmployeeAttendanceList from './component/Drawer/Attendance/AllEmployeeAttendanceList';

//System Users
import User from './component/Drawer/SystemUsers/User';
import Roles from './component/Drawer/SystemUsers/Roles';

//Configuration
import CustomerType from './component/Drawer/Configuration/CustomerType';
import CustomerArea from './component/Drawer/Configuration/CustomerArea';
import PrintBarCode from './component/Drawer/Configuration/PrintBarCode';
import PasswordReset from './component/Drawer/Configuration/PasswordReset';
import BusinessVariables from './component/Drawer/Configuration/BusinessVariables';
import AccessControl from './component/Drawer/Configuration/AccessControl';
import SaleInvoice from './component/Drawer/Configuration/SaleInvoice';

import {DrawerProvider} from './component/DrawerContext';
import DrawerModal from './component/DrawModal';
import {UserProvider} from './component/CTX/UserContext';
import AddCustomerPayment from './component/Drawer/Accounts/AddCustomerPayment';
import ChequeClearance from './component/Drawer/Accounts/ChequeClearance';
import SupplierAddPayment from './component/Drawer/Accounts/SupplierAddPayment';
import SupplierChequeClearance from './component/Drawer/Accounts/SupplierChequeClearance';
import TransporterAddPayment from './component/Drawer/Accounts/TransporterAddPayment';
import LabourAddPayment from './component/Drawer/Accounts/LabourAddPayment';

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

function App(): React.JSX.Element {
  return (
    <UserProvider>
      <DrawerProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="Login" component={LoginScreen} />

            <Stack.Screen name="Point of Sale" component={POS} />
            <Stack.Screen name="Table" component={OrderTablePOS} />
            <Stack.Screen name="Close" component={ClosePosBtn} />

            {/*People*/}
            <Stack.Screen name="Customer" component={CustomerPeople} />
            <Stack.Screen name="Suppliers" component={SupplierPeople} />
            <Stack.Screen name="Employees" component={EmployeesPeople} />
            <Stack.Screen name="Transporter" component={TransporterPeople} />
            <Stack.Screen name="Labour" component={LabourPeople} />
            <Stack.Screen name="Order Booker" component={OrderBookerPeople} />
            <Stack.Screen
              name="Fixed Account"
              component={FixedAccountsPeople}
            />

            {/*Products*/}
            <Stack.Screen name="Products" component={ProductsProducts} />
            <Stack.Screen name="Category" component={CategoryProducts} />
            <Stack.Screen name="UOMs" component={UOMProducts} />
            <Stack.Screen name="Deleted Products" component={DeletedProducts} />

            {/*Stock*/}
            <Stack.Screen name="Current Stock" component={CurrentStock} />
            <Stack.Screen
              name="Reorder Products"
              component={ReOrderProductStock}
            />
            <Stack.Screen
              name="Expire Products"
              component={ExpiredProductStock}
            />

            {/*Purchase*/}
            <Stack.Screen name="Purchase Order" component={PurchaseOrder} />
            <Stack.Screen
              name="Purchase Order List"
              component={PurchaseOrderList}
            />
            <Stack.Screen
              name="Purchase /Add Stock"
              component={PurchaseAddStock}
            />
            <Stack.Screen name="Purchase List" component={PurchaseList} />
            <Stack.Screen name="Purchase Return" component={PurchaseReturn} />
            <Stack.Screen
              name="Purchase Return List"
              component={PurchaseReturnList}
            />
            <Stack.Screen
              name="Purchase Table"
              component={PurchaseOrderTable}
            />
            <Stack.Screen name="Stock" component={PurchaseAddStockDetails} />

            {/*Sale*/}
            <Stack.Screen name="Sale Order" component={SaleOrder} />
            <Stack.Screen name="Order List" component={SalesOrderList} />
            <Stack.Screen name="Invoice List" component={SaleInvoiceList} />
            <Stack.Screen name="Dispatch List" component={SaleDispatchList} />
            <Stack.Screen name="Sale Return" component={SaleReturn} />
            <Stack.Screen name="Sale Return List" component={SalesReturnList} />
            <Stack.Screen name="Cash Close" component={SaleCashClose} />

            {/*Trading*/}
            <Stack.Screen name="Trade" component={Trade} />
            <Stack.Screen name="Trading List" component={TradingList} />

            {/*Expenses*/}
            <Stack.Screen
              name="Expense Categories"
              component={ExpenseCategories}
            />
            <Stack.Screen name="Manage Expenses" component={ManageExpenses} />
            {/*Accounts*/}
            <Stack.Screen name="Customer Account" component={CustomerAccount} />
            <Stack.Screen name="Supplier Account" component={SupplierAccount} />
            <Stack.Screen
              name="Transporter Account"
              component={TransporterAccount}
            />
            <Stack.Screen name="Labour Account" component={LabourAccount} />
            <Stack.Screen name="Employee Account" component={EmployeeAccount} />
            <Stack.Screen name="Fixed Accounts" component={FixedAccounts} />
            <Stack.Screen
              name="AddCustomerPayment"
              component={AddCustomerPayment}
            />

            {/*Reports*/}

            {/*People*/}
            <Stack.Screen name="Customer List" component={CustomerList} />
            <Stack.Screen name="Supplier List" component={SupplierList} />
            <Stack.Screen name="Employee List" component={EmployeeList} />
            <Stack.Screen
              name="Area Wise Customer"
              component={AreaWiseCustomer}
            />
            <Stack.Screen
              name="Type Wise Customer"
              component={TypeWiseCustomer}
            />
            <Stack.Screen
              name="Inactive Customer"
              component={InactiveCustomer}
            />

            {/*Product*/}
            <Stack.Screen name="List Of Items" component={ListofItems} />
            <Stack.Screen
              name="Below Reorder Products"
              component={BelowReorderProducts}
            />
            <Stack.Screen name="Expire Product" component={ExpireProducts} />
            <Stack.Screen
              name="Purchase/Return Stock"
              component={PurchaseReturnStock}
            />
            <Stack.Screen
              name="Purchase Order Stock"
              component={PurchaseOrderStock}
            />

            {/*Account*/}
            <Stack.Screen
              name="Customer Accounts"
              component={CustomerAccounts}
            />
            <Stack.Screen
              name="Supplier Accounts"
              component={SupplierAccounts}
            />
            <Stack.Screen
              name="SupplierAddPayment"
              component={SupplierAddPayment}
            />
            <Stack.Screen
              name="Transporter Accounts"
              component={TransporterAccounts}
            />
            <Stack.Screen name="Labour Accounts" component={LabourAccounts} />
            <Stack.Screen
              name="Employee Accounts"
              component={EmployeeAccounts}
            />
            <Stack.Screen name="Fix Accounts" component={FixAccounts} />
            <Stack.Screen name="ChequeClearance" component={ChequeClearance} />
            <Stack.Screen name="SupplierChequeClearance" component={SupplierChequeClearance} />
            <Stack.Screen name="TransporterAddPayment" component={TransporterAddPayment} />
            <Stack.Screen name="LabourAddPayment" component={LabourAddPayment} />

            {/*Sale Report*/}
            <Stack.Screen name="All User Sales" component={AllUserSale} />
            <Stack.Screen name="Single User Sales" component={SingleUserSale} />
            <Stack.Screen
              name="Sale Return Report"
              component={SaleReturnReport}
            />
            <Stack.Screen
              name="Sale & Sale Return Report"
              component={SaleSaleReturnReport}
            />
            <Stack.Screen
              name="Sale Order Reports"
              component={SaleOrderReport}
            />
            <Stack.Screen
              name="Daily Sales Reports"
              component={DailySalesReport}
            />
            <Stack.Screen
              name="Single User Daily Sales"
              component={SingleUserDailySales}
            />

            <Stack.Screen name="Cheque List" component={ChequeList} />
            <Stack.Screen
              name="Profit Loss Report"
              component={ProfitLossReport}
            />
            <Stack.Screen name="Expense Report" component={ExpenseReport} />
            <Stack.Screen name="Business Capital" component={BusinessCapital} />
            <Stack.Screen name="Trades" component={Trading} />
            <Stack.Screen
              name="Customer Balances"
              component={CustomerBalances}
            />
            <Stack.Screen
              name="Supplier Balances"
              component={Supplierbalances}
            />
            <Stack.Screen name="Cash Register" component={CashRegister} />
            <Stack.Screen name="General Ledger" component={GeneralLedger} />
            <Stack.Screen name="Day Book" component={DayBook} />
            <Stack.Screen name="Stock Movement" component={Stockmovement} />

            {/*Attendance*/}
            <Stack.Screen
              name="All Employees Attendance"
              component={AllEmployeeAttendance}
            />
            <Stack.Screen
              name="All Employees Attendance List"
              component={AllEmployeeAttendanceList}
            />

            {/*System User*/}
            <Stack.Screen name="Users" component={User} />
            <Stack.Screen name="Roles" component={Roles} />

            {/*Configuration*/}
            <Stack.Screen name="Customer Type" component={CustomerType} />
            <Stack.Screen name="Areas" component={CustomerArea} />
            <Stack.Screen name="Print Barcode" component={PrintBarCode} />
            <Stack.Screen name="Password Reset" component={PasswordReset} />
            <Stack.Screen
              name="Business Variables"
              component={BusinessVariables}
            />
            <Stack.Screen name="Access Control" component={AccessControl} />
            <Stack.Screen name="Sale Invoice" component={SaleInvoice} />
          </Stack.Navigator>

          <DrawerModal />
        </NavigationContainer>
        <Toast />
      </DrawerProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({});
export default App;
