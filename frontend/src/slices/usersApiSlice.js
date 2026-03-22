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
    updateUserProfile: builder.mutation({
        query: (userData) => ({
            url: `${USERS_URL}/profile`,
            method: 'PUT',
            body: userData,
        }),
    }),
    getUserDetails: builder.query({
        query: (id) => ({
            url: `${USERS_URL}/${id}`,
            method: 'GET',
        }),
    }),
    getUsers: builder.query({
        query: () => ({
            url: `${USERS_URL}`,
            method: 'GET',
        }),
        providesTags: ['Users'], // provide the User tag, so the user list will be refetched after a new user is created or updated (when the User tag is invalidated)
        keepUnusedDataFor: 5, // keep data in the cache for 5 seconds after the last component unsubscribes
        }),
  
    deleteUser: builder.mutation({
        query: (id) => ({
            url: `${USERS_URL}/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Users'], // invalidate the User tag, so the user list will be refetched after a user is deleted
    }),
    updateUser: builder.mutation({
        query: (updatedUser) => ({
            url: `${USERS_URL}/${updatedUser._id}`,
            method: 'PUT',
            body: updatedUser,
        }),
        invalidatesTags: ['Users'], // invalidate the User tag, so the user list will be refetched after a user is updated
    }),
    }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useUpdateUserProfileMutation, useGetUserDetailsQuery, useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation } = usersApiSlice;