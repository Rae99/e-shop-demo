import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
    token: localStorage.getItem('token') ? localStorage.getItem('token') : null,
};

// 但注意：如果你们后端走的是 HttpOnly cookie 方案，前端其实不需要 token（也拿不到）。
// 这段更像是 header token 方案留下的写法。

const authSlice = createSlice({
    name: 'auth', // as the prefix for action types, e.g. auth/setCredentials
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const {userInfo, token} = action.payload;
            state.userInfo = userInfo;
            state.token = token;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            localStorage.setItem('token', token);
        }
    },
});

export const {setCredentials} = authSlice.actions;

export default authSlice.reducer;