import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import CategoryList from "./components/CategoryList";
import ArticleList from "./components/ArticleList";
import Article from "./components/Article";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();
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
        element: <ArticleList />,
      },
      {
        path: "/article/:id",
        element: <Article />,
      },
    ],
  },
]);
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools/>
    </QueryClientProvider>
  );
}

export default App;
