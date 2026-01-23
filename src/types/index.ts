export interface Post {
  id: string;
  content: string;
  createdAt: string;
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
