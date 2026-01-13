import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
        query: (credentials) => ({
            url: `${USERS_URL}/auth`,
            method: 'POST',
            body: credentials,
        }),
    }),
    }),
});
    
export const { useLoginMutation } = usersApiSlice;