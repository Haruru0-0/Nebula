import { LoginSlice } from "./slices/auth/loginSlice";
import { SignupSlice } from "./slices/auth/signupSlice";
import { ProfileSlice } from "./slices/auth/profileSlice";
import { PasswordSlice } from "./slices/auth/passwordSlice";
import { VerifyEmailSlice } from "./slices/auth/verifyEmailSlice";
import { ResendVerificationSlice } from "./slices/auth/resendVerificationSlice";

import { AgentFetchSlice } from "./slices/agents/agentFetchSlice";
import { AgentDeleteSlice } from "./slices/agents/agentDeleteSlice";
import { AgentAddSlice } from "./slices/agents/agentAddSlice";
import { AgentUpdateSlice } from "./slices/agents/agentUpdateSlice";
import { AgentDetailSlice } from "./slices/agents/agentDetailSlice";

import { ConversationFetchSlice } from "./slices/chat/conversationFetchSlice";
import { ConversationDeleteSlice } from "./slices/chat/conversationDeleteSlice";
import { ConversationDetailSlice } from "./slices/chat/conversationDetailSlice";
import { ConversationUpdateSlice } from "./slices/chat/conversationUpdateSlice";
import { MessageSendSlice } from "./slices/chat/messageSendSlice";

import { OverallMetricsSlice } from "./slices/metrics/overallMetricsSlice";
import { AgentMetricsSlice } from "./slices/metrics/agentMetricsSlice";

export const reducer = {
    // Auth
    login: LoginSlice.reducer,
    signup: SignupSlice.reducer,
    profile: ProfileSlice.reducer,
    password: PasswordSlice.reducer,
    verifyEmail: VerifyEmailSlice.reducer,
    resendVerification: ResendVerificationSlice.reducer,

    // Agents
    agentFetch: AgentFetchSlice.reducer,
    agentDelete: AgentDeleteSlice.reducer,
    agentAdd: AgentAddSlice.reducer,
    agentUpdate: AgentUpdateSlice.reducer,
    agentDetail: AgentDetailSlice.reducer,

    // Chat
    conversationFetch: ConversationFetchSlice.reducer,
    conversationDelete: ConversationDeleteSlice.reducer,
    conversationDetail: ConversationDetailSlice.reducer,
    conversationUpdate: ConversationUpdateSlice.reducer,
    messageSend: MessageSendSlice.reducer,

    // Metrics
    overallMetrics: OverallMetricsSlice.reducer,
    agentMetrics: AgentMetricsSlice.reducer,
};