export default function removeKey(obj, keyToRemove) {
  const { [keyToRemove]: _, ...rest } = obj;
  return rest;
}
