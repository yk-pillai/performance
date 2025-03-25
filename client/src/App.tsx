import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense } from 'react';

// Dynamically load components
const CategoryList = lazy(() => import("./components/CategoryList"));
const ArticleList = lazy(() => import("./components/ArticleList"));
const Article = lazy(() => import("./components/Article"));

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
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ArticleList />
          </Suspense>
        ),
      },
      {
        path: "/article/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Article />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;