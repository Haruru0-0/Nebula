import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { Agent, ApiResponse } from "@/types";

type AgentDetailState = {
    currentAgent: Agent | null
    isFetching: boolean
    isError: boolean
    errorMessage: string
}

const initialState: AgentDetailState = {
    currentAgent: null,
    isFetching: false,
    isError: false,
    errorMessage: ""
};

export const fetchAgentById = createAppAsyncThunk(
    "agents/fetchById",
    async (id: string, thunkAPI) => {
        try {
            const response = await api.get<ApiResponse<{ agent: Agent }>>(`/agents/${id}`);
            return response.data.data.agent;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch agent");
        }
    }
);

export const AgentDetailSlice = createSlice({
    name: "agentDetail",
    initialState,
    reducers: {
        setCurrentAgent: (state, action) => {
            state.currentAgent = action.payload;
        },
        clearAgentDetailState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgentById.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchAgentById.fulfilled, (state, action) => {
                state.isFetching = false;
                state.currentAgent = action.payload;
            })
            .addCase(fetchAgentById.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to fetch agent";
            });
    }
});

export const { setCurrentAgent, clearAgentDetailState } = AgentDetailSlice.actions;
export const agentDetailSelector = (state: { agentDetail: AgentDetailState }) => state.agentDetail;
