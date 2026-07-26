import { describe, expect, it } from 'vitest';

import { isSafeHttpUrl, parseMarkdownLite, stripHtmlTags } from '../markdownLiteParse';

describe('markdownLite', () => {
  describe('stripHtmlTags', () => {
    it('strips HTML tags without interpreting them', () => {
      expect(stripHtmlTags('Hello <b>world</b> <script>alert(1)</script>')).toBe(
        'Hello world alert(1)',
      );
    });
  });

  describe('isSafeHttpUrl', () => {
    it('validates http and https URLs', () => {
      expect(isSafeHttpUrl('http://example.com')).toBe(true);
      expect(isSafeHttpUrl('https://coachwatts.com/path?a=1')).toBe(true);
    });

    it('rejects non-http protocols and malformed URLs', () => {
      expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeHttpUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeHttpUrl('not a url')).toBe(false);
    });
  });

  describe('parseMarkdownLite', () => {
    it('parses emphasis, lists, and links', () => {
      const blocks = parseMarkdownLite(
        'Try **bold** and *italic*\n\n- one\n- two\n\nSee [docs](https://coachwatts.com) and https://example.com/path',
      );

      expect(blocks[0]).toMatchObject({ type: 'paragraph' });
      expect(blocks[0]?.type === 'paragraph' && blocks[0].children).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'bold' }),
          expect.objectContaining({ type: 'italic' }),
        ]),
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
        ]),
      );
    });

    it('parses ordered lists (ol) and inline code', () => {
      const blocks = parseMarkdownLite('Step 1:\n1. First step with `code`\n2. Second step');

      expect(blocks[0]).toMatchObject({ type: 'paragraph' });
      expect(blocks[1]).toMatchObject({ type: 'ol' });
      if (blocks[1]?.type === 'ol') {
        expect(blocks[1].items).toHaveLength(2);
        expect(blocks[1].items[0]).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ type: 'text', value: 'First step with ' }),
            expect.objectContaining({ type: 'code', value: 'code' }),
          ]),
        );
      }
    });

    it('handles CRLF line breaks and strips trailing punctuation on bare URLs', () => {
      const blocks = parseMarkdownLite('Check out https://coachwatts.com/go.\r\nAnother line.');

      expect(blocks[0]?.type).toBe('paragraph');
      if (blocks[0]?.type === 'paragraph') {
        const linkNode = blocks[0].children.find((c) => c.type === 'link');
        expect(linkNode).toBeDefined();
        if (linkNode && linkNode.type === 'link') {
          expect(linkNode.href).toBe('https://coachwatts.com/go');
        }
      }
    });
  });
});
