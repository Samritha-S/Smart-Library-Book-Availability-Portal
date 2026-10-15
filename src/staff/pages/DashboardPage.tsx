import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  RotateCcw,
  Search,
  Upload,
  RefreshCw,
  ArrowRight,
  Bookmark,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  DataTable,
  StatusBadge,
  UpdatedAgo,
  AnimatedNumber,
  Column,
  Dialog,
  Input,
} from '../_local';
import {
  staff_recent_activity,
  staff_overview_stats,
  resolve_lost,
  StaffActivityItem,
  StaffOverviewStats,
} from '../api';

interface HoldShelfItem {
  id: string;
  accession_no: string;
  title: string;
  author: string;
  student_name: string;
  reg_no: string;
  pickup_deadline: string;
  shelf_location: string;
}

interface LostReportItem {
  id: string;
  copy_id: string;
  accession_no: string;
  title: string;
  author: string;
  student_name: string;
  reg_no: string;
  reported_at: string;
  edition_price: number;
  processing_fee: number;
  status: 'reported' | 'resolved';
}

const INITIAL_HOLD_SHELF: HoldShelfItem[] = [
  {
    id: 'hold-1',
    accession_no: 'ACC-1010',
    title: 'Operating System Concepts',
    author: 'Silberschatz, Galvin, Gagne',
    student_name: 'Ananya Deshmukh',
    reg_no: 'AIT2023CS002',
    pickup_deadline: '2 working days left (17 Oct, 18:00)',
    shelf_location: 'Rack CS-02 / Shelf 1',
  },
  {
    id: 'hold-2',
    accession_no: 'ACC-1033',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    student_name: 'Devansh Kulkarni',
    reg_no: 'AIT2023CS005',
    pickup_deadline: '1 working day left (16 Oct, 18:00)',
    shelf_location: 'Rack CS-04 / Shelf 2',
  },
];

