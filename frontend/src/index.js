import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import AdminRoute from './components/AdminRoute.jsx';
// import UserListScreen from './screens/admin/UserListScreen.jsx';
import {HelmetProvider} from 'react-helmet-async';
import ProductListScreen from './screens/admin/ProductListScreen.jsx';
import OrderListScreen from './screens/admin/OrderListScreen.jsx';
import ProductEditScreen from './screens/admin/ProductEditScreen.jsx';

import App from './App';
// import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import { Provider } from 'react-redux';
import store from './store';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingScreen from './screens/ShippingScreen';
import PrivateRoute from './components/PrivateRoute';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserListScreen from './screens/admin/UserListScreen.jsx';
import UserEditScreen from './screens/admin/UserEditScreen.jsx';
import {PayPalScriptProvider} from '@paypal/react-paypal-js';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />
      {/* index, or index={true} works the same */}
      <Route path="page/:pageNumber" element={<HomeScreen />} />
      <Route path="search/:keyword" element={<HomeScreen />} />
      <Route path="search/:keyword/page/:pageNumber" element={<HomeScreen />} />
      <Route path="product/:id" element={<ProductScreen />} />
      <Route path="cart" element={<CartScreen />} />
      <Route path="login" element={<LoginScreen />} />
      <Route path="register" element={<RegisterScreen />} />
      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="shipping" element={<ShippingScreen />} />
        <Route path="payment" element={<PaymentScreen />} />
        <Route path="placeorder" element={<PlaceOrderScreen />} />
        <Route path="order/:id" element={<OrderScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
      </Route>
      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        {/* <Route path="admin/users" element={<UserListScreen />} /> */}
        <Route path="admin/products" element={<ProductListScreen />} />
        <Route path="admin/productlist/:pageNumber" element={<ProductListScreen />} />
        <Route path="admin/orders" element={<OrderListScreen />} />
        <Route path="admin/order/:id" element={<OrderScreen />} /> {/* Reuse OrderScreen for admin order details */}
        <Route path="admin/product/:id/edit" element={<ProductEditScreen />} />
        <Route path="admin/users" element={<UserListScreen />} /> 
        <Route path="admin/user/:id/edit" element={<UserEditScreen />} /> 

      </Route>

    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
    <Provider store={store}>
      <PayPalScriptProvider deferLoading={true}>
        <RouterProvider router={router} />
        </PayPalScriptProvider>
    </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
