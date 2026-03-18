import React from "react";

const AuthFooter = () => {
  return (
    <footer className="w-full bg-white bg-transparen border-t px-5">
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 text-sm text-gray-500 gap-2">
        {/* LEFT */}
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-gray-700">
            Web Bocket Classes
          </span>
          . All rights reserved.
        </p>

        {/* RIGHT */}
        <p>
          Developed by{" "}
          <a
            href="https://www.webbocket.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primaryColor hover:text-orange-500 duration-300"
          >
            Web Bocket
          </a>
        </p>
      </div>
    </footer>
  );
};

export default AuthFooter;
