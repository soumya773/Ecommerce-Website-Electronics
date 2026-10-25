import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { FaRegCircleUser } from "react-icons/fa6";
import { Link, Outlet, useNavigate } from "react-router-dom";
import ROLE from "../common/role";

const AdminPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== ROLE.ADMIN) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col md:flex-row">
      <aside className="bg-white min-h-full w-full max-w-60 customShadow">
        <div className="h-32 flex justify-center items-center flex-col">
          <div className="text-5xl cursor-pointer relative flex justify-center">
            {user?.profilePic ? (
              <img
                src={user?.profilePic}
                className="w-20 h-20 rounded-full"
                alt={user?.name}
              />
            ) : (
              <FaRegCircleUser />
            )}
          </div>
          <p className="capitalize text-lg font-semibold">{user?.name}</p>
          <p className="text-sm">{user?.role}</p>
        </div>

        <div>
          <nav className="grid gap-1 p-4">
            <Link
              to={""}
              end
              className="rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              to={"all-users"}
              className="rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              All Users
            </Link>
            <Link
              to={"all-products"}
              className="rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              All Products
            </Link>
            <Link
              to={"all-orders"}
              className="rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              All Orders
            </Link>
          </nav>
        </div>
      </aside>

      <main className="w-full min-w-0 p-3 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
