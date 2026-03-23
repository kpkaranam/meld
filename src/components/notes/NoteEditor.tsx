import { useEditor, EditorContent } from '@tiptap/react';
import { defaultExtensions, extractPlainText } from '../../lib/tiptap';
import { EditorToolbar } from './EditorToolbar';

interface NoteEditorProps {
  /** TipTap JSON document content. */
  content: object | null;
  /** Called whenever the editor content changes. Receives the JSON doc and extracted plain text. */
  onUpdate: (json: object, plainText: string) => void;
  /** Whether the editor is in editable mode. Defaults to true. */
  editable?: boolean;
}

export function NoteEditor({
  content,
  onUpdate,
  editable = true,
}: NoteEditorProps) {
  const editor = useEditor({
    extensions: defaultExtensions,
    content: content ?? undefined,
    editable,
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const plainText = extractPlainText(json);
      onUpdate(json, plainText);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  return (
    <div
      className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      role="region"
      aria-label="Note editor"
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
