"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRelations = exports.messagesRelations = exports.conversationsRelations = exports.agentsRelations = exports.usersRelations = exports.metrics = exports.messages = exports.conversations = exports.agents = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
/* =========================
   Users
========================= */
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }),
    isVerified: (0, pg_core_1.boolean)("is_verified").notNull().default(false),
    verificationToken: (0, pg_core_1.varchar)("verification_token", { length: 255 }),
    verificationTokenExpiry: (0, pg_core_1.timestamp)("verification_token_expiry", { withTimezone: true }),
    resetToken: (0, pg_core_1.varchar)("reset_token", { length: 255 }),
    resetTokenExpiry: (0, pg_core_1.timestamp)("reset_token_expiry", { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
});
/* =========================
   Agents
========================= */
exports.agents = (0, pg_core_1.pgTable)("agents", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    systemPrompt: (0, pg_core_1.text)("system_prompt").notNull(),
    model: (0, pg_core_1.varchar)("model", { length: 100 }).notNull().default("gpt-4.1"),
    provider: (0, pg_core_1.varchar)("provider", { length: 100 }).notNull().default("openai"),
    temperature: (0, pg_core_1.real)("temperature").notNull().default(0.7),
    maxTokens: (0, pg_core_1.integer)("max_tokens").notNull().default(1000),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.index)("agents_user_id_idx").on(t.userId),
]);
/* =========================
   Conversations
========================= */
exports.conversations = (0, pg_core_1.pgTable)("conversations", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    agentId: (0, pg_core_1.uuid)("agent_id")
        .notNull()
        .references(() => exports.agents.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.index)("conversations_user_id_idx").on(t.userId),
    (0, pg_core_1.index)("conversations_agent_id_idx").on(t.agentId),
]);
/* =========================
   Messages
========================= */
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    conversationId: (0, pg_core_1.uuid)("conversation_id")
        .notNull()
        .references(() => exports.conversations.id, { onDelete: "cascade" }),
    role: (0, pg_core_1.varchar)("role", { length: 50 }).notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    tokenCount: (0, pg_core_1.integer)("token_count"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.index)("messages_conversation_id_idx").on(t.conversationId),
]);
/* =========================
   Metrics
========================= */
exports.metrics = (0, pg_core_1.pgTable)("metrics", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    conversationId: (0, pg_core_1.uuid)("conversation_id")
        .notNull()
        .references(() => exports.conversations.id, { onDelete: "cascade" }),
    tokensProcessed: (0, pg_core_1.integer)("tokens_processed").notNull(),
    responseLatency: (0, pg_core_1.integer)("response_latency").notNull(),
    messageCount: (0, pg_core_1.integer)("message_count").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    (0, pg_core_1.index)("metrics_conversation_id_idx").on(t.conversationId),
    (0, pg_core_1.index)("metrics_timestamp_idx").on(t.timestamp),
]);
/* =========================
   Relations
========================= */
/* Users */
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    agents: many(exports.agents),
    conversations: many(exports.conversations),
}));
/* Agents */
exports.agentsRelations = (0, drizzle_orm_1.relations)(exports.agents, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.agents.userId],
        references: [exports.users.id],
    }),
    conversations: many(exports.conversations),
}));
/* Conversations */
exports.conversationsRelations = (0, drizzle_orm_1.relations)(exports.conversations, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.conversations.userId],
        references: [exports.users.id],
    }),
    agent: one(exports.agents, {
        fields: [exports.conversations.agentId],
        references: [exports.agents.id],
    }),
    messages: many(exports.messages),
    metrics: many(exports.metrics),
}));
/* Messages */
exports.messagesRelations = (0, drizzle_orm_1.relations)(exports.messages, ({ one }) => ({
    conversation: one(exports.conversations, {
        fields: [exports.messages.conversationId],
        references: [exports.conversations.id],
    }),
}));
/* Metrics */
exports.metricsRelations = (0, drizzle_orm_1.relations)(exports.metrics, ({ one }) => ({
    conversation: one(exports.conversations, {
        fields: [exports.metrics.conversationId],
        references: [exports.conversations.id],
    }),
}));
//# sourceMappingURL=schema.js.map