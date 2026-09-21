import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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

export default function ExpenseCharts({ expenses, darkMode = false }) {
  const textColor = darkMode ? "#e8fffb" : "#365d59";
  const mutedColor = darkMode ? "#9bbfba" : "#688481";
  const gridColor = darkMode
    ? "rgba(94, 234, 212, 0.10)"
    : "rgba(15, 118, 110, 0.08)";

  const chartBorderColor = darkMode ? "#102a28" : "#ffffff";

  const tooltipBackground = darkMode ? "#071c1b" : "#123b3b";
  const tooltipText = "#ffffff";

  const byCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const byMonth = expenses.reduce((acc, item) => {
    if (!item.date) return acc;

    const key = item.date.slice(0, 7);
    acc[key] = (acc[key] || 0) + Number(item.amount);

    return acc;
  }, {});

  const monthKeys = Object.keys(byMonth)
    .sort()
    .slice(-6);

  const categoryLabels = Object.keys(byCategory);

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryLabels.map((category) => byCategory[category]),
        backgroundColor: chartColors,
        borderColor: chartBorderColor,
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const barData = {
    labels: monthKeys.map((month) =>
      new Date(`${month}-02`).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Spending",
        data: monthKeys.map((month) => byMonth[month]),
        backgroundColor: darkMode ? "#2dd4bf" : "#14b8a6",
        borderColor: darkMode ? "#5eead4" : "#0f766e",
        hoverBackgroundColor: darkMode ? "#5eead4" : "#0f9388",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 18,
        },
      },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${money.format(ctx.raw)}`,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: textColor,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${money.format(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          color: gridColor,
        },
        ticks: {
          color: mutedColor,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        border: {
          color: gridColor,
        },
        ticks: {
          color: mutedColor,
          callback: (value) => money.format(value),
        },
      },
    },
  };

  return (
    <div className="charts-grid">
      <section className="card chart-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Breakdown</p>
            <h2>By category</h2>
          </div>
        </div>

        <div className="chart-wrap">
          {categoryLabels.length ? (
            <Doughnut
              data={doughnutData}
              options={doughnutOptions}
            />
          ) : (
            <p className="empty">
              Add expenses to see this chart.
            </p>
          )}
        </div>
      </section>

      <section className="card chart-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Trend</p>
            <h2>Last 6 months</h2>
          </div>
        </div>

        <div className="chart-wrap">
          {monthKeys.length ? (
            <Bar
              data={barData}
              options={barOptions}
            />
          ) : (
            <p className="empty">
              Add expenses to see this chart.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}