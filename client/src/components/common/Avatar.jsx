import React from "react";

const Avatar = ({ src, name, size = "w-10 h-10", textSize = "text-lg" }) => {
  const firstLetter = name?.charAt(0)?.toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt="avatar"
        className={`${size} rounded-full border-white border-4 shadow-xl object-cover object-top`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full border-white border-4 shadow-xl flex items-center justify-center
      bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor
      text-white font-semibold ${textSize}`}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;
