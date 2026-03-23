/**
 * FileUpload — drag-and-drop / click-to-browse file input.
 *
 * Reads the selected file as UTF-8 text and forwards both the content string
 * and the original filename to the `onFileContent` callback.
 *
 * Accessibility notes:
 *   - The drop zone is a focusable button so keyboard users can activate it.
 *   - Status (idle / file selected) is announced via aria-live.
 *   - The hidden <input> is wired to the visible button via a ref so the
 *     native file-picker opens on click/Enter/Space.
 */

import { useRef, useState, useCallback, DragEvent, KeyboardEvent } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FileUploadProps {
  /** Comma-separated list of accepted file extensions, e.g. ".csv,.json" */
  accept: string;
  /** Called with the file's text content and the original filename. */
  onFileContent: (content: string, filename: string) => void;
  /** Short label shown inside the drop zone. */
  label: string;
  /** Optional explanatory text shown below the label. */
  description?: string;
  /** When true the control is visually disabled and ignores interactions. */
  disabled?: boolean;
}

/**
 * Drag-and-drop file upload zone.
 *
 * @example
 * <FileUpload
 *   accept=".csv"
 *   label="Drop Todoist CSV here"
 *   description="Exported from Todoist → Settings → Backups"
 *   onFileContent={(text, name) => handleImport(text)}
 * />
 */
export function FileUpload({
  accept,
  onFileContent,
  label,
  description,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // File reading
  // ---------------------------------------------------------------------------

  const readFile = useCallback(
    (file: File) => {
      setReadError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setSelectedFile(file.name);
          onFileContent(content, file.name);
        }
      };
      reader.onerror = () => {
        setReadError('Could not read the file. Please try again.');
      };
      reader.readAsText(file, 'utf-8');
    },
    [onFileContent]
  );

  // ---------------------------------------------------------------------------
  // Input change (click-to-browse)
  // ---------------------------------------------------------------------------

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    // Reset the input value so the same file can be re-selected after clearing.
    e.target.value = '';
  }

  // ---------------------------------------------------------------------------
  // Drag-and-drop
  // ---------------------------------------------------------------------------

  function handleDragOver(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLButtonElement>) {
    // Only clear the flag when leaving the zone itself, not a child element.
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  // ---------------------------------------------------------------------------
  // Keyboard activation (Enter / Space open the file picker)
  // ---------------------------------------------------------------------------

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  // ---------------------------------------------------------------------------
  // Clear selection
  // ---------------------------------------------------------------------------

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedFile(null);
    setReadError(null);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full">
      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={handleInputChange}
      />

      {/* Drop zone */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        aria-label={`${label}. Click or drag a file here.`}
        className={cn(
          'w-full rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-gray-950',
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:border-indigo-600 dark:hover:bg-gray-800/40',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {selectedFile ? (
          /* File selected state */
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-indigo-500" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
              {selectedFile}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs',
                'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400',
                'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500'
              )}
              aria-label="Remove selected file"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Remove
            </button>
          </div>
        ) : (
          /* Idle / drag state */
          <div className="flex flex-col items-center gap-2">
            <Upload
              className={cn(
                'h-8 w-8',
                isDragging
                  ? 'text-indigo-500'
                  : 'text-gray-400 dark:text-gray-500'
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'text-sm font-medium',
                isDragging
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {isDragging ? 'Drop file here' : label}
            </span>
            {description && !isDragging && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </span>
            )}
            {!isDragging && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                or click to browse
              </span>
            )}
          </div>
        )}
      </button>

      {/* Error / status region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-1 min-h-[1.25rem]"
      >
        {readError && (
          <p className="text-xs text-red-600 dark:text-red-400">{readError}</p>
        )}
      </div>
    </div>
  );
}
