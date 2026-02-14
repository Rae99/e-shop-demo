import {apiSlice} from './apiSlice';
import { ORDERS_URL } from '../constants.js';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: ORDERS_URL,
                method: 'POST',
                body: orderData,
            }),
        }),
    }),
});

export const { useCreateOrderMutation } = ordersApiSlice;