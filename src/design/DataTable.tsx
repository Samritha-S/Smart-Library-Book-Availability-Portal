import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isNumeric?: boolean;
  sortValue?: (item: T) => string | number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  dense?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  className = '',
  emptyMessage = 'No records found.',
  dense = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortKey !== columnKey) {
      setSortKey(columnKey);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    const column = columns.find((c) => c.key === sortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let valA: any = column.sortValue ? column.sortValue(a) : (a as any)[sortKey];
      let valB: any = column.sortValue ? column.sortValue(b) : (b as any)[sortKey];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      }
      return strB.localeCompare(strA);
    });
  }, [data, columns, sortKey, sortDirection]);

  return (
    <div className={`w-full overflow-x-auto border border-rule rounded-[6px] bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-paper border-b border-rule">
          <tr>
            {columns.map((col) => {
              const isCurrentSort = sortKey === col.key;
              const alignClass =
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                  ? 'text-center'
                  : 'text-left';

              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-3 ${dense ? 'py-2' : 'py-3'} font-semibold text-ink select-none ${alignClass} ${
                    col.sortable ? 'cursor-pointer hover:bg-rule/40 transition-colors' : ''
                  }`}
                  onClick={() => handleSort(col.key, col.sortable)}
                  aria-sort={
                    isCurrentSort
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(col.key, col.sortable);
                    }
                  }}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 ${
                      col.align === 'right' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-grey">
                        {isCurrentSort ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-brand" strokeWidth={2} />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-brand" strokeWidth={2} />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" strokeWidth={1.75} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-grey text-xs"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-paper/80 focus-visible:bg-paper focus-visible:outline-none'
                    : 'hover:bg-paper/40'
                }`}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(item);
                  }
                }}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  const numericClass = col.isNumeric ? 'tabular-nums font-mono' : '';

                  const cellContent = col.accessor
                    ? col.accessor(item)
                    : (item as any)[col.key];

                  return (
                    <td
                      key={col.key}
                      className={`px-3 ${dense ? 'py-2' : 'py-3'} text-ink ${alignClass} ${numericClass}`}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
