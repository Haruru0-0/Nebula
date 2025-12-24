import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";

type AgentDeleteState = {
    isDeleting: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: AgentDeleteState = {
    isDeleting: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const deleteAgent = createAppAsyncThunk(
    "agents/delete",
    async (id: string, thunkAPI) => {
        try {
            await api.delete(`/agents/${id}`);
            return id;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to delete agent");
        }
    }
);

export const AgentDeleteSlice = createSlice({
    name: "agentDelete",
    initialState,
    reducers: {
        clearAgentDeleteState: (state) => {
            state.isError = false;
            state.isDeleting = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(deleteAgent.pending, (state) => {
                state.isDeleting = true;
            })
            .addCase(deleteAgent.fulfilled, (state) => {
                state.isDeleting = false;
                state.isSuccess = true;
            })
            .addCase(deleteAgent.rejected, (state, action) => {
                state.isDeleting = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to delete agent";
            });
    }
});

export const { clearAgentDeleteState } = AgentDeleteSlice.actions;
export const agentDeleteSelector = (state: { agentDelete: AgentDeleteState }) => state.agentDelete;
