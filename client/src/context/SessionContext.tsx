import { createContext, useContext, useState } from "react";

interface Session {
  token: string | null;
  uname: string | null;
}

interface SessionContextType {
  updateSession: (session: Session) => void;
  session: Session;
}

const defaultSession = { token: null, uname: null };

const SessionContext = createContext<SessionContextType>({
  updateSession: () => {},
  session: defaultSession,
});

export const useSession = () => useContext(SessionContext);

const getSession = () => {
  const session = localStorage.getItem("session");
  if (session) {
    return { ...JSON.parse(session) };
  }
  return defaultSession;
};

export const SessionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState(getSession());

  const updateSession = (session: Session) => {
    const { token } = session;
    if (token) {
      localStorage.setItem("session", JSON.stringify(session));
    } else {
      localStorage.removeItem("session");
    }
    setSession(session);
  };

  return (
    <SessionContext.Provider value={{ updateSession, session }}>
      {children}
    </SessionContext.Provider>
  );
};
