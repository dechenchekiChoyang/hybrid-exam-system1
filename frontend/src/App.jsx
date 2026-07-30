import React from 'react';
import API from "./services/api";
import LandingPage from "./components/LandingPage";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Eye,
  EyeOff,
  GraduationCap,
  User,
  Mail,
  Lock,
  Building2,
  IdCard,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  BookOpen,
  UserPlus,
  BarChart3,
  Calendar,
  Download,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Menu,
  LogOut,
  LayoutDashboard,
  Bell,
  Search,
  CheckSquare
} from "lucide-react";

/* ============================================================
   LIGHT DESIGN SYSTEM — Bright, Crisp & Professional Academic Aesthetic
   ============================================================ */
const COLORS = {
  ink: "#F8FAFC",             // Light Slate Background
  surface: "#FFFFFF",         // Clean White Card Background
  surface2: "#F1F5F9",        // Secondary Light Slate
  border: "#E2E8F0",          // Subtle Border
  textPrimary: "#0F172A",     // High Contrast Dark Text
  textMuted: "#64748B",       // Medium Muted Text
  accent: "#2563EB",          // Vibrant Royal Blue
  gold: "#D97706",            // Warm Amber / Gold
  green: "#16A34A",           // Vibrant Emerald Green
  red: "#DC2626",             // Crimson Red
  purple: "#7C3AED",         // Royal Purple
};

const MONO = "'IBM Plex Mono', monospace";
const SANS = "'IBM Plex Sans', sans-serif";
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');`;

/* ============================================================
   MOCK EXAMINATION DATA
   ============================================================ */
const MOCK_USERS = {
  student: { name: "Choyang Dema", email: "student@college.edu" },
  instructor: { name: "Dr. Karma Wangchuk", email: "instructor@college.edu" },
  admin: { name: "System Admin", email: "admin@college.edu" },
};

const MOCK_EXAM = {
  examId: "exam_networks_mid",
  title: "Computer Networks — Mid Semester Examination",
  department: "Computer Science & Applications",
  subject: "Computer Networks",
  description: "Comprehensive assessment covering OSI Reference Model, Transport Layer protocols (TCP/UDP), IP Addressing, and Routing Algorithms.",
  instructions: "Answer all questions. Objective questions (MCQ, True/False, Fill in Blank) are evaluated automatically. Subjective questions are evaluated manually by assigned faculty.",
  durationMinutes: 15,
  passingMarks: 40,
  maxAttempts: 1,
  negativeMarking: false,
  shuffleQuestions: false,
  shuffleOptions: false,
  autoSubmit: true,
  showScoreImmediately: false,
  showAnswersImmediately: false,
  manualPublish: true,
  maxTabSwitchViolations: 3,
  examPin: "483916",
  questions: [
    { _id: "q1", type: "mcq", text: "Which OSI layer is responsible for routing packets between different networks?", options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"], correctIndex: 1, marks: 5 },
    { _id: "q2", type: "mcq", text: "What does TCP guarantee that UDP does not?", options: ["Lower latency", "Ordered, reliable delivery", "Smaller header size", "Broadcast support"], correctIndex: 1, marks: 5 },
    { _id: "q3", type: "true_false", text: "A Network Switch operates primarily at Layer 2 (Data Link) of the OSI model.", options: ["True", "False"], correctIndex: 0, marks: 5 },
    { _id: "q4", type: "true_false", text: "UDP establishes a virtual connection prior to transmitting data packets.", options: ["True", "False"], correctIndex: 1, marks: 5 },
    { _id: "q5", type: "fill_blank", text: "The network protocol used to map domain names to IP addresses is called ______.", acceptedAnswers: ["dns", "domain name system"], marks: 5 },
    { _id: "q6", type: "fill_blank", text: "HTTPS operates on standard port number ______ by default.", acceptedAnswers: ["443"], marks: 5 },
    { _id: "q7", type: "short_answer", text: "Briefly explain the purpose and steps of the TCP three-way handshake.", maxMarks: 10 },
    { _id: "q8", type: "short_answer", text: "Differentiate between circuit switching and packet switching in computer networks.", maxMarks: 10 },
    { _id: "q9", type: "long_answer", text: "Describe each layer of the OSI 7-Layer Reference Model and provide one standard protocol for each.", maxMarks: 15 },
    { _id: "q10", type: "case_study", text: "Diagnose a corporate network experiencing packet drop during real-time video conferencing and recommend remediation.", maxMarks: 15 },
    { _id: "q11", type: "coding", text: "Write a function in any language to validate whether a given string is a valid IPv4 address.", maxMarks: 15 },
  ],
};

const totalMarks = MOCK_EXAM.questions.reduce((s, q) => s + (q.marks ?? q.maxMarks), 0);

const TYPE_LABEL = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  case_study: "Case Study",
  coding: "Coding / Practical",
};
const AUTO_TYPES = ["mcq", "true_false", "fill_blank"];
const MANUAL_TYPES = ["short_answer", "long_answer", "case_study", "coding"];

function normalize(str) {
  return (str ?? "").trim().toLowerCase();
}

function autoGrade(answers) {
  let autoScore = 0;
  let autoPossible = 0;
  const perQuestion = {};
  MOCK_EXAM.questions.forEach((q) => {
    if (!AUTO_TYPES.includes(q.type)) return;
    autoPossible += q.marks;
    const given = answers[q._id];
    let correct = false;
    if (q.type === "fill_blank") {
      correct = given != null && q.acceptedAnswers.some((a) => normalize(a) === normalize(given));
    } else {
      correct = given === q.correctIndex;
    }
    if (correct) autoScore += q.marks;
    perQuestion[q._id] = { correct, given };
  });
  return { autoScore, autoPossible, perQuestion };
}

function getMascot(pct) {
  if (pct >= 90) return { emoji: "🏆", color: COLORS.green, title: "First Class Distinction!", msg: "Outstanding academic performance." };
  if (pct >= 75) return { emoji: "🌟", color: COLORS.accent, title: "First Class!", msg: "Great work, consistently high score." };
  if (pct >= 50) return { emoji: "👍", color: COLORS.gold, title: "Satisfactory Pass", msg: "Passed the exam, keep practicing." };
  return { emoji: "⚠️", color: COLORS.red, title: "Needs Improvement", msg: "Please consult your course instructor for review." };
}

/* ============================================================
   HOOKS
   ============================================================ */
function useCountdown(totalSeconds, active, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const expiredRef = useRef(false);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          if (!expiredRef.current) { expiredRef.current = true; onExpire?.(); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, onExpire]);
  const m = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const s = (secondsLeft % 60).toString().padStart(2, "0");
  return { secondsLeft, formatted: `${m}:${s}`, fraction: secondsLeft / totalSeconds };
}

// ── Server-side timer hook — backend is the authority ──
function useServerCountdown(examId, fallbackSeconds, active, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [timerLoading, setTimerLoading] = useState(true);
  const expiredRef = useRef(false);
  const startedRef = useRef(false);
  const lastSync = useRef(0);

  // Initialize from server — try timer (resume) first, then start
  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;

    const initFromServer = async () => {
      try {
        let res;
        try {
          res = await API.get(`/submissions/${examId}/timer`);
          if (res.data?.status && res.data.status !== "in-progress") {
            setSecondsLeft(0);
            setTimerLoading(false);
            if (!expiredRef.current) { expiredRef.current = true; onExpire?.(); }
            return;
          }
          if (res.data?.startedAt) { lastSync.current = Date.now(); }
        } catch {
          res = await API.post(`/submissions/${examId}/start`);
          lastSync.current = Date.now();
        }

        if (res?.data?.expired) {
          setSecondsLeft(0);
          if (!expiredRef.current) { expiredRef.current = true; onExpire?.(); }
        } else {
          setSecondsLeft(res?.data?.remainingSeconds ?? fallbackSeconds);
        }
      } catch {
        // API unavailable — fall back to client-side timer
        setSecondsLeft(fallbackSeconds);
      } finally {
        setTimerLoading(false);
      }
    };
    initFromServer();
  }, [active, examId, fallbackSeconds, onExpire]);

  // Countdown tick + periodic server sync
  useEffect(() => {
    if (!active || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      if (!expiredRef.current) { expiredRef.current = true; onExpire?.(); }
      return;
    }

    const tickId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(tickId);
          if (!expiredRef.current) { expiredRef.current = true; onExpire?.(); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Sync with server every 30 seconds
    const syncId = setInterval(async () => {
      try {
        const res = await API.get(`/submissions/${examId}/timer`);
        if (res?.data && typeof res.data.remainingSeconds === "number") {
          setSecondsLeft(res.data.remainingSeconds);
          lastSync.current = Date.now();
          if (res.data.expired && !expiredRef.current) {
            expiredRef.current = true;
            onExpire?.();
          }
        }
      } catch { /* silent — keep local countdown */ }
    }, 30000);

    return () => { clearInterval(tickId); clearInterval(syncId); };
  }, [active, secondsLeft !== null, examId, onExpire]);

  const s = secondsLeft ?? fallbackSeconds;
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const secs = (s % 60).toString().padStart(2, "0");
  return {
    secondsLeft: s,
    formatted: `${m}:${secs}`,
    fraction: fallbackSeconds > 0 ? Math.max(0, Math.min(1, s / fallbackSeconds)) : 0,
    loading: timerLoading,
  };
}

function useTabSwitchDetector(active, maxViolations, onMaxExceeded) {
  const violationsRef = useRef(0);
  const [violations, setViolations] = useState(0);
  const [banner, setBanner] = useState(null);
  const register = useCallback(() => {
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    if (violationsRef.current >= maxViolations) { setBanner("max"); onMaxExceeded?.(); }
    else setBanner("warn");
  }, [maxViolations, onMaxExceeded]);

  useEffect(() => {
    if (!active) return;
    const handleVisibility = () => { if (document.visibilityState === "hidden") register(); };
    const handleBlur = () => register();
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    const blockContext = (e) => e.preventDefault();
    const blockClipboard = (e) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("copy", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
    };
  }, [active, register]);

  return { violations, banner, dismissBanner: () => setBanner(null) };
}

/* ============================================================
   UI PRIMITIVES (Bright Light Design Tokens)
   ============================================================ */
