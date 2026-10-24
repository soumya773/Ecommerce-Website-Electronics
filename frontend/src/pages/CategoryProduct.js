import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productCategory from "../helpers/productCategory";
import VerticalCard from "../components/VerticalCard";
import SummaryApi from "../common";

const CategoryProduct = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Read selected categories from the URL and normalize their case.
  const urlSearch = new URLSearchParams(location.search);

  const urlCategoryList = urlSearch
    .getAll("category")
    .map((category) => category.trim().toLowerCase())
    .filter(Boolean);

  const [selectCategory, setSelectCategory] = useState(() =>
    Object.fromEntries(urlCategoryList.map((category) => [category, true])),
  );

  const [filterCategoryList, setFilterCategoryList] = useState(urlCategoryList);

  // Fetch products matching the selected categories.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch(SummaryApi.filterProduct.url, {
          method: SummaryApi.filterProduct.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: filterCategoryList,
          }),
        });

        const dataResponse = await response.json();

        if (!response.ok || dataResponse?.success === false) {
          console.error("Product filter API error:", dataResponse);
          setData([]);
          return;
        }

        const products = Array.isArray(dataResponse?.data)
          ? dataResponse.data
          : [];

        setData(products);
      } catch (error) {
        console.error("Failed to fetch filtered products:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterCategoryList]);

  // Handle category checkbox changes.
  const handleSelectCategory = (event) => {
    const { value, checked } = event.target;
    const category = value.trim().toLowerCase();

    setSelectCategory((previous) => ({
      ...previous,
      [category]: checked,
    }));
  };

  // Synchronize selected categories with the URL.
  useEffect(() => {
    const selectedCategories = Object.keys(selectCategory)
      .filter((category) => selectCategory[category])
      .map((category) => category.trim().toLowerCase());

    setFilterCategoryList((previous) => {
      if (
        previous.length === selectedCategories.length &&
        previous.every(
          (category, index) => category === selectedCategories[index],
        )
      ) {
        return previous;
      }

      return selectedCategories;
    });

    const params = new URLSearchParams();

    selectedCategories.forEach((category) => {
      params.append("category", category);
    });

    const queryString = params.toString();
    const newUrl = queryString
      ? `/product-category?${queryString}`
      : "/product-category";

    const currentUrl = `${location.pathname}${location.search}`;

    if (currentUrl !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [selectCategory, navigate, location.pathname, location.search]);

  // Sort products by selling price without mutating the original array.
  const handleOnChangeSortBy = (event) => {
    setSortBy(event.target.value);
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === "asc") {
      return a.sellingPrice - b.sellingPrice;
    }

    if (sortBy === "dsc") {
      return b.sellingPrice - a.sellingPrice;
    }

    return 0;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="hidden lg:grid grid-cols-[200px,1fr]">
        {/* Left sidebar */}
        <div className="bg-white p-2 min-h-[calc(100vh-120px)] overflow-y-scroll">
          {/* Sort products */}
          <div>
            <h3 className="text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300">
              Sort by
            </h3>

            <form className="text-sm flex flex-col gap-2 py-2">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="price-asc"
                  name="sortBy"
                  checked={sortBy === "asc"}
                  onChange={handleOnChangeSortBy}
                  value="asc"
                />
                <label htmlFor="price-asc">Price - Low to High</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="price-desc"
                  name="sortBy"
                  checked={sortBy === "dsc"}
                  onChange={handleOnChangeSortBy}
                  value="dsc"
                />
                <label htmlFor="price-desc">Price - High to Low</label>
              </div>
            </form>
          </div>

          {/* Filter by category */}
          <div>
            <h3 className="text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300">
              Category
            </h3>

            <form className="text-sm flex flex-col gap-2 py-2">
              {productCategory.map((categoryName) => {
                const categoryValue = categoryName?.value?.trim().toLowerCase();

                return (
                  <div className="flex items-center gap-3" key={categoryValue}>
                    <input
                      type="checkbox"
                      name="category"
                      checked={Boolean(selectCategory[categoryValue])}
                      value={categoryValue}
                      id={categoryValue}
                      onChange={handleSelectCategory}
                    />

                    <label htmlFor={categoryValue}>{categoryName?.label}</label>
                  </div>
                );
              })}
            </form>
          </div>
        </div>

        {/* Product results */}
        <div className="px-4">
          <p className="font-medium text-slate-800 text-lg my-2">
            Search Results: {loading ? "Loading..." : sortedData.length}
          </p>

          <div className="min-h-[calc(100vh-120px)] overflow-y-scroll max-h-[calc(100vh-120px)]">
            {!loading && sortedData.length > 0 && (
              <VerticalCard data={sortedData} loading={loading} />
            )}

            {!loading && sortedData.length === 0 && (
              <p className="py-6 text-gray-500">
                No products found in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProduct;
