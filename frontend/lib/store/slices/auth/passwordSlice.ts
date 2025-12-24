import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { ResetPasswordPayload, ApiResponse } from "@/types";

type PasswordState = {
    isFetching: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: PasswordState = {
    isFetching: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const forgotPassword = createAppAsyncThunk(
    "auth/forgot-password",
    async (email: string, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<void>>("/auth/forgot-password", { email });
            if (response.status === 200) {
                return response.data;
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Request failed");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const resetPassword = createAppAsyncThunk(
    "auth/reset-password",
    async (payload: ResetPasswordPayload, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<void>>("/auth/reset-password", payload);
            if (response.status === 200) {
                return response.data;
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Reset failed");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const PasswordSlice = createSlice({
    name: "password",
    initialState,
    reducers: {
        clearPasswordState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(forgotPassword.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.isFetching = false;
                state.isSuccess = true;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Request failed";
            })
            .addCase(resetPassword.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isFetching = false;
                state.isSuccess = true;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Reset failed";
            });
    }
});

export const { clearPasswordState } = PasswordSlice.actions;
export const passwordSelector = (state: { password: PasswordState }) => state.password;
