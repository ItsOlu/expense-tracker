const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Profile({ user, expenses }) {
  const totalSpending = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return (
    <section className="profile-page">
      <div className="page-header">
        <p className="eyebrow">Account</p>
        <h1>User Profile</h1>
        <p className="muted">View your account information.</p>
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
            <span className="muted">Account ID</span>
            <strong>{user.uid}</strong>
          </div>

          <div>
            <span className="muted">Expenses recorded</span>
            <strong>{expenses.length}</strong>
          </div>

          <div>
            <span className="muted">Total recorded spending</span>
            <strong>{money.format(totalSpending)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
