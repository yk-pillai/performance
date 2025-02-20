import { Link, useLocation } from "react-router-dom";
import { ANY, API_BACKEND_URL, ARTICLE, CATEGORY } from "../constants";
import { useSearchContext } from "../context/SearchContext";
import { useEffect, useRef, useState } from "react";
import useGetPage from "../hooks/useGetPage";
import { SearchResultType } from "../types/searchResult";

const Search = () => {
  const { state } = useLocation();
  const keyword = state && state.title ? ARTICLE : CATEGORY;
  const { search, setSearch } = useSearchContext();
  const [searchResult, setSearchResult] = useState<SearchResultType[]>([]);
  const [showResult, setShowResult] = useState(false);
  const categoryId = ANY;
  const type = useGetPage();
  const limit = 5;
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const timeOutRef = useRef<number>(undefined);

  useEffect(() => {
    if (search === "") {
      setSearchResult([]);
      return;
    }
    if ([ARTICLE, CATEGORY].includes(type)) {
      async function getSearchedResult() {
        try {
          const data = await fetch(
            `${API_BACKEND_URL}/articles/s/${categoryId}?limit=${limit}&term=${search}`
          );
          const res = await data.json();
          setSearchResult(res.articles);
        } catch (err) {
          console.error(err);
        }
      }
      clearTimeout(timeOutRef.current);
      timeOutRef.current = setTimeout(() => {
        getSearchedResult();
      }, 400);
    }
    return () => {
      clearTimeout(timeOutRef.current);
    };
  }, [search, categoryId, type]);

  const handleClick = () => {
    setSearchResult([]);
    setSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleOnBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (dropDownRef.current && dropDownRef.current.contains(e.relatedTarget)) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  };
  const handleOnFocus = () => {
    setShowResult(true);
  };

  return (
    <div className="w-full relative">
      <input
        type="text"
        placeholder={`Search for ${keyword}`}
        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 lg:grow w-full"
        onChange={handleInputChange}
        value={search}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
      />
      {showResult && [ARTICLE, CATEGORY].includes(type) ? (
        <div
          ref={dropDownRef}
          className={`absolute bg-white flex flex-col mt-1 leading-10 w-full rounded-lg italics ${
            searchResult.length ? "border border-slate-200" : ""
          }`}
        >
          {searchResult.length
            ? searchResult.map((r) => {
                return (
                  <Link
                    to={`/article/${r.id}`}
                    key={r.id}
                    state={{ title: r.title }}
                    className="hover:bg-gray-200 rounded-md p-2"
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    onClick={handleClick}
                  >
                    {r.title}
                  </Link>
                );
              })
            : null}
        </div>
      ) : null}
    </div>
  );
};

export default Search;
