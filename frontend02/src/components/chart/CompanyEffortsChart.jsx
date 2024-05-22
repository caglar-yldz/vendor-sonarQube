import { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js";
import { useTranslation } from "react-i18next";
import { Button } from "antd";

const CompanyEffortsChart = ({ selectedYear, projects, setSelectedYear }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { t } = useTranslation();

  const monthNames = t("barChart.months", { returnObjects: true });

  useEffect(() => {
    if (projects.length === 0 || !chartRef.current) return;

    const data = prepareChartData(projects);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: monthNames,
        datasets: data.datasets,
      },
      options: {
        scales: {
          y: {
            stacked: false,
            title: {
              display: true,
              text: t("barChart.days"),
            },

            beginAtZero: true,
          },

          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Aylar",
              },
              ticks: {
                callback: function (value, index, values) {
                  return monthNames[value - 1];
                },
              },
            },
          ],
        },
      },
    });
  }, [projects, t]);
  const handlePrevYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    if (selectedYear < currentYear) {
      setSelectedYear(selectedYear + 1);
    }
  };

  const prepareChartData = (projects) => {
    const colorPalette = [
      "#1f77b4", // Mavi
      "#ff7f0e", // Turuncu
      "#2ca02c", // Yeşil
      "#d62728", // Kırmızı
      "#9467bd", // Mor
      "#8c564b", // Kahverengi
      "#e377c2", // Pembe
      "#7f7f7f", // Gri
      "#bcbd22", // Sarı
      "#17becf", // Cyan
    ];

    const datasets = projects.map((project, index) => {
      const dataset = {
        label: project.projectName,
        data: Array.from({ length: 12 }, () => 0),
        backgroundColor: colorPalette[index % colorPalette.length], // Proje sayısına göre renk atama
        borderWidth: 1,
      };

      project.efforts.forEach((effort) => {
        if (effort.year === selectedYear) {
          const monthIndex = effort.month - 1;
          const workHours = parseInt(effort.dayCount, 10) || 0;
          if (effort.effortConfirmation === "approved") {
            dataset.data[monthIndex] += workHours;
          }
        }
      });

      return dataset;
    });

    return { datasets };
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "10px",
        }}
      >
        <Button onClick={handlePrevYear}>{t("barChart.previousYear")} </Button>
        <h2 style={{ margin: "0 20px" }}>{selectedYear}</h2>
        <Button
          onClick={handleNextYear}
          disabled={selectedYear === new Date().getFullYear()}
        >
          {t("barChart.nextYear")}
        </Button>
      </div>
      <div style={{ width: "100%", aspectRatio: "16 / 9" }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default CompanyEffortsChart;
