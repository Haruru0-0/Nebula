import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { ResendVerificationPayload, ApiResponse } from "@/types";

type ResendVerificationState = {
    isResending: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: ResendVerificationState = {
    isResending: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const resendVerificationUser = createAppAsyncThunk(
    "auth/resendVerification",
    async (payload: ResendVerificationPayload, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<void>>("/auth/resend-verification", payload);
            if (response.status === 200) {
                return response.data.message || "Verification email sent successfully";
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Failed to resend verification email");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const ResendVerificationSlice = createSlice({
    name: "resendVerification",
    initialState,
    reducers: {
        clearResendVerificationState: (state) => {
            state.isError = false;
            state.isResending = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(resendVerificationUser.pending, (state) => {
                state.isResending = true;
            })
            .addCase(resendVerificationUser.fulfilled, (state) => {
                state.isResending = false;
                state.isSuccess = true;
            })
            .addCase(resendVerificationUser.rejected, (state, action) => {
                state.isResending = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to resend verification email";
            });
    }
});

export const { clearResendVerificationState } = ResendVerificationSlice.actions;
export const resendVerificationSelector = (state: { resendVerification: ResendVerificationState }) => state.resendVerification;