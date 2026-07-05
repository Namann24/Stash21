export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  category: string;
  tags: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  views?: number;
  reactions?: number;
  commentsCount?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
  approved: boolean;
}

export interface Reaction {
  id: string;
  post_id: string;
  emoji: string;
  count: number;
}

export interface Feedback {
  id: string;
  name: string | null;
  email: string | null;
  category: string;
  topic: string | null;
  message: string;
  created_at: string;
  votes: number;
}

export interface Upvote {
  id: string;
  feedback_id: string;
  voter_fingerprint: string;
  value: number;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}
