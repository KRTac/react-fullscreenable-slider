import React from 'react';


type SpacerProps = {
  children: React.ReactNode,
  className?: string
};

function Spacer({ children, className }: SpacerProps) {
  return (
    <div
      className={`my-14 lg:my-20${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  );
}

export default Spacer;
