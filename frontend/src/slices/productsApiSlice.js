import { PRODUCTS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
        query: () => ({
            url: PRODUCTS_URL}),
            keepUnusedDataFor: 5, // keep data in the cache for 5 seconds after the last component unsubscribes
        }),
    
      getProductDetails: builder.query({
        query: (id) => ({
            url: `${PRODUCTS_URL}/${id}`}),
            keepUnusedDataFor: 5,
        }),
   
  }),
});

export const { useGetProductsQuery, useGetProductDetailsQuery } = productsApiSlice;
// the convention to name the hook is use + endpointName + Query (for queries) or Mutation (for mutations)