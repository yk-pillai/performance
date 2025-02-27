// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SearchContextProvider } from "./context/SearchContext.tsx";
import { SessionContextProvider } from "./context/SessionContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <SessionContextProvider>
    <SearchContextProvider>
      <App />
    </SearchContextProvider>
  </SessionContextProvider>
  // </StrictMode>,
);
