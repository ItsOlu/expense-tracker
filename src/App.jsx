import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import AuthForm from './components/AuthForm';
import ExpenseForm, { categories } from './components/ExpenseForm';
import ExpenseCharts from './components/ExpenseCharts';
import ExpenseTable from './components/ExpenseTable';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState('All');
  const [month, setMonth] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setAuthLoading(false);
  }), []);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      return undefined;
    }
    const ref = collection(db, 'users', user.uid, 'expenses');
    const q = query(ref, orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setError('');
    }, (err) => setError(err.message));
  }, [user]);

  const monthOptions = useMemo(() => [...new Set(expenses.map((e) => e.date.slice(0, 7)))].sort().reverse(), [expenses]);

  const filtered = useMemo(() => expenses.filter((e) => {
    const categoryMatch = category === 'All' || e.category === category;
    const monthMatch = month === 'All' || e.date.startsWith(month);
    return categoryMatch && monthMatch;
  }), [expenses, category, month]);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const avg = filtered.length ? total / filtered.length : 0;
  const topCategory = Object.entries(filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  async function saveExpense(values) {
    if (!user) return;
    const ref = collection(db, 'users', user.uid, 'expenses');
    if (editing) {
      await updateDoc(doc(ref, editing.id), { ...values, updatedAt: serverTimestamp() });
      setEditing(null);
    } else {
      await addDoc(ref, { ...values, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
  }

  async function removeExpense(id) {
    if (!user) return;
    if (!window.confirm('Delete this expense?')) return;
    await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
  }

  if (authLoading) return <div className="center-screen">Loading…</div>;
  if (!user) return <AuthForm />;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">Dashboard</p><h1>Expense Tracker</h1></div>
        <div className="user-box"><span>{user.email}</span><button className="secondary" onClick={() => signOut(auth)}>Sign out</button></div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="summary-grid">
        <article className="summary card"><span>Total spend</span><strong>{money.format(total)}</strong></article>
        <article className="summary card"><span>Average expense</span><strong>{money.format(avg)}</strong></article>
        <article className="summary card"><span>Top category</span><strong>{topCategory}</strong></article>
      </section>

      <ExpenseForm editing={editing} onSave={saveExpense} onCancel={() => setEditing(null)} />

      <section className="card filters">
        <label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}><option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Month<select value={month} onChange={(e) => setMonth(e.target.value)}><option>All</option>{monthOptions.map((m) => <option key={m} value={m}>{new Date(`${m}-02`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>)}</select></label>
        <button className="secondary reset" onClick={() => { setCategory('All'); setMonth('All'); }}>Reset filters</button>
      </section>

      <ExpenseCharts expenses={filtered} />
      <ExpenseTable expenses={filtered} onEdit={setEditing} onDelete={removeExpense} />
    </main>
  );
}
