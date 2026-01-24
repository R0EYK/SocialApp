import type { Post } from "./types";

export const APP_NAME = "HelpOthers";

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

export type FormMode = "add" | "edit";
