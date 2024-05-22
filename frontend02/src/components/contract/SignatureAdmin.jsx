import React, { useContext, useState } from "react";
import { Col, Row, Typography, Modal, Checkbox } from "antd";
import PrimaryButton from "../buttons/primaryButton";
import axios from "axios";
import PDFViewer from "./PDFViewer.jsx";
import GlobalContext from "../../context/GlobalContext.jsx";
import { notification } from "antd";
import { useTranslation } from "react-i18next";

const Context = React.createContext({
  name: "Default",
});
function SignatureAdmin({ socket, setIsContractConfirmedForNext }) {
  const { contractDetails, currentUser, setContractId } =
    useContext(GlobalContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [pdfURL, setPDFURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [isContractConfirmed, setIsContractConfirmed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { t } = useTranslation();

  const handleOpenModal = () => {
    setIsConfirmed(false);
    handleRewiewAndSignatureContract();
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsConfirmed(false);
    setIsModalVisible(false);
  };

  const [api, contextHolder] = notification.useNotification();
  const openNotification = (placement) => {
    api.success({
      message: t("allAlert.approveContractSuccess"),
      placement,
    });
  };

  const handleConfirmCheckbox = (e) => {
    setIsConfirmed(e.target.checked);
  };
  const handleNewContract = async () => {
    console.log("contractDetails:", contractDetails);
    setLoading(true);
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_PORT}/api/contracts`,
          {
            vendorId: contractDetails.vendorId,
            vendorName: contractDetails.vendorName,
            companyName: currentUser.companyName,
            contractName: contractDetails.contractName,
            projectName: contractDetails.projectName,
            projectId: contractDetails.projectId,
            taxResidence: contractDetails.country,
            job: contractDetails.job,
            jobTitle: contractDetails.scopeTemplate,
            seniorityLevel: contractDetails.competenceLevel,
            jobDescription: contractDetails.scopeDescription,
            currency: contractDetails.currency,
            paymentRate:
              contractDetails.salaryType == "daily"
                ? contractDetails.price
                : contractDetails.price / 30,
            startDate: contractDetails.totalDate,
            validThroughDate: contractDetails.validThrough,
            billDate: contractDetails.date,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((result) => {
          if (result.status === 201) {
            setContractId(result.data._id);
            setIsContractConfirmed(true);
            setIsContractConfirmedForNext(true);
            socket.emit("chat", {
              message: "contracts",
              sender: socket.id,
            });
            setLoading(false);
            handleCancelModal();
            openNotification("topRight");
            notification.success({
              message: t("allAlert.saveDraftContract"),
              placement: "topRight",
            });
          } else {
            console.log("handleNewContract function calledelse");
            console.log("result:", result.status);
            setLoading(false);
          }
        });
      setShowAlert(true);
    } catch (error) {
      setLoading(false);
      console.error("contract failed:", error.response.data);
    }
  };

  const handleRewiewAndSignatureContract = async () => {
    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_PORT}/api/contracts/contractPDF`,
          {
            vendorId: contractDetails.vendorId,
            vendorName: contractDetails.vendorName,
            companyName: currentUser.companyName,
            projectName: contractDetails.projectName,
            taxResidence: contractDetails.country,
            jobTitle: contractDetails.scopeTemplate,
            seniorityLevel: contractDetails.competenceLevel,
            currency: contractDetails.currency,
            paymentRate: contractDetails.price,
            startDate: contractDetails.date,
            validThroughDate: contractDetails.validThrough,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((result) => {
          if (result.status === 201) {
            setPDFURL(
              `${import.meta.env.VITE_API_PORT}/feFiles/` + result.data.fileURL
            ); // pdfURL state'i güncellendi
            setIsModalVisible(true);
          }
        });
    } catch (error) {
      console.error("contract failed:", error.response.data);
    }
  };

  return (
    <>
      <>
        <Context.Provider>{contextHolder}</Context.Provider>
      </>
      <Row justify="center" align="middle">
        <Col>
          <Typography style={{ marginBottom: "50px", fontSize: "18px" }}>
            {" "}
            {t("contractSignature.approvalContract")}
          </Typography>
        </Col>
        <Col span={24}>
          <PrimaryButton style={{ width: "100%" }} onClick={handleOpenModal}>
            {isContractConfirmed
              ? t("contractSignature.view")
              : t("contractSignature.viewAndApprove")}
          </PrimaryButton>
        </Col>
        <Modal
          title=""
          visible={isModalVisible}
          onCancel={handleCancelModal}
          footer={null}
          style={{ maxHeight: "10px" }}
        >
          <Row>{pdfURL && <PDFViewer pdfURL={pdfURL} />}</Row>
          <Row style={{ padding: "25px" }}>
            {!isContractConfirmed && (
              <Checkbox checked={isConfirmed} onChange={handleConfirmCheckbox}>
                {t("contractSignature.contractViewAndApprove")}{" "}
              </Checkbox>
            )}
          </Row>
          <Row justify="center">
            <PrimaryButton
              onClick={handleNewContract}
              style={{
                width: "100%",
                color: isContractConfirmed ? "#008631aa" : "",
              }}
              disabled={!isConfirmed || loading || isContractConfirmed}
              loading={loading}
            >
              {isContractConfirmed
                ? t("contractSignature.approved")
                : t("contractSignature.approve")}
            </PrimaryButton>
          </Row>
        </Modal>
      </Row>
    </>
  );
}

export default SignatureAdmin;
