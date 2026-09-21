import { useEffect, useState } from 'react';

export const categories = ['Housing', 'Food', 'Transport', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Other'];

const empty = {
  description: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().slice(0, 10),
};

export default function ExpenseForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editing) {
      setForm({
        description: editing.description,
        amount: String(editing.amount),
        category: editing.category,
        date: editing.date,
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  function change(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.description.trim() || Number(form.amount) <= 0) return;
    await onSave({
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
    });
    setForm(empty);
  }

  return (
    <form className="card expense-form" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Transaction</p>
          <h2>{editing ? 'Edit expense' : 'Add expense'}</h2>
        </div>
      </div>
      <div className="form-grid">
        <label className="wide">Description<input name="description" value={form.description} onChange={change} placeholder="Groceries" required /></label>
        <label>Amount<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={change} placeholder="0.00" required /></label>
        <label>Category<select name="category" value={form.category} onChange={change}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Date<input name="date" type="date" value={form.date} onChange={change} required /></label>
      </div>
      <div className="actions">
        <button className="primary">{editing ? 'Update expense' : 'Add expense'}</button>
        {editing && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
