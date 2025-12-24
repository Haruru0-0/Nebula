import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { Conversation, ApiResponse } from "@/types";

type ConversationDetailState = {
    activeConversation: Conversation | null
    isFetching: boolean
    isError: boolean
    errorMessage: string
}

const initialState: ConversationDetailState = {
    activeConversation: null,
    isFetching: false,
    isError: false,
    errorMessage: ""
};

export const fetchConversationById = createAppAsyncThunk(
    "chat/fetchById",
    async (conversationId: string, thunkAPI) => {
        try {
            const response = await api.get<ApiResponse<{ conversation: Conversation }>>(`/conversations/${conversationId}`);
            return response.data.data.conversation;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to fetch conversation");
        }
    }
);

export const ConversationDetailSlice = createSlice({
    name: "conversationDetail",
    initialState,
    reducers: {
        setActiveConversation: (state, action) => {
            state.activeConversation = action.payload;
        },
        clearConversationDetailState: (state) => {
            state.isError = false;
            state.isFetching = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversationById.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchConversationById.fulfilled, (state, action) => {
                state.isFetching = false;
                state.activeConversation = action.payload;
            })
            .addCase(fetchConversationById.rejected, (state, action) => {
                state.isFetching = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to fetch conversation";
            });
    }
});

export const { setActiveConversation, clearConversationDetailState } = ConversationDetailSlice.actions;
export const conversationDetailSelector = (state: { conversationDetail: ConversationDetailState }) => state.conversationDetail;
