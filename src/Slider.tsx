import React from 'react';


interface SliderProps {
  index?: number;
  children?: React.ReactNode;
}

export default function Slider({ children, index }: SliderProps) {
  let body: React.ReactNode = [];

  if (children) {
    body = React.Children.map<React.ReactNode, any>(children, (item, idx) => {
      if (!item) {
        return null;
      }

      console.log(item);

      return (
        <div key={idx}>{item}</div>
      );
    });
  }

  return (
    <div>
      {body}
    </div>
  );
}
