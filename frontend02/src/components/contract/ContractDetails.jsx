import { Row, Card, Typography, Col, Modal, Tag, Space } from "antd";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import PrimaryButton from "../buttons/primaryButton";
import "../../page/contract/contract.scss";
import PDFViewer from "./PDFViewer";
import { useTranslation } from "react-i18next";
import {currencyList} from '../../constans/currencyList.js';
// eslint-disable-next-line react/prop-types
function ContractDetails({ contractId }) {
  const [contractDetails, setContractDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pdfURL, setPdfURL] = useState("");
  const { t } = useTranslation();
  const taraflarRef = useRef(null);
  const danismanDetaylariRef = useRef(null);
  const projeDetaylariRef = useRef(null);
  const isSozlesmesiRef = useRef(null);
  const isDetaylariRef = useRef(null);

  const downloadPDF = (url) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobURL = window.URL.createObjectURL(new Blob([blob]));
        const fileName = url.split("/").pop();
        const a = document.createElement("a");
        a.href = blobURL;
        a.setAttribute("download", fileName);
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_PORT}/api/contracts/${contractId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setContractDetails(response.data);
        const url = `${import.meta.env.VITE_API_PORT}/files/${
          response.data.contractName
        }${response.data.vendorId}.pdf`;
        console.log(url);
        setPdfURL(url);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    if (contractId) {
      fetchContractDetails();
    }
  }, [contractId]);

  const renderCard = (title, content, loading, endContent = "nul", ref) => (
    <Card bordered={false} className="card-content" loading={loading} ref={ref}>
      <Typography.Text strong style={{ fontSize: "18px" }}>
        {title}
      </Typography.Text>
      {Array.isArray(content) ? (
        content.map((item, index) => (
          <Row
            key={index}
            className="card-row"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <Typography.Text>{item}</Typography.Text>
            </div>
            {endContent && (
              <div style={{ textAlign: "right" }}>
                <Typography.Text>
                  {Array.isArray(endContent) ? endContent[index] : endContent}
                </Typography.Text>
              </div>
            )}
          </Row>
        ))
      ) : (
        <Row
          className="card-row"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <Typography.Text>{content}</Typography.Text>
          </div>
          {endContent && (
            <div style={{ textAlign: "right" }}>
              <Typography.Text>
                {Array.isArray(endContent) ? endContent[0] : endContent}
              </Typography.Text>
            </div>
          )}
        </Row>
      )}
    </Card>
  );

  const status = [
    {
      status: "approved",
      text: t("contractDetail.approved"),
    },
    {
      status: "rejected",
      text: t("contractDetail.rejected"),
    },
    {
      status: "pending",
      text: t("contractDetail.pending"),
    },
  ];

  const statusText =
    status.find((item) => item.status === contractDetails?.status)?.text ||
    "Durum Belirsiz";


  const currencyPrefix = contractDetails?.currency
    ? currencyList.find((item) => item.value === contractDetails?.currency)
        ?.prefix
    : "";

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${day}/${month}/${year}`;
  };

  const scrollToRef = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  const formatPaymentRate = contractDetails?.currency
    ? (paymentRate, currency) => {
        const currencyInfo = currencyList.find(
          (item) => item.value === currency
        );
        const { thousandSeparator, decimalSeparator, decimalDigits, prefix } =
          currencyInfo;

        const formattedRate = paymentRate
          .toFixed(decimalDigits)
          .toString()
          .replace(".", decimalSeparator);
        return ` ${formattedRate.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          thousandSeparator
        )}`;
      }
    : (paymentRate) => paymentRate;

  return (
    <div>
      <Row
        justify="center"
        className="contract-header"
        style={{ marginTop: "20px" }}
      >
        <Col style={{ padding: "20px", textAlign: "center" }}>
          <Row style={{ marginBottom: "20px" }}>
            <Typography.Text strong style={{ fontSize: "28px" }}>
              {contractDetails?.contractName.toUpperCase()}
            </Typography.Text>
          </Row>
          <Row justify="center">
            <Tag
              color={
                statusText === t("contractDetail.approved")
                  ? "success"
                  : statusText === t("contractDetail.pending")
                  ? "warning"
                  : "error"
              }
            >
              {statusText}
            </Tag>
          </Row>
        </Col>
      </Row>

      <Row justify="center" style={{ minHeight: "83.5vh", display: "flex" }}>
        <Col
          style={{ padding: "20px" }}
          span={24}
          xs={24}
          sm={24}
          md={34}
          lg={14}
          xxl={5}
        >
          <Card
            bordered={false}
            className="card-content"
            style={{ minHeight: "41.5rem", display: "flex", padding: "0 20px" }}
          >
            <Typography className="cart-details-contents-title">
              {t("contractDetail.pageDetails")}
            </Typography>
            <Space direction="vertical">
              <Typography.Text
                className="cart-details-contents-subtitle"
                onClick={() => scrollToRef(taraflarRef)}
              >
                {t("contractDetail.sides")}
              </Typography.Text>
              <div className="cart-details-contents-left-space">
                <Space direction="vertical">
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.companyName")}
                  </Typography.Text>
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.vendorName")}
                  </Typography.Text>
                </Space>
              </div>
              <Typography.Text
                className="cart-details-contents-subtitle"
                onClick={() => scrollToRef(danismanDetaylariRef)}
              >
                {t("contractDetail.vendorDetails")}
              </Typography.Text>
              <div className="cart-details-contents-left-space">
                <Space direction="vertical">
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.vendorProfession")}
                  </Typography.Text>
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.vendorCompetency")}
                  </Typography.Text>
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.vendorSalary")}
                  </Typography.Text>
                </Space>
              </div>
              <Typography.Text
                className="cart-details-contents-subtitle"
                onClick={() => scrollToRef(projeDetaylariRef)}
              >
                {t("contractDetail.projectDetails")}
              </Typography.Text>
              <div className="cart-details-contents-left-space">
                <Space direction="vertical">
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.projectName")}
                  </Typography.Text>
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.billDate")}
                  </Typography.Text>
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.paymentStartDate")}
                  </Typography.Text>
                </Space>
              </div>
              <Typography.Text
                className="cart-details-contents-subtitle"
                onClick={() => scrollToRef(isSozlesmesiRef)}
              >
                {t("contractDetail.jobContract")}
              </Typography.Text>
              <div className="cart-details-contents-left-space">
                <Typography.Text className="cart-details-contents-subtitle-text">
                  {" "}
                  {t("contractDetail.jobContractDetail")}
                </Typography.Text>
              </div>
              <Typography.Text
                className="cart-details-contents-subtitle"
                onClick={() => scrollToRef(isDetaylariRef)}
              >
                {t("contractDetail.jobDetails")}
              </Typography.Text>
              <div className="cart-details-contents-left-space">
                <Space direction="vertical">
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.jobTitle")}
                  </Typography.Text>
                  <Typography.Text className="cart-details-contents-subtitle-text">
                    {t("contractDetail.jobDescription")}
                  </Typography.Text>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
        <Col
          style={{ padding: "20px" }}
          span={24}
          xs={24}
          sm={24}
          md={34}
          lg={14}
          xxl={11}
        >
          {renderCard(
            t("contractDetail.sides"),
            [t("contractDetail.companyName"), t("contractDetail.vendorName")],
            loading,
            [contractDetails?.companyName, contractDetails?.vendorName],
            taraflarRef
          )}
          {renderCard(
            t("contractDetail.vendorDetails"),
            [
              t("contractDetail.vendorProfession"),
              t("contractDetail.vendorCompetency"),
              t("contractDetail.vendorSalary"),
            ],
            loading,
            [
              contractDetails?.job,
              contractDetails?.seniorityLevel,
              currencyPrefix +
                " " +
                formatPaymentRate(
                  contractDetails?.paymentRate,
                  contractDetails?.currency
                ),
            ],
            danismanDetaylariRef
          )}

          {renderCard(
            t("contractDetail.projectDetails"),
            [
              t("contractDetail.projectName"),
              t("contractDetail.billDate"),
              t("contractDetail.paymentStartDate"),
            ],
            loading,
            [
              contractDetails?.projectName,
              formatDate(contractDetails?.billDate),
              formatDate(contractDetails?.startDate),
            ],
            projeDetaylariRef
          )}
          <Card
            bordered={false}
            className="card-content"
            loading={loading}
            ref={isSozlesmesiRef}
          >
            <Typography.Text strong>
              {" "}
              {t("contractDetail.jobContract")}
            </Typography.Text>
            <div
              className="card-row"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography.Text style={{ marginRight: "auto" }}>
                {t("contractDetail.jobContractDetail")}
              </Typography.Text>
              <PrimaryButton onClick={handleOpenModal}>
                {" "}
                {t("contractDetail.view")}
              </PrimaryButton>
            </div>
          </Card>

          {renderCard(
            t("contractDetail.jobDetails"),
            [t("contractDetail.jobTitle"), t("contractDetail.jobDescription")],
            loading,
            [contractDetails?.jobTitle, contractDetails?.jobDescription],
            isDetaylariRef
          )}
        </Col>
      </Row>

      <Modal
        title=""
        visible={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        style={{ maxHeight: "10px" }}
      >
        <Row>{pdfURL && <PDFViewer pdfURL={pdfURL} />}</Row>
        <Row justify="center">
          <PrimaryButton onClick={() => downloadPDF(pdfURL)}>
            {t("contractDetail.downloadContract")}
          </PrimaryButton>
        </Row>
      </Modal>
    </div>
  );
}

export default ContractDetails;
