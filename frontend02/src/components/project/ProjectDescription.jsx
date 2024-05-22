import { useContext, useState, useEffect } from "react";
import GlobalContext from "../../context/GlobalContext";
import BarChartProject from "../chart/BarChartProject";
import PieChart from "../chart/PieChart";
import { Row, Col, Card, Statistic } from "antd";
import { useTranslation } from "react-i18next";

export default function ProjectDescription() {
  const { response, efforts, projectVendors } = useContext(GlobalContext);
  const { t } = useTranslation();
  var totalEffortHours = 0;

  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [efforts]);

  efforts.forEach((effort) => {
    if (effort.effortConfirmation === "approved")
      totalEffortHours += parseFloat(effort.workHours);
  });

  const approvedEfforts = efforts.filter(
    (effort) => effort.effortConfirmation === "approved"
  );
  console.log("approvedEfforts", approvedEfforts);
  const groupedEfforts = approvedEfforts.reduce((acc, effort) => {
    const key = `${effort.vendorId}-${effort.month}`;
    if (!acc[key]) {
      acc[key] = {
        vendorId: effort.vendorId,
        month: effort.month,
        dayCount: 0,
        userName: effort.userName,
      };
    }
    acc[key].dayCount += effort.dayCount; // Sum 'dayCount'
    return acc;
  }, {});

  for (let key in groupedEfforts) {
    groupedEfforts[key].dayCount *= 8;
  }

  return (
    <Row gutter={16}>
      <Col span={24} sm={12} lg={12} xl={12} xxl={12}>
        <Card
          title={t("projectDescription.totalConsultantCount")}
          style={{ marginBottom: "16px" }}
        >
          <Statistic
            value={projectVendors.length}
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
        <Card
          title={t("projectDescription.totalEffortCount")}
          style={{ marginBottom: "16px" }}
        >
          <Statistic value={efforts.length} valueStyle={{ color: "#3f8600" }} />
        </Card>
        <Card
          title={t("projectDescription.totalEffortHours")}
          style={{ marginBottom: "16px" }}
        >
          <Statistic
            value={totalEffortHours.toFixed(2)}
            valueStyle={{ color: "#cf1322" }}
          />
        </Card>
      </Col>
      <Col
        style={{ marginBottom: "16px" }}
        span={24}
        sm={12}
        lg={12}
        xl={12}
        xxl={12}
      >
        <Card title={t("projectDescription.consultantBasedEffortGraph")}>
          <Row style={{ minHeight: "355px" }} justify="center" align="middle">
            <Col>
              <PieChart
                key={key}
                style={{ maxHeight: "160px" }}
                effort={efforts}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={24}>
        <Card
          title={t("projectDescription.monthlyEffortGraph")}
          style={{
            paddingTop: "2em",
            paddingBottom: "5em",
            paddingLeft: "0em",
            paddingRight: "0em",
          }}
          headStyle={{
            justifyContent: "start",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <BarChartProject efforts={groupedEfforts} />
        </Card>
      </Col>
    </Row>
  );
}
