import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { MetricsResponse, ApiResponse } from "@/types";

type OverallMetricsState = {
    data: MetricsResponse | null
    isFetching: boolean
    isError: boolean
    errorMessage: string
}

const initialState: OverallMetricsState = {
    data: null,
    isFetching: false,
    isError: false,
    errorMessage: ""
};

export const fetchOverallMetrics = createAppAsyncThunk(
    "metrics/fetchOverall",
    async (period: string = "24h", thunkAPI) => {
        try {
            const response = await api.get<ApiResponse<MetricsResponse>>(`/metrics/overall`, {
                params: { period }
            });
            return response.data.data;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch overall metrics");
        }
    }
);

export const OverallMetricsSlice = createSlice({
    name: "overallMetrics",
    initialState,
    reducers: {
        clearOverallMetricsState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOverallMetrics.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchOverallMetrics.fulfilled, (state, action) => {
                state.isFetching = false;
                state.data = action.payload;
            })
            .addCase(fetchOverallMetrics.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to fetch overall metrics";
            });
    }
});

export const { clearOverallMetricsState } = OverallMetricsSlice.actions;
export const overallMetricsSelector = (state: { overallMetrics: OverallMetricsState }) => state.overallMetrics;
