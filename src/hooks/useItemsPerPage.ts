import { useState, useEffect } from 'react';


function filterProp(
  prop: number | string,
  sliderDim: number,
  itemDim: number,
  setItemDim: (dim: number) => any
) {
  let itemsPerPage = typeof prop === 'number' && prop > 0 ? prop : 1;

  if (sliderDim <= 0) {
    return itemsPerPage;
  }

  if (prop === 'auto') {
    if (itemDim <= 0) {
      return itemsPerPage;
    }

    itemsPerPage = Math.round(sliderDim / itemDim);
  } else {
    setItemDim(sliderDim / itemsPerPage);
  }

  return itemsPerPage;
}

function useItemsPerPage(
  prop: number | string,
  sliderAxisDim: number,
  itemAxisDim: number,
  setItemAxisDim: (dim: number) => any
) {
  const [ itemsPerPage, setItemsPerPage ] = useState(filterProp(
    prop,
    sliderAxisDim,
    itemAxisDim,
    setItemAxisDim
  ));

  useEffect(() => {
    setItemsPerPage(filterProp(
      prop,
      sliderAxisDim,
      itemAxisDim,
      setItemAxisDim
    ));
  }, [ prop, sliderAxisDim, itemAxisDim, setItemAxisDim ]);

  return itemsPerPage;
}

export default useItemsPerPage;
