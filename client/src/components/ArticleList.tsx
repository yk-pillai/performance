import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getApiLimit, preloadImage, timeAgo } from "../utils";
import {
  API_BACKEND_URL,
  ARTICLE,
  ASSETS_BACKEND_URL,
  FETCH_MULTIPLYER,
} from "../constants";
import UpArrowIcon from "./UpArrowIcon";
import SmoothScrollLink from "./SmoothScrollLink";
import { Article } from "../types";
import Like from "./Like";
import Views from "./Views";
import { useSession } from "../context/SessionContext";

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [likedArticle, setLikedArticle] = useState(new Set());
  const [viewedArticle, setViewedArticle] = useState(new Set());
  const { pathname } = useLocation();
  const path = pathname.split("/");
  const catId = path[path.length - 1];
  const limit = getApiLimit(ARTICLE, window.innerWidth);
  const showLimit = (limit / FETCH_MULTIPLYER) * 2;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const {
    session: { token },
  } = useSession();

  const getArticles = async (
    catId: string,
    limit: number,
    cursor: null | string = null
  ) => {
    try {
      const data = await fetch(
        `${API_BACKEND_URL}/articles/${catId}?limit=${limit}&cursor=${
          cursor ?? ""
        }`,
        {
          credentials: "include",
        }
      );
      const res = await data.json();
      return res.articles;
    } catch (err) {
      console.error(err);
    }
  };

  const getUserLikesAndViews = async (
    catId: string,
    sessionId: string | null
  ) => {
    try {
      const data = await fetch(`${API_BACKEND_URL}/user/activity/${catId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
      });
      const res = await data.json();
      return res;
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

  const manageDisplayedArticles = (combinedArticles: Article[]) => {
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
      const { likes, views } = await getUserLikesAndViews(catId, token);
      setLikedArticle(new Set(likes));
      setViewedArticle(new Set(views));
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
    <div className="article-list grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6">
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
              src={`${ASSETS_BACKEND_URL}${article.image_url}`}
              className="w-36 h-full rounded-lg shadow-md object-cover"
            />
            <div className="flex flex-col justify-between flex-1">
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-6">
                {article.summary}
              </p>

              {/* Views & Likes */}
              <div className="flex justify-around items-center text-sm mt-3">
                <Like
                  classes={`h-5 w-5 ${
                    likedArticle.has(article.id) ? "text-red-500" : "text-white"
                  }`}
                  noOfLikes={article.likes}
                />
                <Views
                  classes={`h-6 w-6 ${
                    viewedArticle.has(article.id)
                      ? "text-blue-300"
                      : "text-white"
                  }`}
                  noOfViews={article.views}
                />
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
