export default function isActiveIndex(idx: number, firstActive: number, perPage: number) {
  return idx >= firstActive && idx < (firstActive + perPage);
}
