import { useState, useContext } from "react";
import {
  Button,
  Steps,
  theme,
  Col,
  Row,
  Card,
  notification,
  Typography,
} from "antd";
import Header from "../../Layout/Header";
import "./contract.scss";
import PrimaryButton from "../../components/buttons/primaryButton";
import GlobalContext from "../../context/GlobalContext";
import { useNavigate } from "react-router-dom";
import { DefineDates, Generalnfo, RoleDetails } from "../../components";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react/prop-types
const App = ({ socket }) => {
  useBackgroundStyle();
  const { contractDetails } = useContext(GlobalContext);
  const [current, setCurrent] = useState(0);
  const { t } = useTranslation();
  const [validation, setValidation] = useState({
    generalInfo: false,
    roleDetails: false,
    defineDates: false,
  });
  const showNotification = () => {
    notification.error({
      message: t("allAlert.contractForm"),
      description: t("allAlert.contractFormDescription"),
    });
  };
  const steps = [
    {
      title: t("contractPages.generelInformation"),

      content: <Generalnfo />,
    },
    {
      title: t("contractPages.roleDetails"),
      content: <RoleDetails />,
    },
    {
      title: t("contractPages.defineDates"),
      content: <DefineDates />,
    },
  ];

  const navigate = useNavigate();

  const next = () => {
    switch (current) {
      case 0:
        if (
          !contractDetails.vendorName ||
          !contractDetails.contractName ||
          !contractDetails.country ||
          !contractDetails.selectedUser ||
          !contractDetails.vendorId
        ) {
          showNotification();
        } else {
          setValidation((prevState) => ({ ...prevState, generalInfo: true }));
          setCurrent(current + 1);
        }
        break;
      case 1:
        if (
          !contractDetails.job ||
          !contractDetails.competenceLevel ||
          !contractDetails.scopeTemplate ||
          !contractDetails.scopeDescription
        ) {
          showNotification();
        } else {
          setValidation((prevState) => ({ ...prevState, roleDetails: true }));
          setCurrent(current + 1);
        }
        break;
      case 2:
        setValidation((prevState) => ({ ...prevState, defineDates: true }));
        break;
      default:
        break;
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <div className="body">
      <Header socket={socket} />

      <Row justify="center" style={{ minHeight: "83.5vh", display: "flex" }}>
        <Col
          style={{ padding: "20px" }}
          span={24}
          xs={24}
          sm={24}
          md={16}
          lg={14}
          xxl={14}
        >
          <Typography.Title style={{ textAlign: "center", padding: "36px" }}>
            {t("contractPages.createContract")}
          </Typography.Title>
          <Row gutter={20} justify="center">
            <Col span={16}>
              <div className="content">{steps[current].content}</div>
              <Row
                style={{
                  float: "right",
                }}
              >
                {current > 0 && (
                  <Button
                    type="primary"
                    danger
                    style={{
                      margin: "0 8px",
                    }}
                    onClick={() => prev()}
                  >
                    {t("contractPages.back")}
                  </Button>
                )}
                {current === steps.length - 1 && (
                  <PrimaryButton
                    style={{ height: "32px" }}
                    onClick={() => {
                      if (
                        !contractDetails.currency ||
                        !contractDetails.price ||
                        !contractDetails.date ||
                        !contractDetails.validThrough ||
                        !contractDetails.dayNumber
                      ) {
                        showNotification();
                      } else {
                        navigate("/signaturesContract");
                      }
                    }}
                  >
                    {t("contractPages.createContract")}
                  </PrimaryButton>
                )}
                {current < steps.length - 1 && (
                  <PrimaryButton
                    style={{ height: "32px" }}
                    onClick={() => next()}
                  >
                    {t("contractPages.next")}
                  </PrimaryButton>
                )}
              </Row>
            </Col>

            <Col span={8}>
              <Card style={{ padding: "15px 0px 0px 0px", width: "100%" }}>
                <Steps current={current} direction="vertical">
                  {steps.map((step, index) => (
                    <Steps.Step
                      style={{ marginBottom: "0px", height: "60px" }}
                      key={index}
                      title={step.title}
                    />
                  ))}
                </Steps>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};
export default App;
