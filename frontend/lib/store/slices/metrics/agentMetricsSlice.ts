import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { MetricsResponse, ApiResponse } from "@/types";

type AgentMetricsState = {
    metricsMap: Record<string, MetricsResponse>
    isFetching: boolean
    isError: boolean
    errorMessage: string
}

const initialState: AgentMetricsState = {
    metricsMap: {},
    isFetching: false,
    isError: false,
    errorMessage: ""
};

export const fetchAgentMetrics = createAppAsyncThunk(
    "metrics/fetchAgent",
    async ({ agentId, period = "24h" }: { agentId: string, period?: string }, thunkAPI) => {
        try {
            const response = await api.get<ApiResponse<MetricsResponse>>(`/metrics/${agentId}`, {
                params: { period }
            });
            return { agentId, data: response.data.data };
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || `Failed to fetch metrics for agent ${agentId}`);
        }
    }
);

export const AgentMetricsSlice = createSlice({
    name: "agentMetrics",
    initialState,
    reducers: {
        clearAgentMetricsState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgentMetrics.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchAgentMetrics.fulfilled, (state, action) => {
                state.isFetching = false;
                state.metricsMap[action.payload.agentId] = action.payload.data;
            })
            .addCase(fetchAgentMetrics.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to fetch agent metrics";
            });
    }
});

export const { clearAgentMetricsState } = AgentMetricsSlice.actions;
export const agentMetricsSelector = (state: { agentMetrics: AgentMetricsState }) => state.agentMetrics;
