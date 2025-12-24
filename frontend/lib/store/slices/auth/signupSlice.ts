import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import secureLocalStorage from "react-secure-storage";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { SignupPayload, AuthData, ApiResponse } from "@/types";

type SignupState = {
    isFetching: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: SignupState = {
    isFetching: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const signupUser = createAppAsyncThunk(
    "auth/signup",
    async (payload: SignupPayload, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<AuthData>>("/auth/signup", payload);
            const { data } = response.data;
            if (response.status === 201 || response.status === 200) {
                secureLocalStorage.setItem("accessToken", data.accessToken);
                secureLocalStorage.setItem("refreshToken", data.refreshToken);
                secureLocalStorage.setItem("user", JSON.stringify(data.user));
                return data;
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Signup failed");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const SignupSlice = createSlice({
    name: "signup",
    initialState,
    reducers: {
        clearSignupState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signupUser.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(signupUser.fulfilled, (state) => {
                state.isFetching = false;
                state.isSuccess = true;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Signup failed";
            });
    }
});

export const { clearSignupState } = SignupSlice.actions;
export const signupSelector = (state: { signup: SignupState }) => state.signup;
