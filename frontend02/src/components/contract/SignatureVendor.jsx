import { Col, Row, Typography } from "antd";
import PrimaryButton from "../buttons/primaryButton";
import GlobalContext from "../../context/GlobalContext.jsx";
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { notification } from "antd";

const Context = React.createContext({
  name: "Default",
});
function SignatureVendor({ socket }) {
  const { contractId, currentUser, contractDetails } =
    useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [isContractSent, setIsContractSent] = useState(false);
  const { t } = useTranslation();
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (placement) => {
    api.success({
      message: t("allAlert.sendContract"),
      placement,
    });
  };

  const handleSendContract = async () => {
    setLoading(true);
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_PORT}/api/contracts/send/${contractId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((result) => {
          if (result.status == 200) {
            socket.emit("chat", {
              message: "contracts",
              sender: socket.id,
            });
            openNotification("topRight");
            setLoading(false);
            setIsContractSent(true);

            axios.post(
              `${import.meta.env.VITE_API_PORT}/api/notifications/`,
              {
                title: `newContract`,
                description: `${currentUser.companyName} firması size kontrat gönderdi.`,
                props: { companyName: currentUser.companyName },
                isRead: false,
                relatedObjectId: null,
                relatedObjectUrl: "/contracts/",
                vendorId: contractDetails.vendorId,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            socket.emit("notification", {
              message: "effort",
            });
          } else {
            setLoading(false);
          }
        });
    } catch (error) {
      setLoading(false);
      console.error("contract failed:", error);
    }
  };
  return (
    <>
      <>
        <Context.Provider>{contextHolder}</Context.Provider>
      </>
      <div>
        <Row justify="center" align="middle">
          <Col>
            <Typography style={{ marginBottom: "50px" }}>
              {t("contractSignature.notifyVendor")}
            </Typography>
          </Col>
          <Col span={24}>
            <PrimaryButton
              style={{
                width: "100%",
                color: isContractSent ? "#008631aa" : "",
              }}
              loading={loading}
              disabled={loading || isContractSent}
              onClick={handleSendContract}
            >
              {isContractSent
                ? t("contractSignature.sent")
                : t("contractSignature.sendContract")}
            </PrimaryButton>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default SignatureVendor;
