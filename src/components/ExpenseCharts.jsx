import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const chartColors = [
  "#0f766e",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#0891b2",
  "#2563eb",
  "#8b5cf6",
  "#f59e0b",
  "#f97316",
  "#e85d75",
];

export default function ExpenseCharts({ expenses }) {
  const byCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const byMonth = expenses.reduce((acc, item) => {
    const key = item.date.slice(0, 7);
    acc[key] = (acc[key] || 0) + item.amount;
    return acc;
  }, {});

  const monthKeys = Object.keys(byMonth).sort().slice(-6);
  const categoryLabels = Object.keys(byCategory);

  const doughnutData = {
  labels: categoryLabels,
  datasets: [
    {
      data: categoryLabels.map((c) => byCategory[c]),
      backgroundColor: chartColors,
      borderColor: "#ffffff",
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
};
 
const barData = {
  labels: monthKeys.map((m) =>
    new Date(`${m}-02`).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    })
  ),
  datasets: [
    {
      label: "Spending",
      data: monthKeys.map((m) => byMonth[m]),
      backgroundColor: "#14b8a6",
      borderColor: "#0f766e",
      borderWidth: 1,
      borderRadius: 8,
      hoverBackgroundColor: "#0f9388",
    },
  ],
};

  const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#365d59",
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) =>
          `${ctx.dataset.label ? `${ctx.dataset.label}: ` : ""}${money.format(ctx.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#688481",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(15, 118, 110, 0.08)",
      },
      ticks: {
        color: "#688481",
        callback: (value) => money.format(value),
      },
    },
  },
};

  return (
    <div className="charts-grid">
      <section className="card chart-card">
        <div className="section-heading"><div><p className="eyebrow">Breakdown</p><h2>By category</h2></div></div>
        <div className="chart-wrap">
          {categoryLabels.length ? 
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#365d59",
                    usePointStyle: true,
                  },
                },
              },
            }}
          />
 : <p className="empty">Add expenses to see this chart.</p>}
        </div>
      </section>
      <section className="card chart-card">
        <div className="section-heading"><div><p className="eyebrow">Trend</p><h2>Last 6 months</h2></div></div>
        <div className="chart-wrap">
          {monthKeys.length ? <Bar data={barData} options={options} /> : <p className="empty">Add expenses to see this chart.</p>}
        </div>
      </section>
    </div>
  );
}
