import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants.js';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
}); 

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['Product', 'User', 'Order'],
    endpoints: (builder) => ({}),
});

// apiSlice is like the parent of all the other api slices,
// instead of putting endpoints here, 
// we will extend this apiSlice in other files, such as productApiSlice.js, userApiSlice.js, orderApiSlice.js

export default apiSlice;

