import React from 'react';
import { BookMarked, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const MyBooksPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            My Books
          </h2>
          <p className="text-xs text-slate-500">
            Circulation history, hold queues, and reading lists
          </p>
        </div>
      </div>

      {/* Placeholder screen for Phase 1 */}
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm my-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
          <BookMarked className="w-8 h-8 text-teal-700" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            My Books Collection
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Detailed circulation shelves, self-checkout renewals, and reserve queues will be delivered in the upcoming circulation phase.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/search">
            <Button size="sm" className="gap-2">
              <Search className="w-3.5 h-3.5" />
              Search Library Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
