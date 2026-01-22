"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Calendar, Loader2 } from "lucide-react";

interface AttendanceRecord {
  w_id: string;
  w_name: string | null;
  w_status: string | null;
  date: string | null;
}

export function AttendanceListIntegrated() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedDays, setLoadedDays] = useState(5);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("today");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    try {
      const response = await fetch("/api/attendance");
      const data = await response.json();
      if (Array.isArray(data)) {
        setAttendance(data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  }

  const displayedRecords = attendance.slice(0, loadedDays * 10);

  // Get today's date string for filtering
  const today = new Date().toISOString().split("T")[0];

  // Get records based on selected date range
  const getRecordsForDateRange = useMemo(() => {
    let recordsToFilter = displayedRecords;

    if (selectedDateRange === "today") {
      recordsToFilter = displayedRecords.filter(
        (r) => r.date === today
      );
    } else if (selectedDateRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      recordsToFilter = displayedRecords.filter((r) => {
        if (!r.date) return false;
        const recordDate = new Date(r.date);
        return recordDate >= weekAgo;
      });
    } else if (selectedDateRange === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      recordsToFilter = displayedRecords.filter((r) => {
        if (!r.date) return false;
        const recordDate = new Date(r.date);
        return recordDate >= monthAgo;
      });
    } else if (
      selectedDateRange === "custom" &&
      customStartDate &&
      customEndDate
    ) {
      recordsToFilter = displayedRecords.filter((r) => {
        if (!r.date) return false;
        const recordDate = new Date(r.date);
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return recordDate >= start && recordDate <= end;
      });
    }

    return recordsToFilter;
  }, [
    selectedDateRange,
    customStartDate,
    customEndDate,
    displayedRecords,
    today,
  ]);

  // Apply filters to records
  const filteredRecords = useMemo(() => {
    return getRecordsForDateRange.filter((record) => {
      const nameMatch = (record.w_name || "")
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const statusMatch =
        statusFilter === "all" ||
        (record.w_status || "").toLowerCase() === statusFilter.toLowerCase();
      return nameMatch && statusMatch;
    });
  }, [nameFilter, statusFilter, getRecordsForDateRange]);

  // Get summary statistics
  const presentCount = filteredRecords.filter(
    (r) => (r.w_status || "").toLowerCase() === "present"
  ).length;
  const absentCount = filteredRecords.filter(
    (r) => (r.w_status || "").toLowerCase() === "absent"
  ).length;
  const totalRecords = filteredRecords.length;

  const handleLoadMore = () => {
    setLoadedDays((prev) => prev + 5);
  };

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    if (range !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const uniqueStatuses = [
    ...new Set(
      displayedRecords
        .map((r) => r.w_status)
        .filter((s): s is string => s !== null)
    ),
  ];

  const uniqueDates = [
    ...new Set(
      filteredRecords
        .map((r) => r.date)
        .filter((d): d is string => d !== null)
    ),
  ].reverse();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "200ms" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Attendance Management
        </h2>
        <Users className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Date Range Selection */}
      <div className="mb-6 pb-6 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase mb-3">
          Select Date Range
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          {[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "custom", label: "Custom" },
          ].map((option) => (
            <Button
              key={option.value}
              variant={
                selectedDateRange === option.value ? "default" : "outline"
              }
              className="h-8 text-xs transition-all duration-200"
              onClick={() => handleDateRangeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Range */}
        {selectedDateRange === "custom" && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-secondary/30 rounded-lg">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {totalRecords > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-secondary/20 rounded-lg border border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Total</p>
            <p className="text-lg font-semibold text-foreground">
              {totalRecords}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Present</p>
            <p className="text-lg font-semibold text-emerald-600">
              {presentCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Absent</p>
            <p className="text-lg font-semibold text-red-600">{absentCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 mb-6 pb-6 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Filter Attendance
        </p>
        <div className="space-y-2">
          <Input
            placeholder="Search worker name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="h-8 text-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attendance Records */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {uniqueDates.map((date) => {
            const dateRecords = filteredRecords.filter((r) => r.date === date);
            const isToday = date === today;
            const dateStats = {
              present: dateRecords.filter(
                (r) => (r.w_status || "").toLowerCase() === "present"
              ).length,
              absent: dateRecords.filter(
                (r) => (r.w_status || "").toLowerCase() === "absent"
              ).length,
            };

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    {isToday ? "(Today)" : ""}
                  </p>
                  <div className="flex gap-2">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                      P: {dateStats.present}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                      A: {dateStats.absent}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {dateRecords.map((record, index) => (
                    <div
                      key={`${record.w_id}-${date}-${index}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary transition-colors border border-border/50 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {record.w_name || record.w_id}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          ID: {record.w_id}
                        </p>
                      </div>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                          (record.w_status || "").toLowerCase() === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.w_status || "Unknown"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            No attendance records found for selected filters
          </p>
        </div>
      )}

      {loadedDays * 10 < attendance.length &&
        selectedDateRange !== "custom" && (
          <Button
            variant="outline"
            className="w-full mt-4 h-8 text-xs transition-all duration-300 hover:scale-105 bg-transparent"
            onClick={handleLoadMore}
          >
            Load More Days
          </Button>
        )}
    </Card>
  );
}
