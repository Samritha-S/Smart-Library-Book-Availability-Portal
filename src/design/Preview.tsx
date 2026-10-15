import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  Smartphone,
  Monitor,
  Maximize2,
  ArrowRight,
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { StatusBadge, type BadgeStatus } from './StatusBadge';
import { Skeleton } from './Skeleton';
import { Sheet } from './Sheet';
import { Dialog } from './Dialog';
import { Toaster, toast } from './Toaster';
import { DataTable, type Column } from './DataTable';
import { CommandBar, type CommandBarItem } from './CommandBar';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { UpdatedAgo } from './UpdatedAgo';
import { AnimatedNumber } from './AnimatedNumber';
import { DueRing } from './DueRing';
import { StudentShell } from './StudentShell';
import { StaffShell } from './StaffShell';

interface SampleBook {
  id: string;
  accession: string;
  title: string;
  author: string;
  status: BadgeStatus;
  shelf: string;
  dueDate: string;
  fine: number;
}

const SAMPLE_BOOKS: SampleBook[] = [
  {
    id: '1',
    accession: 'ACC-84920',
    title: 'Introduction to Algorithms (4th Ed.)',
    author: 'Cormen, Leiserson, Rivest, Stein',
    status: 'available',
    shelf: 'CS-04-B',
    dueDate: '2026-10-28',
    fine: 0,
  },
  {
    id: '2',
    accession: 'ACC-84921',
    title: 'Database System Concepts',
    author: 'Silberschatz, Korth, Sudarshan',
    status: 'due_soon',
    shelf: 'CS-02-A',
    dueDate: '2026-10-18',
    fine: 0,
  },
  {
    id: '3',
    accession: 'ACC-73819',
    title: 'Operating System Concepts (10th Ed.)',
    author: 'Silberschatz, Galvin, Gagne',
    status: 'overdue',
    shelf: 'CS-03-C',
    dueDate: '2026-10-09',
    fine: 30,
  },
  {
    id: '4',
    accession: 'ACC-91024',
    title: 'Digital Design & Computer Architecture',
    author: 'David Harris, Sarah Harris',
    status: 'waiting',
    shelf: 'EC-01-D',
    dueDate: '2026-10-22',
    fine: 0,
  },
  {
    id: '5',
    accession: 'ACC-61011',
    title: 'Microelectronic Circuits',
    author: 'Adel S. Sedra, Kenneth C. Smith',
    status: 'unavailable',
    shelf: 'EC-05-A',
    dueDate: '2026-11-04',
    fine: 0,
  },
  {
    id: '6',
    accession: 'ACC-50012',
    title: 'IEEE Transactions on Information Theory',
    author: 'IEEE Archive',
    status: 'reference',
    shelf: 'REF-01',
    dueDate: '—',
    fine: 0,
  },
];

