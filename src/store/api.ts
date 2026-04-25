import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import { clearAuth, setCredentials } from "./reducers/auth";
import type { PaginatedResponse, Post, User } from "@/types";

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
  tagTypes: ["AuthUser", "Posts", "Post"],
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
} = api;
