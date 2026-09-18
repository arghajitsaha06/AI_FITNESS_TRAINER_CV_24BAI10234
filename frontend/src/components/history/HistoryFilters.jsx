import React from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export const HistoryFilters = ({
  searchQuery,
  onSearchChange,
  exerciseFilter,
  onExerciseChange,
  sortBy,
  onSortChange,
  onResetFilters,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-navy-800 border border-white/5 shadow-card flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Box */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by exercise or date..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-850 border border-white/10 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 transition-all font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-textMuted hover:text-textPrimary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Exercise Dropdown */}
        <div className="flex items-center gap-2 bg-navy-850 border border-white/10 rounded-xl px-3 py-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-brand-orange" />
          <select
            value={exerciseFilter}
            onChange={(e) => onExerciseChange(e.target.value)}
            className="bg-transparent text-textPrimary focus:outline-none cursor-pointer font-medium"
          >
            <option value="All" className="bg-navy-900 text-textPrimary">
              All Exercises
            </option>
            <option value="Bicep Curl" className="bg-navy-900 text-textPrimary">
              Bicep Curl
            </option>
            <option value="Squat" className="bg-navy-900 text-textPrimary">
              Squat
            </option>
            <option value="Push-Up" className="bg-navy-900 text-textPrimary">
              Push-Up
            </option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 bg-navy-850 border border-white/10 rounded-xl px-3 py-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-textMuted" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-textPrimary focus:outline-none cursor-pointer font-medium"
          >
            <option value="newest" className="bg-navy-900 text-textPrimary">
              Newest First
            </option>
            <option value="accuracy" className="bg-navy-900 text-textPrimary">
              Highest Accuracy
            </option>
            <option value="reps" className="bg-navy-900 text-textPrimary">
              Most Reps
            </option>
            <option value="duration" className="bg-navy-900 text-textPrimary">
              Longest Duration
            </option>
          </select>
        </div>

        {/* Reset button if filtered */}
        {(searchQuery || exerciseFilter !== "All" || sortBy !== "newest") && (
          <button
            onClick={onResetFilters}
            className="text-xs text-brand-soft hover:text-brand-orange font-medium underline px-2 py-1"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default HistoryFilters;
