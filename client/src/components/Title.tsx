import { useLocation } from "react-router-dom";
import useMetaDescription from "../hooks/useMetaDescription";
import { ARTICLE, CATEGORY } from "../constants";
import useGetPage from "../hooks/useGetPage";

const getMetaDescription = (path: string, title: string) => {
  if (path === CATEGORY) {
    return `Browse a variety of articles related to ${title}`;
  } else if (path === ARTICLE) {
    return `${title}`;
  }
  return "Browse a variety of topics and explore interesting articles on subjects ranging from technology to lifestyle. Stay informed and inspired with our curated content.";
};

const Title = () => {
  const { state } = useLocation();
  const path = useGetPage();
  const title = (state && state.title) ?? "Category";
  useMetaDescription(getMetaDescription(path, title));

  return (
    <div className="mb-3 sm:mb-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <hr className="mt-1 border-gray-300" />
    </div>
  );
};

export default Title;
