export default function isVisibleIndex(idx: number, firstActive: number, perPage: number) {
  return idx >= firstActive && idx < (firstActive + perPage);
}
