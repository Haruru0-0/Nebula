import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "@/types";

type StreamingChatState = {
    isStreaming: boolean
    streamingContent: string
    streamingConversationId: string | null
    completedMessage: ChatMessage | null
    error: string | null
}

const initialState: StreamingChatState = {
    isStreaming: false,
    streamingContent: "",
    streamingConversationId: null,
    completedMessage: null,
    error: null
};

export const streamingChatSlice = createSlice({
    name: "streamingChat",
    initialState,
    reducers: {
        startStreaming: (state, action: PayloadAction<string | null>) => {
            state.isStreaming = true;
            state.streamingContent = "";
            state.streamingConversationId = action.payload;
            state.completedMessage = null;
            state.error = null;
        },
        appendToken: (state, action: PayloadAction<string>) => {
            state.streamingContent += action.payload;
        },
        setConversationId: (state, action: PayloadAction<string>) => {
            state.streamingConversationId = action.payload;
        },
        finishStreaming: (state, action: PayloadAction<ChatMessage>) => {
            state.isStreaming = false;
            state.completedMessage = action.payload;
            state.streamingContent = "";
        },
        setStreamingError: (state, action: PayloadAction<string>) => {
            state.isStreaming = false;
            state.error = action.payload;
            state.streamingContent = "";
        },
        resetStreaming: (state) => {
            state.isStreaming = false;
            state.streamingContent = "";
            state.streamingConversationId = null;
            state.completedMessage = null;
            state.error = null;
        }
    }
});

export const {
    startStreaming,
    appendToken,
    setConversationId,
    finishStreaming,
    setStreamingError,
    resetStreaming
} = streamingChatSlice.actions;

export const streamingChatSelector = (state: { streamingChat: StreamingChatState }) => state.streamingChat;
