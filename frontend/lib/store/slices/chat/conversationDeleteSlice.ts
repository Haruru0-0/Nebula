import { createSlice } from "@reduxjs/toolkit";
import api from "../../api";
import { createAppAsyncThunk } from "../../createAppAsyncThunk";

type ConversationDeleteState = {
    isDeleting: boolean
    isSuccess: boolean
    isError: boolean
    errorMessage: string
}

const initialState: ConversationDeleteState = {
    isDeleting: false,
    isSuccess: false,
    isError: false,
    errorMessage: ""
};

export const deleteConversation = createAppAsyncThunk(
    "chat/delete",
    async (conversationId: string, thunkAPI) => {
        try {
            await api.delete(`/conversations/${conversationId}`);
            return conversationId;
        } catch (e: any) {
            return thunkAPI.rejectWithValue(e.response?.data?.message || "Failed to delete conversation");
        }
    }
);

export const ConversationDeleteSlice = createSlice({
    name: "conversationDelete",
    initialState,
    reducers: {
        clearConversationDeleteState: (state) => {
            state.isError = false;
            state.isDeleting = false;
            state.isSuccess = false;
            state.errorMessage = "";
            return state;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(deleteConversation.pending, (state) => {
                state.isDeleting = true;
            })
            .addCase(deleteConversation.fulfilled, (state) => {
                state.isDeleting = false;
                state.isSuccess = true;
            })
            .addCase(deleteConversation.rejected, (state, action) => {
                state.isDeleting = false;
                state.isError = true;
                state.errorMessage = action.payload || "Failed to delete conversation";
            });
    }
});

export const { clearConversationDeleteState } = ConversationDeleteSlice.actions;
export const conversationDeleteSelector = (state: { conversationDelete: ConversationDeleteState }) => state.conversationDelete;
