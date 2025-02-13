// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SearchContextProvider } from "./context/SearchContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <SearchContextProvider>
    <App />
  </SearchContextProvider>
  // </StrictMode>,
);
