// components/DynamicButton.jsx
import React from "react";

const DynamicButton = ({ label, onClick, color = "blue", className = "" }) => {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    gray: "bg-gray-600 hover:bg-gray-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md shadow-sm transition-all duration-150 ${colorClasses[color]} ${className}`}
    >
      {label}
    </button>
  );
};

export default DynamicButton;
