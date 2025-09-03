import React from "react";

const IconContainer = ({
  icon: Icon,
  bgColor = "bg-primary-200",
  rotation = "rotate-3",
  position = "",
  size = "p-4",
}) => {
  return (
    <div
      className={`${bgColor} ${size} rounded-lg border-4 border-neutral-950 ${rotation} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${position}`}
    >
      <Icon className="text-4xl" />
    </div>
  );
};

export default IconContainer;
