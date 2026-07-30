import API from "./services/api";
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
      const res = await API.post("/auth/login", { email, password, role });
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
      await API.post("/auth/register", {
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
   STUDENT DASHBOARD (Full-Width Responsive Grid with Collapsible Sidebar)
   ============================================================ */
function StudentDashboard({ user, submission, onStart, onViewResult, onLogout, activeTab, onSelectTab }) {
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
                    {MOCK_EXAM.subject}
                  </span>
                  {examStatus === "available" && <Badge color={COLORS.amber}>Window Open</Badge>}
                  {examStatus === "pending" && <Badge color={COLORS.gold}>Under Evaluation</Badge>}
                  {examStatus === "published" && <Badge color={COLORS.green}>Results Published</Badge>}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{MOCK_EXAM.title}</h2>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {MOCK_EXAM.description}
            </p>

            <div className="grid grid-cols-3 gap-4 p-3.5 bg-slate-50 rounded-xl text-xs font-mono text-slate-700 mb-5 border border-slate-200">
              <div>Duration: <span className="font-bold text-slate-900">{MOCK_EXAM.durationMinutes} Mins</span></div>
              <div>Questions: <span className="font-bold text-slate-900">{MOCK_EXAM.questions.length} Items</span></div>
              <div>Total Marks: <span className="font-bold text-slate-900">{totalMarks} Marks</span></div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                <Shield size={16} className="text-blue-600" />
                <span>AI & Browser Proctoring Enabled (Max 3 Violations)</span>
              </div>

              {examStatus === "available" && (
                <Button onClick={onStart} className="px-6 py-2.5">
                  Start Examination →
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
function ExamSummary({ onBegin, onBack }) {
  const counts = {};
  MOCK_EXAM.questions.forEach((q) => { counts[q.type] = (counts[q.type] ?? 0) + 1; });

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-xl w-full p-8 bg-white shadow-xl">
        <Eyebrow>Official Examination Verification</Eyebrow>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{MOCK_EXAM.title}</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{MOCK_EXAM.instructions}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(counts).map(([type, n]) => (
            <div key={type} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{TYPE_LABEL[type]}</span>
              <span className="font-bold font-mono text-slate-900">{n} Items</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 grid grid-cols-3 text-center text-xs">
          <div><div className="text-slate-500">Total Marks</div><div className="font-bold text-base text-blue-900">{totalMarks}</div></div>
          <div><div className="text-slate-500">Duration</div><div className="font-bold text-base text-blue-900">{MOCK_EXAM.durationMinutes} Mins</div></div>
          <div><div className="text-slate-500">Passing Cutoff</div><div className="font-bold text-base text-blue-900">{MOCK_EXAM.passingMarks}</div></div>
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

function ExamInterface({ onSubmit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [visited, setVisited] = useState({ [MOCK_EXAM.questions[0]._id]: true });
  const [locked, setLocked] = useState(false);
  const submittedRef = useRef(false);

  const finalize = useCallback((reason) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLocked(true);
    onSubmit(answers, reason);
  }, [answers, onSubmit]);

  const { formatted, fraction, secondsLeft } = useCountdown(MOCK_EXAM.durationMinutes * 60, !locked, () => finalize("auto-submitted — time expired"));
  const { violations, banner, dismissBanner } = useTabSwitchDetector(!locked, MOCK_EXAM.maxTabSwitchViolations, () => finalize("auto-submitted — proctoring violation limit"));

  const currentQuestion = MOCK_EXAM.questions[currentIndex];
  const goTo = (idx) => { setCurrentIndex(idx); setVisited((p) => ({ ...p, [MOCK_EXAM.questions[idx]._id]: true })); };
  const setAnswer = (val) => setAnswers((p) => ({ ...p, [currentQuestion._id]: val }));
  const toggleFlag = () => setFlagged((p) => ({ ...p, [currentQuestion._id]: !p[currentQuestion._id] }));

  const isAnswered = (q) => {
    const v = answers[q._id];
    return v !== undefined && v !== null && v !== "";
  };
  const answeredMap = Object.fromEntries(MOCK_EXAM.questions.filter(isAnswered).map((q) => [q._id, true]));
  const danger = secondsLeft <= 60;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div>
          <div className="font-bold text-slate-900 text-sm tracking-tight">{MOCK_EXAM.title}</div>
          <div className="text-xs text-slate-500 font-medium">
            {Object.keys(answeredMap).length} of {MOCK_EXAM.questions.length} Questions Answered
          </div>
        </div>
        <TimerRing fraction={fraction} formatted={formatted} danger={danger} />
      </header>

      {banner === "warn" && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between text-xs text-red-700 font-semibold">
          <span>⚠️ Proctoring Alert: Tab switch detected ({violations}/{MOCK_EXAM.maxTabSwitchViolations}). Further switches will auto-submit.</span>
          <button onClick={dismissBanner} className="underline">Dismiss</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <main className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold font-mono text-blue-600 uppercase">
              Question {currentIndex + 1} of {MOCK_EXAM.questions.length} • {TYPE_LABEL[currentQuestion.type]} ({currentQuestion.marks ?? currentQuestion.maxMarks} Marks)
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
            {currentIndex < MOCK_EXAM.questions.length - 1 ? (
              <Button onClick={() => goTo(currentIndex + 1)}>Next Question →</Button>
            ) : (
              <Button variant="danger" onClick={() => finalize("submitted")}>Submit Examination</Button>
            )}
          </div>
        </main>

        <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-5 h-fit shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Question Palette</div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {MOCK_EXAM.questions.map((q, idx) => {
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
   INSTRUCTOR DASHBOARD
   ============================================================ */
function InstructorDashboard({ user, submission, onOpenGrading, onLogout }) {
  const manualQuestions = MOCK_EXAM.questions.filter((q) => MANUAL_TYPES.includes(q.type));
  const gradedCount = submission ? manualQuestions.filter((q) => submission.manualGrades[q._id]?.marks != null).length : 0;
  const pendingCount = submission ? manualQuestions.length - gradedCount : 0;

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Assigned Courses" value="3" icon="📖" accent="#059669" subtext="Active Papers" />
        <StatCard label="Total Submissions" value={submission ? "1" : "0"} icon="📥" accent="#2563EB" subtext="Received Scripts" />
        <StatCard label="Pending Manual Grading" value={pendingCount} icon="📝" accent={pendingCount > 0 ? "#D97706" : "#059669"} subtext="Needs Evaluation" />
        <StatCard label="Results Status" value={submission?.status === "published" ? "Published" : "Draft"} icon="📢" accent="#7C3AED" subtext="Grade Sheet Status" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Eyebrow>Active Examination Papers</Eyebrow>
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{MOCK_EXAM.title}</h2>
                <p className="text-xs text-slate-500 mt-1">Subject: {MOCK_EXAM.subject} • Total Marks: {totalMarks}</p>
              </div>
              <Badge color={submission?.status === "published" ? COLORS.green : COLORS.gold}>
                {submission?.status === "published" ? "Published" : "Evaluation Pending"}
              </Badge>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-5">
              {submission ? (
                <div>
                  Candidate <strong className="text-slate-900">{MOCK_USERS.student.name}</strong> submitted a test script. {pendingCount} subjective question(s) require manual evaluation.
                </div>
              ) : (
                "No candidate submissions received yet."
              )}
            </div>

            <Button onClick={onOpenGrading} disabled={!submission} className="px-6 py-2.5">
              Open Faculty Grading Queue →
            </Button>
          </Card>
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

function GradingQueue({ submission, onSave, onPublish, onBack }) {
  const manualQuestions = MOCK_EXAM.questions.filter((q) => MANUAL_TYPES.includes(q.type));
  const allGraded = manualQuestions.every((q) => submission.manualGrades[q._id]?.marks != null);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4">← Back to Faculty Dashboard</button>
        <Eyebrow>Faculty Grading Console</Eyebrow>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{MOCK_EXAM.title}</h1>
        <p className="text-xs text-slate-500 mb-6">Evaluating Candidate: <strong className="text-slate-900">{MOCK_USERS.student.name}</strong></p>

        <div className="space-y-4 mb-8">
          {manualQuestions.map((q, idx) => (
            <GradeRow key={q._id} question={q} index={idx} value={submission.manualGrades[q._id]} answer={submission.answers[q._id]} onSave={(marks, feedback) => onSave(q._id, marks, feedback)} />
          ))}
        </div>

        <Card className="p-6 bg-white border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {allGraded ? "✓ All manual questions graded. Ready to publish results." : "Please grade all subjective questions before publishing."}
          </div>
          <Button variant={allGraded ? "gold" : "ghost"} disabled={!allGraded} onClick={onPublish}>
            Publish Final Mark Sheet
          </Button>
        </Card>
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
      const res = await API.post("/auth/create-staff", staffForm);
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Total Candidates" value="1,280" icon="👨‍🎓" accent="#2563EB" subtext="Enrolled Students" />
        <StatCard label="Faculty Members" value="48" icon="👨‍🏫" accent="#7C3AED" subtext="Instructors & Evaluation Staff" />
        <StatCard label="Active Examinations" value="24" icon="📋" accent="#059669" subtext="Live Papers" />
        <StatCard label="System Status" value="HEALTHY" icon="⚡" accent="#16A34A" subtext="99.9% Uptime" />
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
                  <input
                    value={staffForm.fullName}
                    onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="faculty@college.edu"
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Password *</label>
                  <input
                    type="password"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Role Type *</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  >
                    <option value="instructor">Instructor / Faculty</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              {msg.text && (
                <div className={`text-xs p-3 rounded-lg border font-semibold ${msg.isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {msg.text}
                </div>
              )}

              <Button type="submit" className="px-6 py-2.5" disabled={loading}>
                {loading ? "Provisioning Account..." : "Provision Staff Account"}
              </Button>
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
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [submission, setSubmission] = useState(null);

  const handleLogin = (u) => {
    setUser({ name: u.name, email: u.email, role: u.role });
    setActiveTab("dashboard");
    if (u.role === "student") setScreen("s-dashboard");
    else if (u.role === "instructor") setScreen("i-dashboard");
    else setScreen("a-dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setScreen("landing");
  };

  const handleRegistered = (info) => { setPendingRegistration(info); setScreen("student-registered"); };

  const handleExamSubmit = (answers, reason) => {
    const autoBreakdown = autoGrade(answers);
    setSubmission({
      answers, autoBreakdown, manualGrades: {}, status: "submitted",
      submittedAt: new Date().toISOString(), reason,
    });
    setScreen("s-confirm");
  };

  const handleSaveGrade = (qid, marks, feedback) => {
    setSubmission((prev) => ({ ...prev, manualGrades: { ...prev.manualGrades, [qid]: { marks, feedback } } }));
  };

  const handlePublish = () => {
    const manualScore = Object.values(submission.manualGrades).reduce((s, g) => s + (g.marks ?? 0), 0);
    const finalScore = submission.autoBreakdown.autoScore + manualScore;
    setSubmission((prev) => ({ ...prev, status: "published", finalScore }));
    setScreen("i-dashboard");
  };

  const isLoggedIn = () => !!localStorage.getItem("token");
  const isDashboardScreen = ["s-dashboard", "i-dashboard", "a-dashboard"].includes(screen);

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
              {screen === "s-dashboard" && (
                <StudentDashboard
                  user={user}
                  submission={submission}
                  onLogout={handleLogout}
                  onStart={() => setScreen("s-summary")}
                  onViewResult={() => setScreen("s-result")}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                />
              )}
              {screen === "i-dashboard" && (
                <InstructorDashboard
                  user={user}
                  submission={submission}
                  onLogout={handleLogout}
                  onOpenGrading={() => setScreen("i-grading")}
                />
              )}
              {screen === "a-dashboard" && (
                <AdminDashboard
                  user={user}
                  submission={submission}
                  onLogout={handleLogout}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Exam & Grading Standalone Flows */}
      {screen === "s-summary" && <ExamSummary onBack={() => setScreen("s-dashboard")} onBegin={() => setScreen("s-exam")} />}
      {screen === "s-exam" && <ExamInterface onSubmit={handleExamSubmit} />}
      {screen === "s-confirm" && <SubmissionConfirmation onBack={() => setScreen("s-dashboard")} />}
      {screen === "s-result" && submission?.status === "published" && (
        <StudentResult submission={submission} onBack={() => setScreen("s-dashboard")} />
      )}
      {screen === "i-grading" && submission && (
        <GradingQueue submission={submission} onSave={handleSaveGrade} onPublish={handlePublish} onBack={() => setScreen("i-dashboard")} />
      )}
    </div>
  );
}