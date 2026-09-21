import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "./lib/firebase";

import AuthForm from "./components/AuthForm";
import Navbar from "./components/Navbar";
import ExpenseForm, { categories } from "./components/ExpenseForm";
import ExpenseCharts from "./components/ExpenseCharts";
import ExpenseTable from "./components/ExpenseTable";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);

  const [category, setCategory] = useState("All");
  const [month, setMonth] = useState("All");
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      return undefined;
    }

    const ref = collection(db, "users", user.uid, "expenses");
    const q = query(ref, orderBy("date", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        setExpenses(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }))
        );

        setError("");
      },
      (err) => {
        setError(err.message);
      }
    );
  }, [user]);

  const monthOptions = useMemo(() => {
    return [
      ...new Set(
        expenses
          .filter((expense) => expense.date)
          .map((expense) => expense.date.slice(0, 7))
      ),
    ]
      .sort()
      .reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatch =
        category === "All" || expense.category === category;

      const monthMatch =
        month === "All" ||
        (expense.date && expense.date.startsWith(month));

      return categoryMatch && monthMatch;
    });
  }, [expenses, category, month]);

  const total = filtered.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const avg = filtered.length ? total / filtered.length : 0;

  const topCategory =
    Object.entries(
      filtered.reduce((acc, expense) => {
        acc[expense.category] =
          (acc[expense.category] || 0) + Number(expense.amount);

        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  async function saveExpense(values) {
    if (!user) return;

    try {
      const ref = collection(db, "users", user.uid, "expenses");

      if (editing) {
        await updateDoc(doc(ref, editing.id), {
          ...values,
          updatedAt: serverTimestamp(),
        });

        setEditing(null);
      } else {
        await addDoc(ref, {
          ...values,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeExpense(id) {
    if (!user) return;

    const confirmed = window.confirm("Delete this expense?");
    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "expenses", id)
      );

      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading) {
    return <div className="center-screen">Loading…</div>;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <BrowserRouter>
      <Navbar
        user={user}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((current) => !current)}
        onSignOut={handleSignOut}
      />

      <main className="app-shell">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={
              <>
                <header className="page-header">
                  <p className="eyebrow">Dashboard</p>
                  <h1>Expense Tracker</h1>
                  <p className="muted">
                    Track your spending and review your expenses.
                  </p>
                </header>

                <section className="summary-grid">
                  <article className="summary card">
                    <span>Total spend</span>
                    <strong>{money.format(total)}</strong>
                  </article>

                  <article className="summary card">
                    <span>Average expense</span>
                    <strong>{money.format(avg)}</strong>
                  </article>

                  <article className="summary card">
                    <span>Top category</span>
                    <strong>{topCategory}</strong>
                  </article>
                </section>

                <ExpenseForm
                  editing={editing}
                  onSave={saveExpense}
                  onCancel={() => setEditing(null)}
                />

                <section className="card filters">
                  <label>
                    Category
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>All</option>

                      {categories.map((item) => (
                        <option key={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Month
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option>All</option>

                      {monthOptions.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {new Date(
                            `${item}-02`
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    className="secondary reset"
                    onClick={() => {
                      setCategory("All");
                      setMonth("All");
                    }}
                  >
                    Reset filters
                  </button>
                </section>

                <ExpenseCharts
                  expenses={filtered}
                  darkMode={darkMode}
                />

                <ExpenseTable
                  expenses={filtered}
                  onEdit={setEditing}
                  onDelete={removeExpense}
                />
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <section className="profile-page">
                <div className="page-header">
                  <p className="eyebrow">Account</p>
                  <h1>User Profile</h1>
                  <p className="muted">
                    View your account information.
                  </p>
                </div>

                <div className="card profile-card">
                  <div className="profile-avatar">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>

                  <div className="profile-details">
                    <div>
                      <span className="muted">Email</span>
                      <strong>{user.email}</strong>
                    </div>

                    <div>
                      <span className="muted">
                        Account ID
                      </span>
                      <strong>{user.uid}</strong>
                    </div>

                    <div>
                      <span className="muted">
                        Expenses recorded
                      </span>
                      <strong>{expenses.length}</strong>
                    </div>

                    <div>
                      <span className="muted">
                        Total recorded spending
                      </span>
                      <strong>
                        {money.format(
                          expenses.reduce(
                            (sum, expense) =>
                              sum + Number(expense.amount),
                            0
                          )
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
