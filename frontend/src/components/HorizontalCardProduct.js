import React, { useContext, useEffect, useRef, useState } from "react";
import fetchCategoryWiseProduct from "../helpers/fetchCategoryWiseProduct";
import displayINRCurrency from "../helpers/displayCurrency";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import addToCart from "../helpers/addToCart";
import Context from "../context";

const HorizontalCardProduct = ({ category, heading }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadingList = new Array(13).fill(null);
  const scrollElement = useRef(null);
  const { fetchUserAddToCart } = useContext(Context);

  // Fetch products for the selected category
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const categoryProduct = await fetchCategoryWiseProduct(category);

        console.log("Horizontal category product response:", categoryProduct);

        if (!isMounted) return;

        if (Array.isArray(categoryProduct?.data)) {
          setData(categoryProduct.data);
        } else {
          console.error("Invalid category product response:", categoryProduct);
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch horizontal category products:", error);

        if (isMounted) {
          setData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [category]);

  // Scroll products to the right
  const scrollRight = () => {
    if (scrollElement.current) {
      scrollElement.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  // Scroll products to the left
  const scrollLeft = () => {
    if (scrollElement.current) {
      scrollElement.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  // Add product to cart
  const handleAddToCart = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart(e, id);

      if (typeof fetchUserAddToCart === "function") {
        await fetchUserAddToCart();
      }
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 my-6 relative">
      <h2 className="text-2xl font-semibold py-4">{heading}</h2>

      <div
        ref={scrollElement}
        className="flex items-center gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth"
      >
        {/* Left scroll button */}
        <button
          type="button"
          aria-label="Scroll products left"
          className="bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block z-10"
          onClick={scrollLeft}
        >
          <FaAngleLeft />
        </button>

        {/* Right scroll button */}
        <button
          type="button"
          aria-label="Scroll products right"
          className="bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block z-10"
          onClick={scrollRight}
        >
          <FaAngleRight />
        </button>

        {/* Loading skeletons */}
        {loading ? (
          loadingList.map((_, index) => (
            <div
              key={`loading-${index}`}
              className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] h-36 bg-white rounded-sm shadow flex"
            >
              <div className="bg-slate-200 h-full p-4 min-w-[120px] md:min-w-[145px] animate-pulse"></div>

              <div className="p-4 grid w-full gap-2">
                <h2 className="font-medium text-base md:text-lg bg-slate-200 animate-pulse p-1 rounded-full"></h2>

                <p className="p-1 bg-slate-200 animate-pulse rounded-full"></p>

                <div className="flex gap-3 w-full">
                  <p className="p-1 bg-slate-200 w-full animate-pulse rounded-full"></p>
                  <p className="p-1 bg-slate-200 w-full animate-pulse rounded-full"></p>
                </div>

                <div className="h-6 w-full bg-slate-200 animate-pulse rounded-full"></div>
              </div>
            </div>
          ))
        ) : Array.isArray(data) && data.length > 0 ? (
          data.map((product, index) => (
            <div
              key={product?._id || `product-${index}`}
              className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] h-36 bg-white rounded-sm shadow flex"
            >
              <Link
                to={`/product/${product?._id}`}
                className="bg-slate-200 h-full p-4 min-w-[120px] md:min-w-[145px]"
              >
                <img
                  src={product?.productImage?.[0] || ""}
                  alt={product?.productName || "Product"}
                  className="object-scale-down h-full hover:scale-110 transition-all"
                  loading="lazy"
                />
              </Link>

              <div className="p-4 grid flex-1 min-w-0">
                <Link to={`/product/${product?._id}`}>
                  <h2 className="font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black">
                    {product?.productName}
                  </h2>
                </Link>

                <p className="capitalize text-slate-500">{product?.category}</p>

                <div className="flex gap-3">
                  <p className="text-red-600 font-medium">
                    {displayINRCurrency(product?.sellingPrice)}
                  </p>

                  <p className="text-slate-500 line-through">
                    {displayINRCurrency(product?.price)}
                  </p>
                </div>

                <button
                  type="button"
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded-full"
                  onClick={(e) => handleAddToCart(e, product?._id)}
                  disabled={!product?._id}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 py-6">
            No products found in this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default HorizontalCardProduct;
