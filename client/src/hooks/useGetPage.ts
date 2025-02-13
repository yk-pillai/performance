import { useLocation } from "react-router-dom";
import { HOME } from "../constants";

const useGetPage = () => {
  const { pathname } = useLocation();
  let path = HOME;
  if (pathname !== "/") {
    path = pathname.split("/")[1];
  }
  return path;
};

export default useGetPage;
