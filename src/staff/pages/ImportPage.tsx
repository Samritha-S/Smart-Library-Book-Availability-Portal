import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import {
  Button,
  DataTable,
  StatusBadge,
  Column,
  ErrorState,
} from '../_local';
import {
  import_catalog_batch,
  list_import_review,
  resolve_import_review,
  ImportBatchRow,
  ImportCatalogResult,
  ImportReviewItem,
} from '../api';

// In-memory cache for Open Library API responses
const openLibraryCache = new Map<string, any>();

const getQueryParam = (key: string): string => {
  const hashParts = window.location.hash.split('?');
  const search = hashParts[1] || window.location.search.substring(1);
  return new URLSearchParams(search).get(key) || '';
};

export const ImportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'review'>('preview');
  const [rows, setRows] = useState<ImportBatchRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState({ done: 0, total: 0 });
  const [commitLoading, setCommitLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportCatalogResult | null>(null);
  const [reviewItems, setReviewItems] = useState<ImportReviewItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ message: string; fix: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (getQueryParam('sample') === 'true') {
      handleLoadSample();
    }
  }, []);

  // Load sample CSV directly
  const handleLoadSample = async () => {
    setIsParsing(true);
    setErrorMessage(null);
    setImportResult(null);

    try {
      // In Vite dev, fetch the sample-catalog.csv file
      const res = await fetch(new URL('../sample-catalog.csv', import.meta.url).href);
      const csvText = await res.text();
      processCsvText(csvText);
    } catch (err) {
      console.error('Failed to load sample CSV:', err);
      // Fallback sample data directly if fetch fails
      const fallbackCsv = `accession_no,isbn,title,author,subject,edition_no,year,shelf_location,reference_only
ACC-1001,9780262033848,Introduction to Algorithms,Thomas H. Cormen,Computer Science,3,2009,CS-01-A,false
ACC-1004,9780131103627,The C Programming Language,Brian W. Kernighan,Computer Science,2,1988,CS-02-B,false
ACC-1006,9780132350884,Clean Code,Robert C. Martin,Software Engineering,1,2008,CS-03-C,false
ACC-1010,9781449373320,Designing Data-Intensive Applications,Martin Kleppmann,Database Systems,1,2017,DB-01-A,false
ACC-1016,9780134093413,Artificial Intelligence: A Modern Approach,Stuart Russell,Artificial Intelligence,4,2020,AI-01-A,false
ACC-1026,,Principles of Digital Communication,Robert Gallager,Electrical Engineering,1,2008,EE-01-A,false
ACC-1028,9780000000000,Unverified Rare Manuscript on Graph Theory,Euler Archive,Mathematics,1,1950,RARE-01,true`;
      processCsvText(fallbackCsv);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setErrorMessage(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const processCsvText = (csvText: string) => {
    Papa.parse<ImportBatchRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows = results.data.map((r) => ({
          accession_no: (r.accession_no || '').trim(),
          isbn: (r.isbn || '').trim(),
          title: (r.title || '').trim(),
          author: (r.author || '').trim(),
          subject: (r.subject || 'General').trim(),
          edition_no: r.edition_no || 1,
          year: r.year || 2024,
          shelf_location: (r.shelf_location || 'UNASSIGNED').trim(),
          reference_only: String(r.reference_only).toLowerCase() === 'true',
        }));

        setRows(parsedRows);
        setIsParsing(false);

        // Automatically trigger Open Library enrichment for rows with ISBN
        enrichWithOpenLibrary(parsedRows);
      },
      error: (error: Error) => {
        setIsParsing(false);
        setErrorMessage({
          message: `CSV parsing error: ${error.message}`,
          fix: 'Verify the CSV column headers: accession_no, isbn, title, author, subject, edition_no, year, shelf_location, reference_only.',
        });
      },
    });
  };

  // Open Library API lookup (throttled & cached)
  const enrichWithOpenLibrary = async (batch: ImportBatchRow[]) => {
    const rowsWithIsbn = batch.filter((r) => r.isbn && r.isbn.length >= 9);
    if (rowsWithIsbn.length === 0) return;

    setIsEnriching(true);
    setEnrichmentProgress({ done: 0, total: rowsWithIsbn.length });

    const reviewItemsToAdd: ImportReviewItem[] = [];

    // Group into batches of 5 to respect rate limits
    const chunkSize = 5;
    for (let i = 0; i < rowsWithIsbn.length; i += chunkSize) {
      const chunk = rowsWithIsbn.slice(i, i + chunkSize);
      const bibkeys = chunk.map((r) => `ISBN:${r.isbn}`).join(',');

      try {
        let data: Record<string, any> = {};
        if (openLibraryCache.has(bibkeys)) {
          data = openLibraryCache.get(bibkeys);
        } else {
          const resp = await fetch(
            `https://openlibrary.org/api/books?bibkeys=${bibkeys}&jscmd=data&format=json`
          );
          if (resp.ok) {
            data = await resp.json();
            openLibraryCache.set(bibkeys, data);
          }
        }

        // Check each row in chunk
        for (const row of chunk) {
          const bookData = data[`ISBN:${row.isbn}`];
          if (!bookData) {
            // Failed lookup -> needs review
            reviewItemsToAdd.push({
              id: `rev-${row.accession_no}`,
              accession_no: row.accession_no,
              isbn: row.isbn,
              title: row.title,
              author: row.author,
              suggested_title: row.title ? `${row.title} (Verified)` : undefined,
              reason: 'Open Library found no matching record for this ISBN',
              status: 'pending',
              created_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn('Open Library lookup error:', err);
      }

      setEnrichmentProgress({ done: Math.min(rowsWithIsbn.length, i + chunkSize), total: rowsWithIsbn.length });
      // Throttling delay
      await new Promise((r) => setTimeout(r, 200));
    }

    // Rows without ISBN also go to needs review
    const rowsWithoutIsbn = batch.filter((r) => !r.isbn || r.isbn.trim() === '');
    for (const row of rowsWithoutIsbn) {
      reviewItemsToAdd.push({
        id: `rev-${row.accession_no}`,
        accession_no: row.accession_no,
        title: row.title || 'Untitled Book',
        author: row.author || 'Unknown Author',
        suggested_title: row.title ? `${row.title} (Standard Edition)` : 'Introduction to Algorithms',
        reason: 'Missing ISBN in CSV batch row',
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    setReviewItems(reviewItemsToAdd);
    setIsEnriching(false);
  };

  // Commit with import_catalog_batch
  const handleCommitBatch = async () => {
    if (rows.length === 0) return;
    setCommitLoading(true);
    setErrorMessage(null);

    try {
      const result = await import_catalog_batch(rows);
      setImportResult(result);

      // Toast: reuses button verb ('Commit batch' -> 'Batch committed')
      setToastMessage(
        `Batch committed: ${result.copies_created} copies added, ${result.sent_to_review} sent to review.`
      );
      setTimeout(() => setToastMessage(null), 5000);

      // Fetch fresh review list from backend
      const reviews = await list_import_review();
      setReviewItems(reviews);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch commit failed';
      setErrorMessage({
        message: msg,
        fix: 'Check for duplicate accession numbers or invalid column values before committing.',
      });
    } finally {
      setCommitLoading(false);
    }
  };

  const handleResolveReview = async (reviewId: string, action: 'accept' | 'dismiss') => {
    try {
      await resolve_import_review(reviewId, { action });
      setReviewItems((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: action === 'accept' ? 'resolved' : 'dismissed' } : r))
      );
      setToastMessage(`Review item ${action === 'accept' ? 'accepted and catalogued' : 'dismissed'}.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Resolution failed');
    }
  };

  const previewColumns: Column<ImportBatchRow>[] = [
    {
      key: 'accession_no',
      header: 'Accession',
      sortable: true,
      className: 'w-28 font-mono',
    },
    {
      key: 'isbn',
      header: 'ISBN',
      className: 'w-36 font-mono text-[11px]',
      accessor: (row) =>
        row.isbn ? (
          <span className="text-[#042f2e]">{row.isbn}</span>
        ) : (
          <span className="text-[#b45309] text-[10px] font-sans">No ISBN</span>
        ),
    },
    {
      key: 'title',
      header: 'Book title',
      accessor: (row) => (
        <span className="font-serif font-medium text-[#042f2e] line-clamp-1">{row.title}</span>
      ),
    },
    {
      key: 'author',
      header: 'Author(s)',
      accessor: (row) => <span className="text-xs text-[#042f2e]/80">{row.author}</span>,
    },
    {
      key: 'shelf_location',
      header: 'Shelf',
      className: 'w-28 font-mono text-[11px]',
    },
    {
      key: 'reference_only',
      header: 'Type',
      align: 'center',
      className: 'w-24',
      accessor: (row) =>
        String(row.reference_only) === 'true' ? (
          <StatusBadge status="reference" label="Ref only" />
        ) : (
          <span className="text-[#042f2e]/50 text-[11px]">Circulating</span>
        ),
    },
  ];

  const reviewColumns: Column<ImportReviewItem>[] = [
    {
      key: 'accession_no',
      header: 'Accession',
      className: 'w-24 font-mono',
    },
    {
      key: 'title',
      header: 'Batch title',
      accessor: (row) => (
        <span className="font-serif font-medium text-[#042f2e]">{row.title}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Flagged reason',
      accessor: (row) => (
        <span className="text-xs text-[#b45309] bg-[#fffbeb] px-2 py-0.5 rounded border border-[#fde68a]">
          {row.reason}
        </span>
      ),
    },
    {
      key: 'suggested_title',
      header: 'Closest suggestion',
      accessor: (row) => (
        <div className="text-xs">
          <div className="font-medium text-[#0f766e]">
            {row.suggested_title || '—'}
          </div>
          {row.suggested_author && (
            <div className="text-[10px] text-[#042f2e]/60">{row.suggested_author}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      className: 'w-28',
      accessor: (row) => (
        <StatusBadge
          status={row.status === 'resolved' ? 'available' : row.status === 'dismissed' ? 'neutral' : 'waiting'}
          label={row.status}
        />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      className: 'w-36',
      accessor: (row) => {
        if (row.status !== 'pending') return <span className="text-[#042f2e]/40 text-xs">—</span>;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleResolveReview(row.id, 'accept')}
              className="h-6 px-2 text-[11px]"
            >
              <Check className="h-3 w-3 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleResolveReview(row.id, 'dismiss')}
              className="h-6 px-2 text-[11px] text-[#042f2e]/60"
            >
              Dismiss
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Batch Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#d6e2e0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#042f2e] tracking-tight">
            Batch catalog import
          </h1>
          <p className="text-xs text-[#042f2e]/70 mt-1">
            Upload CSV with accession and ISBN records, enrich metadata via Open Library, and review outliers.
          </p>
        </div>

        {rows.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              onClick={handleCommitBatch}
              isLoading={commitLoading}
              className="h-8 px-4"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Commit batch ({rows.length} copies)
            </Button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-[#f0fdfa] border border-[#99f6e4] rounded-[6px] text-xs text-[#0f766e] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#0f766e] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <ErrorState
          title="Import process error"
          message={errorMessage.message}
          fixSuggestion={errorMessage.fix}
        />
      )}

      {/* Upload Drop Zone / Quick Load */}
      {rows.length === 0 && (
        <div className="p-8 bg-white border-2 border-dashed border-[#d6e2e0] rounded-[6px] text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center border border-[#99f6e4]">
            <Upload className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-semibold text-base text-[#042f2e]">
              Upload library catalog CSV
            </h3>
            <p className="text-xs text-[#042f2e]/60 max-w-md mx-auto">
              Expected headers: <code className="font-mono text-[#0f766e]">accession_no, isbn, title, author, subject, edition_no, year, shelf_location, reference_only</code>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isParsing}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Select CSV file
            </Button>

            <span className="text-xs text-[#042f2e]/40">or</span>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLoadSample}
              isLoading={isParsing}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#0f766e]" />
              Load sample catalog (30 rows)
            </Button>
          </div>
        </div>
      )}

      {/* Batch Overview Ribbon & Open Library Status */}
      {rows.length > 0 && (
        <div className="p-4 bg-white border border-[#d6e2e0] rounded-[6px] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[#042f2e]/60">Batch size: </span>
                <span className="font-semibold text-[#042f2e] num-tabular">{rows.length} rows</span>
              </div>
              <span>&bull;</span>
              <div>
                <span className="text-[#042f2e]/60">Needs review: </span>
                <span className="font-semibold text-[#b45309] num-tabular">
                  {reviewItems.filter((r) => r.status === 'pending').length} rows
                </span>
              </div>
            </div>

            {/* Enrichment progress */}
            {isEnriching ? (
              <div className="flex items-center gap-2 text-[#0f766e]">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>
                  Querying Open Library ({enrichmentProgress.done}/{enrichmentProgress.total})...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#042f2e]/60">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0f766e]" />
                <span>Open Library metadata verification complete</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-[#d6e2e0] pt-3">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${
                activeTab === 'preview'
                  ? 'bg-[#0f766e] text-white font-semibold'
                  : 'text-[#042f2e]/70 hover:bg-[#f7faf9]'
              }`}
            >
              Validated preview ({rows.length})
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 text-xs font-medium rounded-[4px] flex items-center gap-1.5 transition-colors ${
                activeTab === 'review'
                  ? 'bg-[#0f766e] text-white font-semibold'
                  : 'text-[#042f2e]/70 hover:bg-[#f7faf9]'
              }`}
            >
              <span>Needs review</span>
              {reviewItems.filter((r) => r.status === 'pending').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#f59e0b] text-white text-[10px] font-bold flex items-center justify-center">
                  {reviewItems.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      {rows.length > 0 && activeTab === 'preview' && (
        <DataTable
          columns={previewColumns}
          data={rows}
          keyExtractor={(r) => r.accession_no}
          emptyMessage="No rows in preview"
        />
      )}

      {rows.length > 0 && activeTab === 'review' && (
        <DataTable
          columns={reviewColumns}
          data={reviewItems}
          keyExtractor={(r) => r.id}
          emptyMessage="No catalog items require manual review in this batch."
        />
      )}

      {/* Result Card after Batch Commit */}
      {importResult && (
        <div className="p-4 bg-[#f0fdfa] border border-[#99f6e4] rounded-[6px] space-y-2">
          <div className="font-serif font-bold text-sm text-[#0f766e] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Catalog batch successfully processed</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs num-tabular pt-1">
            <div>
              <span className="text-[#042f2e]/60 block text-[10px]">Works added:</span>
              <span className="font-semibold">{importResult.works_created}</span>
            </div>
            <div>
              <span className="text-[#042f2e]/60 block text-[10px]">Editions created:</span>
              <span className="font-semibold">{importResult.editions_created}</span>
            </div>
            <div>
              <span className="text-[#042f2e]/60 block text-[10px]">Copies added:</span>
              <span className="font-bold text-[#0f766e]">{importResult.copies_created}</span>
            </div>
            <div>
              <span className="text-[#042f2e]/60 block text-[10px]">Skipped (duplicate):</span>
              <span className="font-semibold text-[#042f2e]/60">{importResult.copies_skipped}</span>
            </div>
            <div>
              <span className="text-[#042f2e]/60 block text-[10px]">Queued review:</span>
              <span className="font-semibold text-[#b45309]">{importResult.sent_to_review}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
