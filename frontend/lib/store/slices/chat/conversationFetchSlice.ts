import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { Conversation, ApiResponse } from "@/types";

type ConversationFetchState = {
    conversations: Conversation[]
    isFetching: boolean
    isError: boolean
    errorMessage: string
}

const initialState: ConversationFetchState = {
    conversations: [],
    isFetching: false,
    isError: false,
    errorMessage: ""
};

export const fetchConversations = createAppAsyncThunk(
    "chat/fetchConversations",
    async (agentId: string, thunkAPI) => {
        try {
            const response = await api.get<ApiResponse<{ conversations: Conversation[] }>>(`/agents/${agentId}/conversations`);
            return response.data.data.conversations;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch conversations");
        }
    }
);

export const ConversationFetchSlice = createSlice({
    name: "conversationFetch",
    initialState,
    reducers: {
        clearConversationFetchState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.isFetching = false;
                state.conversations = action.payload;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to fetch conversations";
            });
    }
});

export const { clearConversationFetchState } = ConversationFetchSlice.actions;
export const conversationFetchSelector = (state: { conversationFetch: ConversationFetchState }) => state.conversationFetch;
