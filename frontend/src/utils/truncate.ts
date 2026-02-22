export const truncate = (text: string, maxChars: number) => {
  if (!text) return "";
  return text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
};
