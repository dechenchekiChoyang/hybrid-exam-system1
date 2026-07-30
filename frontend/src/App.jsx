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
} from "lucide-react";
/* ============================================================
   DESIGN TOKENS — quiet "testing center at night" aesthetic
   ============================================================ */
const COLORS = {
  ink: "#0F1115",
  surface: "#171B22",
  surface2: "#1F2530",
  border: "#2B3140",
  textPrimary: "#EEF1F6",
  textMuted: "#8A93A6",
  accent: "#5B8DEF",
  gold: "#D9A441",
  green: "#3FA66B",
  greenLight: "#8FCB9E",
  amber: "#D9A441",
  red: "#E0574B",
};
const MONO = "'IBM Plex Mono', monospace";
const SANS = "'IBM Plex Sans', sans-serif";
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');`;

/* ============================================================
   MOCK "DATABASE" — stands in for the Prisma/Postgres tables
   (Users, Exams, Questions, Attempts, AutoGrades, ManualGrades,
   FinalResults) described in the spec. One demo student/exam.
   ============================================================ */
const MOCK_USERS = {
  student: { name: "Choyang Dema", email: "student@college.edu" },
  instructor: { name: "Dr. Karma Wangchuk", email: "instructor@college.edu" },
  admin: { name: "System Admin", email: "admin@college.edu" },
};

