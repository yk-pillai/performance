import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EyeIcon from "./EyeIcon";
import HeartIcon from "./HeartIcon";
import { getApiLimit, preloadImage, timeAgo } from "../utils";
import {
  API_BACKEND_URL,
  ARTICLE,
  ASSETS_BACKEND_URL,
  FETCH_MULTIPLYER,
} from "../constants";
import UpArrowIcon from "./UpArrowIcon";
import SmoothScrollLink from "./SmoothScrollLink";
import { ArticleT } from "../types";

const ArticleList = () => {
  const [articles, setArticles] = useState<ArticleT[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<ArticleT[]>([]);
  const { pathname } = useLocation();
  const path = pathname.split("/");
  const catId = path[path.length - 1];
  const limit = getApiLimit(ARTICLE, window.innerWidth);
  const showLimit = (limit / FETCH_MULTIPLYER) * 2;
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getArticles = async (
    catId: string,
    limit: number,
    cursor: null | string = null
  ) => {
    try {
      const data = await fetch(
        `${API_BACKEND_URL}/articles/${catId}?limit=${limit}&cursor=${
          cursor ?? ""
        }`
      );
      const res = await data.json();
      return res.articles;
    } catch (err) {
      console.error(err);
    }
  };

  const pullArticlesFromState: IntersectionObserverCallback = async ([
    entry,
  ]) => {
    if (entry.isIntersecting && displayedArticles.length !== articles.length) {
      if (displayedArticles.length + showLimit >= articles.length) {
        const res = await getArticles(
          catId,
          limit,
          articles[articles.length - 1].timestamp
        );
        const combinedArticles = [...articles, ...res];
        manageDisplayedArticles(combinedArticles);
      } else {
        setDisplayedArticles((prev) => [
          ...prev,
          ...articles.slice(prev.length, prev.length + showLimit),
        ]);
      }
    }
  };

  const manageDisplayedArticles = (combinedArticles: ArticleT[]) => {
    setArticles(combinedArticles);
    setDisplayedArticles((prev) => [
      ...prev,
      ...combinedArticles.slice(prev.length, prev.length + showLimit),
    ]);
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
    async function getInitialArticles() {
      const res = await getArticles(catId, limit);
      const combinedArticles = [...articles, ...res];

      if (combinedArticles.length > 0) {
        const numToPreload = limit / FETCH_MULTIPLYER;
        for (let i = 0; i < numToPreload; i++) {
          preloadImage(`${ASSETS_BACKEND_URL}${combinedArticles[i].image_url}`);
        }
      }
      manageDisplayedArticles(combinedArticles);
    }
    getInitialArticles();
  }, []);

  if (!displayedArticles.length) {
    return <p>Loading...</p>;
  }
  return (
    <div className="article-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6">
      {displayedArticles.map((article: ArticleT) => (
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
                <div>{timeAgo(article.timestamp)}</div>
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
