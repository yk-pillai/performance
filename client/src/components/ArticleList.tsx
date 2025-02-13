import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EyeIcon from "./EyeIcon";
import HeartIcon from "./HeartIcon";
import { getApiLimit } from "../utils";
import { ARTICLE, FETCH_MULTIPLYER } from "../constants";
import UpArrowIcon from "./UpArrowIcon";
import SmoothScrollLink from "./SmoothScrollLink";

export interface Article {
  id: string;
  title: string;
  summary: string;
  likes: string;
  views: string;
  image_url: string;
  timestamp: string;
}

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const { pathname } = useLocation();
  const limit = getApiLimit(ARTICLE, window.innerWidth);
  const showLimit = (limit / FETCH_MULTIPLYER) * 2;
  const observerRef = useRef<IntersectionObserver | null>(null);


  const getArticles = async (cursor: null | string = null)=> {
    const path = pathname.split("/");
    try {
      const data = await fetch(
        `http://localhost:5000/api/articles/${
          path[path.length - 1]
        }?limit=${limit}&cursor=${cursor ?? ""}`
      );
      const res = await data.json();

      const combinedArticles = [...articles, ...res.articles];

      if (combinedArticles.length > 0) {
        const numToPreload = limit / FETCH_MULTIPLYER;
        for (let i = 0; i < numToPreload; i++) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = `http://localhost:5000${combinedArticles[i].image_url}`;
          document.head.appendChild(link);
        }
      }

      setArticles(combinedArticles);
      setDisplayedArticles((prev) => [
        ...prev,
        ...combinedArticles.slice(prev.length, prev.length + showLimit),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const pullArticlesFromState: IntersectionObserverCallback = ([entry]) => {
    if (entry.isIntersecting && displayedArticles.length !== articles.length) {
      if (displayedArticles.length + showLimit >= articles.length) {
        getArticles(articles[articles.length - 1].timestamp);
      } else {
        setDisplayedArticles((prev) => [
          ...prev,
          ...articles.slice(prev.length, prev.length + showLimit),
        ]);
      }
    }
  };

  useEffect(() => {
    const lastArticle = document.querySelector(
      ".article-list .article:nth-last-child(3)"
    );

    if (lastArticle) {
      observerRef.current = new IntersectionObserver(pullArticlesFromState, {
        threshold: 0.1,
      });
      observerRef.current.observe(lastArticle);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedArticles]);


  useEffect(() => {
    getArticles();
  }, []);

  if (!displayedArticles.length) {
    return <p>Loading...</p>;
  }
  return (
    <div className="article-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6">
      {displayedArticles.map((article: Article) => (
        <Link
          to={`/article/${article.id}`}
          state={{ title: article.title }}
          key={article.id}
          className="article p-3 sm:p-4 bg-white border border-gray-200 rounded-2xl shadow-lg transition duration-500 hover:scale-105 hover:shadow-xl"
        >
          {/* Article Title */}
          <div className="capitalize mb-1 sm:mb-2 font-bold text-lg text-ellipsis overflow-hidden whitespace-nowrap">
            {article.title}
          </div>

          {/* Image & Summary */}
          <div className="flex gap-4 h-44">
            <img
              alt={article.title}
              src={`http://localhost:5000${article.image_url}`}
              className="w-36 h-full rounded-lg shadow-md object-cover"
            />
            <div className="flex flex-col justify-between flex-1">
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-6">
                {article.summary}
              </p>

              {/* Views & Likes */}
              <div className="flex justify-around items-center text-sm mt-3">
                <div className="flex items-center gap-1">
                  <EyeIcon className="h-6 w-6 text-white" stroke="dodgerblue" />
                  <span className="text-blue-800">{article.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartIcon className="h-5 w-5 text-white" />
                  <span className="text-red-500">{article.likes}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}

      <SmoothScrollLink href="#root">
        <UpArrowIcon />
      </SmoothScrollLink>
    </div>
  );
};

export default ArticleList;
