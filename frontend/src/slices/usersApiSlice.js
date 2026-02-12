import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
        query: (credentials) => ({
            url: `${USERS_URL}/login`,
            method: 'POST',
            body: credentials,
        }),
    }),
    register: builder.mutation({
        query: (userData) => ({
            url: `${USERS_URL}/register`,
            method: 'POST',
            body: userData,
        }),
    }), 
    logout: builder.mutation({
        query: () => ({
            url: `${USERS_URL}/logout`,
            method: 'POST',
        }),
    }),
  }),
});
    
export const { useLoginMutation, useLogoutMutation, useRegisterMutation } = usersApiSlice;