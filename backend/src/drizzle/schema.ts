import { relations, type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
    pgTable,
    uuid,
    text,
    varchar,
    boolean,
    integer,
    timestamp,
    index,
    uniqueIndex,
    real,
} from "drizzle-orm/pg-core";

/* =========================
   Users
========================= */

export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        password: text("password").notNull(),
        name: varchar("name", { length: 255 }),
        isVerified: boolean("is_verified").notNull().default(false),
        verificationToken: varchar("verification_token", { length: 255 }),
        verificationTokenExpiry: timestamp("verification_token_expiry", { withTimezone: true }),
        resetToken: varchar("reset_token", { length: 255 }),
        resetTokenExpiry: timestamp("reset_token_expiry", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow()
            .$onUpdateFn(() => new Date()),
    }
);

/* =========================
   Agents
========================= */

export const agents = pgTable(
    "agents",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        systemPrompt: text("system_prompt").notNull(),
        model: varchar("model", { length: 100 }).notNull().default("gpt-4.1"),
        provider: varchar("provider", { length: 100 }).notNull().default("openai"),
        temperature: real("temperature").notNull().default(0.7),
        maxTokens: integer("max_tokens").notNull().default(1000),
        isActive: boolean("is_active").notNull().default(true),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("agents_user_id_idx").on(t.userId),
    ]
);

/* =========================
   API keys (each user's own provider keys, encrypted)
========================= */

export const apiKeys = pgTable(
    "api_keys",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        provider: varchar("provider", { length: 20 }).notNull(),
        encryptedKey: text("encrypted_key").notNull(),
        keyHint: varchar("key_hint", { length: 8 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("api_keys_user_provider_idx").on(t.userId, t.provider),
    ]
);

/* =========================
   Sessions (rotating refresh tokens; only a hash of each token is stored)
========================= */

export const refreshTokens = pgTable(
    "refresh_tokens",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        // Every token from one sign-in shares a family, so a reused token can end the whole sign-in
        familyId: uuid("family_id").notNull(),
        tokenHash: varchar("token_hash", { length: 64 }).notNull(),
        remember: boolean("remember").notNull().default(false),
        // The absolute end of the sign-in: after this the person signs in again
        sessionEndsAt: timestamp("session_ends_at", { withTimezone: true }).notNull(),
        usedAt: timestamp("used_at", { withTimezone: true }),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("refresh_tokens_hash_idx").on(t.tokenHash),
        index("refresh_tokens_family_idx").on(t.familyId),
        index("refresh_tokens_user_idx").on(t.userId),
    ]
);

/* =========================
   Conversations
========================= */

export const conversations = pgTable(
    "conversations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        title: varchar("title", { length: 255 }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        agentId: uuid("agent_id")
            .notNull()
            .references(() => agents.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("conversations_user_id_idx").on(t.userId),
        index("conversations_agent_id_idx").on(t.agentId),
    ]
);


/* =========================
   Messages
========================= */

export const messages = pgTable(
    "messages",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        conversationId: uuid("conversation_id")
            .notNull()
            .references(() => conversations.id, { onDelete: "cascade" }),
        role: varchar("role", { length: 50 }).notNull(),
        content: text("content").notNull(),
        tokenCount: integer("token_count"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("messages_conversation_id_idx").on(t.conversationId),
    ]
);


/* =========================
   Metrics
========================= */

export const metrics = pgTable(
    "metrics",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        conversationId: uuid("conversation_id")
            .notNull()
            .references(() => conversations.id, { onDelete: "cascade" }),
        tokensProcessed: integer("tokens_processed").notNull(),
        responseLatency: integer("response_latency").notNull(),
        messageCount: integer("message_count").notNull(),
        timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("metrics_conversation_id_idx").on(t.conversationId),
        index("metrics_timestamp_idx").on(t.timestamp),
    ]
);

/* =========================
   Relations
========================= */

/* Users */
export const usersRelations = relations(users, ({ many }) => ({
    agents: many(agents),
    conversations: many(conversations),
}));

/* Agents */
export const agentsRelations = relations(agents, ({ one, many }) => ({
    user: one(users, {
        fields: [agents.userId],
        references: [users.id],
    }),
    conversations: many(conversations),
}));

/* Conversations */
export const conversationsRelations = relations(
    conversations,
    ({ one, many }) => ({
        user: one(users, {
            fields: [conversations.userId],
            references: [users.id],
        }),
        agent: one(agents, {
            fields: [conversations.agentId],
            references: [agents.id],
        }),
        messages: many(messages),
        metrics: many(metrics),
    })
);

/* Messages */
export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
}));

/* Metrics */
export const metricsRelations = relations(metrics, ({ one }) => ({
    conversation: one(conversations, {
        fields: [metrics.conversationId],
        references: [conversations.id],
    }),
}));

/* =========================
   Types
========================= */

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Agent = InferSelectModel<typeof agents>;
export type NewAgent = InferInsertModel<typeof agents>;

export type ApiKey = InferSelectModel<typeof apiKeys>;

export type Conversation = InferSelectModel<typeof conversations>;
export type NewConversation = InferInsertModel<typeof conversations>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export type Metric = InferSelectModel<typeof metrics>;
export type NewMetric = InferInsertModel<typeof metrics>;
