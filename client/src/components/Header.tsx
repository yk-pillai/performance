import { Link } from "react-router-dom";
import Search from "./Search";
import { useSession } from "../context/SessionContext";
import SearchIcon from "./SearchIcon";
import { useState } from "react";
import CancelIcon from "./CancelIcon";
import toast from "react-hot-toast";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const { updateSession, session } = useSession();
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const { uname } = session;
  const logout = () => {
    if (confirm(`${uname} do you want to log out?`)) {
      updateSession({ token: null, uname: null });
      toast.success(`${uname} you have been logged out.`,{
        position: "top-center",
        duration: 5000
      })
    }
  };
  return (
    <div className="flex flex-row lg:flex-row items-center justify-between z-10 sticky top-0 pt-3 bg-gray-50 pb-3 sm:py-4 rounded-lg shadow-md px-6 mb-3 sm:mb-5 gap-2">
      <Link
        to="/"
        className="text-2xl font-extrabold border border-gray-200 rounded-lg p-2 shadow-lg"
      >
        TooFast
      </Link>
      <div
        onClick={() => setShowSearchBar(true)}
        className={`flex items-center w-full`}
      >
        {!showSearchBar ? (
          <div className="flex border border-gray-200 rounded-lg p-2 shadow-lg items-center cursor-pointer">
            <SearchIcon />
            Search
          </div>
        ) : (
          <Search />
        )}
      </div>
      {!showSearchBar && (
        !uname ? (
          <button onClick={onLoginClick} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Login</button>
        ) : (
          <button onClick={logout} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{uname ?? "Logout"}</button>
        )
      )}
      {showSearchBar && <CancelIcon onCancel={() => setShowSearchBar(false)} />}
    </div>
  );
};

export default Header;