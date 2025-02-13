import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Title from "../components/Title";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-6">
      <Header />
      <Title />
      <Outlet />
    </div>
  );
};

export default Layout;
