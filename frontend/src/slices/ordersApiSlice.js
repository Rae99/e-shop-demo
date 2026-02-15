import {apiSlice} from './apiSlice';
import { ORDERS_URL, PAYPAL_URL } from '../constants.js';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: ORDERS_URL,
                method: 'POST',
                body: orderData,
            }),
        }),
        getOrder: builder.query({
            query: (id) => ({
                url: `${ORDERS_URL}/${id}`,
                method: 'GET',// the default method is GET, so we can omit it
            }),
            keepUnusedDataFor: 5, // keep the order data in cache for 5 seconds after the component unmounts, so if we navigate back to the order details page within 5 seconds, we can show the cached data instead of fetching it again from the server
            providesTags: (result, error, id) => [{ type: 'Order', id }],
        }),
        payOrder: builder.mutation({
            query: ({ id, paymentResult }) => ({
                url: `${ORDERS_URL}/${id}/pay`,
                method: 'PUT',
                body: paymentResult,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
        }), // =confirmOrderWasPaid
        getPayPalClientId: builder.query({
            query: () => ({
                url: PAYPAL_URL,
                method: 'GET',
            }),
            transformResponse: (response) => response.clientId,
        }), // get client id from the server, so we can use it in the PayPalScriptProvider component in index.js
        deliverOrder: builder.mutation({
            query: (id) => ({
                url: `${ORDERS_URL}/${id}/deliver`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Order', id }],
        }), 
    }),
});

export const { useCreateOrderMutation, useGetOrderQuery, usePayOrderMutation, useDeliverOrderMutation, useGetPayPalClientIdQuery } = ordersApiSlice;