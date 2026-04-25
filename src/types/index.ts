export interface Post {
  id: string;
  content: string;
  createdAt: string;
  likes: string[];
  likesCount: number;
  comments?: Comment[];
  commentsCount: number;
  image?: string;
  createdBy: User;
}

export interface User {
  id: string;
  fullName: string;
  image?: string;
  email?: string;
  onlineStatus?: "online" | "away" | "offline";
  lastSeen?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: User;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  updatedAt: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  limit: number;
  skip: number;
}
