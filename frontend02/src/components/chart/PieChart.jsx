import { useState, useRef, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Empty } from "antd";
import "chart.js/auto";

ChartJS.register(ArcElement, Tooltip, Legend); // Register necessary Chart.js elements

const getRandomSoftColor = () => {
  const red = Math.floor(Math.random() * 128 + 128);
  const green = Math.floor(Math.random() * 128 + 128);
  const blue = Math.floor(Math.random() * 128 + 128);
  return `rgb(${red}, ${green}, ${blue})`;
};

const actions = [
  {
    name: "Add Data",
    handler(chart) {
      const newLabel = `Data ${chart.data.labels.length + 1}`;
      const newData = Math.floor(Math.random() * 100);
      chart.data.labels.push(newLabel);
      chart.data.datasets[0].data.push(newData);
      const colorIndex = chart.data.datasets[0].backgroundColor.length % 5;
      chart.data.datasets[0].backgroundColor.push(
        chart.data.datasets[0].backgroundColor[colorIndex]
      );
      chart.data.datasets[0].borderColor.push(
        chart.data.datasets[0].borderColor[colorIndex]
      );
      chart.update();
    },
  },
  {
    name: "Remove Data",
    handler(chart) {
      chart.data.labels.pop();
      chart.data.datasets[0].data.pop();
      chart.data.datasets[0].backgroundColor.pop();
      chart.data.datasets[0].borderColor.pop();
      chart.update();
    },
  },
];

const PieChart = (props) => {
  const { effort } = props;
  const [chartData, setChartData] = useState({});
  const chartRef = useRef(null);

  useEffect(() => {
    const groupedEfforts = effort.reduce((acc, curr) => {
      if (curr.effortConfirmation === "approved") {
        if (!acc[curr.userName]) {
          acc[curr.userName] = 0;
        }
        acc[curr.userName] += curr.dayCount * 8;
      }
      return acc;
    }, {});

    const data = {
      labels: Object.keys(groupedEfforts),
      datasets: [
        {
          label: "My Dataset",
          data: Object.values(groupedEfforts),
          backgroundColor: Object.keys(groupedEfforts).map(() =>
            getRandomSoftColor()
          ),
          borderColor: Object.keys(groupedEfforts).map(() =>
            getRandomSoftColor()
          ),
          borderWidth: 1,
        },
      ],
    };

    setChartData(data);
  }, [effort]);

  useEffect(() => {
    try {
      const chart = new ChartJS(chartRef.current, {
        type: "pie",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.label || "";

                  if (label) {
                    label += ": ";
                  }
                  if (context.parsed !== undefined) {
                    label += context.parsed;
                  }
                  return label;
                },
              },
            },
          },
        },
      });

      return () => chart.destroy();
    } catch (error) {
      console.error("Error rendering chart:", error);
    }
  }, [chartData]);

  if (effort.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "269px",
        }}
      >
        <Empty description="Veri Yok." />
      </div>
    );
  }

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PieChart;
