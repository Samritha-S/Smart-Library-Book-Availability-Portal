import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit2,
  Check,
  X,
  Archive,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Input,
  Dialog,
  StatusBadge,
  DataTable,
  Column,
  ErrorState,
} from '../_local';
import {
  catalogue_search,
  update_copy,
  withdraw_record,
  CatalogueItem,
  CatalogueSearchParams,
} from '../api';

export const CataloguePage: React.FC = () => {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refOnlyFilter, setRefOnlyFilter] = useState<boolean | undefined>(undefined);
  const [sortKey, setSortKey] = useState<CatalogueSearchParams['sort_by']>('accession_no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Inline editing state: track which copy_id is currently editing
  const [editingCopyId, setEditingCopyId] = useState<string | null>(null);
  const [editShelf, setEditShelf] = useState('');
  const [editStatus, setEditStatus] = useState<CatalogueItem['status']>('available');
  const [editReferenceOnly, setEditReferenceOnly] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Withdraw dialog state (strictly required reason, NO DELETE ANYWHERE)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedWithdrawCopy, setSelectedWithdrawCopy] = useState<CatalogueItem | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawReasonError, setWithdrawReasonError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pageError, setPageError] = useState<{ message: string; fix: string } | null>(null);

  const fetchCatalogue = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const res = await catalogue_search({
        query: searchQuery,
        status: statusFilter,
        reference_only: refOnlyFilter,
        sort_by: sortKey,
        sort_order: sortOrder,
        page: 1,
        page_size: 50,
      });
      setItems(res.items);
      setTotalCount(res.total_count);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query catalog';
      setPageError({
        message: msg,
        fix: 'Check network connectivity or retry the search query with standard terms.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalogue();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, refOnlyFilter, sortKey, sortOrder]);

  const handleStartEdit = (copy: CatalogueItem) => {
    setEditingCopyId(copy.copy_id);
    setEditShelf(copy.shelf_location);
    setEditStatus(copy.status);
    setEditReferenceOnly(copy.reference_only);
  };

  const handleCancelEdit = () => {
    setEditingCopyId(null);
  };

  const handleSaveEdit = async (copyId: string) => {
    setSaveLoading(true);
    try {
      await update_copy(copyId, {
        shelf_location: editShelf,
        status: editStatus,
        reference_only: editReferenceOnly,
      });

      setItems((prev) =>
        prev.map((item) =>
          item.copy_id === copyId
            ? {
                ...item,
                shelf_location: editShelf.toUpperCase(),
                status: editStatus,
                reference_only: editReferenceOnly,
              }
            : item
        )
      );

      // Verb toast
      setToastMessage(`Saved updates for copy ${editShelf}`);
      setTimeout(() => setToastMessage(null), 3000);
      setEditingCopyId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenWithdraw = (copy: CatalogueItem) => {
    setSelectedWithdrawCopy(copy);
    setWithdrawReason('');
    setWithdrawReasonError('');
    setWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedWithdrawCopy) return;

    if (!withdrawReason.trim() || withdrawReason.trim().length < 5) {
      setWithdrawReasonError('A detailed reason (at least 5 characters) is required to withdraw a book.');
      return;
    }

    setWithdrawLoading(true);
    try {
      await withdraw_record(selectedWithdrawCopy.copy_id, withdrawReason);

      setItems((prev) =>
        prev.map((item) =>
          item.copy_id === selectedWithdrawCopy.copy_id
            ? {
                ...item,
                status: 'withdrawn',
                withdrawn_reason: withdrawReason.trim(),
              }
            : item
        )
      );

      setToastMessage(`Withdrawn ${selectedWithdrawCopy.accession_no} (${selectedWithdrawCopy.title}).`);
      setTimeout(() => setToastMessage(null), 3500);
      setWithdrawDialogOpen(false);
    } catch (err: unknown) {
      setWithdrawReasonError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const columns: Column<CatalogueItem>[] = [
    {
      key: 'accession_no',
      header: 'Accession',
      sortable: true,
      className: 'w-28',
      accessor: (row) => (
        <span className="font-mono font-medium text-[#042f2e]">{row.accession_no}</span>
      ),
    },
    {
      key: 'title',
      header: 'Title & metadata',
      sortable: true,
      accessor: (row) => (
        <div className="space-y-0.5">
          <div className="font-serif font-medium text-sm text-[#042f2e] line-clamp-1">
            {row.title}
          </div>
          <div className="text-[11px] text-[#042f2e]/60 flex items-center gap-2">
            <span>{row.author}</span>
            {row.isbn && (
              <>
                <span>&bull;</span>
                <span className="font-mono">{row.isbn}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'shelf_location',
      header: 'Shelf location',
      sortable: true,
      className: 'w-36',
      accessor: (row) => {
        const isEditing = editingCopyId === row.copy_id;
        if (isEditing) {
          return (
            <input
              type="text"
              value={editShelf}
              onChange={(e) => setEditShelf(e.target.value.toUpperCase())}
              className="w-full h-7 px-2 text-xs font-mono font-medium uppercase rounded border border-[#0f766e] bg-white focus:outline-none"
              autoFocus
            />
          );
        }
        return (
          <span className="font-mono font-medium px-1.5 py-0.5 rounded bg-[#f7faf9] border border-[#d6e2e0] text-[#042f2e]">
            {row.shelf_location}
          </span>
        );
      },
    },
    {
      key: 'reference_only',
      header: 'Reference',
      className: 'w-28 text-center',
      align: 'center',
      accessor: (row) => {
        const isEditing = editingCopyId === row.copy_id;
        if (isEditing) {
          return (
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={editReferenceOnly}
                onChange={(e) => setEditReferenceOnly(e.target.checked)}
                className="rounded border-[#d6e2e0] text-[#0f766e] focus:ring-[#0f766e]"
              />
              <span className="text-[11px]">Ref</span>
            </label>
          );
        }
        return row.reference_only ? (
          <StatusBadge status="reference" label="Reference" />
        ) : (
          <span className="text-[#042f2e]/40 text-xs">Circulating</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-36',
      accessor: (row) => {
        const isEditing = editingCopyId === row.copy_id;
        if (isEditing) {
          return (
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as CatalogueItem['status'])}
              className="h-7 px-1.5 text-xs rounded border border-[#0f766e] bg-white focus:outline-none"
            >
              <option value="available">Available</option>
              <option value="issued">Issued</option>
              <option value="on_hold_shelf">On hold shelf</option>
              <option value="damaged_repair">Damaged / Repair</option>
              <option value="lost">Lost</option>
              <option value="missing">Missing</option>
            </select>
          );
        }
        return <StatusBadge status={row.status} />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      className: 'w-36',
      accessor: (row) => {
        const isEditing = editingCopyId === row.copy_id;

        if (isEditing) {
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSaveEdit(row.copy_id)}
                isLoading={saveLoading}
                className="h-7 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={saveLoading}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1.5">
            {row.status !== 'withdrawn' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStartEdit(row)}
                  className="h-7 px-2 text-xs text-[#042f2e]/70 hover:text-[#042f2e]"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenWithdraw(row)}
                  className="h-7 px-2 text-xs text-[#b91c1c] hover:bg-[#fef2f2]"
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Withdraw
                </Button>
              </>
            )}
            {row.status === 'withdrawn' && (
              <span className="text-[11px] text-[#b91c1c] italic pr-2">Withdrawn</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#d6e2e0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#042f2e] tracking-tight">
            Catalogue & copy inventory
          </h1>
          <p className="text-xs text-[#042f2e]/70 mt-1">
            Search physical copies, modify shelf locations inline, and perform policy-compliant withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#042f2e]/60 num-tabular">
            Showing {items.length} of {totalCount} copies
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchCatalogue}
            isLoading={isLoading}
            className="h-8"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reload</span>
          </Button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-[#f0fdfa] border border-[#99f6e4] rounded-[6px] text-xs text-[#0f766e] flex items-center justify-between">
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="p-3.5 bg-white border border-[#d6e2e0] rounded-[6px] flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, accession no, ISBN, or shelf..."
            leftIcon={<Search className="h-4 w-4" />}
            className="h-8 text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#042f2e]/60">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 text-xs rounded-[6px] border border-[#d6e2e0] bg-white text-[#042f2e] focus:outline-none focus:ring-2 focus:ring-[#0f766e]"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="issued">Issued</option>
            <option value="on_hold_shelf">On hold shelf</option>
            <option value="damaged_repair">Damaged / Repair</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        {/* Reference Only Filter */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#d6e2e0]">
          <label className="flex items-center gap-1.5 text-xs text-[#042f2e] cursor-pointer">
            <input
              type="checkbox"
              checked={refOnlyFilter === true}
              onChange={(e) => setRefOnlyFilter(e.target.checked ? true : undefined)}
              className="rounded border-[#d6e2e0] text-[#0f766e] focus:ring-[#0f766e]"
            />
            <span>Reference only</span>
          </label>
        </div>
      </div>

      {/* Page Error State */}
      {pageError && (
        <ErrorState
          title="Catalogue retrieval failed"
          message={pageError.message}
          fixSuggestion={pageError.fix}
          onRetry={fetchCatalogue}
        />
      )}

      {/* Dense Data Table */}
      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(row) => row.copy_id}
        isLoading={isLoading}
        sortKey={sortKey}
        sortDirection={sortOrder}
        onSort={(key) => {
          if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
          } else {
            setSortKey(key as CatalogueSearchParams['sort_by']);
            setSortOrder('asc');
          }
        }}
        emptyMessage="No book copies found matching your search and filter criteria."
      />

      {/* WITHDRAW REASON DIALOG (Modal overlay with REQUIRED reason - NO DELETE) */}
      <Dialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        title="Withdraw book copy"
        description="Records are preserved in immutable audit logs. Provide a mandatory reason."
      >
        {selectedWithdrawCopy && (
          <div className="space-y-4">
            <div className="p-3 bg-[#f7faf9] rounded-[6px] border border-[#d6e2e0] text-xs space-y-1">
              <div className="font-serif font-bold text-sm text-[#042f2e]">
                {selectedWithdrawCopy.title}
              </div>
              <div className="flex items-center gap-3 text-[#042f2e]/70">
                <span className="font-mono">{selectedWithdrawCopy.accession_no}</span>
                <span>&bull;</span>
                <span>Shelf: {selectedWithdrawCopy.shelf_location}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#042f2e]">
                Mandatory withdrawal reason <span className="text-[#b91c1c]">*</span>
              </label>
              <textarea
                value={withdrawReason}
                onChange={(e) => {
                  setWithdrawReason(e.target.value);
                  setWithdrawReasonError('');
                }}
                rows={3}
                placeholder="State why this copy is being withdrawn (e.g., severe water damage, superseded edition weeded, lost in transit)..."
                className="w-full p-2.5 text-xs rounded-[6px] border border-[#d6e2e0] text-[#042f2e] placeholder:text-[#042f2e]/40 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
              />
              {withdrawReasonError && (
                <p className="text-xs text-[#b91c1c]">{withdrawReasonError}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#d6e2e0]">
              <span className="text-[11px] text-[#042f2e]/60">
                Notice: Physical records cannot be hard deleted.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setWithdrawDialogOpen(false)}
                  disabled={withdrawLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleConfirmWithdraw}
                  isLoading={withdrawLoading}
                  disabled={!withdrawReason.trim()}
                >
                  Withdraw copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
