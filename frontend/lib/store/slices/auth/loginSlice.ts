import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import secureLocalStorage from "react-secure-storage";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { LoginPayload, AuthData, ApiResponse } from "@/types";

type LoginState = {
    isFetching: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: LoginState = {
    isFetching: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const loginUser = createAppAsyncThunk(
    "auth/login",
    async (payload: LoginPayload, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<AuthData>>("/auth/signin", payload);
            const { data } = response.data;
            if (response.status === 200) {
                secureLocalStorage.setItem("accessToken", data.accessToken);
                secureLocalStorage.setItem("refreshToken", data.refreshToken);
                secureLocalStorage.setItem("user", JSON.stringify(data.user));
                return data;
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Login failed");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const LoginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        clearLoginState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(loginUser.fulfilled, (state) => {
                state.isFetching = false;
                state.isSuccess = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Login failed";
            });
    }
});

export const { clearLoginState } = LoginSlice.actions;
export const loginSelector = (state: { login: LoginState }) => state.login;
