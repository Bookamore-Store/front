import { setLanguageHeader } from '@/shared/helpers/setLanguageHeader';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store';
import type { ListResponse } from '@/types/entities/ListResponse';
import type {
  ChatMessage,
  Conversation,
  MessagesResponse,
  SendConversationMessageRequest,
  SendOfferMessageRequest,
  UnreadCountResponse,
} from '@/types/entities/Chat';

export interface GetConversationMessagesParams {
  conversationId: string;
  before?: string;
  after?: string;
  limit?: number;
}

export const ChatsApi = createApi({
  reducerPath: 'chatsApi',
  tagTypes: ['Conversation', 'Messages', 'UnreadCount'],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_API_URL || '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return setLanguageHeader(headers);
    },
  }),
  endpoints: (build) => ({
    // =========================
    // Conversations
    // =========================

    getConversations: build.query<
      ListResponse<Conversation> | Conversation[],
      void
    >({
      query: () => '/conversations',
      providesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),

    getConversationMessages: build.query<
      MessagesResponse,
      GetConversationMessagesParams
    >({
      query: ({ conversationId, before, after, limit = 20 }) => ({
        url: `/conversations/${conversationId}/messages`,
        params: {
          limit,
          ...(before ? { before } : {}),
          ...(after ? { after } : {}),
        },
      }),

      keepUnusedDataFor: 60,

      providesTags: (_result, _error, { conversationId, before, after }) => {
        // Historical pages are not invalidated by message mutations.
        if (before || after) {
          return [];
        }

        return [
          {
            type: 'Messages',
            id: conversationId,
          },
        ];
      },
    }),

    sendConversationMessage: build.mutation<
      ChatMessage,
      SendConversationMessageRequest
    >({
      query: ({ conversationId, content }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: 'POST',
        body: {
          content,
        },
      }),
      invalidatesTags: (_result, error, { conversationId }) =>
        error
          ? []
          : [
              { type: 'Messages', id: conversationId },
              { type: 'Conversation', id: 'LIST' },
              'UnreadCount',
            ],
    }),

    markConversationAsRead: build.mutation<void, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, error, conversationId) =>
        error
          ? []
          : [
              {
                type: 'Messages',
                id: conversationId,
              },
              {
                type: 'Conversation',
                id: 'LIST',
              },
              'UnreadCount',
            ],
    }),

    getUnreadCount: build.query<UnreadCountResponse, void>({
      query: () => '/conversations/unread-count',
      providesTags: ['UnreadCount'],
    }),

    // =========================
    // Offer messages
    // =========================

    getOfferMessages: build.query<MessagesResponse, string>({
      query: (offerId) => `/offers/${offerId}/messages`,
      providesTags: (_result, _error, offerId) => [
        {
          type: 'Messages',
          id: `offer-${offerId}`,
        },
      ],
    }),

    sendOfferMessage: build.mutation<ChatMessage, SendOfferMessageRequest>({
      query: ({ offerId, content }) => ({
        url: `/offers/${offerId}/messages`,
        method: 'POST',
        body: { content },
      }),

      invalidatesTags: (_result, error, { offerId }) =>
        error
          ? []
          : [
              { type: 'Messages', id: `offer-${offerId}` },
              { type: 'Conversation', id: 'LIST' },
              'UnreadCount',
            ],
    }),

    markOfferMessagesAsRead: build.mutation<void, string>({
      query: (offerId) => ({
        url: `/offers/${offerId}/messages/read`,
        method: 'POST',
      }),

      invalidatesTags: (_result, error, offerId) =>
        error
          ? []
          : [
              { type: 'Messages', id: `offer-${offerId}` },
              { type: 'Conversation', id: 'LIST' },
              'UnreadCount',
            ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetConversationMessagesQuery,
  useLazyGetConversationMessagesQuery,
  useSendConversationMessageMutation,
  useMarkConversationAsReadMutation,
  useGetUnreadCountQuery,
  useLazyGetUnreadCountQuery,
  useGetOfferMessagesQuery,
  useLazyGetOfferMessagesQuery,
  useSendOfferMessageMutation,
  useMarkOfferMessagesAsReadMutation,
} = ChatsApi;