export const Preview: React.FC = () => {
  // Viewport mode: 'fluid' | '360' | '1280'
  const [viewportMode, setViewportMode] = useState<'fluid' | '360' | '1280'>('fluid');
  const [activeShellTab, setActiveShellTab] = useState<'student' | 'staff' | 'components'>('components');

  // Interactive component states
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(14);
  const [staleTimestamp, setStaleTimestamp] = useState<number>(Date.now() - 95000);
  const [freshTimestamp, setFreshTimestamp] = useState<number>(Date.now() - 14000);
  const [textInputValue, setTextInputValue] = useState('Operating System Concepts');
  const [selectValue, setSelectValue] = useState('cs');

  // Command bar items
  const commandItems: CommandBarItem[] = [
    {
      id: 'issue',
      label: 'Issue book copy',
      group: 'Circulation desk',
      icon: <BookOpen className="w-4 h-4" />,
      shortcut: 'Ctrl I',
      onSelect: () => toast.success('Issue book drawer opened'),
    },
    {
      id: 'return',
      label: 'Process book return',
      group: 'Circulation desk',
      icon: <RotateCcw className="w-4 h-4" />,
      shortcut: 'Ctrl R',
      onSelect: () => toast.success('Return book workflow initiated'),
    },
    {
      id: 'search',
      label: 'Search catalog by ISBN / title',
      group: 'Catalog search',
      icon: <Search className="w-4 h-4" />,
      onSelect: () => toast.info('Catalog search activated'),
    },
    {
      id: 'student-lookup',
      label: 'Student register number lookup',
      group: 'Members',
      shortcut: 'Ctrl M',
      onSelect: () => toast.info('Member profile opened'),
    },
  ];

  // Table columns
  const tableColumns: Column<SampleBook>[] = [
    {
      key: 'accession',
      header: 'Accession',
      sortable: true,
      isNumeric: true,
      width: '120px',
      accessor: (b) => <span className="font-mono text-grey">{b.accession}</span>,
    },
    {
      key: 'title',
      header: 'Book title & author',
      sortable: true,
      accessor: (b) => (
        <div>
          <span className="font-serif font-medium text-ink block">{b.title}</span>
          <span className="text-[11px] text-grey">{b.author}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '130px',
      accessor: (b) => <StatusBadge status={b.status} size="sm" />,
    },
    {
      key: 'shelf',
      header: 'Shelf',
      sortable: true,
      width: '90px',
      accessor: (b) => <span className="font-mono">{b.shelf}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due date',
      sortable: true,
      isNumeric: true,
      width: '100px',
      accessor: (b) => <span>{b.dueDate}</span>,
    },
    {
      key: 'fine',
      header: 'Fine',
      sortable: true,
      isNumeric: true,
      align: 'right',
      width: '80px',
      accessor: (b) => (
        <span className={b.fine > 0 ? 'text-alert font-semibold' : 'text-grey'}>
          {b.fine > 0 ? `₹${b.fine}.00` : '—'}
        </span>
      ),
    },
  ];

  // Shell Preview Switchers
  if (activeShellTab === 'student') {
    return (
      <div>
        <div className="bg-ink text-paper px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-medium">Previewing StudentShell (unwired)</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveShellTab('components')}
          >
            Return to component catalog
          </Button>
        </div>
        <StudentShell
          userName="Aarav Sharma"
          userRegNo="AIT2023CS001"
          libraryName="Central Engineering Library"
        >
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[6px] border border-rule">
              <h2 className="font-serif text-2xl font-bold text-ink mb-1">
                Welcome back, Aarav
              </h2>
              <p className="text-xs text-grey">
                You have 1 active loan and 0 overdue books.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white border border-rule rounded-[6px] flex flex-col items-center">
                <span className="text-xs font-semibold text-grey mb-4">Current checkout</span>
                <DueRing daysLeft={8} totalDays={14} />
                <p className="font-serif font-semibold text-sm text-ink mt-4 text-center">
                  Introduction to Algorithms
                </p>
              </div>
              <div className="p-6 bg-white border border-rule rounded-[6px] flex flex-col items-center">
                <span className="text-xs font-semibold text-grey mb-4">Upcoming due date</span>
                <DueRing daysLeft={2} totalDays={14} />
                <p className="font-serif font-semibold text-sm text-ink mt-4 text-center">
                  Database System Concepts
                </p>
              </div>
            </div>
          </div>
        </StudentShell>
      </div>
    );
  }

  if (activeShellTab === 'staff') {
    return (
      <div>
        <div className="bg-ink text-paper px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-medium">Previewing StaffShell (unwired)</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveShellTab('components')}
          >
            Return to component catalog
          </Button>
        </div>
        <StaffShell
          staffName="Rahul Verma"
          staffRole="Circulation librarian"
          libraryName="Main Circulation Desk"
          commandItems={commandItems}
        >
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[6px] border border-rule">
              <h2 className="font-serif text-xl font-bold text-ink mb-1">
                Circulation overview
              </h2>
              <p className="text-xs text-grey">
                Live counter of daily desk transactions and physical copy availability.
              </p>
            </div>
            <DataTable
              data={SAMPLE_BOOKS}
              columns={tableColumns}
              keyExtractor={(b) => b.id}
            />
          </div>
        </StaffShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink pb-24">
      {/* Sonner Toast Mount */}
      <Toaster />

      {/* Floating Toolbar: Viewport toggles & Shell previews */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-rule backdrop-blur-none px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-brand text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <span className="font-serif font-bold text-sm block leading-none">
                Design System Preview
              </span>
              <span className="text-[11px] text-grey">Tokens, components & shells</span>
            </div>
          </div>

          {/* Viewport Width Controls */}
          <div className="flex items-center gap-1.5 bg-paper p-1 rounded-[6px] border border-rule text-xs">
            <button
              type="button"
              onClick={() => setViewportMode('fluid')}
              className={`px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 font-medium transition-colors ${
                viewportMode === 'fluid'
                  ? 'bg-white text-brand shadow-sm font-semibold'
                  : 'text-grey hover:text-ink'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fluid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('360')}
              className={`px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 font-medium transition-colors ${
                viewportMode === '360'
                  ? 'bg-white text-brand shadow-sm font-semibold'
                  : 'text-grey hover:text-ink'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>360px mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('1280')}
              className={`px-2.5 py-1 rounded-[4px] flex items-center gap-1.5 font-medium transition-colors ${
                viewportMode === '1280'
                  ? 'bg-white text-brand shadow-sm font-semibold'
                  : 'text-grey hover:text-ink'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>1280px desktop</span>
            </button>
          </div>

          {/* Shell preview switchers */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveShellTab('student')}
            >
              Student shell
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveShellTab('staff')}
            >
              Staff shell
            </Button>
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <div
        className={`mx-auto transition-all p-4 md:p-6 lg:p-8 space-y-12 ${
          viewportMode === '360'
            ? 'w-[360px] border-x border-rule bg-white shadow-sm my-6 p-4 rounded-[6px]'
            : viewportMode === '1280'
            ? 'w-[1280px] max-w-full'
            : 'max-w-6xl'
        }`}
      >
        {/* Intro */}
        <section className="space-y-1.5 border-b border-rule pb-6">
          <div className="flex items-center gap-2">
            <StatusBadge status="available" label="Design system live" />
            <span className="text-xs text-grey">WCAG AA • 6px controls • 12px overlays</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            Smart Library Component Catalog
          </h1>
          <p className="text-sm text-grey max-w-2xl">
            This screen showcases every design component in every supported state under both 360px and 1280px viewports.
          </p>
        </section>

        {/* 1. COLOR TOKENS & SEMANTICS */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">1. Color tokens & status meaning</h2>
            <p className="text-xs text-grey">All tokens strictly match specification. No purple anywhere.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs">
            <div className="p-3 rounded-[6px] bg-[#042f2e] text-paper border border-[#042f2e]">
              <div className="font-semibold">ink</div>
              <div className="text-[11px] opacity-80 font-mono">#042f2e</div>
              <div className="text-[10px] mt-2 opacity-70">Primary text</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#0f766e] text-white border border-[#0f766e]">
              <div className="font-semibold">brand</div>
              <div className="text-[11px] opacity-90 font-mono">#0f766e</div>
              <div className="text-[10px] mt-2 opacity-90">Available</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#f59e0b] text-[#042f2e] border border-[#f59e0b]">
              <div className="font-semibold">accent</div>
              <div className="text-[11px] opacity-90 font-mono">#f59e0b</div>
              <div className="text-[10px] mt-2 opacity-80">Waiting / due soon</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#b45309] text-white border border-[#b45309]">
              <div className="font-semibold">accentink</div>
              <div className="text-[11px] opacity-90 font-mono">#b45309</div>
              <div className="text-[10px] mt-2 opacity-80">Amber label text</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#b91c1c] text-white border border-[#b91c1c]">
              <div className="font-semibold">alert</div>
              <div className="text-[11px] opacity-90 font-mono">#b91c1c</div>
              <div className="text-[10px] mt-2 opacity-80">Overdue only</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#f7faf9] text-[#042f2e] border border-rule">
              <div className="font-semibold">paper</div>
              <div className="text-[11px] text-grey font-mono">#f7faf9</div>
              <div className="text-[10px] mt-2 text-grey">Canvas matte</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#d6e2e0] text-[#042f2e] border border-[#d6e2e0]">
              <div className="font-semibold">rule</div>
              <div className="text-[11px] text-grey font-mono">#d6e2e0</div>
              <div className="text-[10px] mt-2 text-grey">1px crisp borders</div>
            </div>
          </div>
        </section>

        {/* 2. BUTTONS */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">2. Buttons</h2>
            <p className="text-xs text-grey">6px radius, primary, secondary, ghost, danger, sizes & loading states.</p>
          </div>
          <div className="space-y-4">
            {/* Variants */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary action</Button>
              <Button variant="secondary">Secondary action</Button>
              <Button variant="ghost">Ghost action</Button>
              <Button variant="danger">Danger action</Button>
              <Button variant="primary" loading>Loading action</Button>
              <Button variant="secondary" disabled>Disabled action</Button>
            </div>
            {/* Sizes */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="primary">Small button</Button>
              <Button size="md" variant="primary">Medium button</Button>
              <Button size="lg" variant="primary">Large button</Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" strokeWidth={1.75} />}
              >
                Add copy
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
              >
                Cancel hold
              </Button>
            </div>
          </div>
        </section>

        {/* 3. INPUTS & SELECTS */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">3. Inputs & selects</h2>
            <p className="text-xs text-grey">6px radius, sentence case labels, helper text, error states.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Student register number"
              placeholder="e.g. AIT2023CS001"
              helperText="University roll number assigned during admission"
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Input
              label="Active book query"
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              helperText="Editing active query field"
            />
            <Input
              label="Accession barcode"
              value="INVALID-123"
              error="Barcode not found in catalog repository"
            />
            <Select
              label="Department filter"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'cs', label: 'Computer science & engineering' },
                { value: 'ec', label: 'Electronics & communication' },
                { value: 'me', label: 'Mechanical engineering' },
              ]}
              helperText="Select primary department collection"
            />
            <Select
              label="Shelf location"
              disabled
              options={[{ value: 'cs-04', label: 'Stack CS-04-B (Locked)' }]}
              helperText="Disabled while shelf is in inventory audit"
            />
            <Input
              label="Disabled input"
              disabled
              value="Read only barcode ACC-901"
            />
          </div>
        </section>

        {/* 4. STATUS BADGES */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">4. Status badges</h2>
            <p className="text-xs text-grey">Semantic status mapping repository-wide: brand, accent, alert, grey.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="available" />
            <StatusBadge status="waiting" />
            <StatusBadge status="due_soon" />
            <StatusBadge status="overdue" />
            <StatusBadge status="unavailable" />
            <StatusBadge status="reference" />
            <StatusBadge status="available" size="md" label="Available (Shelf 04)" />
            <StatusBadge status="overdue" size="md" label="Overdue (3 days)" />
            <StatusBadge status="reference" dot={false} label="No dot reference" />
          </div>
        </section>

        {/* 5. SKELETONS */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">5. Skeletons</h2>
            <p className="text-xs text-grey">Calm pulse placeholders with strict control (6px), sheet (12px), or full radii.</p>
          </div>
          <div className="p-4 bg-white border border-rule rounded-[6px] space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton radius="full" width={40} height={40} />
              <div className="space-y-1.5 flex-1">
                <Skeleton radius="control" height={14} width="40%" />
                <Skeleton radius="control" height={12} width="25%" />
              </div>
            </div>
            <Skeleton radius="control" height={36} width="100%" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton radius="control" height={28} />
              <Skeleton radius="control" height={28} />
              <Skeleton radius="control" height={28} />
            </div>
          </div>
        </section>

        {/* 6. DUE RING */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">6. Due ring</h2>
            <p className="text-xs text-grey">SVG library due-date stamp with once-on-load draw and tabular figures.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-rule rounded-[6px] flex flex-col items-center">
              <span className="text-xs font-semibold text-grey mb-3">On schedule (brand)</span>
              <DueRing daysLeft={10} totalDays={14} />
              <span className="text-xs text-brand font-medium mt-3">10 working days left</span>
            </div>
            <div className="p-5 bg-white border border-rule rounded-[6px] flex flex-col items-center">
              <span className="text-xs font-semibold text-grey mb-3">Due soon (accent)</span>
              <DueRing daysLeft={2} totalDays={14} />
              <span className="text-xs text-accentink font-medium mt-3">2 working days left</span>
            </div>
            <div className="p-5 bg-white border border-rule rounded-[6px] flex flex-col items-center">
              <span className="text-xs font-semibold text-grey mb-3">Overdue (alert)</span>
              <DueRing daysLeft={-4} totalDays={14} overdue />
              <span className="text-xs text-alert font-medium mt-3">4 days overdue</span>
            </div>
          </div>
        </section>

        {/* 7. ANIMATED NUMBER & UPDATED AGO */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">7. Animated number & updated ago</h2>
            <p className="text-xs text-grey">Ticks and highlights on change. Relative timestamps with stale banners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Animated Number */}
            <div className="p-5 bg-white border border-rule rounded-[6px] space-y-3">
              <span className="text-xs font-semibold text-grey block">Animated number counter</span>
              <div className="flex items-center gap-4">
                <span className="font-serif text-3xl font-bold text-ink">
                  <AnimatedNumber value={animatedCount} suffix=" copies" />
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAnimatedCount((c) => Math.max(0, c - 1))}
                  >
                    -1
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAnimatedCount((c) => c + 1)}
                  >
                    +1
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setAnimatedCount((c) => c + 5)}
                  >
                    +5
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-grey">
                Click to tick counter and view brief highlight flash. Respects prefers-reduced-motion.
              </p>
            </div>

            {/* Updated Ago */}
            <div className="p-5 bg-white border border-rule rounded-[6px] space-y-3">
              <span className="text-xs font-semibold text-grey block">Relative timestamp & stale state</span>
              <div className="space-y-2">
                <UpdatedAgo
                  timestamp={freshTimestamp}
                  onRefresh={() => setFreshTimestamp(Date.now())}
                />
                <UpdatedAgo
                  timestamp={staleTimestamp}
                  staleThresholdSeconds={60}
                  onRefresh={() => setStaleTimestamp(Date.now())}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 8. DATA TABLE */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">8. Data table</h2>
            <p className="text-xs text-grey">Dense, sticky header, sortable columns, tabular figures.</p>
          </div>
          <DataTable
            data={SAMPLE_BOOKS}
            columns={tableColumns}
            keyExtractor={(b) => b.id}
            onRowClick={(b) => toast.info(`Selected: ${b.title}`)}
          />
        </section>

        {/* 9. EMPTY & ERROR STATES */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">9. Empty & error states</h2>
            <p className="text-xs text-grey">Restrained editorial messages with retry actions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmptyState
              title="No active reservations"
              description="You do not have any books currently placed on hold. Browse the catalog to request a title."
              action={
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Explore catalog
                </Button>
              }
            />
            <ErrorState
              title="Failed to sync circulation desk"
              message="Could not reach the university database. Your session remains authenticated."
              onRetry={() => toast.success('Retrying connection...')}
            />
          </div>
        </section>

        {/* 10. OVERLAYS: SHEET, DIALOG, TOAST, COMMAND BAR */}
        <section className="space-y-4">
          <div className="border-b border-rule pb-2">
            <h2 className="font-serif text-lg font-semibold text-ink">10. Overlays & keyboard shortcuts</h2>
            <p className="text-xs text-grey">12px radius, Esc key dismiss, bottom sheet (&lt;768px) / right-hand panel (&ge;768px).</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => setSheetOpen(true)}>
              Open responsive sheet
            </Button>
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open modal dialog
            </Button>
            <Button variant="secondary" onClick={() => setCommandBarOpen(true)}>
              Open command bar (Ctrl+K)
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.success('Book returned successfully')}
            >
              Trigger success toast
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.error('Accession barcode conflict detected')}
            >
              Trigger error toast
            </Button>
          </div>
        </section>
      </div>

      {/* Responsive Sheet Modal */}
      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Book details & copy breakdown"
        description="Stack CS-04-B • Central Library"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSheetOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setSheetOpen(false); toast.success('Book hold placed'); }}>
              Place hold
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-paper rounded-[6px] border border-rule space-y-1">
            <span className="font-serif font-semibold text-sm text-ink block">
              Introduction to Algorithms (4th Ed.)
            </span>
            <span className="text-grey block">Thomas H. Cormen, Charles E. Leiserson</span>
            <div className="flex items-center gap-2 pt-1">
              <StatusBadge status="available" size="sm" />
              <span className="font-mono text-grey">ISBN 978-0262046305</span>
            </div>
          </div>
          <p className="text-grey leading-normal">
            Below 768px, this panel automatically docks as a bottom sheet. Above 768px, it expands as a right-hand drawer.
          </p>
        </div>
      </Sheet>

      {/* Modal Dialog */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirm book checkout"
        description="Review transaction details before issuing copy."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setDialogOpen(false); toast.success('Transaction logged'); }}>
              Confirm checkout
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-rule">
            <span className="text-grey">Student register number</span>
            <span className="font-mono font-semibold text-ink">AIT2023CS001</span>
          </div>
          <div className="flex justify-between py-1 border-b border-rule">
            <span className="text-grey">Loan duration</span>
            <span className="font-medium text-ink">14 working days</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-grey">Due date calculation</span>
            <span className="font-mono text-brand font-medium">2026-10-29</span>
          </div>
        </div>
      </Dialog>

      {/* Command Bar */}
      <CommandBar
        open={commandBarOpen}
        onOpenChange={setCommandBarOpen}
        items={commandItems}
      />
    </div>
  );
};
