/**
 * Truncates a list of description bullets to a character budget, breaking at
 * a word boundary and appending "..." to the item that overflows — used to
 * collapse a long Experience entry on mobile without cutting a word in half.
 * Returns the items unchanged if they already fit within `limit`.
 */
export function truncateDescription(items: string[], limit: number): string[] {
  const fullText = items.join(' ');
  if (fullText.length <= limit) return items;

  const truncated: string[] = [];
  let charCount = 0;
  for (const item of items) {
    if (charCount + item.length <= limit) {
      truncated.push(item);
      charCount += item.length;
    } else if (charCount < limit) {
      const remaining = limit - charCount;
      let truncatedText = item.substring(0, remaining);
      const lastSpaceIndex = truncatedText.lastIndexOf(' ');
      if (lastSpaceIndex > 0) truncatedText = truncatedText.substring(0, lastSpaceIndex);
      truncated.push(`${truncatedText}...`);
      break;
    } else {
      break;
    }
  }
  return truncated;
}
