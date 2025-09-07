import React from "react";

const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50">
      <div className="relative">
        {/* Outer rotating border */}
        <div
          className={`${sizeClasses[size]} border-4 border-neutral-200 rounded-full animate-spin`}
        >
          <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-neutral-600 font-bold text-lg animate-pulse">
          {message}
        </p>
      )}

      {/* MindBridge branding */}
      <div className="mt-8 flex items-center gap-2 opacity-50">
        <div className="bg-primary-500 p-2 rounded-lg rotate-3 border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-lg font-extrabold text-neutral-50">MB</span>
        </div>
        <span className="text-xl font-extrabold text-neutral-950">
          MindBridge
        </span>
      </div>
    </div>
  );
};

export const LoadingSpinnerOnly = ({ message, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {/* Outer rotating border */}
        <div
          className={`${sizeClasses[size]} border-2 border-neutral-200 rounded-full animate-spin`}
        >
          <div className="absolute inset-0 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
      {message && (
        <span className="text-white font-bold text-sm">
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
