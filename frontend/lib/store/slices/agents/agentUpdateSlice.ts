import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { Agent, ApiResponse } from "@/types";

type AgentUpdateState = {
    isUpdating: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: AgentUpdateState = {
    isUpdating: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const updateAgent = createAppAsyncThunk(
    "agents/update",
    async ({ id, data }: { id: string, data: Partial<Agent> }, thunkAPI) => {
        try {
            const response = await api.put<ApiResponse<{ agent: Agent }>>(`/agents/${id}`, data);
            return response.data.data.agent;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to update agent");
        }
    }
);

export const AgentUpdateSlice = createSlice({
    name: "agentUpdate",
    initialState,
    reducers: {
        clearAgentUpdateState: (state) => {
            state.isError = false;
            state.isUpdating = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateAgent.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(updateAgent.fulfilled, (state) => {
                state.isUpdating = false;
                state.isSuccess = true;
            })
            .addCase(updateAgent.rejected, (state, action) => {
                state.isUpdating = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to update agent";
            });
    }
});

export const { clearAgentUpdateState } = AgentUpdateSlice.actions;
export const agentUpdateSelector = (state: { agentUpdate: AgentUpdateState }) => state.agentUpdate;
