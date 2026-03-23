import { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Download,
  Upload,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '../stores/themeStore';
import { cn } from '../utils/cn';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/shared/Button';
import { FileUpload } from '../components/shared/FileUpload';
import { exportService } from '../services/exportService';
import { TemplateList } from '../components/templates/TemplateList';
import { useImportTodoist, useImportJSON } from '../hooks/useImport';
import type { ImportResult } from '../services/importService';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  icon: React.ElementType;
  label: string;
  description: string;
};

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    icon: Sun,
    label: 'Light',
    description: 'Always use light mode',
  },
  {
    value: 'dark',
    icon: Moon,
    label: 'Dark',
    description: 'Always use dark mode',
  },
  {
    value: 'system',
    icon: Monitor,
    label: 'System',
    description: 'Match your OS setting',
  },
];

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { theme, setTheme } = useThemeStore();
  const [isExporting, setIsExporting] = useState(false);

  // --- Import state ---
  const importTodoist = useImportTodoist();
  const importJSON = useImportJSON();
  const [todoistResult, setTodoistResult] = useState<ImportResult | null>(null);
  const [jsonResult, setJsonResult] = useState<ImportResult | null>(null);

  function handleTodoistFile(content: string) {
    setTodoistResult(null);
    importTodoist.mutate(content, {
      onSuccess: (result) => setTodoistResult(result),
    });
  }

  function handleJSONFile(content: string) {
    setJsonResult(null);
    importJSON.mutate(content, {
      onSuccess: (result) => setJsonResult(result),
    });
  }

  async function handleExportMarkdown() {
    setIsExporting(true);
    try {
      const { markdown } = await exportService.exportAllData();
      exportService.downloadFile(markdown, 'meld-export.md', 'text/markdown');
      toast.success('Markdown export downloaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportJSON() {
    setIsExporting(true);
    try {
      const { json } = await exportService.exportAllData();
      exportService.downloadFile(json, 'meld-export.json', 'application/json');
      toast.success('JSON export downloaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        App preferences and account settings.
      </p>

      {/* Theme section */}
      <section className="mt-8" aria-labelledby="theme-heading">
        <h2
          id="theme-heading"
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Appearance
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose how Meld looks to you. Your preference is synced across
          devices.
        </p>

        <div
          className="mt-4 grid grid-cols-3 gap-3"
          role="radiogroup"
          aria-labelledby="theme-heading"
        >
          {themeOptions.map(({ value, icon: Icon, label, description }) => {
            const isSelected = theme === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTheme(value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                {/* Checkmark badge */}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                    <Check className="h-3 w-3 text-white" aria-hidden="true" />
                  </span>
                )}

                <Icon
                  className={cn(
                    'h-6 w-6',
                    isSelected
                      ? 'text-indigo-500'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                  aria-hidden="true"
                />

                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {label}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Export section */}
      <section className="mt-10" aria-labelledby="export-heading">
        <h2
          id="export-heading"
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Export Data
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Download a full copy of your tasks, notes, projects, and tags.
          Markdown is human-readable; JSON is suitable for backup or external
          processing.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleExportMarkdown}
            isLoading={isExporting}
            disabled={isExporting}
            aria-label="Export all data as Markdown"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export as Markdown
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportJSON}
            isLoading={isExporting}
            disabled={isExporting}
            aria-label="Export all data as JSON"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export as JSON
          </Button>
        </div>

        {isExporting && (
          <p
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
            aria-live="polite"
          >
            Preparing export…
          </p>
        )}
      </section>

      {/* Import section */}
      <section className="mt-10" aria-labelledby="import-heading">
        <h2
          id="import-heading"
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Import Data
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Bring your existing tasks and projects into Meld from other apps or
          from a previous Meld export.
        </p>

        <div className="mt-6 space-y-8">
          {/* Todoist CSV */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Upload
                  className="h-4 w-4 text-indigo-500"
                  aria-hidden="true"
                />
                Import from Todoist
              </h3>
              <a
                href="https://todoist.com/help/articles/how-to-export-a-project-as-a-csv-file"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                How to export from Todoist
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Export a project from Todoist as a CSV file, then upload it here.
              Priorities (p1–p3), due dates, and completion status are
              preserved.
            </p>
            <div className="mt-3">
              <FileUpload
                accept=".csv"
                label="Drop Todoist CSV here"
                description="Accepted format: .csv"
                disabled={importTodoist.isPending}
                onFileContent={handleTodoistFile}
              />
            </div>
            {importTodoist.isPending && (
              <p
                className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                aria-live="polite"
              >
                Importing…
              </p>
            )}
            {todoistResult && <ImportResultSummary result={todoistResult} />}
          </div>

          {/* Meld JSON */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-indigo-500" aria-hidden="true" />
              Import from JSON
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload a Meld JSON export (downloaded from Export Data above).
              Tasks, notes, and projects are all restored.
            </p>
            <div className="mt-3">
              <FileUpload
                accept=".json"
                label="Drop Meld JSON here"
                description="Accepted format: .json"
                disabled={importJSON.isPending}
                onFileContent={handleJSONFile}
              />
            </div>
            {importJSON.isPending && (
              <p
                className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                aria-live="polite"
              >
                Importing…
              </p>
            )}
            {jsonResult && <ImportResultSummary result={jsonResult} />}
          </div>
        </div>
      </section>

      {/* Templates section */}
      <section className="mt-10" aria-labelledby="templates-heading">
        <h2
          id="templates-heading"
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Templates
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Reusable templates for tasks and notes. Open any task or note and
          click the template icon to save it as a template.
        </p>

        <div className="mt-4">
          <TemplateList />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ImportResultSummary
// ---------------------------------------------------------------------------

interface ImportResultSummaryProps {
  result: import('../services/importService').ImportResult;
}

function ImportResultSummary({ result }: ImportResultSummaryProps) {
  const hasErrors = result.errors.length > 0;
  const hasSuccesses = result.tasksImported > 0 || result.projectsCreated > 0;

  return (
    <div
      className={cn(
        'mt-3 rounded-lg border px-4 py-3 text-sm',
        hasErrors
          ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950/30'
          : 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30'
      )}
      role="status"
      aria-live="polite"
    >
      {hasSuccesses && (
        <p className="font-medium text-gray-900 dark:text-gray-100">
          Successfully imported{' '}
          {result.tasksImported > 0 && (
            <>
              <strong>{result.tasksImported}</strong> task
              {result.tasksImported !== 1 ? 's' : ''}
            </>
          )}
          {result.tasksImported > 0 && result.projectsCreated > 0 && ' and '}
          {result.projectsCreated > 0 && (
            <>
              <strong>{result.projectsCreated}</strong> project
              {result.projectsCreated !== 1 ? 's' : ''}
            </>
          )}
          .
        </p>
      )}
      {!hasSuccesses && !hasErrors && (
        <p className="text-gray-600 dark:text-gray-400">
          No items were found to import.
        </p>
      )}
      {hasErrors && (
        <details className="mt-2">
          <summary className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {result.errors.length} row
            {result.errors.length !== 1 ? 's' : ''} had errors
          </summary>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto pl-1">
            {result.errors.map((msg, i) => (
              <li
                key={i}
                className="text-xs text-yellow-800 dark:text-yellow-200"
              >
                {msg}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
