import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { Agent, ApiResponse } from "@/types";

type AgentFetchState = {
    agents: Agent[]
    isFetching: boolean
    isError: boolean
    errorMessage: string
}

const initialState: AgentFetchState = {
    agents: [],
    isFetching: false,
    isError: false,
    errorMessage: ""
};

export const fetchAgents = createAppAsyncThunk(
    "agents/fetchAll",
    async (_, thunkAPI) => {
        try {
            const response = await api.get<ApiResponse<{ agents: Agent[], count: number }>>("/agents");
            return response.data.data.agents;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch agents");
        }
    }
);

export const AgentFetchSlice = createSlice({
    name: "agentFetch",
    initialState,
    reducers: {
        clearAgentFetchState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgents.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchAgents.fulfilled, (state, action) => {
                state.isFetching = false;
                state.agents = action.payload;
            })
            .addCase(fetchAgents.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to fetch agents";
            });
    }
});

export const { clearAgentFetchState } = AgentFetchSlice.actions;
export const agentFetchSelector = (state: { agentFetch: AgentFetchState }) => state.agentFetch;
