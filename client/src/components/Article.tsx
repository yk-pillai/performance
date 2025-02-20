import { useEffect, useState } from "react";
import { ArticleT } from "../types";
import { useLocation } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import EyeIcon from "./EyeIcon";
import HorizontalRule from "./HorizontalRule";
import { API_BACKEND_URL } from "../constants";
import BannerImage from "./BannerImage";

const Article = () => {
  const { pathname } = useLocation();
  const [article, setArticle] = useState<ArticleT[]>();

  useEffect(() => {
    const path = pathname.split("/");
    async function getArticle() {
      try {
        const data = await fetch(
          `${API_BACKEND_URL}/article/${path[path.length - 1]}`
        );
        const res = await data.json();
        setArticle(res.article);
      } catch (error) {
        console.log(error);
      }
    }
    getArticle();
  }, [pathname]);
  if (!article) {
    return <div>Loading article...</div>;
  }
  return (
    <>
      <div className="flex justify-start gap-10 items-center p-2">
        <div className="flex items-center gap-1 cursor-pointer">
          <HeartIcon className="h-7 w-7 text-white" />
          <span className="text-red-500">{article[0].likes}</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer">
          <EyeIcon className="h-8 w-8 text-white" stroke="dodgerblue" />
          <span className="text-blue-800">{article[0].views}</span>
        </div>
        <span>{article[0].timestamp}</span>
      </div>
      <HorizontalRule />
      <BannerImage
        imageUrl={`http://localhost:5000${article[0].image_url}`}
        altTxt={article[0].image_url}
      />
      <div className="p-1 mt-4 font-tinos text-lg">{article[0].content}</div>
    </>
  );
};

export default Article;
