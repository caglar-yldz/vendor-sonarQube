import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Empty } from "antd";

Chart.register(...registerables);

const LineChart = ({ user, projects }) => {
  const chartRefs = useRef([]);
  const [uniqueProjectIds, setUniqueProjectIds] = useState([]);
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    if (user && user.effortIds) {
      setUniqueProjectIds([
        ...new Set(user.effortIds.map((effort) => effort.projectId)),
      ]);
    }
  }, [user]);

  useEffect(() => {
    charts.forEach((chart) => chart.destroy()); // Destroy old charts before creating new ones
    const newCharts = uniqueProjectIds.map((projectId, index) => {
      const labels = [];
      const data = [];
      const chartRef = chartRefs.current[index];

      user.effortIds.forEach((effort) => {
        if (effort.projectId === projectId) {
          const workHoursNumber = parseFloat(effort.workHours);
          const date = new Date(effort.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          chartData.push({
            name: date,
            [projectId]: workHoursNumber,
          });
        }
      });

      const project = projects.find((project) => project._id === projectId);
      const projectName = project ? project.projectName : "Silinen Proje";

      const datasets = [
        {
          label: projectName,
          data: data,
          borderColor: "green",
          backgroundColor: "green",
          fill: false,
          type: "line",
        },
      ];

      const chartData = {
        labels: labels,
        datasets: datasets,
      };

      const config = {
        type: "line",
        data: chartData,
        options: {
          plugins: {
            title: {
              display: true,
              text: "Aylık Efor Grafiği",
            },
            legend: {
              display: true,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      };

      return new Chart(chartRef, config);
    });

    setCharts(newCharts);
  }, [user, uniqueProjectIds, projects]);

  if (!user || !user.effortIds || user.effortIds.length === 0) {
    return <Empty description="No Data" />;
  }

  return (
    <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
      {uniqueProjectIds.map((projectId, index) => (
        <canvas key={projectId} ref={(el) => (chartRefs.current[index] = el)} />
      ))}
    </div>
  );
};

export default LineChart;
