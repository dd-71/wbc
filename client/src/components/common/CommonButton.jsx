import React from 'react'

const CommonButton = ({ handler, label, icon }) => {
  return (
    <button
      onClick={handler}
      className="px-4 flex items-center gap-1 py-2 bg-gradient-to-t from-primaryColor via-[#617cf5] to-primaryFadedColor text-white rounded-md transition-all duration-500 hover:shadow-[0px_6px_10px_#424242] capitalize"
    >
      {icon}{label}
    </button>
  )
}

export default CommonButton