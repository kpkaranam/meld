import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export const defaultExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    bulletList: { keepMarks: true },
    orderedList: { keepMarks: true },
  }),
  Placeholder.configure({
    placeholder: 'Start writing...',
  }),
];

/** Recursively extract plain text from a TipTap JSON document for search indexing. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractPlainText(json: any): string {
  if (!json || !json.content) return '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractText(node: any): string {
    if (node.type === 'text') return node.text ?? '';
    if (!node.content) return '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childText = (node.content as any[]).map(extractText).join('');
    // Add newline after block-level elements so words don't run together.
    const blockTypes = [
      'paragraph',
      'heading',
      'bulletList',
      'orderedList',
      'blockquote',
      'codeBlock',
      'listItem',
    ];
    if (blockTypes.includes(node.type as string)) {
      return childText + '\n';
    }
    return childText;
  }

  return extractText(json).trim();
}
