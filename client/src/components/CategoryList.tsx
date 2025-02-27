import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import { ANY, API_BACKEND_URL } from "../constants";
import { Category } from "../types";
import { useQuery } from "@tanstack/react-query";

async function getCategories() {
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    const response = await fetch(`${API_BACKEND_URL}/categories`,{
      credentials:'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const res = await response.json();
    // throw Error("Custom Error");
    return res.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

const CategoryList = () => {
  const { search } = useSearchContext();
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(
    []
  );

  const { error, data, isLoading, refetch } = useQuery<Category[]>({
    queryKey: ["categoryList"],
    queryFn: getCategories,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setDisplayedCategories(
        search
          ? data.filter((c) =>
              c.name.toLowerCase().startsWith(search.toLowerCase())
            )
          : data
      );
    }
  }, [search, data]);

  if (isLoading) {
    return <p className="flex justify-center">Fetching categories...</p>;
  }

  if (error) {
    return (
      <div className="flex items-center flex-col">
        <p>Error loading categories: {error?.message || "Unknown error"}</p>
        <button className="border p-2" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <Link
        to={`/category/${ANY}`}
        state={{ title: "All" }}
        className="col-span-full p-6 bg-white border border-gray-200 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-100 text-lg font-medium"
      >
        All
      </Link>
      {displayedCategories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          state={{ title: category.name }}
          className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-100 text-lg font-medium`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
