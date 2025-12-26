import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";
import { Conversation, ApiResponse } from "@/types";

type ConversationUpdateState = {
    isUpdating: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string | null
}

const initialState: ConversationUpdateState = {
    isUpdating: false,
    isSuccess: false,
    isError: false,
    errorMessage: null
};

export const updateConversation = createAppAsyncThunk(
    "chat/updateConversation",
    async ({ conversationId, title }: { conversationId: string, title: string }, thunkAPI) => {
        try {
            const response = await api.patch<ApiResponse<{ conversation: Conversation }>>(`/chat/conversations/${conversationId}`, {
                title
            });
            return response.data.data;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to update conversation");
        }
    }
);

const ConversationUpdateSlice = createSlice({
    name: "conversationUpdate",
    initialState,
    reducers: {
        clearConversationUpdateState: (state) => {
            state.isError = false;
            state.isUpdating = false;
            state.isSuccess = false;
            state.errorMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateConversation.pending, (state) => {
                state.isUpdating = true;
                state.isSuccess = false;
                state.isError = false;
                state.errorMessage = null;
            })
            .addCase(updateConversation.fulfilled, (state) => {
                state.isUpdating = false;
                state.isSuccess = true;
            })
            .addCase(updateConversation.rejected, (state, action) => {
                state.isUpdating = false;
                state.isError = true;
                state.errorMessage = action.payload as string;
            });
    }
});

export const { clearConversationUpdateState } = ConversationUpdateSlice.actions;
export const conversationUpdateSelector = (state: { conversationUpdate: ConversationUpdateState }) => state.conversationUpdate;
export { ConversationUpdateSlice };
export default ConversationUpdateSlice.reducer;
