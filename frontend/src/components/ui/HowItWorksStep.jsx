import React from "react";
import { Card, CardContent } from "./card";

const HowItWorksStep = ({
  stepNumber,
  title,
  description,
  bgColor = "bg-neutral-200",
}) => {
  return (
    <Card
      className={`${bgColor} p-6 rounded-xl border-4 border-border hover:-translate-y-2 transition-transform shadow-shadow z-10`}
    >
      <CardContent>
        <div className="bg-primary-500 w-12 h-12 rounded-full border-4 border-border flex items-center justify-center mb-6 text-neutral-50 font-black text-xl">
          {stepNumber}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};

export default HowItWorksStep;
