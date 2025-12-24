import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { Agent, ApiResponse } from "@/types";

type AgentAddState = {
    isAdding: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: AgentAddState = {
    isAdding: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const createAgent = createAppAsyncThunk(
    "agents/create",
    async (payload: Partial<Agent>, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<{ agent: Agent }>>("/agents", payload);
            return response.data.data.agent;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to create agent");
        }
    }
);

export const AgentAddSlice = createSlice({
    name: "agentAdd",
    initialState,
    reducers: {
        clearAgentAddState: (state) => {
            state.isError = false;
            state.isAdding = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createAgent.pending, (state) => {
                state.isAdding = true;
            })
            .addCase(createAgent.fulfilled, (state) => {
                state.isAdding = false;
                state.isSuccess = true;
            })
            .addCase(createAgent.rejected, (state, action) => {
                state.isAdding = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to create agent";
            });
    }
});

export const { clearAgentAddState } = AgentAddSlice.actions;
export const agentAddSelector = (state: { agentAdd: AgentAddState }) => state.agentAdd;
