export interface Post {
  id: string;
  content: string;
  createdAt: string;
  likes: Like[];
  comments?: Comment[];
  commentsCount: number;
  image?: string;
  createdBy: User;
}

export interface User {
  id: string;
  fullName: string;
  image?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: User;
}

export interface Like {
  id: string;
  userId: string;
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
