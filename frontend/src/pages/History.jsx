import React, { useState, useMemo } from "react";
import PageContainer from "../components/layout/PageContainer";
import HistoryFilters from "../components/history/HistoryFilters";
import HistoryTable from "../components/history/HistoryTable";
import { useUser } from "../context/UserContext";

export const History = () => {
  const { history } = useUser();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseFilter, setExerciseFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Filter and sort the history
  const filteredSessions = useMemo(() => {
    let result = [...history];

    // Filter by Exercise
    if (exerciseFilter !== "All") {
      result = result.filter(
        (s) =>
          s.exercise?.toLowerCase() === exerciseFilter.toLowerCase() ||
          s.exerciseId?.toLowerCase() === exerciseFilter.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.exercise?.toLowerCase().includes(q) ||
          s.date?.toLowerCase().includes(q) ||
          s.accuracy?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "accuracy") {
        const accA = parseInt(a.accuracy, 10) || a.accuracyNum || 0;
        const accB = parseInt(b.accuracy, 10) || b.accuracyNum || 0;
        return accB - accA;
      }
      if (sortBy === "reps") {
        return (b.reps || 0) - (a.reps || 0);
      }
      if (sortBy === "duration") {
        return (b.durationSeconds || 0) - (a.durationSeconds || 0);
      }
      // default: newest first (order preserved from initial list / newly prepended)
      return 0;
    });

    return result;
  }, [history, searchQuery, exerciseFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setExerciseFilter("All");
    setSortBy("newest");
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-brand-orange" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-soft font-semibold">
            Telemetry Database
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight uppercase">
          WORKOUT HISTORY
        </h1>
        <p className="text-base sm:text-lg text-textSecondary mt-1">
          Track your training progress over time.
        </p>
      </div>

      {/* Top Controls (Search, Exercise Filter, Date Filter, Sort) */}
      <HistoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        exerciseFilter={exerciseFilter}
        onExerciseChange={setExerciseFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* Main Table / Cards */}
      <HistoryTable
        sessions={filteredSessions}
        onResetFilters={handleResetFilters}
      />
    </PageContainer>
  );
};

export default History;
