import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Download, LogOut, RefreshCw, Search } from "lucide-react";
import { weddingDetails } from "../config/weddingDetails";
import { supabase, supabaseConfigError } from "../supabaseClient";
import "./AdminDashboard.css";

type AttendanceStatus = "attending" | "not_attending";

type WeddingRsvp = {
  id: string;
  guest_name: string;
  mobile_number: string;
  number_of_guests: number | null;
  attendance_status: AttendanceStatus;
  attending_events: string[];
  created_at: string;
};

const eventNames = weddingDetails.events.map(({ name }) => name);

function formatSubmissionDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function csvCell(value: string | number) {
  const text = String(value);
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [checkingSession, setCheckingSession] = useState(supabase !== null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loadedResponseKey, setLoadedResponseKey] = useState<string | null>(null);
  const [responses, setResponses] = useState<WeddingRsvp[]>([]);
  const [authMessage, setAuthMessage] = useState("");
  const [dashboardMessage, setDashboardMessage] = useState("");
  const [search, setSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const checkingAdmin = Boolean(user && isAdmin === null);
  const responseRequestKey = user ? `${user.id}:${refreshCount}` : "";
  const loadingResponses = Boolean(
    user && isAdmin && loadedResponseKey !== responseRequestKey,
  );

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;
        if (error) setAuthMessage(`Could not check the current session: ${error.message}`);
        setUser(
          data.session?.user
            ? { id: data.session.user.id, email: data.session.user.email }
            : null,
        );
      } catch (error) {
        if (!active) return;
        console.error("Could not check the Supabase session:", error);
        setAuthMessage("We could not check your login. Please refresh and try again.");
      } finally {
        if (active) setCheckingSession(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      setIsAdmin(null);
      setResponses([]);
      setLoadedResponseKey(null);
      setAuthMessage("");
      setDashboardMessage("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !user) return;

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase.rpc("is_rsvp_admin");
        if (!active) return;
        if (error) {
          console.error("Admin access check failed:", error.message);
          setDashboardMessage("We could not verify administrator access. Check the Supabase setup.");
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        if (!active) return;
        console.error("Admin access check could not reach Supabase:", error);
        setDashboardMessage("We could not verify administrator access. Please try again.");
        setIsAdmin(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!supabase || !user || !isAdmin) return;

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("wedding_rsvps")
          .select(
            "id, guest_name, mobile_number, number_of_guests, attendance_status, attending_events, created_at",
          )
          .order("created_at", { ascending: false });
        if (!active) return;
        if (error) {
          console.error("RSVP records could not be loaded:", error.message);
          setDashboardMessage("We could not load responses. Please refresh and try again.");
        } else {
          setResponses((data ?? []) as WeddingRsvp[]);
          setDashboardMessage("");
        }
      } catch (error) {
        if (!active) return;
        console.error("RSVP records could not be reached:", error);
        setDashboardMessage("We could not load responses. Check your connection and try again.");
      } finally {
        if (active) setLoadedResponseKey(responseRequestKey);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAdmin, responseRequestKey, user]);

  const visibleResponses = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return responses.filter((response) => {
      const matchesSearch =
        !normalizedSearch ||
        response.guest_name.toLocaleLowerCase().includes(normalizedSearch) ||
        response.mobile_number.toLocaleLowerCase().includes(normalizedSearch);
      const matchesAttendance =
        attendanceFilter === "all" ||
        response.attendance_status === attendanceFilter;
      const matchesEvent =
        eventFilter === "all" || response.attending_events.includes(eventFilter);
      return matchesSearch && matchesAttendance && matchesEvent;
    });
  }, [attendanceFilter, eventFilter, responses, search]);

  const acceptedCount = responses.filter(
    ({ attendance_status }) => attendance_status === "attending",
  ).length;
  const declinedCount = responses.length - acceptedCount;
  const guestTotal = responses.reduce(
    (total, response) => total + (response.number_of_guests ?? 0),
    0,
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || loginPending) return;
    setAuthMessage("");
    setLoginPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthMessage(`Sign-in failed: ${error.message}`);
      } else {
        setPassword("");
      }
    } catch (error) {
      console.error("Administrator sign-in could not reach Supabase:", error);
      setAuthMessage("We could not sign in. Check your connection and try again.");
    } finally {
      setLoginPending(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Administrator sign-out failed:", error.message);
        setAuthMessage("We could not sign you out. Please try again.");
      }
    } catch (error) {
      console.error("Administrator sign-out could not reach Supabase:", error);
      setAuthMessage("We could not sign you out. Please try again.");
    }
  };

  const exportCsv = () => {
    const header = [
      "Guest name",
      "Mobile number",
      "Attendance",
      "Number of guests",
      "Attending events",
      "Submitted at",
    ];
    const rows = visibleResponses.map((response) => [
      response.guest_name,
      response.mobile_number,
      response.attendance_status,
      response.number_of_guests ?? "",
      response.attending_events.join("; "),
      response.created_at,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-rsvps.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const refreshResponses = () => {
    if (!supabase || !user || !isAdmin) return;
    setDashboardMessage("");
    setRefreshCount((count) => count + 1);
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="admin-back-link" href="/">
          ← Invitation
        </a>
        <p>KAJAL &amp; SHUBHAM</p>
        <span>PRIVATE RSVP DASHBOARD</span>
      </header>

      {!supabase ? (
        <section className="admin-panel" aria-labelledby="admin-title">
          <p className="admin-eyebrow">ADMIN ACCESS</p>
          <h1 id="admin-title">Connect Supabase to continue</h1>
          <p className="admin-message" role="status">{supabaseConfigError}</p>
        </section>
      ) : checkingSession ? (
        <section className="admin-panel" aria-live="polite">
          Checking your secure session…
        </section>
      ) : !user ? (
        <section className="admin-panel" aria-labelledby="admin-title">
          <p className="admin-eyebrow">PRIVATE ADMINISTRATION</p>
          <h1 id="admin-title">Sign in to view RSVPs</h1>
          <p className="admin-intro">
            Only an administrator account added in Supabase can access guest responses.
          </p>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              <span>Email address</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {authMessage && <p className="admin-error" role="alert">{authMessage}</p>}
            <button type="submit" className="admin-primary-button" disabled={loginPending}>
              {loginPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      ) : checkingAdmin ? (
        <section className="admin-panel" aria-live="polite">
          Verifying administrator access…
        </section>
      ) : !isAdmin ? (
        <section className="admin-panel" aria-labelledby="admin-title">
          <p className="admin-eyebrow">PRIVATE ADMINISTRATION</p>
          <h1 id="admin-title">Administrator access required</h1>
          <p className="admin-intro">
            This signed-in account is not on the RSVP administrator allowlist.
          </p>
          {dashboardMessage && <p className="admin-error" role="alert">{dashboardMessage}</p>}
          <button type="button" className="admin-primary-button" onClick={handleSignOut}>
            Sign out
          </button>
        </section>
      ) : (
        <section className="admin-dashboard" aria-labelledby="admin-title">
          <div className="admin-dashboard-heading">
            <div>
              <p className="admin-eyebrow">YOUR CELEBRATION AT A GLANCE</p>
              <h1 id="admin-title">Guest responses</h1>
              <p className="admin-intro">{user.email}</p>
            </div>
            <button type="button" className="admin-secondary-button" onClick={handleSignOut}>
              <LogOut aria-hidden="true" size={16} /> Sign out
            </button>
          </div>

          <div className="admin-stat-grid" aria-label="RSVP summary">
            <article><span>Accepted responses</span><strong>{acceptedCount}</strong></article>
            <article><span>Declined responses</span><strong>{declinedCount}</strong></article>
            <article><span>Guests attending</span><strong>{guestTotal}</strong></article>
          </div>

          <div className="admin-list-heading">
            <div>
              <h2>All responses</h2>
              <p>{visibleResponses.length} of {responses.length} responses</p>
            </div>
            <div className="admin-toolbar-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={refreshResponses}
                disabled={loadingResponses}
              >
                <RefreshCw aria-hidden="true" size={16} />
                {loadingResponses ? "Refreshing…" : "Refresh"}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={exportCsv}
                disabled={visibleResponses.length === 0}
              >
                <Download aria-hidden="true" size={16} /> Export CSV
              </button>
            </div>
          </div>

          <div className="admin-filters">
            <label className="admin-search">
              <Search aria-hidden="true" size={17} />
              <span className="visually-hidden">Search by guest name or mobile number</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or mobile"
              />
            </label>
            <label>
              <span className="visually-hidden">Filter by attendance</span>
              <select value={attendanceFilter} onChange={(event) => setAttendanceFilter(event.target.value)}>
                <option value="all">All responses</option>
                <option value="attending">Attending</option>
                <option value="not_attending">Not attending</option>
              </select>
            </label>
            <label>
              <span className="visually-hidden">Filter by celebration</span>
              <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
                <option value="all">All celebrations</option>
                {eventNames.map((name) => <option value={name} key={name}>{name}</option>)}
              </select>
            </label>
          </div>

          {dashboardMessage && <p className="admin-error" role="alert">{dashboardMessage}</p>}
          {loadingResponses ? (
            <p className="admin-empty" aria-live="polite">Loading guest responses…</p>
          ) : visibleResponses.length === 0 ? (
            <p className="admin-empty">
              {responses.length === 0
                ? "No responses have been submitted yet."
                : "No responses match these filters."}
            </p>
          ) : (
            <div className="admin-response-list">
              {visibleResponses.map((response) => (
                <article className="admin-response-card" key={response.id}>
                  <div className="admin-response-topline">
                    <h3>{response.guest_name}</h3>
                    <span className={`admin-status admin-status--${response.attendance_status}`}>
                      {response.attendance_status === "attending" ? "Attending" : "Not attending"}
                    </span>
                  </div>
                  <dl>
                    <div><dt>Mobile</dt><dd>{response.mobile_number}</dd></div>
                    <div><dt>Guests</dt><dd>{response.number_of_guests ?? "—"}</dd></div>
                    <div><dt>Submitted</dt><dd>{formatSubmissionDate(response.created_at)}</dd></div>
                  </dl>
                  <div className="admin-event-tags">
                    <span>Celebrations</span>
                    {response.attending_events.length ? (
                      response.attending_events.map((name) => (
                        <span className="admin-event-tag" key={name}>{name}</span>
                      ))
                    ) : (
                      <span className="admin-no-events">None selected</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
