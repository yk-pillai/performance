import { Link } from "react-router-dom"
import Search from "./Search"

const Header = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between z-10 sticky top-0 bg-gray-50 pb-3 sm:py-4 rounded-lg shadow-md px-6 mb-3 sm:mb-5 gap-2">
        <Link
          to="/"
          className="text-2xl font-extrabold border border-gray-200 rounded-lg p-2 shadow-lg"
        >
          TooFast
        </Link>
        <Search />
      </div>
  )
}

export default Header