const INITIAL_LOST_REPORTS: LostReportItem[] = [
  {
    id: 'lost-1',
    copy_id: 'cpy-lost-01',
    accession_no: 'ACC-1014',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    student_name: 'Aarav Sharma',
    reg_no: 'AIT2023CS001',
    reported_at: '12 Oct 2026',
    edition_price: 650,
    processing_fee: 50,
    status: 'reported',
  },
];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StaffOverviewStats | null>(null);
  const [activities, setActivities] = useState<StaffActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'activity' | 'holds' | 'lost'>('activity');
  const [filterType, setFilterType] = useState<string>('all');

  // Hold shelf state
  const [holdShelfItems] = useState<HoldShelfItem[]>(INITIAL_HOLD_SHELF);

  // Lost reports state
  const [lostReports, setLostReports] = useState<LostReportItem[]>(INITIAL_LOST_REPORTS);
  const [selectedLost, setSelectedLost] = useState<LostReportItem | null>(null);
  const [resolveMethod, setResolveMethod] = useState<'fee' | 'replaced'>('fee');
  const [replacementAccession, setReplacementAccession] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleResolveLostSubmit = async () => {
    if (!selectedLost) return;
    setIsResolving(true);
    try {
      const res = await resolve_lost(
        selectedLost.id,
        resolveMethod,
        resolveMethod === 'replaced' ? replacementAccession.trim().toUpperCase() : undefined
      );

      if (res.success) {
        setLostReports((prev) =>
          prev.map((r) => (r.id === selectedLost.id ? { ...r, status: 'resolved' } : r))
        );
        setToastMessage(
          `Resolved lost report for ${selectedLost.accession_no} via ${
            resolveMethod === 'fee'
              ? `fee payment (₹${selectedLost.edition_price + selectedLost.processing_fee})`
              : `replacement copy (${replacementAccession.toUpperCase()})`
          }.`
        );
        setTimeout(() => setToastMessage(null), 4000);
        setSelectedLost(null);
        setReplacementAccession('');
      } else {
        alert(res.message || 'Failed to resolve lost report');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resolving lost report';
      alert(msg);
    } finally {
      setIsResolving(false);
    }
  };

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
              <div className="font-mono text-[10px] text-[#042f2e]/50">{row.reg_no}</div>
            )}
          </div>
        ) : (
          <span className="text-[#042f2e]/40">—</span>
        ),
    },
    {
      key: 'details',
      header: 'Circulation note',
      accessor: (row) => <span className="text-[#042f2e]/70">{row.details || '—'}</span>,
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      accessor: (row) => {
        const d = new Date(row.timestamp);
        return (
          <span className="text-[#042f2e]/60 num-tabular text-[11px]">
            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull;{' '}
            {d.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
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

      {/* Header with Title and Live Refreshed Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d6e2e0]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#042f2e] tracking-tight">
            Circulation overview
          </h1>
          <p className="text-xs text-[#042f2e]/70 mt-1">
            Real-time library desk operations, loan activity, hold shelf, and lost items.
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
            <AnimatedNumber value={holdShelfItems.length} />
          </div>
          <div className="text-[10px] text-[#b45309]/80 mt-1">Awaiting student pickup</div>
        </div>

        <div className="p-4 col-span-2 md:col-span-1">
          <div className="text-[11px] font-medium text-[#042f2e]/60">Lost reports</div>
          <div className="text-2xl font-semibold text-[#042f2e] mt-1">
            <AnimatedNumber value={lostReports.filter((r) => r.status === 'reported').length} />
          </div>
          <div className="text-[10px] text-[#042f2e]/50 mt-1">Pending resolution</div>
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
              <div className="text-[11px] text-[#042f2e]/60">Scan copy barcode & fines</div>
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

      {/* Main Operations Navigation Tabs */}
      <div className="border-b border-[#d6e2e0] flex items-center gap-2">
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-2 px-3 border-b-2 text-xs font-medium transition-colors ${
            activeTab === 'activity'
              ? 'border-[#0f766e] text-[#0f766e] font-semibold'
              : 'border-transparent text-[#042f2e]/70 hover:text-[#042f2e]'
          }`}
        >
          Desk activity ({activities.length})
        </button>

        <button
          onClick={() => setActiveTab('holds')}
          className={`py-2 px-3 border-b-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'holds'
              ? 'border-[#0f766e] text-[#0f766e] font-semibold'
              : 'border-transparent text-[#042f2e]/70 hover:text-[#042f2e]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-[#b45309]" />
          <span>Hold shelf queue ({holdShelfItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lost')}
          className={`py-2 px-3 border-b-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'lost'
              ? 'border-[#0f766e] text-[#0f766e] font-semibold'
              : 'border-transparent text-[#042f2e]/70 hover:text-[#042f2e]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#b91c1c]" />
          <span>Lost reports queue ({lostReports.filter((r) => r.status === 'reported').length})</span>
        </button>
      </div>

      {/* TAB 1: DESK ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#042f2e]">
                Recent desk audit activity
              </h2>
              <p className="text-xs text-[#042f2e]/60">
                Audit log of loans, check-ins, withdrawals, and updates.
              </p>
            </div>

            {/* Filter Tabs */}
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

          <DataTable
            columns={columns}
            data={filteredActivities}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No desk activity recorded matching the selected filter."
          />
        </div>
      )}

      {/* TAB 2: HOLD SHELF PICKUPS */}
      {activeTab === 'holds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#042f2e]">
                Reserved hold shelf copies
              </h2>
              <p className="text-xs text-[#042f2e]/60">
                Returned books reserved for the first student in the hold queue (held for 2 working days).
              </p>
            </div>
          </div>

          <div className="border border-[#d6e2e0] rounded-[6px] overflow-hidden bg-white">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f7faf9] border-b border-[#d6e2e0]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Accession</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Book title</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Held for patron</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Shelf location</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Pickup window</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e2e0]">
                {holdShelfItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7faf9]">
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#042f2e]">
                      {item.accession_no}
                    </td>
                    <td className="py-2.5 px-3 font-serif font-medium text-[#042f2e]">
                      {item.title}
                      <div className="text-[11px] text-[#042f2e]/60 font-sans">{item.author}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#042f2e]">
                      <div className="font-medium">{item.student_name}</div>
                      <div className="text-[10px] font-mono text-[#042f2e]/60">{item.reg_no}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#042f2e]/80">
                      {item.shelf_location}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-[#b45309] font-medium bg-[#fef3c7] px-2 py-0.5 rounded-[4px]">
                        {item.pickup_deadline}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/staff/issue?reg=${item.reg_no}&scan=${item.accession_no}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#0f766e] text-white rounded hover:bg-[#0f766e]/90"
                      >
                        Issue to patron
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOST BOOK REPORTS QUEUE */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#042f2e]">
                Lost book incident queue
              </h2>
              <p className="text-xs text-[#042f2e]/60">
                Fines stop accruing on the report date. Resolve by fee payment or physical book replacement.
              </p>
            </div>
          </div>

          <div className="border border-[#d6e2e0] rounded-[6px] overflow-hidden bg-white">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-[#f7faf9] border-b border-[#d6e2e0]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Accession</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Book title</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Reported by</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Report date</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Replacement cost</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e]">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-[#042f2e] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d6e2e0]">
                {lostReports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#f7faf9]">
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#042f2e]">
                      {report.accession_no}
                    </td>
                    <td className="py-2.5 px-3 font-serif font-medium text-[#042f2e]">
                      {report.title}
                      <div className="text-[11px] text-[#042f2e]/60 font-sans">{report.author}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#042f2e]">
                      <div className="font-medium">{report.student_name}</div>
                      <div className="text-[10px] font-mono text-[#042f2e]/60">{report.reg_no}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#042f2e]/70 num-tabular">
                      {report.reported_at}
                    </td>
                    <td className="py-2.5 px-3 text-[#042f2e] num-tabular">
                      ₹{report.edition_price} + ₹{report.processing_fee} (Fee: ₹{report.edition_price + report.processing_fee})
                    </td>
                    <td className="py-2.5 px-3">
                      {report.status === 'resolved' ? (
                        <span className="text-[11px] text-[#0f766e] bg-[#f0fdfa] px-2 py-0.5 rounded font-medium">
                          Resolved
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#b91c1c] bg-[#fef2f2] px-2 py-0.5 rounded font-medium">
                          Pending resolution
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {report.status === 'reported' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedLost(report)}
                          className="text-xs h-7"
                        >
                          Resolve...
                        </Button>
                      ) : (
                        <span className="text-xs text-[#042f2e]/40">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedLost && (
        <Dialog
          open={!!selectedLost}
          onOpenChange={(open) => {
            if (!open) setSelectedLost(null);
          }}
          title={`Resolve Lost Book: ${selectedLost.accession_no}`}
          description={`Title: "${selectedLost.title}" reported by ${selectedLost.student_name} (${selectedLost.reg_no})`}
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-[#042f2e] block mb-1.5">
                Resolution method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResolveMethod('fee')}
                  className={`p-3 rounded-[6px] border text-left transition-colors ${
                    resolveMethod === 'fee'
                      ? 'border-[#0f766e] bg-[#f0fdfa]'
                      : 'border-[#d6e2e0] hover:bg-[#f7faf9]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#042f2e]">Option 1: Pay Lost Fee</div>
                  <div className="text-[11px] text-[#042f2e]/70 mt-0.5">
                    Book price (₹{selectedLost.edition_price}) + processing fee (₹{selectedLost.processing_fee}) = ₹
                    {selectedLost.edition_price + selectedLost.processing_fee}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setResolveMethod('replaced')}
                  className={`p-3 rounded-[6px] border text-left transition-colors ${
                    resolveMethod === 'replaced'
                      ? 'border-[#0f766e] bg-[#f0fdfa]'
                      : 'border-[#d6e2e0] hover:bg-[#f7faf9]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#042f2e]">Option 2: Replace Physical Book</div>
                  <div className="text-[11px] text-[#042f2e]/70 mt-0.5">
                    Student brings same/newer edition in new condition. Register new accession barcode.
                  </div>
                </button>
              </div>
            </div>

            {resolveMethod === 'replaced' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#042f2e] block">
                  New copy accession number *
                </label>
                <Input
                  value={replacementAccession}
                  onChange={(e) => setReplacementAccession(e.target.value)}
                  placeholder="e.g. ACC-2045"
                  className="font-mono uppercase text-sm"
                />
                <p className="text-[11px] text-[#042f2e]/60">
                  A new copy record will be generated with status "available".
                </p>
              </div>
            )}

            <div className="p-3 bg-[#f7faf9] border border-[#d6e2e0] rounded-[6px] text-xs text-[#042f2e]/80">
              <span className="font-semibold text-[#042f2e]">Audit trail:</span> Resolving this report clears borrowing blocks on {selectedLost.student_name}'s account and writes a permanent ledger entry.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#d6e2e0]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLost(null)}
                disabled={isResolving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleResolveLostSubmit}
                isLoading={isResolving}
                disabled={resolveMethod === 'replaced' && !replacementAccession.trim()}
              >
                Confirm resolution
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
