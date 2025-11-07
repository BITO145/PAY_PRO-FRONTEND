import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Clock, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import {
  useGetTodayAttendanceQuery,
  useMarkAttendanceMutation,
  useGetAttendanceRangeQuery,
} from "../../services/attendanceApi";

// ✅ Reusable Circular Progress Component
const CircularProgress = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = "#10B981",
  trackColor = "#E5E7EB",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-out"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="18"
        fill="#374151"
        transform="rotate(90, 60, 60)"
      >
        {`${Math.min(100, Math.max(0, percentage)).toFixed(0)}%`}
      </text>
    </svg>
  );
};

export default function Attendance() {
  const { data, refetch, isFetching } = useGetTodayAttendanceQuery();
  const [markAttendance, { isLoading: isMarking }] =
    useMarkAttendanceMutation();
  const [checkInFile, setCheckInFile] = useState(null);
  const [checkOutFile, setCheckOutFile] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const [nowTick, setNowTick] = useState(Date.now());

  const punchInTime = data?.data?.punchInTime
    ? new Date(data.data.punchInTime)
    : null;
  const punchOutTime = data?.data?.punchOutTime
    ? new Date(data.data.punchOutTime)
    : null;
  const currentStatus = data?.data?.currentStatus || "idle";
  const canCheckIn =
    data?.data?.canCheckIn ?? data?.data?.canMarkAttendance ?? true;
  const checkInDisabledReason = data?.data?.checkInDisabledReason || "";

  const [remaining, setRemaining] = useState("00:00:00");
  const [workPct, setWorkPct] = useState(0);

  // Calendar state (month view)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDateISO = new Date(monthStart).toISOString();
  const endDateISO = new Date(new Date(monthEnd).setHours(23, 59, 59, 999)).toISOString();
  const { data: monthData, isFetching: monthLoading } = useGetAttendanceRangeQuery({ startDate: startDateISO, endDate: endDateISO });

  // Local watcher for UI time tick
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  // Light polling every 1 min to sync state
  useEffect(() => {
    const id = setInterval(() => refetch(), 60000);
    return () => clearInterval(id);
  }, [refetch]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (punchInTime && !punchOutTime && currentStatus === "active") {
      const WORK_HOURS = 8;
      const totalMs = WORK_HOURS * 60 * 60 * 1000;
      const end = new Date(punchInTime.getTime() + totalMs);

      const tick = () => {
        const now = Date.now();
        const ms = end.getTime() - now;
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
          2,
          "0"
        );
        const s = String(totalSeconds % 60).padStart(2, "0");
        setRemaining(`${h}:${m}:${s}`);

        const elapsed = Math.min(now - punchInTime.getTime(), totalMs);
        const pct = (elapsed / totalMs) * 100;
        setWorkPct(pct);
      };

      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setRemaining("00:00:00");
      setWorkPct(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [punchInTime, punchOutTime, currentStatus]);

  const officeEnd = (() => {
    const d = new Date();
    d.setHours(18, 30, 0, 0);
    return d;
  })();
  const isAfterOfficeEnd = nowTick > officeEnd.getTime();

  const onPunch = async (type) => {
    try {
      setError("");
      const fd = new FormData();
      fd.append("type", type);
      if (type === "checkin" && checkInFile) fd.append("image", checkInFile);
      if (type === "checkout" && checkOutFile) fd.append("image", checkOutFile);
      await markAttendance(fd).unwrap();
      setCheckInFile(null);
      setCheckOutFile(null);
      refetch();
    } catch (e) {
      setError(e?.data?.message || e?.error || "Failed to mark attendance");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">
            Track and manage employee attendance and working hours.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <Clock className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Monthly Attendance Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-3">
            <button
              className="p-1 rounded hover:bg-accent"
              onClick={() => {
                const d = new Date(currentMonth);
                setCurrentMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1));
              }}
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              {currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button
              className="p-1 rounded hover:bg-accent"
              onClick={() => {
                const d = new Date(currentMonth);
                setCurrentMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1));
              }}
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Green = Present, Red = Absent (weekdays with no record), Yellow = Leave, Gray = Future
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthCalendar
            monthStart={monthStart}
            monthEnd={monthEnd}
            records={monthData?.data || monthData || []}
            loading={monthLoading}
          />
        </CardContent>
      </Card>

      {/* Attendance Features */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
          <CardDescription>
            Punch-In and Punch-Out with image proof. Timer runs on server time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Punch In */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="h-5 w-5 text-emerald-600" />
                <h3 className="font-semibold text-foreground">Punch In</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Upload an image from your office environment to mark your
                attendance.
              </p>

              <label
                htmlFor="checkin-upload"
                className="cursor-pointer inline-flex items-center justify-center w-full rounded-md border border-dashed border-emerald-400 bg-emerald-50/40 hover:bg-emerald-100 text-emerald-700 text-sm font-medium py-2 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                {checkInFile ? checkInFile.name : "Select or Drop Image"}
              </label>
              <input
                id="checkin-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCheckInFile(e.target.files?.[0] || null)}
              />

              <Button
                className="mt-4 w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onPunch("checkin")}
                disabled={
                  isMarking ||
                  currentStatus === "active" ||
                  !!punchInTime ||
                  !canCheckIn ||
                  isAfterOfficeEnd
                }
              >
                <Clock className="h-4 w-4" />
                {punchInTime ? "Already Punched In" : "Punch In"}
              </Button>

              {(!canCheckIn || isAfterOfficeEnd) && (
                <p className="text-xs text-red-600 mt-2">
                  {isAfterOfficeEnd
                    ? "Office hours have ended"
                    : checkInDisabledReason || "Check-in disabled currently."}
                </p>
              )}

              {punchInTime && (
                <p className="text-xs text-muted-foreground mt-2">
                  You punched in at {new Date(punchInTime).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Punch Out */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-foreground">Punch Out</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Upload an image when leaving. If you forget, system auto-closes
                at 6:30 PM (upload allowed till 11:59 PM).
              </p>

              <label
                htmlFor="checkout-upload"
                className="cursor-pointer inline-flex items-center justify-center w-full rounded-md border border-dashed border-orange-400 bg-orange-50/40 hover:bg-orange-100 text-orange-700 text-sm font-medium py-2 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                {checkOutFile ? checkOutFile.name : "Select or Drop Image"}
              </label>
              <input
                id="checkout-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCheckOutFile(e.target.files?.[0] || null)}
              />

              <Button
                className="mt-4 w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => onPunch("checkout")}
                disabled={isMarking || currentStatus !== "active"}
              >
                <Clock className="h-4 w-4" />
                {punchOutTime ? "Already Punched Out" : "Punch Out"}
              </Button>

              {punchOutTime && (
                <p className="text-xs text-muted-foreground mt-2">
                  You punched out at{" "}
                  {new Date(punchOutTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Status + Circular Progress */}
          <div className="mt-8 p-6 rounded-lg bg-accent/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-border">
            {/* Left side */}
            <div>
              <div className="text-sm text-muted-foreground">
                Current Status
              </div>
              <div
                className={`text-lg font-semibold capitalize ${
                  currentStatus === "active"
                    ? "text-emerald-600"
                    : currentStatus === "idle"
                    ? "text-gray-500"
                    : "text-orange-600"
                }`}
              >
                {currentStatus}
              </div>
            </div>

            {/* Right side - semi circular timer */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="relative flex items-center justify-center">
                <SemiCircularProgress
                  percentage={workPct}
                  size={160}
                  strokeWidth={12}
                  color="#10B981"
                />
                {/* Timer text inside circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Time Left
                  </div>
                  <div className="text-2xl font-bold tabular-nums">
                    {remaining}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// Calendar grid component
const MonthCalendar = ({ monthStart, monthEnd, records = [], loading }) => {
  // Map records by date (YYYY-MM-DD) to status
  const recMap = new Map();
  records.forEach((r) => {
    const d = new Date(r.date || r?.dateString || r?.createdAt);
    const key = d.toISOString().slice(0, 10);
    recMap.set(key, (r.status || '').toLowerCase());
  });

  const today = new Date();
  const daysInMonth = monthEnd.getDate();
  const firstWeekday = new Date(monthStart).getDay(); // 0 Sun ... 6 Sat
  const cells = [];

  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Leading blanks
  for (let i = 0; i < firstWeekday; i++) cells.push(null);

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const curr = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const key = curr.toISOString().slice(0, 10);
    const isFuture = curr > today;
    const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
    let status = recMap.get(key); // 'present' | 'absent' | 'leave' | etc. (lowercase)
    if (!status) {
      if (!isFuture && !isWeekend) status = 'absent'; // assume absent on past weekdays with no record
      else status = 'none';
    }

    cells.push({ day, status, date: curr });
  }

  const colorFor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-300';
      case 'leave':
      case 'half day':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      case 'absent':
        return 'bg-red-500/20 text-red-700 border-red-300';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div>
      <div className="grid grid-cols-7 text-xs text-muted-foreground mb-2">
        {weekdays.map((w) => (
          <div key={w} className="text-center py-1">{w}</div>
        ))}
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) =>
            cell ? (
              <div
                key={idx}
                className={`h-12 rounded-md border flex items-center justify-center text-sm ${colorFor(cell.status)}`}
                title={`${cell.date.toDateString()} — ${cell.status}`}
              >
                {cell.day}
              </div>
            ) : (
              <div key={idx} className="h-12" />
            )
          )}
        </div>
      )}
    </div>
  );
};

const SemiCircularProgress = ({
  percentage,
  size = 160,
  strokeWidth = 12,
  color = '#10B981',
  trackColor = '#E5E7EB',
}) => {
  // We’ll draw a 270° arc (¾ of a full circle)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const visibleArc = 0.75 * circumference // 270° visible
  const offset = visibleArc * (1 - percentage / 100)

  // SVG arc start at top (rotated -135°)
  const rotation = -135

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform"
    >
      <g transform={`rotate(${rotation} ${size / 2} ${size / 2})`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={visibleArc + ' ' + circumference}
          strokeDashoffset={circumference - visibleArc}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={visibleArc + ' ' + circumference}
          strokeDashoffset={offset + (circumference - visibleArc)}
          strokeLinecap="round"
          className="transition-all duration-700 ease-in-out"
        />
      </g>
    </svg>
  )
}
