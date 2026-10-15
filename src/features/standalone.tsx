import React from 'react';
import ReactDOM from 'react-dom/client';
import { MyBooksView } from './MyBooksView';
import { PlaceHoldButton } from './holds/PlaceHoldButton';
import '../index.css';

const StandaloneApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper">
      <MyBooksView />

      {/* PlaceHoldButton showcase at bottom for review */}
      <aside className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-6 border-t border-rule bg-white rounded-[12px] shadow-sm mb-12">
        <h3 className="font-serif font-bold text-ink text-base mb-1">
          Catalog Search & Detail: PlaceHoldButton preview
        </h3>
        <p className="text-xs text-grey mb-4 font-sans">
          Reusable component for search/detail cards. Demonstrates disabled state with reason when student is blocked, loading, and optimistic queue position.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <PlaceHoldButton
            workId="work-demo-1"
            title="Distributed Systems: Principles and Paradigms"
            author="Andrew S. Tanenbaum, Maarten van Steen"
          />
        </div>
      </aside>
    </div>
  );
};

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <StandaloneApp />
    </React.StrictMode>
  );
}
