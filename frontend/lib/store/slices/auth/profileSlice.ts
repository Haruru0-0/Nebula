import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import secureLocalStorage from "react-secure-storage";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { User, ApiResponse } from "@/types";

type ProfileState = {
    user: User | null
    isFetching: boolean
    isError: boolean
}

const initialState: ProfileState = {
    user: null,
    isFetching: false,
    isError: false
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
            });
    }
});

export const { setProfile, logout } = ProfileSlice.actions;
export const profileSelector = (state: { profile: ProfileState }) => state.profile;
