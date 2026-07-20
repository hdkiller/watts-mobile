import * as WebBrowser from 'expo-web-browser';
import { Linking, Text, View } from 'react-native';

import {
  isSafeHttpUrl,
  parseMarkdownLite,
  type InlineNode,
} from './markdownLiteParse';

export {
  parseMarkdownLite,
  stripHtmlTags,
  isSafeHttpUrl,
  type InlineNode,
  type BlockNode,
} from './markdownLiteParse';

export async function openMarkdownLink(href: string): Promise<void> {
  if (!isSafeHttpUrl(href)) return;
  try {
    await WebBrowser.openBrowserAsync(href);
  } catch {
    await Linking.openURL(href);
  }
}

function Inline({
  nodes,
  baseClassName,
}: {
  nodes: InlineNode[];
  baseClassName: string;
}) {
  return (
    <>
      {nodes.map((node, index) => {
        const key = `${node.type}-${index}`;
        if (node.type === 'text') {
          return (
            <Text key={key} className={baseClassName}>
              {node.value}
            </Text>
          );
        }
        if (node.type === 'bold') {
          return (
            <Text key={key} className={`${baseClassName} font-bold`}>
              <Inline nodes={node.children} baseClassName={baseClassName} />
            </Text>
          );
        }
        if (node.type === 'italic') {
          return (
            <Text key={key} className={`${baseClassName} italic`}>
              <Inline nodes={node.children} baseClassName={baseClassName} />
            </Text>
          );
        }
        if (node.type === 'code') {
          return (
            <Text
              key={key}
              className="rounded bg-border-strong px-1.5 py-0.5 text-sm text-brand"
            >
              {node.value}
            </Text>
          );
        }
        return (
          <Text
            key={key}
            className={`${baseClassName} text-brand underline`}
            onPress={() => {
              void openMarkdownLink(node.href);
            }}
            accessibilityRole="link"
          >
            <Inline nodes={node.children} baseClassName={baseClassName} />
          </Text>
        );
      })}
    </>
  );
}

/** Constrained markdown for assistant/system bubbles. No HTML execution. */
export function MarkdownLite({
  text,
  className = 'text-base leading-6 text-text-primary',
}: {
  text: string;
  className?: string;
}) {
  const blocks = parseMarkdownLite(text);
  if (blocks.length === 0) return null;

  return (
    <View>
      {blocks.map((block, blockIndex) => {
        const key = `${block.type}-${blockIndex}`;
        if (block.type === 'paragraph') {
          return (
            <Text key={key} className={`${className}${blockIndex > 0 ? ' mt-2' : ''}`}>
              <Inline nodes={block.children} baseClassName={className} />
            </Text>
          );
        }
        return (
          <View key={key} className={`${blockIndex > 0 ? 'mt-2' : ''} pl-4`}>
            {block.items.map((item, itemIndex) => (
              <Text key={`${key}-${itemIndex}`} className={`${className} mb-1`}>
                {block.type === 'ul' ? '• ' : `${itemIndex + 1}. `}
                <Inline nodes={item} baseClassName={className} />
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}