function Eyebrow({ children, color }) {
  return (
    <div style={{ color: color ?? COLORS.textMuted }} className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button" }) {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-transparent",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white shadow-sm border-transparent",
    ghost: "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 border-transparent",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border-transparent",
    gold: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-transparent",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant] || styles.primary} ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "", style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        ...style,
      }}
      className={`rounded-xl transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, accent = COLORS.accent, icon = "📊", subtext }) {
  return (
    <Card className="p-5 flex-1 min-w-[160px] hover:shadow-md transition-all border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="text-xl p-2 rounded-lg bg-slate-50 border border-slate-100">{icon}</span>
      </div>
      <div style={{ color: accent }} className="text-3xl font-extrabold tracking-tight font-mono mb-1">
        {value}
      </div>
      {subtext && <div className="text-xs text-slate-500 font-medium">{subtext}</div>}
    </Card>
  );
}

function Badge({ children, color = COLORS.accent, bg }) {
  return (
    <span
      style={{
        color: color,
        backgroundColor: bg || `${color}15`,
        borderColor: `${color}40`,
      }}
      className="text-xs px-2.5 py-1 rounded-full font-semibold border inline-flex items-center gap-1 uppercase tracking-wider text-[11px]"
    >
      {children}
    </span>
  );
}

/* ============================================================
   COLLAPSIBLE SIDEBAR COMPONENT
   ============================================================ */
function AppSidebar({ collapsed, onToggle, activeTab, onSelectTab, role, user, onLogout }) {
  const studentMenus = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "exams", label: "My Examinations", icon: FileText, badge: "1 Active" },
    { id: "results", label: "Results & Mark Sheet", icon: Award },
    { id: "admitCard", label: "Hall Ticket / Admit Card", icon: IdCard },
    { id: "schedule", label: "Exam Timetable", icon: Calendar },
    { id: "notices", label: "Official Notices", icon: Bell },
  ];

  const instructorMenus = [
    { id: "dashboard", label: "Faculty Dashboard", icon: LayoutDashboard },
    { id: "grading", label: "Manual Grading Queue", icon: BookOpen, badge: "Action Required" },
    { id: "papers", label: "Question Papers", icon: FileText },
    { id: "results", label: "Publish Mark Sheets", icon: Award },
  ];

  const adminMenus = [
    { id: "dashboard", label: "Admin Console", icon: LayoutDashboard },
    { id: "staff", label: "Staff Provisioning", icon: UserPlus },
    { id: "students", label: "Student Registry", icon: GraduationCap },
    { id: "system", label: "Security & Audit Logs", icon: Shield },
  ];

  const menus = role === "admin" ? adminMenus : role === "instructor" ? instructorMenus : studentMenus;

  return (
    <aside
      className={`bg-slate-900 text-white min-h-screen flex flex-col justify-between transition-all duration-300 z-40 relative shadow-xl ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {/* Header with Logo and Collapse Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30 text-lg">
                🎓
              </div>
              <div>
                <div className="font-bold text-sm text-white tracking-tight leading-none">
                  HYBRID EXAM
                </div>
                <div className="text-[10px] text-blue-400 font-medium mt-1">
                  Spring Term 2026
                </div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md mx-auto text-lg">
              🎓
            </div>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-auto"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1.5">
          {menus.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : ""}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all relative group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />

                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Section */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed && (
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 mb-2">
            <div className="text-xs font-bold text-white truncate">{user?.name || "User"}</div>
            <div className="text-[11px] text-slate-400 capitalize">{role} Account</div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white transition-all border border-red-500/20`}
          title="Sign Out"
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ============================================================
   HEADER NAVBAR COMPONENT (Full Width Top Area)
   ============================================================ */
function AppHeader({ user, role, onLogout, collapsed, onToggleSidebar }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <div className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
            ROYAL HYBRID EXAMINATIONS PORTAL
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-mono font-bold border border-blue-200">
              OFFICIAL SYSTEM
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Academic Assessment System • Spring Semester 2026
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-72 hidden md:block">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search exams, mark sheets, schedules..."
            className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
          />
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs font-bold text-slate-900">{user?.name || "User"}</div>
          <div className="text-[11px] text-slate-500 capitalize flex items-center justify-end gap-1.5">
            <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-purple-500' : role === 'instructor' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            {role} Portal
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1.5"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

/* ============================================================
   AUTH SHELL & LANDING
   ============================================================ */
const ROLE_META = {
  student: { icon: "🎓", label: "Student Portal", email: MOCK_USERS.student.email },
  instructor: { icon: "👨‍🏫", label: "Faculty / Instructor", email: MOCK_USERS.instructor.email },
  admin: { icon: "⚙️", label: "System Administration", email: MOCK_USERS.admin.email },
};

function AuthShell({ eyebrow, title, subtitle, children, onBack }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #EEF2FF 100%)",
      }}
    >
      <div className="w-full max-w-md rounded-2xl p-8 bg-white border border-slate-200 shadow-xl shadow-blue-900/5">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            ← Back to portals
          </button>
        )}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <GraduationCap size={36} />
          </div>
        </div>

        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{subtitle}</p>

        {children}
      </div>
    </div>
  );
}

function LandingScreen({ onPickRole, onStudentRegister }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #E0F2FE 0%, #F8FAFC 45%, #EEF2FF 100%)" }}
    >
      <div className="w-full max-w-md rounded-2xl p-8 bg-white border border-slate-200 shadow-2xl shadow-blue-950/10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/25 text-white">
            🎓
          </div>
        </div>

        <p className="text-center font-bold text-xs uppercase tracking-widest text-blue-600 mb-2">
          Royal Examination Authority
        </p>

        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">
          Hybrid Assessment Portal
        </h1>

        <p className="text-center text-sm text-slate-500 mb-8">
          Select your official access portal to continue.
        </p>

        <div className="space-y-3.5">
          {[
            { key: "student", bg: "bg-blue-50 border-blue-200 hover:border-blue-400" },
            { key: "instructor", bg: "bg-emerald-50 border-emerald-200 hover:border-emerald-400" },
            { key: "admin", bg: "bg-purple-50 border-purple-200 hover:border-purple-400" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onPickRole(item.key)}
              className={`w-full rounded-xl p-4 text-left border transition-all duration-200 hover:shadow-md flex items-center justify-between ${item.bg}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="text-2xl">{ROLE_META[item.key].icon}</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{ROLE_META[item.key].label}</div>
                  <div className="text-xs text-slate-500">Secure Single Sign-On Access</div>
                </div>
              </div>
              <ChevronRight className="text-slate-400" size={20} />
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 mb-3 font-medium">New Student Candidate?</p>
          <button
            onClick={onStudentRegister}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all"
          >
            Create Student Account
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleLoginScreen({ role, onLogin, onBack, onGoToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const meta = ROLE_META[role];

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/api/auth/login", { email, password, role });
      const userToSave = {
        name: res.data.user.fullName,
        email: res.data.user.email,
        role: res.data.user.role,
      };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userToSave));
      onLogin(userToSave);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  const defaultPass = role === "admin" ? "Admin123!" : role === "instructor" ? "Instructor123!" : "Student123!";

  return (
    <AuthShell
      eyebrow={`${meta.label}`}
      title={`${meta.icon} Portal Sign In`}
      subtitle={role === "instructor" ? "Enter your faculty credentials provided by Administration." : role === "admin" ? "Enter your system administrator credentials." : "Enter your registered student credentials."}
      onBack={onBack}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={meta.email}
            type="email"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-blue-900">Demo Seed Credentials:</span><br />
          Email: <code className="font-mono font-semibold text-blue-700">{meta.email}</code><br />
          Password: <code className="font-mono font-semibold text-blue-700">{defaultPass}</code>
        </div>

        {error && <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

        <Button type="submit" className="w-full py-3" disabled={loading}>
          {loading ? "Authenticating..." : "Sign In to Portal"}
        </Button>
      </form>

      {role === "student" && (
        <p className="text-xs text-center text-slate-500 mt-6">
          New Student Candidate?{" "}
          <span onClick={onGoToRegister} className="text-blue-600 hover:underline cursor-pointer font-semibold">
            Create Student Account
          </span>
        </p>
      )}
    </AuthShell>
  );
}

function StudentRegisterScreen({ onRegistered, onBack, onGoToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", department: "Computer Science", studentId: "STU2026-09" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("All required fields must be filled out.");
      return;
    }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await API.post("/api/auth/register", {
        fullName: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "student",
        department: form.department,
        enrollmentId: form.studentId,
      });
      onRegistered({ name: form.name.trim(), email: form.email.trim() });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Self Registration" title="Student Registration" subtitle="Create your academic student candidate account." onBack={onBack}>
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
          <input value={form.name} onChange={set("name")} required className="w-full rounded-lg px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
          <input value={form.email} onChange={set("email")} type="email" required className="w-full rounded-lg px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Department *</label>
          <select value={form.department} onChange={set("department")} className="w-full rounded-lg px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none">
            <option value="Computer Science">Computer Science</option>
            <option value="Computer Applications">Computer Applications</option>
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Password *</label>
          <input value={form.password} onChange={set("password")} type="password" required className="w-full rounded-lg px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm Password *</label>
          <input value={form.confirmPassword} onChange={set("confirmPassword")} type="password" required className="w-full rounded-lg px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none" />
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">{error}</div>}

        <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>{loading ? "Creating Account..." : "Complete Registration"}</Button>
      </form>
    </AuthShell>
  );
}

function StudentRegisteredScreen({ name, onContinue }) {
  return (
    <AuthShell eyebrow="Account Ready" title="Registration Confirmed" subtitle={`Welcome ${name}. Your candidate profile has been created successfully.`}>
      <Button className="w-full" onClick={onContinue}>Proceed to Sign In</Button>
    </AuthShell>
  );
}

/* ============================================================
   HISTORY RESULT DETAIL VIEW
   ============================================================ */
function HistoryResultView({ result, submissionId, onBack }) {
  const [downloading, setDownloading] = useState(false);

  if (!result) return null;
  const pct = result.totalMarks > 0 ? Math.round((result.finalScore / result.totalMarks) * 100) : null;
  const passed = result.passingMarks != null ? result.finalScore >= result.passingMarks : null;

  const generateMarksheetPDF = async () => {
    if (!submissionId) return;
    setDownloading(true);
    try {
      const res = await API.get(`/submissions/${submissionId}/marksheet`);
      const d = res.data;

      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const w = doc.internal.pageSize.getWidth();
      let y = 15;

      // ── Top header ──
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, w, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("ROYAL HYBRID EXAMINATION PORTAL", w / 2, 13, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Official Semester Examination Mark Sheet", w / 2, 21, { align: "center" });

      y = 35;
      doc.setTextColor(30, 41, 59);

      // ── Student Information ──
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Student Information", 14, y);
      y += 7;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(14, y, 80, y);
      y += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Full Name       :  ${d.student.fullName || "—"}`, 14, y); y += 6;
      doc.text(`Enrollment ID   :  ${d.student.enrollmentId || "—"}`, 14, y); y += 6;
      doc.text(`Department      :  ${d.student.department || "—"}`, 14, y); y += 6;
      doc.text(`Email           :  ${d.student.email || "—"}`, 14, y); y += 6;
      y += 3;

      // ── Exam Information ──
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Examination Information", 14, y);
      y += 7;
      doc.setDrawColor(37, 99, 235);
      doc.line(14, y, 90, y);
      y += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Subject          :  ${d.exam.subject || "—"}`, 14, y); y += 6;
      doc.text(`Exam Title       :  ${d.exam.title || "—"}`, 14, y); y += 6;
      doc.text(`Maximum Marks    :  ${d.result.totalMarks}`, 14, y); y += 6;
      doc.text(`Passing Marks    :  ${d.exam.passingMarks}`, 14, y); y += 6;
      doc.text(`Issue Date       :  ${new Date(d.result.publishedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`, 14, y);
      y += 9;

      // ── Result Summary table ──
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Result Summary", 14, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [["Final Score", "Percentage", "Grade", "Result"]],
        body: [[
          `${d.result.finalScore} / ${d.result.totalMarks}`,
          `${d.result.percentage}%`,
          d.result.grade,
          d.result.passed ? "PASS" : "FAIL",
        ]],
        styles: { fontSize: 10, halign: "center", cellPadding: 4 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });
      y = doc.lastAutoTable.finalY + 10;

      // ── Grade scale ──
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text("Grade Scale: O (90-100)  A+ (80-89)  A (70-79)  B+ (60-69)  B (50-59)  C (40-49)  F (< Pass)", 14, y);
      y += 14;

      // ── Footer ──
      const fy = doc.internal.pageSize.getHeight() - 30;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, fy, w - 14, fy);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by Hybrid Examination ERP • This is a computer-generated marksheet.", w / 2, fy + 5, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Controller of Examination", w - 25, fy + 13, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text("Signature", w - 25, fy + 17, { align: "right" });

      const safeSubject = (d.exam.subject || "Exam").replace(/[^a-zA-Z0-9]/g, "_");
      const safeName = (d.student.fullName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`Marksheet_${safeSubject}_${safeName}.pdf`);
    } catch (err) {
      console.error("Marksheet generation failed:", err);
      alert(err.response?.data?.message || err.message || "Failed to generate marksheet.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 rounded-2xl shadow-lg">
        <button onClick={onBack} className="text-blue-200 hover:text-white text-xs font-semibold mb-3 flex items-center gap-1">
          ← Back to Results
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight">Result Breakdown</h1>
        <p className="text-blue-100 text-sm mt-1">Official Score Card</p>
      </div>

      <Card className="p-6 bg-white border-slate-200 flex items-center gap-6">
        <div className="text-5xl">{pct != null && pct >= 75 ? "🏆" : pct != null && pct >= 50 ? "👍" : "📋"}</div>
        <div className="flex-1">
          <div className="font-bold text-lg text-slate-900">
            {pct != null && pct >= 75 ? "Great Performance!" : pct != null && pct >= 50 ? "Satisfactory" : "Result"}
          </div>
          <div className="text-3xl font-extrabold font-mono text-blue-600 my-1">
            {result.finalScore} / {result.totalMarks}
            {pct != null && <span className="text-sm font-normal text-slate-500"> ({pct}%)</span>}
          </div>
          {passed !== null && (
            <Badge color={passed ? COLORS.green : COLORS.red}>{passed ? "Passed" : "Failed"}</Badge>
          )}
          <div className="text-xs text-slate-500 mt-2">Passing Marks: {result.passingMarks}</div>
        </div>
      </Card>

      {/* Download Marksheet */}
      <Card className="p-5 bg-white border-slate-200 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-slate-900">Official Marksheet</div>
          <div className="text-xs text-slate-500">Download your university-verified examination marksheet as a PDF document.</div>
        </div>
        <Button onClick={generateMarksheetPDF} disabled={downloading} variant="primary">
          {downloading ? "Generating…" : <><Download size={16} className="mr-1.5" /> Download Marksheet</>}
        </Button>
      </Card>

      {result.manualFeedback && result.manualFeedback.length > 0 && (
        <>
          <Eyebrow>Faculty Feedback</Eyebrow>
          <div className="space-y-3">
            {result.manualFeedback.map((fb, i) => (
              <Card key={i} className="p-4 bg-white border-slate-200">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Question:</span>{" "}
                  {result.questions?.find((q) => q._id === fb.question)?.text || fb.question}
                </div>
                <div className="text-xs mt-2">
                  <span className="font-bold text-slate-900">Marks: {fb.marks}</span>
                  {fb.feedback && <span className="text-slate-600 ml-3 italic">"{fb.feedback}"</span>}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   STUDENT DASHBOARD (Full-Width Responsive Grid with Collapsible Sidebar)
   ============================================================ */
function StudentDashboard({ user, submission, activeExam, onStart, onViewResult, onLogout, activeTab, onSelectTab }) {
  const [showAdmitCard, setShowAdmitCard] = useState(activeTab === "admitCard");
  
  useEffect(() => {
    if (activeTab === "admitCard") setShowAdmitCard(true);
  }, [activeTab]);

  const hasResult = submission?.status === "published";
  const finalPct = hasResult ? Math.round((submission.finalScore / totalMarks) * 100) : null;
  const mascot = hasResult ? getMascot(finalPct) : null;
  const examStatus = !submission ? "available" : submission.status === "published" ? "published" : "pending";

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Formal Header Banner - Full Width */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30 uppercase tracking-wider">
              Student Candidate Portal • Enrollment ID: STU-2026-881
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.name || "Student"} 👋
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Department of Computer Science & Applications • 6th Semester Academic Term
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdmitCard(true)}
            className="bg-white hover:bg-slate-100 text-blue-900 px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Download size={16} />
            <span>Download Admit Card / Hall Ticket</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner - 4 Full Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Enrolled Courses" value="5" icon="📚" accent="#2563EB" subtext="Spring Term 2026" />
        <StatCard label="Completed Exams" value={submission ? "1" : "0"} icon="✅" accent="#16A34A" subtext="Evaluated Papers" />
        <StatCard label="Pending Exams" value={!submission ? "1" : "0"} icon="⏳" accent="#D97706" subtext="Action Required" />
        <StatCard label="Cumulative Mark Sheet" value={hasResult ? `${finalPct}%` : "AWAITING"} icon="🏆" accent="#7C3AED" subtext="Official Transcript" />
      </div>

      {/* Mascot / Published Result Banner */}
      {mascot && (
        <Card className="p-6 border-2 border-emerald-300 bg-emerald-50/60 flex items-center gap-6 shadow-sm">
          <div className="text-5xl">{mascot.emoji}</div>
          <div className="flex-1">
            <div className="text-emerald-900 font-bold text-lg mb-0.5">{mascot.title}</div>
            <div className="text-slate-800 text-sm font-semibold">
              Official Score: {submission.finalScore}/{totalMarks} ({finalPct}%)
            </div>
            <div className="text-slate-600 text-xs mt-0.5">{mascot.msg}</div>
          </div>
          <Button variant="success" onClick={onViewResult} className="px-6 py-2.5">
            View Mark Sheet Breakdown
          </Button>
        </Card>
      )}

      {/* Main Full-Width Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Examinations & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          <Eyebrow>Active & Scheduled Examinations</Eyebrow>

          <Card className="p-6 bg-white border-slate-200 shadow-sm hover:border-blue-300 transition-all">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {activeExam?.subject || "No Active Exam"}
                  </span>
                  {examStatus === "available" && <Badge color={COLORS.amber}>Window Open</Badge>}
                  {examStatus === "pending" && <Badge color={COLORS.gold}>Under Evaluation</Badge>}
                  {examStatus === "published" && <Badge color={COLORS.green}>Results Published</Badge>}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{activeExam?.title || "No examinations available"}</h2>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {activeExam?.description || "Check back later for scheduled examinations."}
            </p>

            <div className="grid grid-cols-3 gap-4 p-3.5 bg-slate-50 rounded-xl text-xs font-mono text-slate-700 mb-5 border border-slate-200">
              <div>Duration: <span className="font-bold text-slate-900">{activeExam?.durationMinutes || "—"} Mins</span></div>
              <div>Questions: <span className="font-bold text-slate-900">{activeExam?.questionPool?.countToServe || "—"} Items</span></div>
              <div>Total Marks: <span className="font-bold text-slate-900">{activeExam?.questionPool?.countToServe ? `${activeExam.questionPool.countToServe * 5}*` : "—"}</span></div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                <Shield size={16} className="text-blue-600" />
                <span>AI & Browser Proctoring Enabled (Max 3 Violations)</span>
              </div>

              {examStatus === "available" && activeExam && (
                <Button onClick={() => onStart(activeExam)} className="px-6 py-2.5">
                  Start Examination →
                </Button>
              )}
              {examStatus === "available" && !activeExam && (
                <Button variant="ghost" disabled>
                  No Exams Available
                </Button>
              )}
              {examStatus === "pending" && (
                <Button variant="ghost" disabled>
                  Awaiting Faculty Grading
                </Button>
              )}
              {examStatus === "published" && (
                <Button variant="success" onClick={onViewResult}>
                  View Mark Sheet
                </Button>
              )}
            </div>
          </Card>

          {/* Regulations Card */}
          <Card className="p-6 bg-slate-900 text-white border-none shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-blue-400" size={20} />
              <h3 className="font-bold text-base text-white">University Examination Proctoring Rules</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed list-disc pl-5">
              <li>Candidates must remain within the active browser window during the exam session.</li>
              <li>Switching tabs or minimizing the browser window strictly logs proctoring violations.</li>
              <li>3 violations will result in automatic test script submission.</li>
            </ul>
          </Card>
        </div>

        {/* Right 1 Column: Candidate Details & Notice Board */}
        <div className="space-y-6">
          <Eyebrow>Candidate Verification</Eyebrow>
          <Card className="p-6 bg-white border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
              {user?.name?.charAt(0) || "S"}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{user?.email}</p>

            <div className="space-y-3 text-xs text-left border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600"><span>Department:</span><span className="font-semibold text-slate-900">Computer Science</span></div>
              <div className="flex justify-between text-slate-600"><span>Enrollment:</span><span className="font-semibold text-emerald-600">Active / Enrolled</span></div>
              <div className="flex justify-between text-slate-600"><span>Academic Term:</span><span className="font-semibold text-slate-900">Spring Semester 2026</span></div>
            </div>
          </Card>

          <Eyebrow>Official Notice Board</Eyebrow>
          <Card className="p-5 bg-white border-slate-200 shadow-sm space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs">
              <div className="font-bold text-blue-900 mb-0.5">Mid-Semester Exam Window</div>
              <div className="text-slate-600 leading-relaxed">Computer Networks paper is currently active for 6th-semester candidates.</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="font-bold text-slate-800 mb-0.5">Evaluation Policy</div>
              <div className="text-slate-500 leading-relaxed">Manual subjective scores will be published upon faculty approval.</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hall Ticket Modal */}
      {showAdmitCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl">
            <div className="border-b border-slate-200 pb-4 mb-4 text-center">
              <div className="font-bold text-xs text-blue-600 uppercase tracking-widest">Royal Examination Authority</div>
              <h2 className="text-xl font-extrabold text-slate-900">Official Hall Ticket / Admit Card</h2>
            </div>
            <div className="space-y-3 text-xs text-slate-700 mb-6">
              <div><span className="font-bold">Candidate Name:</span> {user?.name}</div>
              <div><span className="font-bold">Roll Number:</span> 2026-CS-8902</div>
              <div><span className="font-bold">Center Code:</span> MAIN-HALL-A1</div>
              <div><span className="font-bold">Paper Title:</span> Computer Networks Mid-Semester</div>
              <div className="p-4 bg-slate-100 text-center font-mono font-bold tracking-widest text-slate-800 rounded-xl border border-slate-200">
                BARCODE: ||| | |||| || | ||| |||| |
              </div>
            </div>
            <Button className="w-full" onClick={() => setShowAdmitCard(false)}>Close Ticket</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   EXAM PREVIEW & INTERFACE
   ============================================================ */
function ExamSummary({ exam, questions, onBegin, onBack }) {
  const counts = {};
  const questionList = questions || (exam ? [] : MOCK_EXAM.questions);
  const examTitle = exam?.title || MOCK_EXAM.title;
  const examInstructions = exam?.instructions || exam?.description || MOCK_EXAM.instructions;
  const examDuration = exam?.durationMinutes || MOCK_EXAM.durationMinutes;
  const examPassing = exam?.passingMarks ?? MOCK_EXAM.passingMarks;
  const totalQ = questionList.length;
  const totalM = questionList.reduce((s, q) => s + (q.marks ?? q.maxMarks ?? 0), 0);

  questionList.forEach((q) => { counts[q.type] = (counts[q.type] ?? 0) + 1; });

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full p-8 bg-white shadow-xl">
        <Eyebrow>Official Examination Verification</Eyebrow>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{examTitle}</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{examInstructions}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(counts).map(([type, n]) => (
            <div key={type} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{TYPE_LABEL[type] || type}</span>
              <span className="font-bold font-mono text-slate-900">{n} Items</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 grid grid-cols-3 text-center text-xs">
          <div><div className="text-slate-500">Total Marks</div><div className="font-bold text-base text-blue-900">{totalM || totalQ * 5}*</div></div>
          <div><div className="text-slate-500">Duration</div><div className="font-bold text-base text-blue-900">{examDuration} Mins</div></div>
          <div><div className="text-slate-500">Passing Cutoff</div><div className="font-bold text-base text-blue-900">{examPassing}</div></div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onBack}>Cancel</Button>
          <Button className="flex-1 py-3 text-base" onClick={onBegin}>Start Examination Now</Button>
        </div>
      </Card>
    </div>
  );
}

function TimerRing({ fraction, formatted, danger }) {
  const r = 24, c = 2 * Math.PI * r, offset = c * (1 - Math.max(fraction, 0));
  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={danger ? "#DC2626" : "#2563EB"} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <span className={`font-mono text-xs font-bold ${danger ? 'text-red-600' : 'text-slate-900'}`}>{formatted}</span>
    </div>
  );
}

function QuestionInput({ question, value, onChange }) {
  if (question.type === "mcq" || question.type === "true_false") {
    return (
      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const selected = value === idx;
          return (
            <label
              key={idx}
              className={`flex items-center gap-3.5 p-4 rounded-xl cursor-pointer border transition-all ${selected ? 'bg-blue-50/80 border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
            >
              <input type="radio" className="hidden" checked={selected} onChange={() => onChange(idx)} />
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400 bg-white text-slate-600'}`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-sm text-slate-800 font-medium">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === "fill_blank") {
    return (
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your exact response here..."
        className="w-full rounded-xl p-4 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all font-mono"
      />
    );
  }
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={6}
      placeholder="Write your comprehensive response here..."
      className="w-full rounded-xl p-4 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none leading-relaxed"
    />
  );
}

function ExamInterface({ exam, questions, onSubmit }) {
  const questionList = questions || MOCK_EXAM.questions;
  const examId = exam?._id || MOCK_EXAM.examId;
  const examTitle = exam?.title || MOCK_EXAM.title;
  const examDuration = exam?.durationMinutes || MOCK_EXAM.durationMinutes;
  const examMaxViolations = exam?.maxTabSwitchViolations ?? MOCK_EXAM.maxTabSwitchViolations;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [visited, setVisited] = useState({ [questionList[0]?._id]: true });
  const [locked, setLocked] = useState(false);
  const submittedRef = useRef(false);

  const finalize = useCallback((reason) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLocked(true);
    onSubmit(answers, reason);
  }, [answers, onSubmit]);

  const { formatted, fraction, secondsLeft, loading: timerLoading } = useServerCountdown(examId, examDuration * 60, !locked, () => finalize("auto-submitted — time expired"));
  const { violations, banner, dismissBanner } = useTabSwitchDetector(!locked, examMaxViolations, () => finalize("auto-submitted — proctoring violation limit"));

  const currentQuestion = questionList[currentIndex];
  const goTo = (idx) => { setCurrentIndex(idx); setVisited((p) => ({ ...p, [questionList[idx]._id]: true })); };
  const setAnswer = (val) => setAnswers((p) => ({ ...p, [currentQuestion._id]: val }));
  const toggleFlag = () => setFlagged((p) => ({ ...p, [currentQuestion._id]: !p[currentQuestion._id] }));

  const isAnswered = (q) => {
    const v = answers[q._id];
    return v !== undefined && v !== null && v !== "";
  };
  const answeredMap = Object.fromEntries(questionList.filter(isAnswered).map((q) => [q._id, true]));
  const danger = secondsLeft <= 60;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div>
          <div className="font-bold text-slate-900 text-sm tracking-tight">{examTitle}</div>
          <div className="text-xs text-slate-500 font-medium">
            {Object.keys(answeredMap).length} of {questionList.length} Questions Answered
            {timerLoading && <span className="ml-2 text-blue-600 font-semibold animate-pulse">Syncing timer…</span>}
          </div>
        </div>
        <TimerRing fraction={fraction} formatted={timerLoading ? "…" : formatted} danger={danger} />
      </header>

      {banner === "warn" && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between text-xs text-red-700 font-semibold">
          <span>⚠️ Proctoring Alert: Tab switch detected ({violations}/{examMaxViolations}). Further switches will auto-submit.</span>
          <button onClick={dismissBanner} className="underline">Dismiss</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <main className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold font-mono text-blue-600 uppercase">
              Question {currentIndex + 1} of {questionList.length} • {TYPE_LABEL[currentQuestion.type]} ({currentQuestion.marks ?? currentQuestion.maxMarks} Marks)
            </span>
            <button
              onClick={toggleFlag}
              className={`text-xs px-3 py-1 rounded-full border font-semibold ${flagged[currentQuestion._id] ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
            >
              {flagged[currentQuestion._id] ? "★ Flagged" : "☆ Flag for Review"}
            </button>
          </div>

          <p className="text-base font-semibold text-slate-900 mb-6 leading-relaxed">
            {currentQuestion.text}
          </p>

          <div className="mb-8">
            <QuestionInput question={currentQuestion} value={answers[currentQuestion._id]} onChange={setAnswer} />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button variant="ghost" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>
              ← Previous
            </Button>
            {currentIndex < questionList.length - 1 ? (
              <Button onClick={() => goTo(currentIndex + 1)}>Next Question →</Button>
            ) : (
              <Button variant="danger" onClick={() => finalize("submitted")}>Submit Examination</Button>
            )}
          </div>
        </main>

        <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-5 h-fit shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Question Palette</div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {questionList.map((q, idx) => {
              const active = idx === currentIndex;
              const isAns = answeredMap[q._id];
              const isFlag = flagged[q._id];
              return (
                <button
                  key={q._id}
                  onClick={() => goTo(idx)}
                  className={`h-9 w-9 rounded-lg text-xs font-bold font-mono transition-all border ${active ? 'bg-blue-600 text-white border-blue-600' : isFlag ? 'bg-amber-100 text-amber-800 border-amber-300' : isAns ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Answered</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Flagged</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Unanswered</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SubmissionConfirmation({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-white shadow-xl">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Examination Submitted Successfully</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Your responses have been recorded officially. Objective answers have been auto-graded, and subjective answers are sent for faculty review.
        </p>
        <Button onClick={onBack} className="w-full">Return to Dashboard</Button>
      </Card>
    </div>
  );
}

function StudentResult({ submission, onBack }) {
  const pct = Math.round((submission.finalScore / totalMarks) * 100);
  const mascot = getMascot(pct);
  const passed = submission.finalScore >= MOCK_EXAM.passingMarks;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4">← Back to Dashboard</button>
        <Eyebrow>Official Transcript & Score Card</Eyebrow>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{MOCK_EXAM.title}</h1>

        <Card className="p-6 mb-6 bg-white border-slate-200 shadow-sm flex items-center gap-6">
          <div className="text-5xl">{mascot.emoji}</div>
          <div className="flex-1">
            <div className="font-bold text-lg text-slate-900">{mascot.title}</div>
            <div className="text-3xl font-extrabold font-mono text-blue-600 my-1">
              {submission.finalScore} / {totalMarks} <span className="text-sm font-normal text-slate-500">({pct}%)</span>
            </div>
            <div className="text-xs text-slate-500">{mascot.msg}</div>
          </div>
          <Badge color={passed ? COLORS.green : COLORS.red}>{passed ? "Passed" : "Failed"}</Badge>
        </Card>

        <Eyebrow>Detailed Question Breakdown</Eyebrow>
        <div className="space-y-3 mb-8">
          {MOCK_EXAM.questions.map((q, idx) => {
            const auto = submission.autoBreakdown.perQuestion[q._id];
            const manual = submission.manualGrades[q._id];
            const isAuto = AUTO_TYPES.includes(q.type);
            const earned = isAuto ? (auto?.correct ? q.marks : 0) : manual?.marks ?? 0;
            const max = q.marks ?? q.maxMarks;
            return (
              <Card key={q._id} className="p-4 bg-white border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm text-slate-800 font-medium flex-1">{idx + 1}. {q.text}</div>
                  <span className={`font-mono font-bold text-xs ${earned === max ? 'text-emerald-600' : earned > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {earned}/{max} Marks
                  </span>
                </div>
                {!isAuto && manual?.feedback && (
                  <div className="text-xs text-slate-500 italic mt-2 p-2 bg-slate-50 rounded">Faculty Feedback: {manual.feedback}</div>
                )}
              </Card>
            );
          })}
        </div>
        <Button onClick={onBack}>Return to Dashboard</Button>
      </div>
    </div>
  );
}

/* ============================================================
   QUESTION PAPERS — Instructor Exam CRUD
   ============================================================ */
function QuestionPapers({
  exams,
  loading,
  error,
  onRefresh,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onPublishClick,
  questionsMap,
  expandedExamId,
  onToggleQuestions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) {
  if (loading) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight">Question Papers</h1>
          <p className="text-emerald-100 text-sm mt-1">Loading examination records…</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500 text-sm font-medium flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading examination papers…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight">Question Papers</h1>
        </div>
        <Card className="p-8 text-center bg-white border-slate-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Exams</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Button onClick={onRefresh}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Question Papers</h1>
            <p className="text-emerald-100 text-sm mt-1">Manage examination papers</p>
          </div>
          <Button onClick={onCreateClick} className="bg-white hover:bg-slate-100 text-emerald-900 px-5 py-3 rounded-xl font-bold text-xs shadow-md">
            + Create New Exam
          </Button>
        </div>
        <Card className="p-12 text-center bg-white border-slate-200">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No Exams Yet</h2>
          <p className="text-sm text-slate-500 mb-6">No examination papers have been created yet. Click the button above to create your first exam.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Question Papers</h1>
          <p className="text-emerald-100 text-sm mt-1">{exams.length} examination paper{exams.length !== 1 ? "s" : ""} on record</p>
        </div>
        <Button onClick={onCreateClick} className="px-5 py-3 rounded-xl font-bold text-xs shadow-md">
          + Create New Exam
        </Button>
      </div>

      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card key={exam._id} className="p-6 bg-white border-slate-200 hover:border-blue-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">{exam.title}</h2>
                  <Badge color={exam.isPublished ? COLORS.green : COLORS.gold}>
                    {exam.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                {exam.subject && (
                  <p className="text-xs text-slate-500 font-medium mb-3">{exam.subject}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-600 shrink-0" />
                    <span>{exam.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award size={14} className="text-blue-600 shrink-0" />
                    <span>Pass: {exam.passingMarks}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600 shrink-0" />
                    <span>{exam.questionPool?.countToServe || 0} Qs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-600 shrink-0" />
                    <span>{new Date(exam.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" onClick={() => onToggleQuestions(exam._id)}>
                  {expandedExamId === exam._id ? "Hide Questions" : "Questions"}
                </Button>
                {!exam.isPublished && (
                  <Button variant="success" onClick={() => onPublishClick(exam._id)}>
                    Publish
                  </Button>
                )}
                <Button variant="ghost" onClick={() => onEditClick(exam)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDeleteClick(exam)}>
                  Delete
                </Button>
              </div>
            </div>

            {/* Expandable Questions Section */}
            {expandedExamId === exam._id && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Questions ({exam.questionPool?.bank?.length || 0} in bank)
                  </span>
                  <Button variant="ghost" onClick={() => onAddQuestion(exam._id)}>
                    + Add Question
                  </Button>
                </div>

                {(() => {
                  const entry = questionsMap[exam._id];
                  if (!entry) {
                    return (
                      <div className="text-xs text-slate-400 text-center py-4">
                        Click "Questions" to load.
                      </div>
                    );
                  }
                  if (entry.loading) {
                    return (
                      <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500">
                        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading questions…
                      </div>
                    );
                  }
                  if (entry.error) {
                    return (
                      <div className="text-xs text-red-600 text-center py-4">
                        {entry.error} <button onClick={() => onToggleQuestions(exam._id)} className="underline font-semibold ml-1">Retry</button>
                      </div>
                    );
                  }
                  if (!entry.questions || entry.questions.length === 0) {
                    return (
                      <div className="text-xs text-slate-400 text-center py-6">
                        No questions added yet. Click "+ Add Question" above.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {entry.questions.map((q, idx) => (
                        <div key={q._id} className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono font-bold text-slate-900">Q{idx + 1}.</span>
                              <Badge color={q.type === "short_answer" ? COLORS.purple : q.type === "fill_blank" ? COLORS.gold : COLORS.accent}>
                                {q.type === "mcq" ? "MCQ" : q.type === "true_false" ? "T/F" : q.type === "fill_blank" ? "Fill" : "Short"}
                              </Badge>
                              <span className="font-mono text-slate-500">{q.marks ?? q.maxMarks} pts</span>
                            </div>
                            <p className="text-slate-700 truncate">{q.text}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onEditQuestion(exam._id, q)}
                              className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this question?")) {
                                  onDeleteQuestion(exam._id, q._id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   EXAM FORM MODAL — Create / Edit
   ============================================================ */
function ExamFormModal({ open, mode, exam, saving, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "", subject: "", description: "", instructions: "",
    durationMinutes: 60, passingMarks: 30, countToServe: 10,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && exam) {
      setForm({
        title: exam.title || "",
        subject: exam.subject || "",
        description: exam.description || "",
        instructions: exam.instructions || "",
        durationMinutes: exam.durationMinutes || 60,
        passingMarks: exam.passingMarks || 30,
        countToServe: exam.questionPool?.countToServe || 10,
      });
    } else {
      setForm({ title: "", subject: "", description: "", instructions: "", durationMinutes: 60, passingMarks: 30, countToServe: 10 });
    }
    setError("");
  }, [open, mode, exam]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Exam title is required."); return; }
    if (!form.durationMinutes || form.durationMinutes < 1) { setError("Duration must be at least 1 minute."); return; }
    if (form.passingMarks == null || form.passingMarks < 0) { setError("Passing marks must be 0 or more."); return; }
    if (!form.countToServe || form.countToServe < 1) { setError("Questions to serve must be at least 1."); return; }
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 ${open ? "" : "hidden"}`}>
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === "edit" ? "Edit Exam" : "Create New Exam"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-0.5 rounded">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Exam Title *</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. Computer Networks — Mid Semester" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
            <input value={form.subject} onChange={set("subject")} placeholder="e.g. Computer Networks" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Brief exam description…" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Instructions</label>
            <textarea value={form.instructions} onChange={set("instructions")} rows={2} placeholder="Instructions for candidates…" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Duration (min) *</label>
              <input type="number" min={1} value={form.durationMinutes} onChange={set("durationMinutes")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Passing Marks *</label>
              <input type="number" min={0} value={form.passingMarks} onChange={set("passingMarks")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Questions to Serve *</label>
              <input type="number" min={1} value={form.countToServe} onChange={set("countToServe")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
            </div>
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Update Exam" : "Create Exam"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   QUESTION FORM MODAL — Create / Edit
   ============================================================ */
function QuestionFormModal({ open, mode, examId, question, saving, onSave, onClose }) {
  const [form, setForm] = useState({
    type: "mcq", text: "", difficulty: "medium", topic: "", explanation: "",
    options: ["", ""], correctOptionIndex: 0, acceptedAnswers: "",
    marks: 5, maxMarks: 10,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && question) {
      setForm({
        type: question.type || "mcq",
        text: question.text || "",
        difficulty: question.difficulty || "medium",
        topic: question.topic || "",
        explanation: question.explanation || "",
        options: question.options ? [...question.options] : ["", ""],
        correctOptionIndex: question.correctOptionIndex ?? 0,
        acceptedAnswers: question.acceptedAnswers ? question.acceptedAnswers.join(", ") : "",
        marks: question.marks ?? 5,
        maxMarks: question.maxMarks ?? 10,
      });
    } else {
      setForm({
        type: "mcq", text: "", difficulty: "medium", topic: "", explanation: "",
        options: ["", ""], correctOptionIndex: 0, acceptedAnswers: "",
        marks: 5, maxMarks: 10,
      });
    }
    setError("");
  }, [open, mode, question]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setOption = (idx) => (e) => {
    setForm((f) => {
      const opts = [...f.options];
      opts[idx] = e.target.value;
      return { ...f, options: opts };
    });
  };
  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ""] }));
  const removeOption = (idx) => () => {
    setForm((f) => {
      const opts = f.options.filter((_, i) => i !== idx);
      return { ...f, options: opts.length >= 2 ? opts : opts.concat([""]), correctOptionIndex: f.correctOptionIndex >= opts.length ? 0 : f.correctOptionIndex };
    });
  };

  const isOptionType = form.type === "mcq" || form.type === "true_false";
  const isFillType = form.type === "fill_blank";
  const isManualType = form.type === "short_answer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.text.trim()) { setError("Question text is required."); return; }
    if (isOptionType) {
      if (form.options.filter((o) => o.trim()).length < 2) { setError("At least 2 non-empty options are required."); return; }
      if (form.marks == null || form.marks < 0) { setError("Marks must be 0 or more."); return; }
    }
    if (isFillType) {
      if (!form.acceptedAnswers.trim()) { setError("At least one accepted answer is required."); return; }
      if (form.marks == null || form.marks < 0) { setError("Marks must be 0 or more."); return; }
    }
    if (isManualType) {
      if (form.maxMarks == null || form.maxMarks <= 0) { setError("Max marks must be greater than 0."); return; }
    }

    const payload = {
      type: form.type,
      text: form.text.trim(),
      difficulty: form.difficulty,
      topic: form.topic.trim(),
      explanation: form.explanation.trim(),
    };

    if (isOptionType) {
      payload.options = form.options.map((o) => o.trim()).filter((o) => o);
      payload.correctOptionIndex = form.correctOptionIndex;
      payload.marks = Number(form.marks);
    }
    if (isFillType) {
      payload.acceptedAnswers = form.acceptedAnswers.split(",").map((s) => s.trim()).filter((s) => s);
      payload.marks = Number(form.marks);
    }
    if (isManualType) {
      payload.maxMarks = Number(form.maxMarks);
    }

    try {
      await onSave(payload);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 ${open ? "" : "hidden"}`}>
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === "edit" ? "Edit Question" : "Add Question"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-0.5 rounded">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Type */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Question Type *</label>
            <select value={form.type} onChange={set("type")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all">
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="true_false">True / False</option>
              <option value="fill_blank">Fill in the Blank</option>
              <option value="short_answer">Short Answer (Manual)</option>
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Question Text *</label>
            <textarea value={form.text} onChange={set("text")} rows={3} placeholder="Enter the question…" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none" />
          </div>

          {/* Options (MCQ / True/False) */}
          {isOptionType && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Options *</label>
                {form.type === "mcq" && form.options.length < 6 && (
                  <button type="button" onClick={addOption} className="text-xs text-blue-600 font-semibold hover:underline">+ Add Option</button>
                )}
              </div>
              <div className="space-y-2">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={form.correctOptionIndex === idx}
                      onChange={() => setForm((f) => ({ ...f, correctOptionIndex: idx }))}
                      className="shrink-0"
                      title="Mark as correct answer"
                    />
                    <input
                      value={opt}
                      onChange={setOption(idx)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 rounded-lg px-3 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
                    />
                    {form.options.length > 2 && (
                      <button type="button" onClick={removeOption(idx)} className="text-red-400 hover:text-red-600 text-lg font-bold px-1">×</button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Select the radio button next to the correct answer.</p>
            </div>
          )}

          {/* Accepted Answers (Fill in Blank) */}
          {isFillType && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Accepted Answers * (comma-separated)</label>
              <input
                value={form.acceptedAnswers}
                onChange={set("acceptedAnswers")}
                placeholder="e.g. dns, domain name system"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Separate multiple accepted answers with commas.</p>
            </div>
          )}

          {/* Marks / MaxMarks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {isManualType ? "Max Marks *" : "Marks *"}
              </label>
              <input
                type="number"
                min={0}
                value={isManualType ? form.maxMarks : form.marks}
                onChange={set(isManualType ? "maxMarks" : "marks")}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={set("difficulty")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Topic & Explanation */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Topic</label>
            <input value={form.topic} onChange={set("topic")} placeholder="e.g. OSI Model" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Explanation</label>
            <textarea value={form.explanation} onChange={set("explanation")} rows={2} placeholder="Answer explanation (shown after grading)…" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none" />
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Update Question" : "Add Question"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   DELETE CONFIRMATION MODAL (EXAM)
   ============================================================ */
function DeleteConfirmModal({ open, examTitle, deleting, onConfirm, onClose }) {
  return (
    <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 ${open ? "" : "hidden"}`}>
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Delete Exam?</h2>
          <p className="text-sm text-slate-500">
            This will permanently delete <strong className="text-slate-900">"{examTitle}"</strong> and all its associated questions. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting} className="flex-1">
            {deleting ? "Deleting…" : "Delete Exam"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT EXAM HISTORY
   ============================================================ */
function StudentExamHistory({ history, loading, error, onRetry, onViewResult }) {
  if (loading) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight">Results & Transcripts</h1>
          <p className="text-blue-100 text-sm mt-1">Loading your examination history…</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500 text-sm font-medium flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading examination records…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight">Results & Transcripts</h1>
        </div>
        <Card className="p-8 text-center bg-white border-slate-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to Load History</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Button onClick={onRetry}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="w-full space-y-6 pb-12">
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-extrabold tracking-tight">Results & Mark Sheet</h1>
          <p className="text-blue-100 text-sm mt-1">Your official examination records</p>
        </div>
        <Card className="p-12 text-center bg-white border-slate-200">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No Exam History</h2>
          <p className="text-sm text-slate-500 mb-2">You have not attempted any examinations yet.</p>
          <p className="text-xs text-slate-400">Once you complete an exam and results are evaluated, they will appear here.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-tight">Results & Mark Sheet</h1>
        <p className="text-blue-100 text-sm mt-1">{history.length} examination record{history.length !== 1 ? "s" : ""} on file</p>
      </div>

      <div className="grid gap-4">
        {history.map((entry) => {
          const statusColors = {
            "in-progress": { color: COLORS.gold, label: "In Progress" },
            submitted: { color: COLORS.accent, label: "Under Evaluation" },
            graded: { color: COLORS.purple, label: "Graded" },
            published: { color: COLORS.green, label: "Published" },
          };
          const sc = statusColors[entry.status] || statusColors.submitted;
          const pctColor =
            entry.percentage == null
              ? COLORS.textMuted
              : entry.percentage >= 75
              ? COLORS.green
              : entry.percentage >= 50
              ? COLORS.gold
              : COLORS.red;

          return (
            <Card key={entry._id} className="p-6 bg-white border-slate-200 hover:border-blue-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{entry.title}</h2>
                    <Badge color={sc.color}>{sc.label}</Badge>
                    {entry.passed !== null && entry.status === "published" && (
                      <Badge color={entry.passed ? COLORS.green : COLORS.red}>
                        {entry.passed ? "Passed" : "Failed"}
                      </Badge>
                    )}
                  </div>
                  {entry.subject && (
                    <p className="text-xs text-slate-500 font-medium mb-3">{entry.subject}</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-blue-600 shrink-0" />
                      <span>{entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-blue-600 shrink-0" />
                      <span>
                        {entry.status === "published" ? `${entry.score}/${entry.totalMarks}` : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart3 size={14} style={{ color: pctColor }} className="shrink-0" />
                      <span style={{ color: pctColor }} className="font-bold">
                        {entry.percentage != null ? `${entry.percentage}%` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText size={14} className="text-blue-600 shrink-0" />
                      <span>Pass: {entry.passingMarks ?? "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {entry.status === "published" && (
                    <Button variant="primary" onClick={() => onViewResult(entry._id)}>
                      View Details
                    </Button>
                  )}
                  {entry.status !== "published" && (
                    <Button variant="ghost" disabled>
                      Awaiting Results
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   INSTRUCTOR DASHBOARD
   ============================================================ */
function InstructorDashboard({ user, stats, statsLoading, statsError, onRetryStats, exams, onOpenGrading, onLogout }) {
  const publishedExams = (exams || []).filter((e) => e.isPublished);

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-emerald-500/30 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider">
            Faculty Portal • Department of Computer Science
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome, {user?.name || "Dr. Karma Wangchuk"} 👨‍🏫
        </h1>
        <p className="text-emerald-100 text-sm mt-1 max-w-xl">
          Academic Assessment & Grading Management Console
        </p>
      </div>

      {/* Stats Grid */}
      {statsError ? (
        <Card className="p-6 text-center bg-white border-red-200">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm text-red-600 mb-3">{statsError}</p>
          <Button variant="ghost" onClick={onRetryStats}>Retry</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsLoading && !stats ? (
            <>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-5 bg-white border-slate-200 animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
                  <div className="h-8 bg-slate-200 rounded w-12 mb-1" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </Card>
              ))}
            </>
          ) : stats ? (
            <>
              <StatCard label="Total Exams" value={stats.totalExams} icon="📋" accent="#2563EB" subtext="All Papers" />
              <StatCard label="Published" value={stats.publishedExams} icon="✅" accent="#16A34A" subtext="Live for Students" />
              <StatCard label="Drafts" value={stats.draftExams} icon="📝" accent="#D97706" subtext="In Progress" />
              <StatCard label="Total Questions" value={stats.totalQuestions} icon="❓" accent="#7C3AED" subtext="In Bank" />
              <StatCard label="Pending Grading" value={stats.pendingManualGrading} icon="📥" accent={stats.pendingManualGrading > 0 ? "#DC2626" : "#16A34A"} subtext="Needs Review" />
              <StatCard label="Submissions" value={stats.totalSubmissions} icon="📊" accent="#0891B2" subtext="Scripts Received" />
            </>
          ) : null}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Eyebrow>Published Examination Papers</Eyebrow>
          {publishedExams.length === 0 ? (
            <Card className="p-8 text-center bg-white border-slate-200">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm text-slate-500">No published exams yet. Publish an exam from Question Papers first.</p>
            </Card>
          ) : (
            publishedExams.map((exam) => (
              <Card key={exam._id} className="p-6 bg-white border-slate-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{exam.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Subject: {exam.subject || "—"} • Duration: {exam.durationMinutes} min • Pass: {exam.passingMarks}
                    </p>
                  </div>
                  <Badge color={COLORS.green}>Published</Badge>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-5">
                  Questions in bank: {exam.questionPool?.bank?.length || 0} • Questions to serve: {exam.questionPool?.countToServe || 0}
                </div>
                <Button onClick={() => onOpenGrading(exam._id)} className="px-6 py-2.5">
                  View Submissions →
                </Button>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Eyebrow>Instructor Instructions</Eyebrow>
          <Card className="p-5 bg-white border-slate-200 text-xs text-slate-600 leading-relaxed space-y-3">
            <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Evaluation Guidelines</div>
            <p>1. Objective questions are auto-graded by system logic.</p>
            <p>2. Grade subjective questions manually in the grading queue.</p>
            <p>3. Click "Publish Results" once all questions are evaluated.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function GradingQueue({ submissions, activeSubmission, questions, loading, onSelectSubmission, onSaveGrade, onPublishResult, onBack }) {
  const manualQuestions = questions.filter((q) => MANUAL_TYPES.includes(q.type));
  const manualGrades = activeSubmission?.manualGrades || [];
  const gradedIds = new Set(manualGrades.map((g) => g.question?.toString?.() || g.question));
  const allManualGraded = manualQuestions.length > 0 && manualQuestions.every((q) => gradedIds.has(q._id));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4">← Back to Faculty Dashboard</button>
        <Eyebrow>Faculty Grading Console</Eyebrow>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Submission Grading</h1>

        {loading && (
          <div className="flex items-center justify-center py-12 gap-3 text-sm text-slate-500">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </div>
        )}

        {/* Submission List */}
        {!activeSubmission && !loading && (
          <>
            <p className="text-xs text-slate-500 mb-6">{submissions.length} submission{submissions.length !== 1 ? "s" : ""} for this exam</p>
            {submissions.length === 0 ? (
              <Card className="p-12 text-center bg-white border-slate-200">
                <div className="text-5xl mb-4">📭</div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">No Submissions Yet</h2>
                <p className="text-sm text-slate-500">No students have submitted this exam yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <Card key={sub._id} className="p-5 bg-white border-slate-200 hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-900 text-sm">{sub.student?.fullName || sub.student?.name || "Unknown"}</span>
                          <Badge color={sub.status === "published" ? COLORS.green : sub.status === "graded" ? COLORS.purple : COLORS.gold}>
                            {sub.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {sub.student?.email || ""} • Auto: {sub.autoScore}/{sub.autoPossible} • Manual: {sub.manualScore}/{sub.manualPossible || 0}
                          {sub.finalScore != null && ` • Final: ${sub.finalScore}`}
                        </p>
                      </div>
                      <Button onClick={() => onSelectSubmission(sub._id)}>Grade</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Active Grading */}
        {activeSubmission && (
          <>
            <p className="text-xs text-slate-500 mb-2">
              Evaluating: <strong className="text-slate-900">{activeSubmission.student?.fullName || activeSubmission.student?.name || "Student"}</strong>
              {" "}• Status: {activeSubmission.status} • Auto Score: {activeSubmission.autoScore}/{activeSubmission.autoPossible}
              <button onClick={() => onSelectSubmission(null)} className="text-blue-600 font-semibold ml-4 hover:underline">← Back to list</button>
            </p>

            {manualQuestions.length === 0 ? (
              <Card className="p-8 text-center bg-white border-slate-200">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">No Manual Questions</h2>
                <p className="text-sm text-slate-500 mb-4">This exam has no subjective questions requiring manual grading.</p>
                {activeSubmission.status !== "published" && (
                  <Button variant="gold" onClick={() => onPublishResult(activeSubmission._id)}>Publish Result</Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4 mb-8">
                {manualQuestions.map((q, idx) => {
                  const existingGrade = manualGrades.find((g) => (g.question?.toString?.() || g.question) === q._id);
                  const studentAnswer = (activeSubmission.answers || []).find((a) => (a.question?.toString?.() || a.question) === q._id);
                  const answerText = studentAnswer?.textAnswer ?? (studentAnswer?.selectedOptionIndex != null ? q.options?.[studentAnswer.selectedOptionIndex] : null);
                  return (
                    <GradeRow
                      key={q._id}
                      question={q}
                      index={idx}
                      value={existingGrade}
                      answer={answerText}
                      onSave={(marks, feedback) => onSaveGrade(activeSubmission._id, q._id, marks, feedback)}
                    />
                  );
                })}
              </div>
            )}

            {activeSubmission.status !== "published" && manualQuestions.length > 0 && (
              <Card className="p-6 bg-white border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  {allManualGraded ? "✓ All manual questions graded. Ready to publish results." : "Please grade all subjective questions before publishing."}
                </div>
                <Button variant={allManualGraded ? "gold" : "ghost"} disabled={!allManualGraded} onClick={() => onPublishResult(activeSubmission._id)}>
                  Publish Final Mark Sheet
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GradeRow({ question, index, value, answer, onSave }) {
  const [marks, setMarks] = useState(value?.marks ?? "");
  const [feedback, setFeedback] = useState(value?.feedback ?? "");
  const max = question.maxMarks;

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="text-xs font-mono font-bold text-blue-600 mb-2">
        QUESTION {index + 1} • {TYPE_LABEL[question.type]} • MAX {max} MARKS
      </div>
      <p className="text-sm font-semibold text-slate-900 mb-3">{question.text}</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 mb-4 leading-relaxed whitespace-pre-wrap">
        {answer || <span className="text-slate-400 italic">— No Response Submitted —</span>}
      </div>
      <div className="flex gap-4 mb-4">
        <div className="w-32">
          <label className="text-xs font-semibold text-slate-700 block mb-1">Award Marks (/{max})</label>
          <input
            type="number"
            min={0}
            max={max}
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-700 block mb-1">Faculty Remarks / Feedback</label>
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add comments for the candidate..."
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none"
          />
        </div>
      </div>
      <Button variant="ghost" onClick={() => onSave(Math.max(0, Math.min(max, Number(marks) || 0)), feedback)}>
        {value?.marks != null ? "Update Marks" : "Save Grade"}
      </Button>
      {value?.marks != null && <span className="text-xs text-emerald-600 font-bold ml-3">✓ Grade Saved: {value.marks}/{max}</span>}
    </Card>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
/* ============================================================
   ADMIN USER MANAGEMENT
   ============================================================ */
function UserManagement({
  users, loading, error, search, roleFilter,
  onSearchChange, onRoleFilterChange, onRefresh,
  onEdit, onToggleStatus, onDelete,
}) {
  return (
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-tight">User Registry</h1>
        <p className="text-purple-100 text-sm mt-1">Manage all system users</p>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="h-10 rounded-xl px-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Administrators</option>
          </select>
          <Button variant="ghost" onClick={onRefresh}>Refresh</Button>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-sm text-slate-500">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading users…
        </div>
      ) : error ? (
        <Card className="p-8 text-center bg-white border-slate-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Users</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Button onClick={onRefresh}>Retry</Button>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-200">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No Users Found</h2>
          <p className="text-sm text-slate-500">No users match your current filters.</p>
        </Card>
      ) : (
        <Card className="bg-white border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-left">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Department</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold hidden lg:table-cell">Created</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">{u.fullName}</td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">{u.email}</td>
                    <td className="p-4">
                      <Badge color={u.role === "admin" ? COLORS.purple : u.role === "instructor" ? COLORS.green : COLORS.accent}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600 hidden md:table-cell">{u.department || "—"}</td>
                    <td className="p-4">
                      <button
                        onClick={() => onToggleStatus(u._id, u.isActive)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors whitespace-nowrap ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        }`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="p-4 text-slate-500 hidden lg:table-cell whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button onClick={() => onEdit(u)} className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</button>
                      <button onClick={() => onDelete(u._id, u.fullName)} className="text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors ml-1">Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   USER EDIT MODAL
   ============================================================ */
function UserEditModal({ open, user, saving, onSave, onClose }) {
  const [form, setForm] = useState({ fullName: "", email: "", role: "student", department: "", isActive: true });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        role: user.role || "student",
        department: user.department || "",
        isActive: user.isActive ?? true,
      });
    }
    setError("");
  }, [open, user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) { setError("Name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 ${open ? "" : "hidden"}`}>
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold px-2 py-0.5 rounded">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
            <input value={form.fullName} onChange={set("fullName")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email *</label>
            <input value={form.email} onChange={set("email")} type="email" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Role</label>
            <select value={form.role} onChange={set("role")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all">
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
            <input value={form.department} onChange={set("department")} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded" />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">Account Active</label>
          </div>

          {error && <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function AdminDashboard({ user, submission, onLogout }) {
  const [staffForm, setStaffForm] = useState({ fullName: "", email: "", password: "", role: "instructor", department: "Computer Science" });
  const [msg, setMsg] = useState({ text: "", isError: false });
  const [loading, setLoading] = useState(false);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setMsg({ text: "", isError: false });
    if (!staffForm.fullName || !staffForm.email || !staffForm.password) {
      setMsg({ text: "Please fill in all required fields.", isError: true });
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/api/auth/create-staff", staffForm);
      setMsg({ text: res.data.message || "Staff account created successfully!", isError: false });
      setStaffForm({ fullName: "", email: "", password: "", role: "instructor", department: "Computer Science" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to create staff account.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-purple-500/30 text-purple-100 text-xs font-semibold px-3 py-1 rounded-full border border-purple-400/30 uppercase tracking-wider">
            System Administration • Control Console
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Academic System Administration ⚙️
        </h1>
        <p className="text-purple-100 text-sm mt-1 max-w-xl">
          User Management, Staff Provisioning, and System Health Monitoring
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Eyebrow>Staff Account Provisioning Panel</Eyebrow>
          <Card className="p-6 bg-white border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create New Staff Account (Instructor / Admin)</h2>
            <p className="text-xs text-slate-500 mb-6">Provision official faculty or administrator login credentials in the system database.</p>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input value={staffForm.fullName} onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })} placeholder="Dr. Jane Smith" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} placeholder="faculty@college.edu" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Password *</label>
                  <input type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} placeholder="••••••••" className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Role Type *</label>
                  <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none">
                    <option value="instructor">Instructor / Faculty</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>
              {msg.text && (
                <div className={`text-xs p-3 rounded-lg border font-semibold ${msg.isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{msg.text}</div>
              )}
              <Button type="submit" className="px-6 py-2.5" disabled={loading}>{loading ? "Provisioning Account…" : "Provision Staff Account"}</Button>
            </form>
          </Card>
        </div>
        <div className="space-y-6">
          <Eyebrow>System Audit Log</Eyebrow>
          <Card className="p-5 bg-white border-slate-200 text-xs space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">Database Connection</div>
              <div className="text-slate-500">MongoDB Atlas Connected (Healthy)</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">Security / JWT Issuer</div>
              <div className="text-slate-500">Token Verification Active</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP ROUTER
   ============================================================ */
export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // ── All state declarations ──
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [submission, setSubmission] = useState(null);

  // Exam CRUD state
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError, setExamsError] = useState("");
  const [papersModal, setPapersModal] = useState({ open: false, mode: "create", exam: null });
  const [papersSaving, setPapersSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, examId: null, title: "" });
  const [deleting, setDeleting] = useState(false);

  // Question CRUD state
  const [questionsMap, setQuestionsMap] = useState({});
  const [expandedExamId, setExpandedExamId] = useState(null);
  const [questionModal, setQuestionModal] = useState({ open: false, mode: "create", examId: null, question: null });
  const [questionSaving, setQuestionSaving] = useState(false);

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // Student exam history state
  const [myHistory, setMyHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Admin user management state
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userEditModal, setUserEditModal] = useState({ open: false, user: null });
  const [userEditSaving, setUserEditSaving] = useState(false);

  // View single result from history
  const [viewedResult, setViewedResult] = useState(null);
  const [viewingResult, setViewingResult] = useState(false);
  const [currentViewingSubmissionId, setCurrentViewingSubmissionId] = useState(null);

  // Real exam loading (replaces MOCK_EXAM in student flow)
  const [activeExam, setActiveExam] = useState(null);
  const [activeExamQuestions, setActiveExamQuestions] = useState(null);
  const [examStartLoading, setExamStartLoading] = useState(false);

  // Instructor real grading state
  const [gradingExamId, setGradingExamId] = useState(null);
  const [gradingSubmissions, setGradingSubmissions] = useState([]);
  const [activeGradingSubmission, setActiveGradingSubmission] = useState(null);
  const [gradingQuestions, setGradingQuestions] = useState([]);
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (token && savedUser) {
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    setShowLanding(false);

    if (parsedUser.role === "student") {
      setScreen("s-dashboard");
    } else if (parsedUser.role === "instructor") {
      setScreen("i-dashboard");
    } else if (parsedUser.role === "admin") {
      setScreen("a-dashboard");
    }
  }
}, []);

  // ── All handler / API functions ──
  const openGradingForExam = async (examId) => {
    setGradingLoading(true);
    try {
      const res = await API.get(`/submissions/exam/${examId}`);
      setGradingExamId(examId);
      setGradingSubmissions(res.data || []);
      setActiveGradingSubmission(null);
      setGradingQuestions([]);
      setScreen("i-grading");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load submissions.");
    } finally {
      setGradingLoading(false);
    }
  };

  const openGradingSubmission = async (submissionId) => {
    setGradingLoading(true);
    try {
      const res = await API.get(`/submissions/${submissionId}`);
      setActiveGradingSubmission(res.data);
      setGradingQuestions(res.data.questions || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load submission.");
    } finally {
      setGradingLoading(false);
    }
  };

  const saveGrade = async (submissionId, questionId, marks, feedback) => {
    try {
      await API.patch(`/submissions/${submissionId}/grade`, { questionId, marks, feedback });
      // Refresh submission detail
      await openGradingSubmission(submissionId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save grade.");
    }
  };

  const publishResult = async (submissionId) => {
    try {
      await API.post(`/submissions/${submissionId}/publish`);
      // Refresh everything
      await openGradingSubmission(submissionId);
      const res = await API.get(`/submissions/exam/${gradingExamId}`);
      setGradingSubmissions(res.data || []);
      fetchDashboardStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish result.");
    }
  };
  const fetchAvailableExams = async () => {
    try {
      const res = await API.get("/api/exams/available");
      if (res.data?.length > 0) setActiveExam(res.data[0]);
    } catch { /* silent — exam card shows fallback */ }
  };

  const handleStartExam = async (exam) => {
    setExamStartLoading(true);
    try {
      const res = await API.get(`/api/${exam._id}/attempt`);
      setActiveExam(exam);
      setActiveExamQuestions(res.data.questions);
      setScreen("s-summary");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load exam.");
    } finally {
      setExamStartLoading(false);
    }
  };
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const res = await API.get("/addexams/instructor/dashboard");
      setDashboardStats(res.data);
    } catch (err) {
      setStatsError(err.response?.data?.message || "Failed to load dashboard stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMyHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await API.get("/api/submissions/my-history");
      setMyHistory(res.data);
    } catch (err) {
      setHistoryError(err.response?.data?.message || "Failed to load exam history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const params = new URLSearchParams();
      if (userRoleFilter) params.set("role", userRoleFilter);
      if (userSearch.trim()) params.set("search", userSearch.trim());
      const res = await API.get(`/admin/users?${params.toString()}`);
      setAllUsers(res.data);
    } catch (err) {
      setUsersError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await API.patch(`/admin/users/${userId}/status`, { active: !currentActive });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status.");
    }
  };

  const handleUpdateUser = async (userId, formData) => {
    setUserEditSaving(true);
    try {
      await API.put(`/admin/users/${userId}`, formData);
      setUserEditModal({ open: false, user: null });
      await fetchUsers();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update user.");
    } finally {
      setUserEditSaving(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Permanently delete "${userName}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleViewResultDetail = async (submissionId) => {
    setViewingResult(true);
    try {
      const res = await API.get(`/submissions/${submissionId}/result`);
      setViewedResult(res.data);
      setCurrentViewingSubmissionId(submissionId);
      setScreen("s-result-detail");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load result.");
    } finally {
      setViewingResult(false);
    }
  };

  const handleLogin = (u) => {
    setUser({ name: u.name, email: u.email, role: u.role });
    setActiveTab("dashboard");
    setShowLanding(false);
    if (u.role === "student") setScreen("s-dashboard");
    else if (u.role === "instructor") setScreen("i-dashboard");
    else setScreen("a-dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowLanding(true); // Return to your landing page on logout
    setScreen("landing");
  };

  const handleRegistered = (info) => { setPendingRegistration(info); setScreen("student-registered"); };

  const handleExamSubmit = async (answers, reason) => {
    if (!activeExam?._id) {
      alert("No active exam session.");
      return;
    }
    try {
      // Transform client answers { qId: value } → backend format [{ question, selectedOptionIndex?, textAnswer? }]
      const questionLookup = new Map((activeExamQuestions || []).map((q) => [q._id, q]));
      const answersArray = Object.entries(answers).map(([qId, val]) => {
        const q = questionLookup.get(qId);
        const isOptionType = q?.type === "mcq" || q?.type === "true_false";
        return isOptionType
          ? { question: qId, selectedOptionIndex: val }
          : { question: qId, textAnswer: val ?? "" };
      });

      await API.post(`/submissions/${activeExam._id}`, { answers: answersArray });

      setSubmission({ status: "submitted" });
      setScreen("s-confirm");
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed. Please try again.");
    }
  };

  const fetchExams = async () => {
    setExamsLoading(true);
    setExamsError("");
    try {
      const res = await API.get("/api/exams");
      setExams(res.data);
    } catch (err) {
      setExamsError(err.response?.data?.message || "Failed to load exams.");
    } finally {
      setExamsLoading(false);
    }
  };

  const handleCreateExam = async (formData) => {
    setPapersSaving(true);
    try {
      await API.post("/exams", formData);
      setPapersModal({ open: false, mode: "create", exam: null });
      await fetchExams();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create exam.");
    } finally {
      setPapersSaving(false);
    }
  };

  const handleUpdateExam = async (examId, formData) => {
    setPapersSaving(true);
    try {
      await API.put(`/exams/${examId}`, formData);
      setPapersModal({ open: false, mode: "edit", exam: null });
      await fetchExams();
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update exam.");
    } finally {
      setPapersSaving(false);
    }
  };

  const handlePublishExam = async (examId) => {
    try {
      await API.patch(`/exams/${examId}/publish`);
      await fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish exam.");
    }
  };

  const handleDeleteExam = async (examId) => {
    setDeleting(true);
    try {
      await API.delete(`/exams/${examId}`);
      setDeleteConfirm({ open: false, examId: null, title: "" });
      await fetchExams();
    } catch (err) {
      setExamsError(err.response?.data?.message || "Failed to delete exam.");
      setDeleteConfirm({ open: false, examId: null, title: "" });
    } finally {
      setDeleting(false);
    }
  };

  const fetchQuestions = async (examId) => {
    setQuestionsMap((prev) => ({ ...prev, [examId]: { ...prev[examId], loading: true, error: "" } }));
    try {
      const res = await API.get(`/exams/${examId}/questions`);
      setQuestionsMap((prev) => ({ ...prev, [examId]: { questions: res.data, loading: false, error: "" } }));
    } catch (err) {
      setQuestionsMap((prev) => ({ ...prev, [examId]: { ...prev[examId], loading: false, error: err.response?.data?.message || "Failed to load questions." } }));
    }
  };

  const toggleQuestions = (examId) => {
    if (expandedExamId === examId) {
      setExpandedExamId(null);
    } else {
      setExpandedExamId(examId);
      if (!questionsMap[examId]?.questions) {
        fetchQuestions(examId);
      }
    }
  };

  const handleCreateQuestion = async (examId, formData) => {
    setQuestionSaving(true);
    try {
      await API.post(`/exams/${examId}/questions`, formData);
      setQuestionModal({ open: false, mode: "create", examId: null, question: null });
      await fetchQuestions(examId);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create question.");
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleUpdateQuestion = async (examId, questionId, formData) => {
    setQuestionSaving(true);
    try {
      await API.put(`/exams/${examId}/questions/${questionId}`, formData);
      setQuestionModal({ open: false, mode: "edit", examId: null, question: null });
      await fetchQuestions(examId);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update question.");
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleDeleteQuestion = async (examId, questionId) => {
    try {
      await API.delete(`/exams/${examId}/questions/${questionId}`);
      await fetchQuestions(examId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete question.");
    }
  };

  // ── All useEffect hooks ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === "student") setScreen("s-dashboard");
      else if (parsedUser.role === "instructor") setScreen("i-dashboard");
      else if (parsedUser.role === "admin") setScreen("a-dashboard");
    }
  }, []);

  useEffect(() => {
    if (screen === "i-dashboard" && activeTab === "papers") {
      fetchExams();
    }
  }, [screen, activeTab]);

  useEffect(() => {
    if (screen === "i-dashboard" && activeTab === "dashboard") {
      fetchDashboardStats();
      fetchExams();
    }
  }, [screen, activeTab]);

  useEffect(() => {
    if (screen === "s-dashboard" && activeTab === "results") {
      fetchMyHistory();
    }
  }, [screen, activeTab]);

  useEffect(() => {
    if (screen === "a-dashboard" && activeTab === "students") {
      fetchUsers();
    }
  }, [screen, activeTab, userSearch, userRoleFilter]);

  // Auto-fetch available exams when student opens dashboard
  useEffect(() => {
    if (screen === "s-dashboard" && activeTab === "dashboard" && user?.role === "student") {
      fetchAvailableExams();
    }
  }, [screen, activeTab]);

  const isLoggedIn = () => !!localStorage.getItem("token");
  const isDashboardScreen = ["s-dashboard", "i-dashboard", "a-dashboard"].includes(screen);

  // 1. RENDER YOUR NEW LANDING PAGE FIRST
  if (showLanding) {
    return (
      <LandingPage
        onSignIn={() => setShowLanding(false)}
        onGetStarted={() => setShowLanding(false)}
      />
    );
  }

  // 2. TEAMMATE'S EXISTING PORTAL FLOW
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`${FONT_IMPORT} * { box-sizing: border-box; } body { margin: 0; font-family: 'IBM Plex Sans', sans-serif; background-color: #F8FAFC; }`}</style>

      {/* Auth & Registration Screens */}
      {screen === "landing" && (
        <LandingScreen onPickRole={(role) => setScreen(`${role}-login`)} onStudentRegister={() => setScreen("student-register")} />
      )}
      {screen === "student-login" && (
        <RoleLoginScreen role="student" onLogin={handleLogin} onBack={() => setScreen("landing")} onGoToRegister={() => setScreen("student-register")} />
      )}
      {screen === "instructor-login" && (
        <RoleLoginScreen role="instructor" onLogin={handleLogin} onBack={() => setScreen("landing")} />
      )}
      {screen === "admin-login" && (
        <RoleLoginScreen role="admin" onLogin={handleLogin} onBack={() => setScreen("landing")} />
      )}
      {screen === "student-register" && (
        <StudentRegisterScreen onRegistered={handleRegistered} onBack={() => setScreen("landing")} onGoToLogin={() => setScreen("student-login")} />
      )}
      {screen === "student-registered" && pendingRegistration && (
        <StudentRegisteredScreen name={pendingRegistration.name} onContinue={() => setScreen("student-login")} />
      )}

      {/* Main Dashboard Layout with Collapsible Sidebar */}
      {isDashboardScreen && isLoggedIn() && (
        <div className="flex min-h-screen">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            role={user?.role}
            user={user}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader
              user={user}
              role={user?.role}
              onLogout={handleLogout}
              collapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <main className="flex-1 p-8 overflow-y-auto">
              {screen === "s-dashboard" && activeTab !== "results" && (
                <StudentDashboard
                  user={user}
                  submission={submission}
                  activeExam={activeExam}
                  onLogout={handleLogout}
                  onStart={(exam) => handleStartExam(exam)}
                  onViewResult={() => setScreen("s-result")}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                />
              )}
              {screen === "s-dashboard" && activeTab === "results" && (
                <StudentExamHistory
                  history={myHistory}
                  loading={historyLoading}
                  error={historyError}
                  onRetry={fetchMyHistory}
                  onViewResult={handleViewResultDetail}
                />
              )}
              {screen === "i-dashboard" && activeTab === "dashboard" && (
                <InstructorDashboard
                  user={user}
                  stats={dashboardStats}
                  statsLoading={statsLoading}
                  statsError={statsError}
                  onRetryStats={fetchDashboardStats}
                  exams={exams}
                  onLogout={handleLogout}
                  onOpenGrading={openGradingForExam}
                />
              )}
              {screen === "i-dashboard" && activeTab === "grading" && (
                <InstructorDashboard
                  user={user}
                  stats={dashboardStats}
                  statsLoading={statsLoading}
                  statsError={statsError}
                  onRetryStats={fetchDashboardStats}
                  exams={exams}
                  onLogout={handleLogout}
                  onOpenGrading={openGradingForExam}
                />
              )}
              {screen === "i-dashboard" && activeTab === "results" && (
                <InstructorDashboard
                  user={user}
                  stats={dashboardStats}
                  statsLoading={statsLoading}
                  statsError={statsError}
                  onRetryStats={fetchDashboardStats}
                  exams={exams}
                  onLogout={handleLogout}
                  onOpenGrading={openGradingForExam}
                />
              )}
              {screen === "i-dashboard" && activeTab === "papers" && (
                <QuestionPapers
                  exams={exams}
                  loading={examsLoading}
                  error={examsError}
                  onRefresh={fetchExams}
                  onCreateClick={() => setPapersModal({ open: true, mode: "create", exam: null })}
                  onEditClick={(exam) => setPapersModal({ open: true, mode: "edit", exam })}
                  onDeleteClick={(exam) => setDeleteConfirm({ open: true, examId: exam._id, title: exam.title })}
                  onPublishClick={handlePublishExam}
                  questionsMap={questionsMap}
                  expandedExamId={expandedExamId}
                  onToggleQuestions={toggleQuestions}
                  onAddQuestion={(examId) => setQuestionModal({ open: true, mode: "create", examId, question: null })}
                  onEditQuestion={(examId, question) => setQuestionModal({ open: true, mode: "edit", examId, question })}
                  onDeleteQuestion={handleDeleteQuestion}
                />
              )}
              {screen === "a-dashboard" && activeTab !== "students" && (
                <AdminDashboard
                  user={user}
                  submission={submission}
                  onLogout={handleLogout}
                />
              )}
              {screen === "a-dashboard" && activeTab === "students" && (
                <UserManagement
                  users={allUsers}
                  loading={usersLoading}
                  error={usersError}
                  search={userSearch}
                  roleFilter={userRoleFilter}
                  onSearchChange={setUserSearch}
                  onRoleFilterChange={setUserRoleFilter}
                  onRefresh={fetchUsers}
                  onEdit={(u) => setUserEditModal({ open: true, user: u })}
                  onToggleStatus={handleToggleUserStatus}
                  onDelete={handleDeleteUser}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Exam & Grading Standalone Flows */}
      {screen === "s-summary" && (
        <ExamSummary
          exam={activeExam}
          questions={activeExamQuestions}
          onBack={() => setScreen("s-dashboard")}
          onBegin={() => setScreen("s-exam")}
        />
      )}
      {screen === "s-exam" && (
        <ExamInterface
          exam={activeExam}
          questions={activeExamQuestions}
          onSubmit={handleExamSubmit}
        />
      )}
      {screen === "s-confirm" && <SubmissionConfirmation onBack={() => setScreen("s-dashboard")} />}
      {screen === "s-result" && submission?.status === "published" && (
        <StudentResult submission={submission} onBack={() => setScreen("s-dashboard")} />
      )}
      {screen === "s-result-detail" && viewedResult && (
        <div className="flex min-h-screen">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeTab="results"
            onSelectTab={(tab) => { setActiveTab(tab); setScreen("s-dashboard"); }}
            role={user?.role}
            user={user}
            onLogout={handleLogout}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader
              user={user}
              role={user?.role}
              onLogout={handleLogout}
              collapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className="flex-1 p-8 overflow-y-auto">
              <HistoryResultView
                result={viewedResult}
                submissionId={currentViewingSubmissionId}
                onBack={() => setScreen("s-dashboard")}
              />
            </main>
          </div>
        </div>
      )}
      {screen === "i-grading" && (
        <GradingQueue
          submissions={gradingSubmissions}
          activeSubmission={activeGradingSubmission}
          questions={gradingQuestions}
          loading={gradingLoading}
          onSelectSubmission={(id) => id ? openGradingSubmission(id) : setActiveGradingSubmission(null)}
          onSaveGrade={saveGrade}
          onPublishResult={publishResult}
          onBack={() => { setScreen("i-dashboard"); setActiveGradingSubmission(null); setGradingSubmissions([]); }}
        />
      )}

      {/* ── Question Papers Modals ── */}
      <ExamFormModal
        open={papersModal.open}
        mode={papersModal.mode}
        exam={papersModal.exam}
        saving={papersSaving}
        onSave={(formData) =>
          papersModal.mode === "edit"
            ? handleUpdateExam(papersModal.exam._id, formData)
            : handleCreateExam(formData)
        }
        onClose={() => setPapersModal({ open: false, mode: "create", exam: null })}
      />
      <QuestionFormModal
        open={questionModal.open}
        mode={questionModal.mode}
        examId={questionModal.examId}
        question={questionModal.question}
        saving={questionSaving}
        onSave={(formData) =>
          questionModal.mode === "edit"
            ? handleUpdateQuestion(questionModal.examId, questionModal.question._id, formData)
            : handleCreateQuestion(questionModal.examId, formData)
        }
        onClose={() => setQuestionModal({ open: false, mode: "create", examId: null, question: null })}
      />
      <DeleteConfirmModal
        open={deleteConfirm.open}
        examTitle={deleteConfirm.title}
        deleting={deleting}
        onConfirm={() => handleDeleteExam(deleteConfirm.examId)}
        onClose={() => setDeleteConfirm({ open: false, examId: null, title: "" })}
      />
      <UserEditModal
        open={userEditModal.open}
        user={userEditModal.user}
        saving={userEditSaving}
        onSave={(formData) => handleUpdateUser(userEditModal.user._id, formData)}
        onClose={() => setUserEditModal({ open: false, user: null })}
      />
    </div>
  );
}