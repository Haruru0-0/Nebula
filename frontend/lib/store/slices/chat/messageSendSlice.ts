import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { ChatMessage, ApiResponse } from "@/types";

type MessageSendState = {
    isSending: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
    lastSentMessage: ChatMessage | null
}

const initialState: MessageSendState = {
    isSending: false,
    isSuccess: false,
    isError: false,
    errorMessage: "",
    lastSentMessage: null
};

export const sendMessage = createAppAsyncThunk(
    "chat/sendMessage",
    async ({ agentId, message, conversationId }: { agentId: string, message: string, conversationId?: string }, thunkAPI) => {
        try {
            const response = await api.post<ApiResponse<{ conversationId: string, message: ChatMessage }>>(`/chat/${agentId}`, {
                message,
                conversationId
            });
            return response.data.data;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to send message");
        }
    }
);

export const MessageSendSlice = createSlice({
    name: "messageSend",
    initialState,
    reducers: {
        clearMessageSendState: (state) => {
            state.isError = false;
            state.isSuccess = false;
            state.isSending = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessage.pending, (state) => {
                state.isSending = true;
                state.isSuccess = false;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isSending = false;
                state.isSuccess = true;
                state.lastSentMessage = action.payload.message;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isSending = false;
                state.isSuccess = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to send message";
            });
    }
});

export const { clearMessageSendState } = MessageSendSlice.actions;
export const messageSendSelector = (state: { messageSend: MessageSendState }) => state.messageSend;
