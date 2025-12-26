import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import secureLocalStorage from "react-secure-storage";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { VerifyEmailPayload, AuthData, ApiResponse } from "@/types";

type VerifyEmailState = {
    isVerifying: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: VerifyEmailState = {
    isVerifying: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const verifyEmailUser = createAppAsyncThunk(
    "auth/verifyEmail",
    async (payload: VerifyEmailPayload, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<AuthData>>("/auth/verify-email", payload);
            const { data } = response.data;
            if (response.status === 200) {
                secureLocalStorage.setItem("accessToken", data.accessToken);
                secureLocalStorage.setItem("refreshToken", data.refreshToken);
                secureLocalStorage.setItem("user", JSON.stringify(data.user));
                return data;
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Email verification failed");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const VerifyEmailSlice = createSlice({
    name: "verifyEmail",
    initialState,
    reducers: {
        clearVerifyEmailState: (state) => {
            state.isError = false;
            state.isVerifying = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyEmailUser.pending, (state) => {
                state.isVerifying = true;
            })
            .addCase(verifyEmailUser.fulfilled, (state) => {
                state.isVerifying = false;
                state.isSuccess = true;
            })
            .addCase(verifyEmailUser.rejected, (state, action) => {
                state.isVerifying = false;
                state.isError = true;
                state.errorMessage = action.payload || "Email verification failed";
            });
    }
});

export const { clearVerifyEmailState } = VerifyEmailSlice.actions;
export const verifyEmailSelector = (state: { verifyEmail: VerifyEmailState }) => state.verifyEmail;