const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  return (
    <section className="card table-card">
      <div className="section-heading"><div><p className="eyebrow">History</p><h2>Expenses</h2></div><span className="pill">{expenses.length} items</span></div>
      {expenses.length === 0 ? <p className="empty">No expenses match these filters.</p> : (
        <div className="table-scroll">
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {expenses.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(`${item.date}T12:00:00`).toLocaleDateString()}</td>
                  <td>{item.description}</td>
                  <td><span className="pill">{item.category}</span></td>
                  <td className="amount">{money.format(item.amount)}</td>
                  <td className="row-actions">
                    <button className="text-button" onClick={() => onEdit(item)}>Edit</button>
                    <button className="text-button danger" onClick={() => onDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