const MOCK_EXAM = {
  examId: "exam_networks_mid",
  title: "Computer Networks — Mid Semester",
  department: "Computer Applications",
  subject: "Computer Networks",
  description: "Covers OSI layers, routing fundamentals, and transport protocols.",
  instructions: "Answer all questions. Objective questions are graded automatically; written and coding questions are graded manually by your instructor.",
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
  examPin: "483916", // regenerated per exam in the real backend
  questions: [
    { _id: "q1", type: "mcq", text: "Which OSI layer is responsible for routing packets between different networks?", options: ["Data Link", "Network", "Transport", "Session"], correctIndex: 1, marks: 5 },
    { _id: "q2", type: "mcq", text: "What does TCP guarantee that UDP does not?", options: ["Lower latency", "Ordered, reliable delivery", "Smaller header size", "Broadcast support"], correctIndex: 1, marks: 5 },
    { _id: "q3", type: "true_false", text: "A switch operates primarily at Layer 2 of the OSI model.", options: ["True", "False"], correctIndex: 0, marks: 5 },
    { _id: "q4", type: "true_false", text: "UDP establishes a connection before sending data, just like TCP.", options: ["True", "False"], correctIndex: 1, marks: 5 },
    { _id: "q5", type: "fill_blank", text: "The protocol that resolves a domain name to an IP address is called ______.", acceptedAnswers: ["dns", "domain name system"], marks: 5 },
    { _id: "q6", type: "fill_blank", text: "HTTPS uses port number ______ by default.", acceptedAnswers: ["443"], marks: 5 },
    { _id: "q7", type: "short_answer", text: "Briefly explain the purpose of the TCP three-way handshake.", maxMarks: 10 },
    { _id: "q8", type: "short_answer", text: "Compare circuit switching and packet switching, and state which is better suited for modern internet traffic.", maxMarks: 10 },
    { _id: "q9", type: "long_answer", text: "Describe each layer of the OSI model and give one real-world protocol example for each.", maxMarks: 15 },
    { _id: "q10", type: "case_study", text: "A company's office network has frequent packet loss during video calls but not during file transfers. Diagnose likely causes and propose a fix.", maxMarks: 15 },
    { _id: "q11", type: "coding", text: "Write a function that validates whether a given string is a syntactically valid IPv4 address.", maxMarks: 15 },
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
  coding: "Coding",
};
const AUTO_TYPES = ["mcq", "true_false", "fill_blank"];
const MANUAL_TYPES = ["short_answer", "long_answer", "case_study", "coding"];

function normalize(str) {
  return (str ?? "").trim().toLowerCase();
}

// Simulates the server-side auto-grading step. Correctness is computed
// but never sent back to the client until results are published.
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
  if (pct >= 90) return { emoji: "🎉", color: COLORS.green, title: "Excellent work!", msg: "Keep up the outstanding performance!" };
  if (pct >= 75) return { emoji: "😊", color: COLORS.greenLight, title: "Great job!", msg: "You're doing very well!" };
  if (pct >= 50) return { emoji: "🙂", color: COLORS.amber, title: "Nice effort.", msg: "Keep practicing to improve." };
  return { emoji: "😔", color: COLORS.red, title: "Don't give up.", msg: "Review the material and try again." };
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
   PRIMITIVES
   ============================================================ */
function Eyebrow({ children, color }) {
  return (
    <div style={{ fontFamily: MONO, color: color ?? COLORS.textMuted, letterSpacing: "0.14em" }} className="text-[11px] uppercase mb-2">
      {children}
    </div>
  );
}
function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button" }) {
  const styles = {
    primary: {
    background: "#2563EB",
    color: "#ffffff",
    border: "none",
  },
    ghost: { background: "transparent", color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.red, color: "#0B0F17", border: "none" },
    gold: { background: COLORS.gold, color: "#0B0F17", border: "none" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={styles[variant]}
      className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 ${className}`}>
      {children}
    </button>
  );
}
function Card({ children, className = "", style = {} }) {
  return <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, ...style }} className={`rounded-lg ${className}`}>{children}</div>;
}
function StatCard({ label, value, accent }) {
  return (
    <Card className="p-4 flex-1 min-w-[120px]">
      <div style={{ color: COLORS.textMuted }} className="text-xs mb-1">{label}</div>
      <div style={{ color: accent ?? COLORS.textPrimary, fontFamily: MONO }} className="text-2xl font-bold">{value}</div>
    </Card>
  );
}
function Badge({ children, color }) {
  return (
    <span style={{ color, border: `1px solid ${color}`, fontFamily: MONO }} className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
      {children}
    </span>
  );
}
function TopBar({ user, role, onLogout }) {
  return (
    <div style={{ borderBottom: `1px solid ${COLORS.border}` }} className="px-4 py-3 flex items-center justify-between">
      <div style={{ fontFamily: MONO, color: COLORS.textPrimary }} className="text-sm font-semibold tracking-wide">EXAMPORTAL</div>
      <div className="flex items-center gap-3">
        <div style={{ color: COLORS.textMuted }} className="text-xs capitalize">{user.name} · {role}</div>
        <button onClick={onLogout} style={{ color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }} className="text-xs px-2.5 py-1 rounded-md">
          Log out
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   AUTH — landing page + role-specific flows.
   Students can self-register; instructor/admin are login-only
   (those accounts are provisioned by an admin / a DB seed).
   ============================================================ */
const ROLE_META = {
  student: { icon: "🎓", label: "Student", email: MOCK_USERS.student.email },
  instructor: { icon: "👨‍🏫", label: "Instructor", email: MOCK_USERS.instructor.email },
  admin: { icon: "⚙️", label: "Admin", email: MOCK_USERS.admin.email },
};

function AuthShell({ eyebrow, title, subtitle, children, onBack }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: "rgba(23,27,34,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 text-sm hover:text-white transition-colors"
            style={{ color: COLORS.textMuted }}
          >
            ← Back
          </button>
        )}
        <div className="flex justify-center mb-6">
          <div
           className="w-16 h-16 rounded-2xl flex items-center justify-center"
           style={{
             background: "#2563EB",
            }}
          >
            <GraduationCap size={34} color="white" />
          </div>
        </div>

        <Eyebrow>{eyebrow}</Eyebrow>

        <h1
          className="text-3xl font-bold mb-2"
          style={{
            color: COLORS.textPrimary,
            fontFamily: SANS,
          }}
        >
          {title}
        </h1>

        <p
          className="text-sm mb-8 leading-6"
          style={{ color: COLORS.textMuted }}
        >
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
}

// Landing page — the only entry point. Picks a role, then either
// logs in (all roles) or, for students only, offers registration.
function LandingScreen({ onPickRole, onStudentRegister }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{
  background:
    "radial-gradient(circle at top left, rgba(59,130,246,0.15), transparent 35%), radial-gradient(circle at bottom right, rgba(124,58,237,0.15), transparent 35%), linear-gradient(135deg,#020617 0%,#0F172A 45%,#172554 100%)",
}}
    >
      {/* Background Glow */}

<div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/25 blur-[180px] animate-pulse"></div>

<div className="absolute top-16 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600/25 blur-[180px] animate-pulse"></div>

<div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/25 blur-[180px] animate-pulse"></div>

{/* Small Floating Lights */}

<div className="absolute top-24 left-24 w-3 h-3 rounded-full bg-cyan-300 animate-ping"></div>

<div className="absolute top-1/2 right-24 w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>

<div className="absolute bottom-32 left-1/3 w-4 h-4 rounded-full bg-indigo-400 animate-ping"></div>
    

      {/* Glass Card */}
      <div
       className="relative w-full max-w-md rounded-3xl p-8 backdrop-blur-2xl border transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
       style={{
  background: "rgba(17,24,39,0.65)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(96,165,250,0.25)",
  boxShadow:
    "0 0 80px rgba(59,130,246,.30), 0 0 160px rgba(59,130,246,.10)",
}}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl"
            style={{
              background:
                "linear-gradient(135deg,#06B6D4,#2563EB,#4338CA)",
              boxShadow: "0 0 35px rgba(59,130,246,.45)",
            }}
          >
            🎓
          </div>
        </div>

        <p
          className="text-center uppercase tracking-[4px] text-xs mb-3"
          style={{ color: "#7DD3FC" }}
        >
          Hybrid Examination System
        </p>

        <h1
          className="text-4xl font-bold text-center mb-2"
          style={{
            color: "white",
            fontFamily: SANS,
          }}
        >
          Welcome Back
        </h1>

        <p
          className="text-center text-sm mb-8"
          style={{ color: "#94A3B8" }}
        >
          Select your portal to continue.
        </p>

        {/* Role Cards */}

        <div className="space-y-4">

          {[
            {
              key: "student",
              color: "#2563EB",
            },
            {
              key: "instructor",
              color: "#16A34A",
            },
            {
              key: "admin",
              color: "#7C3AED",
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onPickRole(item.key)}
              className="group w-full rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "#111827",
                border: `1px solid ${item.color}55`,
              }}
            >
              <div className="flex items-center justify-between px-5 py-4">

                <div className="flex items-center gap-4">

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      background: `${item.color}22`,
                      color: item.color,
                    }}
                  >
                    {ROLE_META[item.key].icon}
                  </div>

                  <div className="text-left">

                    <h3
                      className="font-semibold"
                      style={{ color: "#F8FAFC" }}
                    >
                      {ROLE_META[item.key].label}
                    </h3>

                    <p
                      className="text-xs"
                      style={{ color: "#94A3B8" }}
                    >
                      Secure Portal Login
                    </p>

                  </div>

                </div>

                <span
                  className="text-xl group-hover:translate-x-1 transition"
                  style={{ color: item.color }}
                >
                  →
                </span>

              </div>
            </button>
          ))}
        </div>

        {/* Register */}

        <div
          className="mt-8 pt-6"
          style={{
            borderTop: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <p
            className="text-sm mb-4"
            style={{ color: "#94A3B8" }}
          >
            New Student?
          </p>

          <button
            onClick={onStudentRegister}
            className="w-full rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg,#06B6D4,#2563EB)",
              color: "white",
              boxShadow: "0 0 25px rgba(59,130,246,.35)",
            }}
          >
            Create Student Account
          </button>

          <p
            className="text-xs mt-5 leading-6"
            style={{ color: "#64748B" }}
          >
            Instructor and Admin accounts are created by the
            System Administrator for security reasons.
          </p>
        </div>
      </div>
    </div>
  );
}

// Shared login form for all three roles — only the copy differs.
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
    setError("Enter both email and password.");
    return;
  }

  try {
    setLoading(true);

    const res = await API.post("/auth/login", {
      email,
      password,
      role,
    });

    const userToSave = {
      name: res.data.user.fullName,
      email: res.data.user.email,
      role: res.data.user.role,
    };
    localStorage.setItem("token", res.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(userToSave)
    );

    onLogin(userToSave);

  } catch (err) {
    setError(
      err.response?.data?.message || "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  const defaultPass = role === "admin" ? "Admin123!" : role === "instructor" ? "Instructor123!" : "Student123!";

  return (
    <AuthShell eyebrow={`${meta.label} sign in`} title={`${meta.icon} ${meta.label} Login`}
      subtitle={role === "instructor" ? "Use the credentials provided by your Admin." : role === "admin" ? "Sign in with an existing Admin account." : "Sign in to your student account."}
      onBack={onBack}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label style={{ color: COLORS.textMuted }} className="text-xs block mb-1.5">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={meta.email} type="email"
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
            className="w-full rounded-md px-3 py-2.5 text-sm outline-none" />
        </div>
        <div>
          <label style={{ color: COLORS.textMuted }} className="text-xs block mb-1.5">Password</label>
          <div className="relative">
            <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••"
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
              className="w-full rounded-md px-3 py-2.5 text-sm outline-none pr-16" />
            <button type="button" onClick={() => setShowPw((v) => !v)} style={{ color: COLORS.textMuted }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <div className="text-right mt-1.5">
            <span style={{ color: COLORS.accent }} className="text-xs cursor-pointer">Forgot password?</span>
          </div>
        </div>

        <div className="p-3 rounded-lg border text-xs leading-relaxed" style={{ background: "rgba(30, 41, 59, 0.5)", borderColor: COLORS.border, color: COLORS.textMuted }}>
          <span className="font-semibold text-slate-200">Default Demo Credentials:</span><br />
          Email: <code className="text-blue-400">{meta.email}</code><br />
          Password: <code className="text-blue-400">{defaultPass}</code>
        </div>

        {error && <div style={{ color: COLORS.red }} className="text-xs">{error}</div>}

        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>

      {role === "student" && (
        <p style={{ color: COLORS.textMuted }} className="text-xs text-center mt-5">
          New Student?{" "}
          <span onClick={onGoToRegister} style={{ color: COLORS.accent }} className="cursor-pointer font-medium">Create Student Account</span>
        </p>
      )}
    </AuthShell>
  );
}

// Student self-registration — the only role that can create its own account.
function StudentRegisterScreen({ onRegistered, onBack, onGoToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", department: "", studentId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.department.trim()) {
      setError("Full name, email, password, and department are required.");
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
    onRegistered({
      name: form.name.trim(),
      email: form.email.trim(),
    });
  } catch (err) {
    setError(
    err.response?.data?.message || "Registration failed."
  );
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthShell
     eyebrow="Student Registration"
     title="Create Student Account"
     subtitle="Fill in the details below to create your account."
     onBack={onBack}
    >
      <form onSubmit={submit} className="space-y-3.5">
        <Field
         label="Full Name"
         value={form.name}
         onChange={set("name")}
        />
        <Field
         label="Email"
         value={form.email}
         onChange={set("email")}
         type="email"
        />
      <div className="mb-5">
        <label
          style={{
            color: COLORS.textPrimary,
            fontWeight: 600,
            marginBottom: "8px",
            display: "block",
            fontSize: "14px",
          }}
        >
          Password <span style={{ color: "#ef4444" }}>*</span>
        </label>

        <div className="relative">
          <input
            value={form.password}
            onChange={set("password")}
            type={showPassword ? "text" : "password"}
            className="w-full h-[52px] rounded-xl bg-slate-900 border border-slate-700 px-4 pr-12 text-white focus:border-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
      <div className="mb-5">
        <label
         style={{
           color: COLORS.textPrimary,
           fontWeight: 600,
           marginBottom: "8px",
           display: "block",
           fontSize: "14px",
          }}
        >
          Confirm Password <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div className="relative">
          <input
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            className="w-full h-[52px] rounded-xl bg-slate-900 border border-slate-700 px-4 pr-12 text-white focus:border-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
             <Eye size={18} />
            )}
          </button>
       </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          value={form.department}
          onChange={set("department")}
          className="w-full h-[52px] rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select Department</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Computer Applications">Computer Applications</option>
          <option value="Physics">Physics</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Commerce">Commerce</option>
          <option value="English">English</option>
        </select>
      </div>
        <Field
        label="Student ID (Optional)"
        value={form.studentId}
        onChange={set("studentId")}
        required={false}
      />

        {error && <div style={{ color: COLORS.red }} className="text-xs">{error}</div>}

        <Button
         type="submit"
         disabled={loading}
         className="w-full mt-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
        >
         {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p style={{ color: COLORS.textMuted }} className="text-xs text-center mt-5">
        Already have an account?{" "}
        <span onClick={onGoToLogin} style={{ color: COLORS.accent }} className="cursor-pointer font-medium">Sign in</span>
      </p>
    </AuthShell>
  );
}

function Field({
  label,
  required = true,
  type = "text",
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-5">
      <label
        style={{
          color: COLORS.textPrimary,
          fontWeight: 600,
          fontSize: "14px",
          display: "block",
          marginBottom: "8px",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              color: "#ef4444",
              marginLeft: "4px",
            }}
          >
            *
          </span>
        )}
      </label>

      <input
        {...inputProps}
        type={type}
        placeholder=""
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "52px",
          background: "#111827",
          color: "#ffffff",
          border: focused
            ? "1px solid #3b82f6"
            : "1px solid #374151",
          borderRadius: "12px",
          padding: "0 16px",
          outline: "none",
          transition: "0.25s",
          fontSize: "15px",
        }}
      />
    </div>
  );
}

// Simple confirmation shown after registration, before the student signs in.
function StudentRegisteredScreen({ name, onContinue }) {
  return (
    <AuthShell eyebrow="Account created" title="You're all set" subtitle={`Welcome, ${name}. Your student account has been created — sign in to continue.`}>
      <Button className="w-full" onClick={onContinue}>Continue to sign in</Button>
    </AuthShell>
  );
}

/* ============================================================
   STUDENT: DASHBOARD
   ============================================================ */
function StudentDashboard({ user, submission, onStart, onViewResult, onLogout }) {
  const hasResult = submission?.status === "published";
  const finalPct = hasResult ? Math.round((submission.finalScore / totalMarks) * 100) : null;
  const mascot = hasResult ? getMascot(finalPct) : null;

  const examStatus = !submission ? "available" : submission.status === "published" ? "published" : "pending";

  return (
    <div className="min-h-screen" style={{ background: COLORS.ink }}>
      <TopBar user={user} role="student" onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Performance mascot — dashboard only, never in exports */}
        {mascot && (
          <Card className="p-6 flex items-center gap-5" style={{ borderColor: mascot.color }}>
            <div className="text-5xl">{mascot.emoji}</div>
            <div>
              <div style={{ color: mascot.color }} className="font-semibold mb-0.5">{mascot.title}</div>
              <div style={{ color: COLORS.textPrimary }} className="text-sm">
                You scored {submission.finalScore}/{totalMarks} ({finalPct}%).
              </div>
              <div style={{ color: COLORS.textMuted }} className="text-xs mt-0.5">{mascot.msg}</div>
            </div>
          </Card>
        )}
        <div className="mb-8">
          <h1
           style={{
             color: COLORS.textPrimary,
             fontSize: "32px",
             fontWeight: "700",
            }}
          >
            Welcome back, {user.name} 👋
          </h1>

          <p
           style={{
             color: COLORS.textMuted,
             marginTop: "8px",
             fontSize: "15px",
            }}
          >
            Manage your examinations and track your academic progress.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Exams"
            value="12"
            accent={COLORS.accent}
         />
          <StatCard
           label="Completed"
           value="8"
           accent={COLORS.green}
         />

          <StatCard
            label="Pending"
            value="4"
            accent={COLORS.gold}
         />

        </div>
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
          </div>
        </div>
        <div>
          <Eyebrow>Exams</Eyebrow>
          <Card className="p-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 style={{ color: COLORS.textPrimary }} className="font-semibold">{MOCK_EXAM.title}</h2>
                {examStatus === "pending" && <Badge color={COLORS.gold}>Pending review</Badge>}
                {examStatus === "published" && <Badge color={COLORS.green}>Published</Badge>}
              </div>
              <p style={{ color: COLORS.textMuted }} className="text-sm mb-3">{MOCK_EXAM.description}</p>
              <div style={{ fontFamily: MONO }} className="flex gap-4 text-xs">
                <span style={{ color: COLORS.textMuted }}>{MOCK_EXAM.durationMinutes} min</span>
                <span style={{ color: COLORS.textMuted }}>{MOCK_EXAM.questions.length} questions</span>
                <span style={{ color: COLORS.textMuted }}>{totalMarks} marks</span>
              </div>
            </div>
            {examStatus === "available" && <Button onClick={onStart}>View exam</Button>}
            {examStatus === "pending" && <Button variant="ghost" disabled>Awaiting grading</Button>}
            {examStatus === "published" && <Button onClick={onViewResult}>View result</Button>}
          </Card>
        </div>

        <div>
          <div className="space-y-6">

  <Card className="p-6">

    <div className="flex flex-col items-center">

      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4"
        style={{
          background: COLORS.accent,
          color: "white",
        }}
      >
        {user.name?.charAt(0)}
      </div>

      <h3
        style={{
          color: COLORS.textPrimary,
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        {user.name}
      </h3>

      <p
        style={{
          color: COLORS.textMuted,
          fontSize: "14px",
          marginBottom: "20px",
        }}
      >
        Student
      </p>

    </div>

    <div className="space-y-4">

      <InfoRow title="Email" value={user.email} />
      <InfoRow title="Department" value="Computer Applications" />
      <InfoRow title="Semester" value="6th Semester" />
      <InfoRow title="Status" value="Active" />

    </div>

  </Card>

</div>
          <Eyebrow>Notifications</Eyebrow>
          <Card className="p-4 space-y-2.5">
            {examStatus === "available" && <NotifRow text="New exam available: Computer Networks — Mid Semester" time="Today" />}
            {examStatus === "pending" && <NotifRow text="Your submission was received and is pending instructor review." time="Just now" />}
            {examStatus === "published" && <NotifRow text="Results for Computer Networks — Mid Semester have been published." time="Just now" />}
            {!submission && <NotifRow text="Upcoming exam window opens soon." time="Yesterday" muted />}
          </Card>
        </div>
      </div>
    </div>
  );
}
function InfoRow({ title, value }) {
  return (
    <div className="flex justify-between items-center">
      <span
        style={{
          color: COLORS.textMuted,
          fontSize: "13px",
        }}
      >
        {title}
      </span>

      <span
        style={{
          color: COLORS.textPrimary,
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        {value}
      </span>
    </div>
  );
}
function NotifRow({ text, time, muted }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: muted ? COLORS.textMuted : COLORS.textPrimary }}>{text}</span>
      <span style={{ color: COLORS.textMuted, fontFamily: MONO }} className="text-xs shrink-0 ml-3">{time}</span>
    </div>
  );
}

/* ============================================================
   STUDENT: EXAM SUMMARY (pre-exam)
   ============================================================ */
function ExamSummary({ onBegin, onBack }) {
  const counts = {};
  MOCK_EXAM.questions.forEach((q) => { counts[q.type] = (counts[q.type] ?? 0) + 1; });

  const tryFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: COLORS.ink }}>
      <Card className="max-w-lg w-full p-8">
        <Eyebrow>Exam summary</Eyebrow>
        <h1 style={{ color: COLORS.textPrimary }} className="text-xl font-semibold mb-1">{MOCK_EXAM.title}</h1>
        <p style={{ color: COLORS.textMuted }} className="text-sm mb-5">{MOCK_EXAM.instructions}</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {Object.entries(counts).map(([type, n]) => (
            <div key={type} style={{ border: `1px solid ${COLORS.border}` }} className="rounded-md px-3 py-2 flex items-center justify-between">
              <span style={{ color: COLORS.textMuted }} className="text-xs">{TYPE_LABEL[type]}</span>
              <span style={{ color: COLORS.textPrimary, fontFamily: MONO }} className="text-xs font-semibold">{n}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }} className="py-3 mb-5 grid grid-cols-3 text-center">
          <div><div style={{ color: COLORS.textMuted }} className="text-xs">Total marks</div><div style={{ color: COLORS.textPrimary, fontFamily: MONO }} className="font-semibold">{totalMarks}</div></div>
          <div><div style={{ color: COLORS.textMuted }} className="text-xs">Duration</div><div style={{ color: COLORS.textPrimary, fontFamily: MONO }} className="font-semibold">{MOCK_EXAM.durationMinutes} min</div></div>
          <div><div style={{ color: COLORS.textMuted }} className="text-xs">Passing</div><div style={{ color: COLORS.textPrimary, fontFamily: MONO }} className="font-semibold">{MOCK_EXAM.passingMarks}</div></div>
        </div>

        <ul style={{ color: COLORS.textMuted }} className="text-xs space-y-2 mb-7 list-disc pl-4">
          <li>Tab-switching, right-click, and copy/paste are disabled and logged once the exam starts. {MOCK_EXAM.maxTabSwitchViolations} tab-switch violations auto-submits your exam.</li>
          <li>Objective questions are graded automatically; short-answer and essay questions are graded by your instructor.</li>
          <li>You will not see your score, correct answers, or grading status until your instructor publishes results.</li>
        </ul>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button variant="ghost" onClick={tryFullscreen}>Enter fullscreen</Button>
          <Button className="flex-1" onClick={onBegin}>Start exam</Button>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   TIMER RING + NAVIGATOR
   ============================================================ */
function TimerRing({ fraction, formatted, danger }) {
  const r = 26, c = 2 * Math.PI * r, offset = c * (1 - Math.max(fraction, 0));
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke={COLORS.border} strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={danger ? COLORS.red : COLORS.accent} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <span style={{ fontFamily: MONO, color: danger ? COLORS.red : COLORS.textPrimary, fontSize: "12px", fontWeight: 600 }}>{formatted}</span>
    </div>
  );
}
function QuestionNavigator({ questions, currentIndex, answered, flagged, visited, onNavigate }) {
  const statusStyle = (q, idx) => {
    if (idx === currentIndex) return { background: COLORS.accent, color: "#0B0F17", border: `1px solid ${COLORS.accent}` };
    if (flagged[q._id]) return { background: "transparent", color: COLORS.gold, border: `1px solid ${COLORS.gold}` };
    if (answered[q._id]) return { background: "transparent", color: COLORS.green, border: `1px solid ${COLORS.green}` };
    if (visited[q._id]) return { background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}` };
    return { background: "transparent", color: COLORS.textMuted, border: `1px dashed ${COLORS.border}` };
  };
  return (
    <aside style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }} className="w-full md:w-60 shrink-0 rounded-lg p-4 h-fit">
      <Eyebrow>Navigator</Eyebrow>
      <div className="grid grid-cols-5 gap-2 mb-5">
        {questions.map((q, idx) => (
          <button key={q._id} onClick={() => onNavigate(idx)} style={{ ...statusStyle(q, idx), fontFamily: MONO }}
            className="h-9 w-9 rounded-full text-xs font-semibold transition-colors">{idx + 1}</button>
        ))}
      </div>
      <div className="space-y-2 text-xs" style={{ color: COLORS.textMuted }}>
        <LegendRow color={COLORS.green} label="Answered" />
        <LegendRow color={COLORS.gold} label="Flagged for review" />
        <LegendRow color={COLORS.textMuted} label="Visited, unanswered" dashed />
        <LegendRow color={COLORS.textMuted} label="Unvisited" dashed faint />
      </div>
    </aside>
  );
}
function LegendRow({ color, label, dashed, faint }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ border: `1px ${dashed ? "dashed" : "solid"} ${color}`, opacity: faint ? 0.5 : 1 }} className="h-3 w-3 rounded-full inline-block" />
      <span>{label}</span>
    </div>
  );
}

