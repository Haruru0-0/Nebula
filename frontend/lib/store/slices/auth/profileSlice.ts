import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import secureLocalStorage from "react-secure-storage";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { User, ApiResponse } from "@/types";

interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}

type ProfileState = {
    user: User | null
    isFetching: boolean
    isError: boolean
    isChangingPassword: boolean
    changePasswordError: string | null
}

const initialState: ProfileState = {
    user: null,
    isFetching: false,
    isError: false,
    isChangingPassword: false,
    changePasswordError: null
};

export const getProfile = createAppAsyncThunk(
    "auth/profile",
    async (_, thunkAPI) => {
        try {
            const response = await api.get<ApiResponse<{ user: User }>>("/auth/profile");
            const { data } = response.data;
            if (response.status === 200) {
                secureLocalStorage.setItem("user", JSON.stringify(data.user));
                return data.user;
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Failed to fetch profile");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const changePassword = createAppAsyncThunk(
    "auth/changePassword",
    async (passwordData: ChangePasswordData, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<void>>("/auth/change-password", passwordData);
            if (response.status === 200) {
                return response.data.message || "Password changed successfully";
            } else {
                return thunkAPI.rejectWithValue(response.data.message || "Failed to change password");
            }
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Something went wrong");
        }
    }
);

export const ProfileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null;
            secureLocalStorage.clear();
            localStorage.removeItem("role");
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProfile.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isFetching = false;
                state.user = action.payload;
            })
            .addCase(getProfile.rejected, (state) => {
                state.isFetching = false;
                state.isError = true;
            })
            .addCase(changePassword.pending, (state) => {
                state.isChangingPassword = true;
                state.changePasswordError = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isChangingPassword = false;
                state.changePasswordError = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isChangingPassword = false;
                state.changePasswordError = action.payload as string;
            });
    }
});

export const { setProfile, logout } = ProfileSlice.actions;
export const profileSelector = (state: { profile: ProfileState }) => state.profile;
