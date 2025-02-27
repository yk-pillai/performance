import { Link } from "react-router-dom";
import Search from "./Search";
import { useSession } from "../context/SessionContext";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const { sessionId } = useSession();
  console.log(sessionId);
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between z-10 sticky top-0 bg-gray-50 pb-3 sm:py-4 rounded-lg shadow-md px-6 mb-3 sm:mb-5 gap-2">
      <Link
        to="/"
        className="text-2xl font-extrabold border border-gray-200 rounded-lg p-2 shadow-lg"
      >
        TooFast
      </Link>
      <Search />
      {!sessionId ? (
        <button
          onClick={onLoginClick}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Login
        </button>
      ) : (
        <button
        // TODO: implement the logout feature
          onClick={onLoginClick}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Header;