/* ============================================================
   STUDENT: EXAM INTERFACE
   ============================================================ */
function QuestionInput({ question, value, onChange }) {
  if (question.type === "mcq" || question.type === "true_false") {
    return (
      <div className="space-y-2.5">
        {question.options.map((opt, idx) => {
          const selected = value === idx;
          return (
            <label key={idx} style={{ border: `1px solid ${selected ? COLORS.accent : COLORS.border}`, background: selected ? "rgba(91,141,239,0.1)" : "transparent" }}
              className="flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors">
              <span style={{ border: `1px solid ${selected ? COLORS.accent : COLORS.textMuted}`, background: selected ? COLORS.accent : "transparent" }} className="h-4 w-4 rounded-full shrink-0" />
              <input type="radio" className="hidden" checked={selected} onChange={() => onChange(idx)} />
              <span style={{ color: COLORS.textPrimary }} className="text-sm">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === "fill_blank") {
    return (
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Type your answer"
        style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
        className="w-full rounded-md px-4 py-3 text-sm outline-none" />
    );
  }
  return (
    <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={5}
      placeholder="Write a short answer…"
      style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
      className="w-full rounded-md px-4 py-3 text-sm outline-none resize-none" />
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
    <div className="min-h-screen" style={{ background: COLORS.ink }}>
      <div style={{ borderBottom: `1px solid ${COLORS.border}` }} className="px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <div style={{ fontFamily: MONO, color: COLORS.textPrimary }} className="text-sm font-semibold">{MOCK_EXAM.title}</div>
          <div style={{ color: COLORS.textMuted }} className="text-xs mt-0.5">
            {Object.keys(answeredMap).length} of {MOCK_EXAM.questions.length} answered
            {violations > 0 && <span style={{ color: COLORS.red }}> · {violations} violation{violations > 1 ? "s" : ""} logged</span>}
          </div>
        </div>
        <TimerRing fraction={fraction} formatted={formatted} danger={danger} />
      </div>

      {banner === "warn" && (
        <div style={{ background: "rgba(224,87,75,0.12)", borderBottom: `1px solid ${COLORS.red}` }} className="px-4 py-2.5 flex items-center justify-between">
          <span style={{ color: COLORS.red }} className="text-xs">Tab-switch detected ({violations}/{MOCK_EXAM.maxTabSwitchViolations}). Further violations will auto-submit your exam.</span>
          <button onClick={dismissBanner} style={{ color: COLORS.red }} className="text-xs font-semibold">Dismiss</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-5">
        <main style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }} className="flex-1 rounded-lg p-6">
          <div className="flex items-start justify-between mb-5">
            <div style={{ fontFamily: MONO, color: COLORS.textMuted }} className="text-xs">
              QUESTION {currentIndex + 1} / {MOCK_EXAM.questions.length} · {TYPE_LABEL[currentQuestion.type]} · {currentQuestion.marks ?? currentQuestion.maxMarks} marks
            </div>
            <button onClick={toggleFlag} style={{ color: flagged[currentQuestion._id] ? COLORS.gold : COLORS.textMuted, border: `1px solid ${flagged[currentQuestion._id] ? COLORS.gold : COLORS.border}` }}
              className="text-xs px-3 py-1 rounded-full shrink-0">{flagged[currentQuestion._id] ? "★ Flagged" : "☆ Flag for review"}</button>
          </div>

          <p style={{ color: COLORS.textPrimary, fontFamily: SANS }} className="text-base mb-6 leading-relaxed">{currentQuestion.text}</p>

          <div className="mb-8">
            <QuestionInput question={currentQuestion} value={answers[currentQuestion._id]} onChange={setAnswer} />
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>Previous</Button>
            {currentIndex < MOCK_EXAM.questions.length - 1
              ? <Button onClick={() => goTo(currentIndex + 1)}>Next</Button>
              : <Button variant="danger" onClick={() => finalize("submitted")}>Submit exam</Button>}
          </div>
        </main>

        <QuestionNavigator questions={MOCK_EXAM.questions} currentIndex={currentIndex} answered={answeredMap} flagged={flagged} visited={visited} onNavigate={goTo} />
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT: SUBMISSION CONFIRMATION (no score shown)
   ============================================================ */
function SubmissionConfirmation({ onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: COLORS.ink }}>
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-4xl mb-4">📥</div>
        <h1 style={{ color: COLORS.textPrimary }} className="text-lg font-semibold mb-3">Your examination has been submitted successfully.</h1>
        <p style={{ color: COLORS.textMuted }} className="text-sm mb-2">Your responses have been saved.</p>
        <p style={{ color: COLORS.textMuted }} className="text-sm mb-2">Objective questions have been graded automatically.</p>
        <p style={{ color: COLORS.textMuted }} className="text-sm mb-6">Subjective questions are pending instructor review.</p>
        <p style={{ color: COLORS.textMuted }} className="text-xs mb-7">Results will be available after they are officially published.</p>
        <Button onClick={onBack}>Back to dashboard</Button>
      </Card>
    </div>
  );
}

/* ============================================================
   STUDENT: PUBLISHED RESULT
   ============================================================ */
function StudentResult({ submission, onBack }) {
  const pct = Math.round((submission.finalScore / totalMarks) * 100);
  const mascot = getMascot(pct);
  const passed = submission.finalScore >= MOCK_EXAM.passingMarks;

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: COLORS.ink }}>
      <div className="max-w-2xl mx-auto">
        <Eyebrow>Published result</Eyebrow>
        <h1 style={{ color: COLORS.textPrimary }} className="text-2xl font-semibold mb-1">{MOCK_EXAM.title}</h1>
        <p style={{ color: COLORS.textMuted }} className="text-sm mb-6">Grading complete — automatic and manual scores combined.</p>

        <Card className="p-6 mb-6 flex items-center gap-5" style={{ borderColor: mascot.color }}>
          <div className="text-5xl">{mascot.emoji}</div>
          <div className="flex-1">
            <div style={{ color: mascot.color }} className="font-semibold mb-0.5">{mascot.title}</div>
            <div style={{ color: COLORS.textPrimary, fontFamily: MONO }} className="text-2xl font-bold">
              {submission.finalScore} / {totalMarks} <span className="text-sm font-normal" style={{ color: COLORS.textMuted }}>({pct}%)</span>
            </div>
            <div style={{ color: COLORS.textMuted }} className="text-xs mt-1">{mascot.msg}</div>
          </div>
          <Badge color={passed ? COLORS.green : COLORS.red}>{passed ? "Pass" : "Fail"}</Badge>
        </Card>

        <Eyebrow>Breakdown</Eyebrow>
        <div className="space-y-2 mb-8">
          {MOCK_EXAM.questions.map((q, idx) => {
            const auto = submission.autoBreakdown.perQuestion[q._id];
            const manual = submission.manualGrades[q._id];
            const isAuto = AUTO_TYPES.includes(q.type);
            const earned = isAuto ? (auto?.correct ? q.marks : 0) : manual?.marks ?? 0;
            const max = q.marks ?? q.maxMarks;
            return (
              <Card key={q._id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p style={{ color: COLORS.textPrimary }} className="text-sm flex-1">{idx + 1}. {q.text}</p>
                  <span style={{ color: earned === max ? COLORS.green : earned > 0 ? COLORS.gold : COLORS.red, fontFamily: MONO }} className="text-xs font-semibold shrink-0">
                    {earned}/{max}
                  </span>
                </div>
                {!isAuto && manual?.feedback && (
                  <p style={{ color: COLORS.textMuted }} className="text-xs mt-2 italic">Instructor feedback: {manual.feedback}</p>
                )}
              </Card>
            );
          })}
        </div>
        <Button onClick={onBack}>Back to dashboard</Button>
      </div>
    </div>
  );
}

/* ============================================================
   INSTRUCTOR: DASHBOARD + GRADING
   ============================================================ */
function InstructorDashboard({ user, submission, onOpenGrading, onLogout }) {
  const manualQuestions = MOCK_EXAM.questions.filter((q) => MANUAL_TYPES.includes(q.type));
  const gradedCount = submission ? manualQuestions.filter((q) => submission.manualGrades[q._id]?.marks != null).length : 0;
  const pendingCount = submission ? manualQuestions.length - gradedCount : 0;

  return (
    <div className="min-h-screen" style={{ background: COLORS.ink }}>
      <TopBar user={user} role="instructor" onLogout={onLogout} />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="flex gap-3 flex-wrap">
          <StatCard label="Assigned courses" value="1" />
          <StatCard label="Submissions" value={submission ? "1" : "0"} />
          <StatCard label="Pending grading" value={pendingCount} accent={pendingCount > 0 ? COLORS.gold : COLORS.green} />
          <StatCard label="Published" value={submission?.status === "published" ? "Yes" : "No"} accent={submission?.status === "published" ? COLORS.green : COLORS.textMuted} />
        </div>

        <div>
          <Eyebrow>Exams</Eyebrow>
          <Card className="p-6 flex items-center justify-between gap-4">
            <div>
              <h2 style={{ color: COLORS.textPrimary }} className="font-semibold mb-1">{MOCK_EXAM.title}</h2>
              <p style={{ color: COLORS.textMuted }} className="text-sm">
                {submission ? `1 submission received · ${pendingCount} question(s) pending manual grading` : "No submissions yet."}
              </p>
            </div>
            <Button onClick={onOpenGrading} disabled={!submission}>Open grading queue</Button>
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
    <div className="min-h-screen px-4 py-8" style={{ background: COLORS.ink }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} style={{ color: COLORS.textMuted }} className="text-xs mb-4">← Back to dashboard</button>
        <Eyebrow>Manual grading</Eyebrow>
        <h1 style={{ color: COLORS.textPrimary }} className="text-xl font-semibold mb-1">{MOCK_EXAM.title}</h1>
        <p style={{ color: COLORS.textMuted }} className="text-sm mb-6">Student: {MOCK_USERS.student.name} · Objective questions already auto-graded.</p>

        <div className="space-y-4 mb-6">
          {manualQuestions.map((q, idx) => (
            <GradeRow key={q._id} question={q} index={idx} value={submission.manualGrades[q._id]} answer={submission.answers[q._id]} onSave={(marks, feedback) => onSave(q._id, marks, feedback)} />
          ))}
        </div>

        <Card className="p-5 flex items-center justify-between">
          <div style={{ color: COLORS.textMuted }} className="text-sm">
            {allGraded ? "All manual questions graded. Ready to publish." : "Grade all manual questions before publishing."}
          </div>
          <Button variant={allGraded ? "gold" : "ghost"} disabled={!allGraded} onClick={onPublish}>Publish results</Button>
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
    <Card className="p-5">
      <div style={{ fontFamily: MONO, color: COLORS.textMuted }} className="text-xs mb-2">
        Q{index + 1} · {TYPE_LABEL[question.type]} · max {max} marks
      </div>
      <p style={{ color: COLORS.textPrimary }} className="text-sm mb-3">{question.text}</p>
      <div style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} className="rounded-md p-3 text-sm mb-4 whitespace-pre-wrap">
        {answer || <span style={{ color: COLORS.textMuted }}>— no response submitted —</span>}
      </div>
      <div className="flex gap-3 mb-3">
        <div className="w-28">
          <label style={{ color: COLORS.textMuted }} className="text-xs block mb-1">Marks (/{max})</label>
          <input type="number" min={0} max={max} value={marks} onChange={(e) => setMarks(e.target.value)}
            style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
            className="w-full rounded-md px-3 py-2 text-sm outline-none" />
        </div>
        <div className="flex-1">
          <label style={{ color: COLORS.textMuted }} className="text-xs block mb-1">Feedback (optional)</label>
          <input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Comment for the student"
            style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }}
            className="w-full rounded-md px-3 py-2 text-sm outline-none" />
        </div>
      </div>
      <Button variant="ghost" onClick={() => onSave(Math.max(0, Math.min(max, Number(marks) || 0)), feedback)}>
        {value?.marks != null ? "Update grade" : "Save grade"}
      </Button>
      {value?.marks != null && <span style={{ color: COLORS.green }} className="text-xs ml-3">Saved: {value.marks}/{max}</span>}
    </Card>
  );
}

