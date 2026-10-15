// TODO-swap with src/design/DataTable once available from Agent B
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  isLoading,
  emptyMessage = 'No records found',
  className,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto border border-[#d6e2e0] rounded-[6px] bg-white font-staff-ui', className)}>
      <table className="w-full border-collapse text-left text-xs">
        <thead className="bg-[#f7faf9] border-b border-[#d6e2e0] sticky top-0 z-10">
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={cn(
                    'py-2 px-3 font-semibold text-[#042f2e] select-none border-r border-[#d6e2e0] last:border-r-0',
                    col.sortable && 'cursor-pointer hover:bg-[#eaf1f0]',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className
                  )}
                >
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      col.align === 'right' && 'justify-end w-full',
                      col.align === 'center' && 'justify-center w-full'
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-[#042f2e]/40">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-[#0f766e]" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-[#0f766e]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d6e2e0]">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-[#042f2e]/60">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0f766e] animate-ping" />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-[#042f2e]/50">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const rowId = keyExtractor(row);
              const customClass = rowClassName ? rowClassName(row) : '';
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hover:bg-[#f7faf9]/80 transition-colors',
                    onRowClick && 'cursor-pointer',
                    customClass
                  )}
                >
                  {columns.map((col) => {
                    const content = col.accessor
                      ? col.accessor(row)
                      : (row as Record<string, unknown>)[col.key] != null
                      ? String((row as Record<string, unknown>)[col.key])
                      : '—';

                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'py-2 px-3 text-[#042f2e] border-r border-[#d6e2e0] last:border-r-0',
                          col.align === 'right' && 'text-right num-tabular',
                          col.align === 'center' && 'text-center',
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
