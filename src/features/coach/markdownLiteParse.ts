export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; children: InlineNode[] };

export type BlockNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'ul'; items: InlineNode[][] }
  | { type: 'ol'; items: InlineNode[][] };

/** Strip angle-bracket tags so raw HTML never becomes executable UI. */
export function stripHtmlTags(input: string): string {
  return input.replace(/<\/?[a-zA-Z][^>]*>/g, '');
}

export function isSafeHttpUrl(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|(https?:\/\/[^\s<]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    if (match[1] && match[2]) {
      nodes.push({
        type: 'link',
        href: match[2],
        children: [{ type: 'text', value: match[1] }],
      });
    } else if (match[3]) {
      nodes.push({ type: 'code', value: match[3] });
    } else if (match[4]) {
      nodes.push({ type: 'bold', children: [{ type: 'text', value: match[4] }] });
    } else if (match[5] || match[6]) {
      nodes.push({
        type: 'italic',
        children: [{ type: 'text', value: match[5] || match[6] || '' }],
      });
    } else if (match[7]) {
      const href = match[7].replace(/[.,);:]+$/, '');
      nodes.push({
        type: 'link',
        href,
        children: [{ type: 'text', value: href }],
      });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return nodes.length > 0 ? nodes : [{ type: 'text', value: text }];
}

export function parseMarkdownLite(source: string): BlockNode[] {
  const text = stripHtmlTags(source.replace(/\r\n/g, '\n'));
  const lines = text.split('\n');
  const blocks: BlockNode[] = [];
  let paragraphLines: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: InlineNode[][] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({
      type: 'paragraph',
      children: parseInline(paragraphLines.join('\n')),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) {
      listType = null;
      listItems = [];
      return;
    }
    blocks.push({ type: listType, items: listItems });
    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    const ulMatch = line.match(/^\s*[-*]\s+(.+)$/);
    const olMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(parseInline(ulMatch[1] || ''));
      continue;
    }
    if (olMatch) {
      flushParagraph();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(parseInline(olMatch[1] || ''));
      continue;
    }
    if (line.trim() === '') {
      flushList();
      flushParagraph();
      continue;
    }
    flushList();
    paragraphLines.push(line);
  }
  flushList();
  flushParagraph();
  return blocks;
}
