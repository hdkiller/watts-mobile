import { describe, expect, it } from 'vitest';

import { parseMarkdownLite, stripHtmlTags } from '../markdownLiteParse';

describe('markdownLite', () => {
  it('strips HTML tags without interpreting them', () => {
    expect(stripHtmlTags('Hello <b>world</b> <script>alert(1)</script>')).toBe(
      'Hello world alert(1)'
    );
  });

  it('parses emphasis, lists, and links', () => {
    const blocks = parseMarkdownLite(
      'Try **bold** and *italic*\n\n- one\n- two\n\nSee [docs](https://coachwatts.com) and https://example.com/path'
    );

    expect(blocks[0]).toMatchObject({ type: 'paragraph' });
    expect(blocks[0]?.type === 'paragraph' && blocks[0].children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'bold' }),
        expect.objectContaining({ type: 'italic' }),
      ])
    );
    expect(blocks[1]).toMatchObject({ type: 'ul' });
    expect(blocks[1]?.type === 'ul' && blocks[1].items).toHaveLength(2);
    expect(blocks[2]?.type === 'paragraph' && blocks[2].children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'link',
          href: 'https://coachwatts.com',
        }),
        expect.objectContaining({
          type: 'link',
          href: 'https://example.com/path',
        }),
      ])
    );
  });
});