/* ============================================================
   ADMIN: DASHBOARD
   ============================================================ */
function AdminDashboard({ user, submission, onLogout }) {
  return (
    <div className="min-h-screen" style={{ background: COLORS.ink }}>
      <TopBar user={user} role="admin" onLogout={onLogout} />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="flex gap-3 flex-wrap">
          <StatCard label="Total exams" value="1" />
          <StatCard label="Instructors" value="1" />
          <StatCard label="Students" value="1" />
          <StatCard label="Results published" value={submission?.status === "published" ? "1" : "0"} accent={submission?.status === "published" ? COLORS.green : COLORS.textMuted} />
        </div>
        <Card className="p-6">
          <p style={{ color: COLORS.textMuted }} className="text-sm leading-relaxed">
            The full admin console — user management, department/course setup, question bank import/export,
            reports, and system settings — is a larger build than fits in this interactive demo. The pieces
            wired up here are the ones that are hardest to get right: role-based dashboards, mixed auto/manual
            grading, the no-answer-disclosure rule during exams, and the manual publish gate. Log in as
            <strong style={{ color: COLORS.textPrimary }}> instructor</strong> to grade the submission, then back in as
            <strong style={{ color: COLORS.textPrimary }}> student</strong> to see the mascot and published result.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  useEffect(() => {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (token && savedUser) {
    const parsedUser = JSON.parse(savedUser);

    setUser(parsedUser);

    if (parsedUser.role === "student") {
      setScreen("s-dashboard");
    } else if (parsedUser.role === "instructor") {
      setScreen("i-dashboard");
    } else if (parsedUser.role === "admin") {
      setScreen("a-dashboard");
    }
  }
}, []);
  const [pendingRegistration, setPendingRegistration] = useState(null); // { name } — shown on the post-register confirmation
  // Single shared "submission" simulates the Attempts/AutoGrades/ManualGrades/FinalResults tables.
  const [submission, setSubmission] = useState(null);

  const handleLogin = (u) => {
  setUser({
    name: u.name,
    email: u.email,
    role: u.role,
  });

  if (u.role === "student") {
    setScreen("s-dashboard");
  } else if (u.role === "instructor") {
    setScreen("i-dashboard");
  } else {
    setScreen("a-dashboard");
  }
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
  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT} * { box-sizing: border-box; } body { margin: 0; }`}</style>

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

      {/* Student flow */}
      {screen === "s-dashboard" && (
        isLoggedIn() ? (
        <StudentDashboard
        user={user}
        submission={submission}
        onLogout={handleLogout}
        onStart={() => setScreen("s-summary")}
        onViewResult={() => setScreen("s-result")}
        />
      ) : (
      <LandingScreen
      onPickRole={(role) => setScreen(`${role}-login`)}
      onStudentRegister={() => setScreen("student-register")}
    />
  )
)}
      {screen === "s-summary" && <ExamSummary onBack={() => setScreen("s-dashboard")} onBegin={() => setScreen("s-exam")} />}
      {screen === "s-exam" && <ExamInterface onSubmit={handleExamSubmit} />}
      {screen === "s-confirm" && <SubmissionConfirmation onBack={() => setScreen("s-dashboard")} />}
      {screen === "s-result" && submission?.status === "published" && (
        <StudentResult submission={submission} onBack={() => setScreen("s-dashboard")} />
      )}

      {/* Instructor flow */}
    {screen === "i-dashboard" && (
      isLoggedIn() ? (
      <InstructorDashboard
      user={user}
      submission={submission}
      onLogout={handleLogout}
      onOpenGrading={() => setScreen("i-grading")}
    />
  ) : (
  <LandingScreen
      onPickRole={(role) => setScreen(`${role}-login`)}
      onStudentRegister={() => setScreen("student-register")}
    />
  )
)}
      {screen === "i-grading" && submission && (
        <GradingQueue submission={submission} onSave={handleSaveGrade} onPublish={handlePublish} onBack={() => setScreen("i-dashboard")} />
      )}

      {/* Admin flow */}
      {screen === "a-dashboard" && (
        isLoggedIn() ? (
        <AdminDashboard
        user={user}
        submission={submission}
        onLogout={handleLogout}
        />
      ) : (
      <LandingScreen
      onPickRole={(role) => setScreen(`${role}-login`)}
      onStudentRegister={() => setScreen("student-register")}
    />
  )
)}
    </div>
  );
}