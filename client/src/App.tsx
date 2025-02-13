import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import CategoryList from "./components/CategoryList";
import ArticleList from "./components/ArticleList";
import Article from "./components/Article";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <CategoryList />,
      },
      {
        path: "/category/:id",
        element: <ArticleList/>
      },
      {
        path: "/article/:id",
        element: <Article/>
      }
    ],
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
