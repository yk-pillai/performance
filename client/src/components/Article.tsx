import { ArticleT } from "../types";
import { useLocation, useOutletContext } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import EyeIcon from "./EyeIcon";
import HorizontalRule from "./HorizontalRule";
import { API_BACKEND_URL } from "../constants";
import BannerImage from "./BannerImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../context/SessionContext";
import { useEffect, useRef } from "react";

async function getArticle(artId: string): Promise<ArticleT | undefined> {
  try {
    const data = await fetch(`${API_BACKEND_URL}/article/${artId}`, {
      credentials: "include",
    });
    const res = await data.json();
    return res.article[0];
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
      throw new Error(errorData.error || "Failed to like article");
    }
  } catch (e) {
    const error = e as Error;
    throw new Error(error.message);
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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["article", artId],
    queryFn: () => getArticle(artId),
  });

  const likeMutation = useMutation({
    mutationFn: () => likeArticle(artId, token),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["article", artId] });
      const previousArticle = queryClient.getQueryData<ArticleT>([
        "article",
        artId,
      ]);
      queryClient.setQueryData<ArticleT>(["article", artId], (oldArticle) => {
        if (oldArticle) {
          return {
            ...oldArticle,
            likes: String((Number(oldArticle.likes) || 0) + 1),
          };
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
    if (data) {
      eventSourceRef.current = new EventSource(
        `${API_BACKEND_URL}/sse/like-count/${artId}`,{
          withCredentials: true
        }
      );

      eventSourceRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.likeCount !== undefined) {
          queryClient.setQueryData<ArticleT>(["article", artId], (oldData) => {
            if (oldData) {
              return { ...oldData, likes: String(message.likeCount) };
            }
            return oldData;
          });
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE error:", error);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };

      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    }
  }, [artId, queryClient, data]);

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

  return (
    <>
      <div className="flex justify-start gap-10 items-center p-">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={handleLike}
        >
          <HeartIcon className="h-7 w-7 text-white" />
          <span className="text-red-500">{data.likes}</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <EyeIcon className="h-8 w-8 text-white" stroke="dodgerblue" />
          <span className="text-blue-800">{data.views}</span>
        </div>
        <span>{data.timestamp}</span>
      </div>
      <HorizontalRule />
      <BannerImage
        imageUrl={`http://localhost:5000${data.image_url}`}
        altTxt={data.image_url}
      />
      <div className="p-1 mt-4 font-tinos text-lg">{data.content}</div>
    </>
  );
};

export default Article;