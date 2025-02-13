import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import { ANY } from "../constants";

interface Category {
  id: string;
  name: string;
}

const CategoryList = () => {
  const { search } = useSearchContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(
    []
  );
  useEffect(() => {
    async function getCategories() {
      try {
        const data = await fetch("http://localhost:5000/api/categories");
        const res = await data.json();
        setCategories(res.categories);
        setDisplayedCategories(res.categories);
      } catch (err) {
        console.error(err);
      }
    }
    getCategories();
  }, []);

  useEffect(() => {
    if (search !== "" && categories.length) {
      setDisplayedCategories(
        categories.filter((c) => {
          return c.name.toLowerCase().startsWith(search.toLowerCase());
        })
      );
    } else {
      setDisplayedCategories(categories);
    }
  }, [search]);

  if (!categories.length) {
    return <p>Fetching categories.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <Link
        to={`/category/${ANY}`}
        state={{ title: "Any" }}
        key={"any"}
        className="col-span-full p-6 bg-white border border-gray-200 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-100 text-lg font-medium"
      >
        Any
      </Link>
      {displayedCategories.map((category) => (
        <Link
          to={`/category/${category.id}`}
          state={{ title: category.name }}
          key={category.id}
          className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md text-center cursor-pointer hover:bg-gray-100 text-lg font-medium`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
