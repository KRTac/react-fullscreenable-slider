import React from 'react';


function Spacer({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10">{children}</div>
  );
}

export default Spacer;
