import React from "react";

const HowItWorksStep = ({
  stepNumber,
  title,
  description,
  bgColor = "bg-neutral-200",
}) => {
  return (
    <div
      className={`${bgColor} p-6 rounded-xl border-4 border-neutral-950 hover:-translate-y-2 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10`}
    >
      <div className="bg-primary-500 w-12 h-12 rounded-full border-4 border-neutral-950 flex items-center justify-center mb-6 text-neutral-50 font-black text-xl">
        {stepNumber}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default HowItWorksStep;
