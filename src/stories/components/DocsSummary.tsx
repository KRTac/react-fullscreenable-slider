import React from 'react';

import LinkTo from './LinkTo';


type SummaryItem = {
  title: string;
  summary: string;
  href: string;
};

function DocsSummary({ items }: { items: SummaryItem[] }) {
  return (
    <div
      className="my-10 flex flex-row items-start flex-wrap max-w-md md:max-w-3xl mx-auto"
    >
      {items.map(({
        title, summary, href
      }, idx) => {
        return (
          <article key={href || idx} className="w-full md:w-1/2 p-4 md:p-6">
            <h2><LinkTo href={href || '#'}>{title}</LinkTo></h2>
            <p>{summary}</p>
          </article>
        );
      })}
    </div>
  );
}

export default DocsSummary;
