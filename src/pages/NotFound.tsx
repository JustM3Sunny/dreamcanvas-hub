
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-imaginexus-dark">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 gradient-text">404</h1>
          <p className="text-2xl text-white mb-8">Oops! Page not found</p>
          <Link to="/">
            <Button className="gradient-btn text-white px-6 py-2">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
