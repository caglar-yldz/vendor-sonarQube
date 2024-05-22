import { useRef, useEffect, useState, useContext } from "react";
import { Chart, registerables } from "chart.js";
import { Empty, Button } from "antd";
import GlobalContext from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

Chart.register(...registerables);

const StackedBarChart = ({ user }) => {
  const chartRef = useRef(null);
  const { projects } = useContext(GlobalContext);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { t } = useTranslation();

  const months = t('barChart.months', { returnObjects: true });

  useEffect(() => {
    if (user && user.effortIds && chartRef.current && projects) {
      const monthlyWorkHours = {};

      user.effortIds.forEach((effort) => {
        const effortYear = effort.year;
        const projectName =
          projects.find((project) => project._id === effort.projectId)
            ?.projectName || "silinmiş proje";
        if (
          effortYear === selectedYear &&
          effort.effortConfirmation === "approved"
        ) {
          const monthKey = `${effort.month}-${effortYear}`;
          if (!monthlyWorkHours[monthKey]) {
            monthlyWorkHours[monthKey] = {};
          }
          if (!monthlyWorkHours[monthKey][projectName]) {
            monthlyWorkHours[monthKey][projectName] = 0;
          }
          monthlyWorkHours[monthKey][projectName] += parseFloat(
            effort.dayCount
          );
        }
      });

      const datasets = projects.map((project) => {
        const projectName = project.projectName || "silinmiş proje";
        const data = months.map((month, index) => {
          const monthKey = `${index + 1}-${selectedYear}`;
          return monthlyWorkHours[monthKey]?.[projectName] || 0;
        });

        const randomColor =
          "#" + Math.floor(Math.random() * 16777215).toString(16);

        return {
          label: projectName,
          data: data,
          backgroundColor: randomColor,
          borderColor: randomColor,
          borderWidth: 1,
        };
      });

      const chartData = {
        labels: months,
        datasets: datasets,
      };

      const config = {
        type: "bar",
        data: chartData,
        options: {
          plugins: {
            title: {
              display: true,
              text: t("barChart.monthlyEffortGraph"),
            },
            legend: {
              display: true,
            },
          },
          scales: {
            y: {
              stacked: false,
              title: {
                display: true,
                text: t("barChart.days"),
              },
            },
          },
        },
      };

      const chart = new Chart(chartRef.current, config);

      return () => chart.destroy();
    }
  }, [user, projects, selectedYear]);

  const handlePrevYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    if (selectedYear < currentYear) {
      setSelectedYear(selectedYear + 1);
    }
  };

  if (!user || !user.effortIds || user.effortIds.length === 0) {
    return <Empty description="Veri Yok." />;
  }

  return (
    <div>
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
}

export default StackedBarChart;