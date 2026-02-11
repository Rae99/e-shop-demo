import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
};

const authSlice = createSlice({
    name: 'auth', // as the prefix for action types, e.g. auth/setCredentials
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const userInfo = action.payload;
            state.userInfo = userInfo;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        },
        logout: (state) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        }, // action can be emitted when we don't need the payload
    }, // Reducers don’t trigger actions — dispatch does. Reducers only receive actions.
});

export const {setCredentials, logout} = authSlice.actions;

export default authSlice.reducer;