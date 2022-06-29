import React from 'react';


function Typography({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose lg:prose-lg max-w-3xl lg:max-w-4xl mx-auto">
      {children}
    </div>
  );
}

export default Typography;
