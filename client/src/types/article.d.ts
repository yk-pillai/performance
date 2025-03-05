
export type Article = {
  id: string;
  title: string;
  summary: string;
  likes: string;
  views: string;
  image_url: string;
  timestamp: string;
  content: string;
};


export interface ArticleT {
  article: Article
  isLiked: boolean;
  isViewed: boolean;
}

