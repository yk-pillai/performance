import { createContext, useContext, useState } from "react";

interface SessionContextType {
  sessionId: string | null;
  setTokenAsSession: (token: string) => void;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: "",
  setTokenAsSession: () => {},
});

export const SessionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    // if (!storedSessionId) {
    //   storedSessionId = crypto.randomUUID();
    //   localStorage.setItem("sessionId", storedSessionId);
    // }
    return storedSessionId;
  });
  const setTokenAsSession = (token: string) => {
    localStorage.setItem("sessionId", token);
    setSessionId(token);
  };
  return (
    <SessionContext.Provider value={{ sessionId, setTokenAsSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
