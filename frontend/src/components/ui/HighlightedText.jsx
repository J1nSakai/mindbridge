import React from "react";

const HighlightedText = ({
  children,
  bgColor = "bg-primary-500",
  textColor = "text-neutral-50",
  skew = "skew-x-3",
}) => {
  return (
    <span
      className={`${bgColor} px-2 ${textColor} ${skew} inline-block border-4 border-border`}
    >
      {children}
    </span>
  );
};

export default HighlightedText;
