import { FileText, X, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { UploadedDocument, ProcessingProgress } from '@/types';
import config from '@/config';

interface DocumentPanelProps {
  documents: UploadedDocument[];
  processingProgress: ProcessingProgress | null;
  canUploadMore: boolean;
  onRemoveDocument: (filename: string) => void;
  onClearAll: () => void;
}

export function DocumentPanel({
  documents,
  processingProgress,
  onRemoveDocument,
  onClearAll,
}: DocumentPanelProps) {
  if (documents.length === 0 && !processingProgress) {
    return null;
  }

  return (
    <div className="mb-3 animate-fade-in">
      {/* Mode Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">
              Local RAG Mode
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {documents.filter((d) => d.status === 'ready').length}/{config.rag.maxFiles} documents
          </span>
        </div>

        {documents.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs flex items-center gap-1"
            title="Clear all documents"
          >
            <Trash2 className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      {/* Processing Progress */}
      {processingProgress && processingProgress.stage !== 'done' && (
        <div className="mb-2 px-3 py-2.5 rounded-xl glass-surface border border-primary-500/20 overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            {processingProgress.stage === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            ) : (
              <Loader2 className="h-4 w-4 text-primary-400 animate-spin flex-shrink-0" />
            )}
            <span
              className={`text-xs font-medium ${
                processingProgress.stage === 'error' ? 'text-red-300' : 'text-primary-300'
              }`}
            >
              {processingProgress.message}
            </span>
          </div>
          {processingProgress.stage !== 'error' && (
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${processingProgress.progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Success message */}
      {processingProgress && processingProgress.stage === 'done' && (
        <div className="mb-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium text-emerald-300">
            {processingProgress.message}
          </span>
        </div>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {documents.map((doc) => (
            <div
              key={doc.filename}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                doc.status === 'ready'
                  ? 'bg-white/[0.05] border border-white/[0.1] hover:border-white/[0.2]'
                  : doc.status === 'processing'
                  ? 'bg-primary-500/10 border border-primary-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <FileText
                className={`h-3.5 w-3.5 flex-shrink-0 ${
                  doc.status === 'ready'
                    ? 'text-primary-400'
                    : doc.status === 'processing'
                    ? 'text-primary-300 animate-pulse'
                    : 'text-red-400'
                }`}
              />
              <span className="text-gray-300 max-w-[150px] truncate" title={doc.filename}>
                {doc.filename}
              </span>
              {doc.status === 'ready' && (
                <span className="text-gray-500">{doc.chunkCount} chunks</span>
              )}
              {doc.status === 'processing' && (
                <Loader2 className="h-3 w-3 text-primary-400 animate-spin" />
              )}
              {doc.status === 'error' && (
                <span title={doc.errorMessage}>
                  <AlertCircle className="h-3 w-3 text-red-400" />
                </span>
              )}
              <button
                onClick={() => onRemoveDocument(doc.filename)}
                className="ml-0.5 p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.1] transition-all"
                title="Remove document"
                disabled={doc.status === 'processing'}
              >
                <X className="h-3 w-3 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
