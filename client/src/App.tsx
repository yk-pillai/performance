import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./pages/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense, useEffect } from 'react';
import CategoryList from "./components/CategoryList";
import { preconnectServer } from "./utils";
import { ASSETS_BACKEND_URL } from "./constants";

// Dynamically load components
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
  useEffect(()=>{
    const cleanup = preconnectServer(ASSETS_BACKEND_URL)
    return cleanup;
  },[])
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;