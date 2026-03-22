import { PRODUCTS_URL } from "../constants";
import { apiSlice } from "./apiSlice";
import { UPLOAD_URL } from "../constants";

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: PRODUCTS_URL,
      }),
      keepUnusedDataFor: 5, // keep data in the cache for 5 seconds after the last component unsubscribes
      providesTags: ['Products'], // provide the Product tag, so the product list will be refetched after a new product is created or updated (when the Product tag is invalidated)
    }),
    
    getProductDetails: builder.query({
      query: (id) => ({
          url: `${PRODUCTS_URL}/${id}`}),
      keepUnusedDataFor: 5,
      }),

    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Products'], // invalidate the Product tag, so the product list will be refetched after a new product is created （stop showing the cached product list, and fetch the updated product list from the server）
    }),

    updateProduct: builder.mutation({
      query: (updatedProduct) => ({
        url: `${PRODUCTS_URL}/${updatedProduct._id}`,
        method: 'PUT',
        body: updatedProduct,
      }),
      invalidatesTags: ['Products'],
    }),

		uploadProductImage: builder.mutation({
			query: (formData) => ({
				url: UPLOAD_URL,
				method: 'POST',
				body: formData,
			}),
		}),

  }),
});

export const { useGetProductsQuery, useGetProductDetailsQuery, useCreateProductMutation, useUpdateProductMutation, useUploadProductImageMutation } = productsApiSlice;
// the convention to name the hook is use + endpointName + Query (for queries) or Mutation (for mutations)