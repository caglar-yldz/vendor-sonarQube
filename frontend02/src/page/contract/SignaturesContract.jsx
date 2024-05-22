import { useState } from "react";
import { Steps, theme, Col, Row, Card, Typography } from "antd";
import Header from "../../Layout/Header";
import "./contract.scss";
import PrimaryButton from "../../components/buttons/primaryButton";
import { SignatureAdmin, SignatureVendor } from "../../components";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react/prop-types
const App = ({ socket }) => {
  useBackgroundStyle();
  const { t } = useTranslation();
  const [isContractConfirmedForNext, setIsContractConfirmedForNext] =
    useState(false);
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const steps = [
    {
      title: t("contractSignature.createContract"),
      content: (
        <SignatureAdmin
          setIsContractConfirmedForNext={setIsContractConfirmedForNext}
          socket={socket}
        />
      ),
    },
    {
      title: t("contractSignature.sendContract"),
      content: <SignatureVendor socket={socket} />,
    },
  ];

  const next = () => {
    setCurrent(current + 1);
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
            {t("contractSignature.createContract")}
          </Typography.Title>
          <Row gutter={20} justify="center">
            <Col span={16}>
              <Card style={{ minHeight: "50px" }}>
                <div
                  className="content"
                  style={{
                    lineHeight: "50px",
                    padding: "24px",
                    color: token.colorTextTertiary,
                    borderRadius: token.borderRadiusLG,
                    marginTop: 16,
                    backgroundColor: "white",
                  }}
                >
                  {steps[current].content}
                </div>
              </Card>
              <div
                style={{
                  marginTop: 24,
                  float: "right",
                }}
              >
                {current === steps.length - 1 && (
                  <PrimaryButton
                    style={{ height: "32px" }}
                    onClick={() => (window.location.href = "/contracts")}
                  >
                    {t("contractSignature.contracts")}
                  </PrimaryButton>
                )}
                {current < steps.length - 1 && (
                  <PrimaryButton
                    style={{ height: "32px" }}
                    onClick={() => next()}
                    disabled={!isContractConfirmedForNext}
                  >
                    {t("contractSignature.next")}
                  </PrimaryButton>
                )}
              </div>
            </Col>

            <Col span={8}>
              <Card style={{ padding: "15px 0px 0px 0px" }}>
                <Steps current={current} direction="vertical">
                  {steps.map((step, index) => (
                    <Steps.Step key={index} title={step.title} />
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
