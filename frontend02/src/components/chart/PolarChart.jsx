import { useRef, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import axios from "axios";
import { useTranslation } from "react-i18next";

Chart.register(...registerables);

const PolarChart = ({ user, currentuser, projectId }) => {
  const { t } = useTranslation();
  const chartContainer = useRef(null);
  let myChart = null;
  const [efforts, setEfforts] = useState([]);

  useEffect(() => {
    const fetchEfforts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_PORT}/api/effort/getEfforts/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const monthlyEfforts = Array(12).fill(0);

        res.data.project.forEach((effort) => {
          console.log("Effort vendorId:", effort.vendorId);
        });

        const filteredEfforts = res.data.project.filter(
          (effort) =>
            effort.effortConfirmation === "approved" &&
            effort.vendorId === user._id
        ); // Filter efforts

        filteredEfforts.forEach((effort) => {
          const month = effort.month - 1; // Get the month number and subtract 1
          const workHours = parseInt(effort.workHours, 10); // Convert workHours to a number
          monthlyEfforts[month] += workHours; // Add the workHours to the corresponding month
        });

        setEfforts(monthlyEfforts); // Set the efforts state to the new array
      } catch (error) {
        console.error("Error fetching efforts:", error);
      }
    };
    fetchEfforts();
  }, [projectId]);
  console.log("efforrrss", efforts);

  const monthNames = t("barChart.months", { returnObjects: true }); // Get the translated month names

  const data = {
    labels: monthNames, // Use the translated month names here
    datasets: [
      {
        label: t("polarchart.workhours"),
        data: efforts, // Use the efforts state here
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(75, 192, 192)",
          "rgb(255, 205, 86)",
          "rgb(201, 203, 207)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(255, 159, 64)",
          "rgb(0, 99, 132)",
          "rgb(75, 0, 192)",
          "rgb(255, 205, 0)",
          "rgb(201, 50, 207)",
          "rgb(100, 149, 237)",
        ],
      },
    ],
  };

  const config = {
    type: "polarArea",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: t("polarchart.effortByMonth"),
        },
      },
    },
  };

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      if (myChart) {
        myChart.destroy(); // Destroy the previous chart
      }
      const newChartInstance = new Chart(chartContainer.current, config);
      myChart = newChartInstance;
    }
    // Cleanup function to destroy the chart instance
    return () => myChart && myChart.destroy();
  }, [chartContainer, efforts]); // Include efforts in the dependency array

  return (
    <div>
      <canvas ref={chartContainer} />
    </div>
  ); // This was missing
};

export default PolarChart;
