import React from "react";
import { Card, CardContent } from "./card";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  bgColor = "bg-primary-200",
  textColor = "text-black",
  iconRotation = "rotate-3",
}) => {
  return (
    <Card
      className={`${bgColor} p-6 rounded-xl border-border hover:-translate-y-2 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
    >
      <CardContent>
        <div
          className={`bg-primary-100 inline-block p-4 rounded-lg border-4 border-neutral-950 mb-4 ${iconRotation}`}
        >
          <Icon className="text-3xl" />
        </div>
        <h3 className={`text-2xl font-bold mb-3 ${textColor}`}>{title}</h3>
        <p className={textColor}>{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
