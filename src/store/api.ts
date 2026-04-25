import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import { clearAuth, setCredentials } from "./reducers/auth";
import type { Conversation, Message, PaginatedResponse, Post, User } from "@/types";

type AuthResponse = {
  id: string;
  fullName: string;
  email: string;
  image?: string;
  accessToken: string;
  refreshToken: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

type UpdateMeRequest = {
  fullName?: string;
  image?: File | null;
};

type PostsQueryParams = {
  limit?: number;
  skip?: number;
};

type UpsertPostPayload = {
  content: string;
  image?: File | null;
};

type ConversationSummaryResponse = {
  conversationId: string;
  participants: User[];
  lastMessage?: {
    _id?: string;
    content: string;
    senderId: string | User;
    createdAt: string;
    updatedAt?: string;
  } | null;
  updatedAt: string;
  createdAt: string;
};

type ConversationDetailsResponse = {
  conversationId: string;
  participants: User[];
  messages: Array<{
    _id?: string;
    messageId?: string;
    conversationId?: string;
    senderId: string | User;
    content: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  totalMessages: number;
  hasMore: boolean;
  createdAt: string;
  updatedAt: string;
};

type ConversationListResponse = {
  conversations: ConversationSummaryResponse[];
  total: number;
  hasMore: boolean;
};

type MessagesListResponse = {
  messages: Array<{
    _id?: string;
    messageId?: string;
    conversationId?: string;
    senderId: string | User;
    content: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  conversationId: string;
  hasMore: boolean;
  totalCount: number;
};

type PostAssistRequest = {
  draft: string;
  intent?: "help-request" | "offer-help" | "general";
  tone?: "friendly" | "formal" | "short";
};

type PostAssistResponse = {
  message: string;
  data: {
    originalText: string;
    improvedText: string;
    summary: string;
    hashtags: string[];
    category: string;
    improvementNotes: string[];
  };
};

const createPostFormData = ({ content, image }: UpsertPostPayload) => {
  const formData = new FormData();
  formData.append("content", content);
  if (image) {
    formData.append("image", image);
  }
  return formData;
};

const createProfileFormData = ({ fullName, image }: UpdateMeRequest) => {
  const formData = new FormData();
  if (typeof fullName === "string") {
    formData.append("fullName", fullName);
  }
  if (image) {
    formData.append("image", image);
  }
  return formData;
};

const normalizeMessage = (message: {
  _id?: string;
  messageId?: string;
  conversationId?: string;
  senderId: string | User;
  content: string;
  createdAt: string;
  updatedAt?: string;
}): Message => ({
  id: message.messageId ?? message._id ?? "",
  conversationId: message.conversationId,
  content: message.content,
  senderId:
    typeof message.senderId === "string" ? message.senderId : message.senderId.id,
  sender: typeof message.senderId === "string" ? undefined : message.senderId,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const tokens = refreshResult.data as {
          accessToken: string;
          refreshToken: string;
        };
        api.dispatch(
          setCredentials({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }),
        );
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearAuth());
      }
    } else {
      api.dispatch(clearAuth());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AuthUser", "Posts", "Post", "Conversations", "Conversation"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
    }),
    refreshToken: builder.mutation<
      { accessToken: string; refreshToken: string },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["AuthUser"],
      transformResponse: (response: User) => response,
    }),
    updateMe: builder.mutation<User, UpdateMeRequest>({
      query: (body) => ({
        url: "/auth/me",
        method: "PUT",
        body: createProfileFormData(body),
      }),
      invalidatesTags: ["AuthUser"],
    }),
    getPosts: builder.query<PaginatedResponse<Post>, PostsQueryParams | void>({
      query: ({ limit = 10, skip = 0 } = {}) => ({
        url: "/posts",
        params: { limit, skip },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((post) => ({
                type: "Post" as const,
                id: post.id,
              })),
              { type: "Posts" as const, id: "LIST" },
            ]
          : [{ type: "Posts" as const, id: "LIST" }],
    }),
    getPostById: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (_, __, postId) => [{ type: "Post", id: postId }],
    }),
    getPostsByUserId: builder.query<
      PaginatedResponse<Post>,
      { userId: string; limit?: number; skip?: number }
    >({
      query: ({ userId, limit = 10, skip = 0 }) => ({
        url: `/posts/user/${userId}`,
        params: { limit, skip },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((post) => ({
                type: "Post" as const,
                id: post.id,
              })),
              { type: "Posts" as const, id: "LIST" },
            ]
          : [{ type: "Posts" as const, id: "LIST" }],
    }),
    createPost: builder.mutation<Post, UpsertPostPayload>({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body: createPostFormData(body),
      }),
      invalidatesTags: [{ type: "Posts", id: "LIST" }],
    }),
    updatePost: builder.mutation<Post, { postId: string; data: UpsertPostPayload }>(
      {
        query: ({ postId, data }) => ({
          url: `/posts/${postId}`,
          method: "PUT",
          body: createPostFormData(data),
        }),
        invalidatesTags: (_, __, { postId }) => [
          { type: "Post", id: postId },
          { type: "Posts", id: "LIST" },
        ],
      },
    ),
    deletePost: builder.mutation<{ message: string }, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Posts", id: "LIST" }],
    }),
    togglePostLike: builder.mutation<
      { message: string; liked: boolean; likesCount: number },
      string
    >({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_, __, postId) => [
        { type: "Post", id: postId },
        { type: "Posts", id: "LIST" },
      ],
    }),
    createComment: builder.mutation<
      { id: string; content: string; createdAt: string; createdBy: User },
      { postId: string; content: string }
    >({
      query: ({ postId, content }) => ({
        url: `/comments/${postId}`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: "Post", id: postId },
        { type: "Posts", id: "LIST" },
      ],
    }),
    getConversations: builder.query<
      { conversations: Conversation[]; total: number; hasMore: boolean },
      { limit?: number; skip?: number } | void
    >({
      query: ({ limit = 20, skip = 0 } = {}) => ({
        url: "/conversations",
        params: { limit, skip },
      }),
      transformResponse: (response: ConversationListResponse) => ({
        conversations: response.conversations.map((conversation) => ({
          id: conversation.conversationId,
          participants: conversation.participants,
          messages: [],
          lastMessage: conversation.lastMessage
            ? normalizeMessage(conversation.lastMessage)
            : undefined,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        })),
        total: response.total,
        hasMore: response.hasMore,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.conversations.map((conversation) => ({
                type: "Conversation" as const,
                id: conversation.id,
              })),
              { type: "Conversations" as const, id: "LIST" },
            ]
          : [{ type: "Conversations" as const, id: "LIST" }],
    }),
    getConversationById: builder.query<Conversation, string>({
      query: (conversationId) => `/conversations/${conversationId}`,
      transformResponse: (response: ConversationDetailsResponse) => ({
        id: response.conversationId,
        participants: response.participants,
        messages: response.messages.map(normalizeMessage),
        totalMessages: response.totalMessages,
        hasMore: response.hasMore,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      }),
      providesTags: (_, __, conversationId) => [
        { type: "Conversation", id: conversationId },
      ],
    }),
    getConversationMessages: builder.query<
      {
        messages: Message[];
        hasMore: boolean;
        totalCount: number;
        conversationId: string;
      },
      { conversationId: string; limit?: number; skip?: number }
    >({
      query: ({ conversationId, limit = 50, skip = 0 }) => ({
        url: `/messages/conversations/${conversationId}`,
        params: { limit, skip },
      }),
      transformResponse: (response: MessagesListResponse) => ({
        messages: response.messages.map(normalizeMessage),
        hasMore: response.hasMore,
        totalCount: response.totalCount,
        conversationId: response.conversationId,
      }),
      providesTags: (_, __, { conversationId }) => [
        { type: "Conversation", id: conversationId },
      ],
    }),
    editMessage: builder.mutation<
      {
        messageId: string;
        conversationId: string;
        content: string;
        updatedAt: string;
      },
      { messageId: string; content: string; conversationId: string }
    >({
      query: ({ messageId, content }) => ({
        url: `/messages/${messageId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (_, __, { conversationId }) => [
        { type: "Conversation", id: conversationId },
        { type: "Conversations", id: "LIST" },
      ],
    }),
    deleteMessage: builder.mutation<
      { messageId: string; conversationId: string; message: string },
      { messageId: string; conversationId: string }
    >({
      query: ({ messageId }) => ({
        url: `/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { conversationId }) => [
        { type: "Conversation", id: conversationId },
        { type: "Conversations", id: "LIST" },
      ],
    }),
    postAssist: builder.mutation<PostAssistResponse, PostAssistRequest>({
      query: (body) => ({
        url: "/ai/post-assist",
        method: "POST",
        body,
        timeout: 10000,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useTogglePostLikeMutation,
  useCreateCommentMutation,
  useGetConversationsQuery,
  useGetConversationByIdQuery,
  useGetConversationMessagesQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
  usePostAssistMutation,
} = api;
