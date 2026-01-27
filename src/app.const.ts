import type { Conversation, Post, User } from "./types";

export const APP_NAME = "HelpOthers";

export const currentUser: User = {
  id: "user-1",
  fullName: "John Doe",
  image: "https://i.pravatar.cc/150?u=john",
};

export const mockPosts: Post[] = [
  {
    id: "1",
    content:
      "Just shipped a new feature today! Really proud of how the team came together to make it happen. Sometimes the best solutions come from the most unexpected conversations.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    commentsCount: 8,
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    createdBy: {
      id: "1",
      fullName: "Alex Johnson",
    },
    comments: [
      {
        id: "c1",
        content: "Great job, Alex! The new feature looks amazing.",
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        createdBy: {
          id: "5",
          fullName: "Sam Wilson",
        },
      },
      {
        id: "c2",
        content: "Kudos to the whole team for pulling this off!",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: "6",
          fullName: "Jordan Smith",
        },
      },
    ],
    likes: [
      {
        id: "l1",
        userId: "5",
      },
      {
        id: "l2",
        userId: "6",
      },
      {
        id: "l3",
        userId: "8",
      },
    ],
  },
  {
    id: "2",
    content:
      "The morning coffee hits different when you're working on something you truly care about. Building products that make a difference is why I got into this field.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    commentsCount: 23,
    createdBy: {
      id: "2",
      fullName: "Jamie Lee",
    },
    likes: [],
    comments: [
      {
        id: "c3",
        content: "Absolutely agree, Jamie! Passion fuels innovation.",
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: "7",
          fullName: "Morgan Brown",
        },
      },
    ],
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [
      currentUser,
      {
        id: "user-2",
        fullName: "Alice Johnson",
        image: "https://i.pravatar.cc/150?u=alice",
      },
    ],
    messages: [
      {
        id: "msg-1",
        content: "Hey! How are you doing?",
        senderId: "user-2",
        createdAt: "2026-01-27T10:00:00Z",
      },
      {
        id: "msg-2",
        content: "I'm good, thanks! Just working on some projects.",
        senderId: "user-1",
        createdAt: "2026-01-27T10:05:00Z",
      },
      {
        id: "msg-3",
        content: "That sounds great! What kind of projects?",
        senderId: "user-2",
        createdAt: "2026-01-27T10:10:00Z",
      },
    ],
    updatedAt: "2026-01-27T10:10:00Z",
    createdAt: "2026-01-25T09:00:00Z",
  },
  {
    id: "conv-2",
    participants: [
      currentUser,
      {
        id: "user-3",
        fullName: "Bob Smith",
        image: "https://i.pravatar.cc/150?u=bob",
      },
    ],
    messages: [
      {
        id: "msg-4",
        content: "Did you see the game last night?",
        senderId: "user-3",
        createdAt: "2026-01-26T20:00:00Z",
      },
      {
        id: "msg-5",
        content: "Yes! It was incredible!",
        senderId: "user-1",
        createdAt: "2026-01-26T20:15:00Z",
      },
    ],
    updatedAt: "2026-01-26T20:15:00Z",
    createdAt: "2026-01-20T14:00:00Z",
  },
  {
    id: "conv-3",
    participants: [
      currentUser,
      {
        id: "user-4",
        fullName: "Carol Williams",
        image: "https://i.pravatar.cc/150?u=carol",
      },
    ],
    messages: [
      {
        id: "msg-6",
        content: "Meeting tomorrow at 3pm?",
        senderId: "user-4",
        createdAt: "2026-01-25T16:00:00Z",
      },
    ],
    updatedAt: "2026-01-25T16:00:00Z",
    createdAt: "2026-01-15T11:00:00Z",
  },
];

export type FormMode = "add" | "edit";
