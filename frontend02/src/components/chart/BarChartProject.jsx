import { useRef, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Empty, Button } from 'antd';
import { useTranslation } from "react-i18next";

Chart.register(...registerables);

const BarChartProject = ({ efforts }) => {
  const {t} = useTranslation();
  const chartRef = useRef(null);
  const [currentMonth, setMonth] = useState(new Date().getMonth());

  const monthNames = t('barChart.months', { returnObjects: true });

  const goToPreviousMonth = () => {
    setMonth((currentMonth - 1 + 12) % 12); // Go to the previous month
  };
  
  const goToNextMonth = () => {
    setMonth((currentMonth + 1) % 12); // Go to the next month
  };

  const currentMonthEfforts = Object.values(efforts).filter(effort => {
  return effort.month === currentMonth + 1; // month in Date starts from 0 (January), but your data starts from 1
});

useEffect(() => {
  if (chartRef.current) {
    if (chartRef.current.chart) {
      // Destroy the old chart to prevent memory leaks
      chartRef.current.chart.destroy();
    }

    const labels = currentMonthEfforts.map(effort => effort.userName); // Access userName property
    const data = currentMonthEfforts.map(effort => effort.dayCount); // Access dayCount property

    const config = {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      label: t('Work Hours'),
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  },
  options: {
    maintainAspectRatio: false
  }
};

    // Delay the creation of the chart to ensure the canvas is fully rendered
    setTimeout(() => {
      chartRef.current.chart = new Chart(chartRef.current.getContext('2d'), config);
    }, 0);
  }
}, [efforts, currentMonth, currentMonthEfforts]); // Add currentMonthEfforts as a dependency


return (
  <div style={{ height: '55vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <div>
        <Button onClick={goToPreviousMonth} style={{ marginRight: '1vw' }}>{t("barChart.previousMonthButton")}</Button>
        <Button onClick={goToNextMonth}>{t("barChart.nextMonthButton")}</Button>
      </div>
      <div style={{fontSize: '2vh', marginTop: '2vh'}}>{monthNames[currentMonth]}</div>
    </div>
    {currentMonthEfforts.length > 0 ? (
      <canvas ref={chartRef} style={{ flex: 'none', height: 'calc(100% - 10vh)', width: '100%', boxSizing: 'border-box' }}></canvas>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Empty description={t("barChart.emptyDescription")} />
      </div>
    )}
  </div>
);


};

export default BarChartProject;