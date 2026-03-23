/**
 * GraphPage — Obsidian-style knowledge graph view.
 *
 * Displays all notes as nodes in a force-directed graph. Edges are derived
 * from [[wiki-link]] references in note content. Clicking a node opens the
 * note in a slide-over panel.
 */

import { useMemo, useState, useCallback } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNotes } from '@/hooks/useNotes';
import { extractBacklinks } from '@/utils/backlinks';
import { ForceGraph } from '@/components/graph/ForceGraph';
import { NoteDetail } from '@/components/notes/NoteDetail';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { GraphNode, GraphLink } from '@/components/graph/ForceGraph';

export default function GraphPage() {
  useDocumentTitle('Graph');

  const { data: notes, isLoading, isError } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Build graph data from all notes + [[backlink]] references
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    const noteList = notes ?? [];

    // Build a title -> id lookup for backlink resolution
    const titleToId = new Map<string, string>();
    noteList.forEach((note: { id: string; title: string }) => {
      titleToId.set(note.title.toLowerCase(), note.id);
    });

    // Initialise nodes
    noteList.forEach((note: { id: string; title: string }) => {
      nodes.push({ id: note.id, title: note.title, connections: 0 });
    });

    // Build a quick id -> node lookup for incrementing connection counts
    const nodeById = new Map<string, GraphNode>();
    nodes.forEach((n) => nodeById.set(n.id, n));

    // Derive links from [[backlinks]] in each note's plain-text content
    noteList.forEach((note: { id: string; content_plain?: string | null }) => {
      const refs = extractBacklinks(note.content_plain ?? '');
      refs.forEach((refTitle) => {
        const targetId = titleToId.get(refTitle.toLowerCase());
        if (targetId && targetId !== note.id) {
          links.push({ source: note.id, target: targetId });
          const srcNode = nodeById.get(note.id);
          const tgtNode = nodeById.get(targetId);
          if (srcNode) srcNode.connections++;
          if (tgtNode) tgtNode.connections++;
        }
      });
    });

    return { nodes, links };
  }, [notes]);

  const hasNotes = (notes ?? []).length > 0;
  const hasLinks = graphData.links.length > 0;

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNoteId(nodeId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Knowledge Graph
        </h1>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {graphData.nodes.length} note{graphData.nodes.length !== 1 ? 's' : ''}
          {graphData.links.length > 0
            ? `, ${graphData.links.length} connection${graphData.links.length !== 1 ? 's' : ''}`
            : ''}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Graph canvas */}
        <div className="flex-1 relative">
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <LoadingSpinner size="lg" />
            </div>
          )}

          {isError && (
            <div
              className="absolute inset-0 flex items-center justify-center p-8"
              role="alert"
            >
              <p className="text-sm text-red-500 dark:text-red-400 text-center">
                Failed to load notes. Please try refreshing.
              </p>
            </div>
          )}

          {!isLoading && !isError && !hasNotes && (
            <GraphEmptyState reason="no-notes" />
          )}

          {!isLoading && !isError && hasNotes && !hasLinks && (
            <GraphEmptyState reason="no-links" />
          )}

          {!isLoading && !isError && hasNotes && (
            <ForceGraph data={graphData} onNodeClick={handleNodeClick} />
          )}
        </div>

        {/* Note detail slide-over panel */}
        {selectedNoteId && (
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-96 z-30 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-xl overflow-hidden"
            role="complementary"
            aria-label="Note detail"
          >
            {/* Panel header */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <button
                type="button"
                onClick={handleClosePanel}
                className="flex items-center justify-center min-h-[36px] min-w-[36px] rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close note panel"
              >
                <span className="hidden sm:block">
                  <X size={18} aria-hidden="true" />
                </span>
                <span className="sm:hidden">
                  <ArrowLeft size={18} aria-hidden="true" />
                </span>
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Note
              </span>
            </div>

            {/* Note detail content */}
            <div className="flex-1 overflow-y-auto">
              <NoteDetail
                noteId={selectedNoteId}
                onClose={handleClosePanel}
                onDelete={handleClosePanel}
                onSelectNote={(id) => setSelectedNoteId(id)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --------------- Empty state helper ---------------

type EmptyReason = 'no-notes' | 'no-links';

function GraphEmptyState({ reason }: { reason: EmptyReason }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="max-w-sm text-center">
        {/* Decorative icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-400 dark:text-indigo-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="2" />
            <circle cx="5" cy="19" r="2" />
            <circle cx="19" cy="19" r="2" />
            <line x1="12" y1="7" x2="5" y2="17" />
            <line x1="12" y1="7" x2="19" y2="17" />
            <line x1="7" y1="19" x2="17" y2="19" />
          </svg>
        </div>

        {reason === 'no-notes' ? (
          <>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              No notes yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your first note to start building your knowledge graph. Use{' '}
              <code className="rounded bg-gray-100 dark:bg-gray-800 px-1 py-0.5 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                [[Note Title]]
              </code>{' '}
              inside a note to link to another note.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              No connections yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Link notes together using{' '}
              <code className="rounded bg-gray-100 dark:bg-gray-800 px-1 py-0.5 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                [[Note Title]]
              </code>{' '}
              syntax inside your notes. Connected notes will appear here as a
              graph.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
