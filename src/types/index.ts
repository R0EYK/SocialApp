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
