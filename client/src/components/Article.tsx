import { ArticleT } from "../types";
import { useLocation, useOutletContext } from "react-router-dom";
import HorizontalRule from "./HorizontalRule";
import { API_BACKEND_URL } from "../constants";
import BannerImage from "./BannerImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../context/SessionContext";
import { useEffect, useRef } from "react";
import useGetPage from "../hooks/useGetPage";
import toast from "react-hot-toast";
import Like from "./Like";
import Views from "./Views";

async function getArticle(
  artId: string,
  sessionId: string | null
): Promise<ArticleT | undefined> {
  try {
    const data = await fetch(`${API_BACKEND_URL}/article/${artId}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
    });
    const res = await data.json();
    return res;
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

async function likeArticle(
  artId: string,
  sessionId: string | null
): Promise<void> {
  try {
    const response = await fetch(`${API_BACKEND_URL}/article/like`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify({ artId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || "Failed to like article");
      (error as FetchError).response = response; // Attach the response object
      throw error;
    }
  } catch (e) {
    const error = e as FetchError;
    throw error;
  }
}

async function viewArticle(
  artId: string,
  sessionId: string | null
): Promise<void> {
  try {
    const response = await fetch(`${API_BACKEND_URL}/article/view`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify({ artId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.error || "Failed to register the view."
      );
      (error as FetchError).response = response; // Attach the response object
      throw error;
    }
  } catch (e) {
    const error = e as FetchError;
    throw error;
  }
}

const Article = () => {
  const { pathname } = useLocation();
  const path = pathname.split("/");
  const artId = path[path.length - 1];
  const { session } = useSession();
  const { token } = session;
  const queryClient = useQueryClient();
  const { openLoginModal } = useOutletContext<{ openLoginModal: () => void }>();
  const eventSourceRef = useRef<EventSource | null>(null);
  const isSSEConnected = useRef(false);
  const page = useGetPage();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["article", artId],
    queryFn: () => getArticle(artId, token),
  });

  const likeMutation = useMutation({
    mutationKey: ['like', artId, token],
    mutationFn: () => likeArticle(artId, token),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["article", artId] });
      const previousArticle = queryClient.getQueryData<ArticleT>([
        "article",
        artId,
      ]);
      queryClient.setQueryData<ArticleT>(["article", artId], (oldArticle) => {
        if (oldArticle) {
          const updatedArticle = {
            ...oldArticle,
            isLiked: true,
            article: {
              ...oldArticle.article,
              likes: String((Number(oldArticle.article.likes) || 0) + 1),
            },
          };
          return updatedArticle;
        }
      });
      return { previousArticle };
    },
    onError: (err: FetchError, _variables, context) => {
      if (err.response?.status === 401) {
        toast.error("You have been logged out due to inactivity.", {
          position: "top-center",
          duration: 5000,
        });
        openLoginModal();
      }
      queryClient.setQueryData<ArticleT>(
        ["article", artId],
        context?.previousArticle
      );
    },
  });

  const viewMutation = useMutation({
    mutationKey: ['view', artId, token],
    mutationFn: () => viewArticle(artId, token),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["article", artId] });
      const previousArticle = queryClient.getQueryData<ArticleT>([
        "article",
        artId,
      ]);
      queryClient.setQueryData<ArticleT>(["article", artId], (oldArticle) => {
        if (oldArticle) {
          const updatedArticle = {
            ...oldArticle,
            isViewed: true,
            article: {
              ...oldArticle.article,
              views: String((Number(oldArticle.article.views) || 0) + 1),
            },
          };
          return updatedArticle;
        }
      });
      return { previousArticle };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData<ArticleT>(
        ["article", artId],
        context?.previousArticle
      );
    },
  });

  const handleLike = () => {
    if (!token) {
      openLoginModal();
      return;
    }
    if (!likeMutation.isPending) {
      likeMutation.mutate();
    }
  };

  useEffect(() => {
    if (data && !isSSEConnected.current) {
      if (!data.isViewed) {
        if (!viewMutation.isPending) {
          viewMutation.mutate();
        }
      }
      isSSEConnected.current = true;
      eventSourceRef.current = new EventSource(
        `${API_BACKEND_URL}/sse/like-count/${artId}`,
        {
          withCredentials: true,
        }
      );

      eventSourceRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message) {
          queryClient.setQueryData<ArticleT>(["article", artId], (oldData) => {
            if (oldData) {
              const updatedArticle = {
                ...oldData,
                article: {
                  ...oldData.article,
                  ...(message.likeCount
                    ? { likes: String(message.likeCount) }
                    : {}),
                  ...(message.viewCount
                    ? { views: String(message.viewCount) }
                    : {}),
                },
              };
              return updatedArticle;
            }
            return oldData;
          });
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE error:", error);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          isSSEConnected.current = false;
        }
      };

      return () => {
        if (eventSourceRef.current && page !== "article") {
          eventSourceRef.current.close();
          isSSEConnected.current = false;
        }
      };
    }
  }, [artId, queryClient, data, page, viewMutation]);

  if (isLoading) {
    return <p className="flex justify-center">Fetching the article...</p>;
  }

  if (error) {
    return (
      <div className="flex items-center flex-col">
        <p>Error loading the article: {error?.message || "Unknown error"}</p>
        <button className="border p-2" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center flex-col">
        <p>No data related to the article found.</p>
      </div>
    );
  }
  const article = data.article;
  const isViewed = data.isViewed;
  const isLiked = data.isLiked;

  return (
    <>
      <div className="flex justify-start gap-8 items-center ml-4">
        <Like
          onLike={handleLike}
          noOfLikes={article.likes}
          classes={`h-7 w-7 ${isLiked ? "text-red-500" : "text-white"}`}
        />
        <Views
          noOfViews={article.views}
          classes={`h-8 w-8 ${
            isViewed ? "text-blue-300" : "text-white"
          }`}
        />
        <span>{article.timestamp}</span>
      </div>
      <HorizontalRule />
      <BannerImage
        imageUrl={`http://localhost:5000${article.image_url}`}
        altTxt={article.image_url}
      />
      <div className="p-1 mt-4 font-tinos text-lg">{article.content}</div>
    </>
  );
};

export default Article;
