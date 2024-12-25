import React, { useState } from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-lg">BrandLogo</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/create"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                New Event
              </Link>
              <Link
                to="/active"
                className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                Update Result
              </Link>
              <Link
                to="/resolved"
                className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
              >
                claim Winning
              </Link>
              <a
                href="#"
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <ConnectButton />
              </a>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-blue-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="#"
              className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/create"
              className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              New Event
            </Link>
            <Link
              to="/active"
              className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Update Result
            </Link>
            <Link
              to="/resolved"
              className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              claim Winning
            </Link>
            <Link
              to="#"
              className="hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              <ConnectButton />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
