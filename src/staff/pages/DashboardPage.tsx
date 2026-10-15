import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  RotateCcw,
  Search,
  Upload,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  Button,
  DataTable,
  StatusBadge,
  UpdatedAgo,
  AnimatedNumber,
  Column,
} from '../_local';
import {
  staff_recent_activity,
  staff_overview_stats,
  StaffActivityItem,
  StaffOverviewStats,
} from '../api';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StaffOverviewStats | null>(null);
  const [activities, setActivities] = useState<StaffActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<string>('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, actData] = await Promise.all([
        staff_overview_stats(),
        staff_recent_activity(25),
      ]);
      setStats(statsData);
      setActivities(actData);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'all') return true;
    return act.type === filterType;
  });

  const columns: Column<StaffActivityItem>[] = [
    {
      key: 'type',
      header: 'Action',
      accessor: (row) => {
        switch (row.type) {
          case 'issue':
            return <StatusBadge status="available" label="Issue" />;
          case 'return':
            return <StatusBadge status="neutral" label="Return" />;
          case 'update':
            return <StatusBadge status="waiting" label="Update" />;
          case 'withdraw':
            return <StatusBadge status="withdrawn" label="Withdraw" />;
          default:
            return <span className="capitalize">{row.type}</span>;
        }
      },
    },
    {
      key: 'accession_no',
      header: 'Accession',
      sortable: true,
      accessor: (row) => <span className="font-mono font-medium">{row.accession_no}</span>,
    },
    {
      key: 'title',
      header: 'Book title',
      accessor: (row) => (
        <span className="font-serif font-medium text-[#042f2e] line-clamp-1">
          {row.title}
        </span>
      ),
    },
    {
      key: 'student_name',
      header: 'Patron / borrower',
      accessor: (row) =>
        row.student_name ? (
          <div>
            <div className="font-medium text-[#042f2e]">{row.student_name}</div>
            {row.reg_no && (
              <div className="text-[10px] text-[#042f2e]/60 num-tabular">{row.reg_no}</div>
            )}
          </div>
        ) : (
          <span className="text-[#042f2e]/40">—</span>
        ),
    },
    {
      key: 'details',
      header: 'Transaction details',
      accessor: (row) => (
        <span className="text-[#042f2e]/70 text-[11px]">{row.details || '—'}</span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Time',
      align: 'right',
      accessor: (row) => {
        const d = new Date(row.timestamp);
        return (
          <span className="text-[#042f2e]/60 text-[11px] num-tabular">
            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#d6e2e0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#042f2e] tracking-tight">
            Circulation desk overview
          </h1>
          <p className="text-xs text-[#042f2e]/70 mt-1">
            Real-time loan transactions, hold reservations, and catalog auditing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UpdatedAgo timestamp={lastRefreshed} onRefresh={loadData} />
          <Button
            size="sm"
            variant="secondary"
            onClick={loadData}
            isLoading={isLoading}
            className="h-8"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Primary Key Metrics - Dense, hairline divided, tabular numbers */}
      <div className="grid grid-cols-2 md:grid-cols-5 border border-[#d6e2e0] rounded-[6px] bg-white divide-y md:divide-y-0 md:divide-x divide-[#d6e2e0]">
        <div className="p-4">
          <div className="text-[11px] font-medium text-[#042f2e]/60">Issued today</div>
          <div className="text-2xl font-semibold text-[#0f766e] mt-1">
            <AnimatedNumber value={stats?.issues_today ?? 0} />
          </div>
          <div className="text-[10px] text-[#042f2e]/50 mt-1">Active loans checked out</div>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-medium text-[#042f2e]/60">Returned today</div>
          <div className="text-2xl font-semibold text-[#042f2e] mt-1">
            <AnimatedNumber value={stats?.returns_today ?? 0} />
          </div>
          <div className="text-[10px] text-[#042f2e]/50 mt-1">Restocked & inspected</div>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-medium text-[#042f2e]/60">Overdue loans</div>
          <div className="text-2xl font-semibold text-[#b91c1c] mt-1">
            <AnimatedNumber value={stats?.overdue_count ?? 0} />
          </div>
          <div className="text-[10px] text-[#b91c1c]/70 mt-1">Fines accruing daily</div>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-medium text-[#042f2e]/60">On hold shelf</div>
          <div className="text-2xl font-semibold text-[#b45309] mt-1">
            <AnimatedNumber value={stats?.holds_waiting ?? 0} />
          </div>
          <div className="text-[10px] text-[#b45309]/80 mt-1">Awaiting student pickup</div>
        </div>

        <div className="p-4 col-span-2 md:col-span-1">
          <div className="text-[11px] font-medium text-[#042f2e]/60">Total collection</div>
          <div className="text-2xl font-semibold text-[#042f2e] mt-1">
            <AnimatedNumber value={stats?.total_catalogued ?? 0} />
          </div>
          <div className="text-[10px] text-[#042f2e]/50 mt-1">Copies in active database</div>
        </div>
      </div>

      {/* Fast Action Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Link
          to="/staff/issue"
          className="group p-3.5 rounded-[6px] bg-white border border-[#d6e2e0] hover:border-[#0f766e] transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#042f2e]">Issue books</div>
              <div className="text-[11px] text-[#042f2e]/60">Scan QR or register no.</div>
            </div>
          </div>
          <span className="text-[10px] bg-[#f7faf9] text-[#042f2e]/60 px-1.5 py-0.5 rounded border border-[#d6e2e0] num-tabular">
            Ctrl+I
          </span>
        </Link>

        <Link
          to="/staff/return"
          className="group p-3.5 rounded-[6px] bg-white border border-[#d6e2e0] hover:border-[#0f766e] transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#f7faf9] text-[#042f2e] flex items-center justify-center border border-[#d6e2e0]">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#042f2e]">Process returns</div>
              <div className="text-[11px] text-[#042f2e]/60">Scan copy accession barcode</div>
            </div>
          </div>
          <span className="text-[10px] bg-[#f7faf9] text-[#042f2e]/60 px-1.5 py-0.5 rounded border border-[#d6e2e0] num-tabular">
            Ctrl+R
          </span>
        </Link>

        <Link
          to="/staff/catalogue"
          className="group p-3.5 rounded-[6px] bg-white border border-[#d6e2e0] hover:border-[#0f766e] transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#f7faf9] text-[#042f2e] flex items-center justify-center border border-[#d6e2e0]">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#042f2e]">Search catalogue</div>
              <div className="text-[11px] text-[#042f2e]/60">Edit shelves or withdraw</div>
            </div>
          </div>
          <span className="text-[10px] bg-[#f7faf9] text-[#042f2e]/60 px-1.5 py-0.5 rounded border border-[#d6e2e0] num-tabular">
            Ctrl+K
          </span>
        </Link>

        <Link
          to="/staff/import"
          className="group p-3.5 rounded-[6px] bg-white border border-[#d6e2e0] hover:border-[#0f766e] transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#f7faf9] text-[#042f2e] flex items-center justify-center border border-[#d6e2e0]">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#042f2e]">Import catalog</div>
              <div className="text-[11px] text-[#042f2e]/60">Batch CSV with Open Library</div>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-[#042f2e]/40 group-hover:text-[#0f766e] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Recent Circulation Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-semibold text-[#042f2e]">
              Recent desk activity
            </h2>
            <p className="text-xs text-[#042f2e]/60">
              Audit log of loans, check-ins, withdrawals, and updates.
            </p>
          </div>

          {/* Activity Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-[6px] border border-[#d6e2e0] text-xs">
            {[
              { id: 'all', label: 'All activity' },
              { id: 'issue', label: 'Issues' },
              { id: 'return', label: 'Returns' },
              { id: 'update', label: 'Updates' },
              { id: 'withdraw', label: 'Withdrawals' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  filterType === f.id
                    ? 'bg-[#0f766e] text-white'
                    : 'text-[#042f2e]/70 hover:text-[#042f2e] hover:bg-[#f7faf9]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Table */}
        <DataTable
          columns={columns}
          data={filteredActivities}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No desk activity recorded matching the selected filter."
        />
      </div>
    </div>
  );
};
