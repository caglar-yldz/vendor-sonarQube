import React from "react";
import Header from "../../Layout/Header";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  HomeOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";
import {
  Table,
  Input,
  Button,
  Row,
  Col,
  Select,
  ConfigProvider,
  Breadcrumb,
  Card,
} from "antd";
import "../../styles/Global.scss";
import PrimaryButton from "../../components/buttons/primaryButton";
import { useTranslation } from "react-i18next";
import "./Style.scss";
import AreYouSureModal from "../../components/modals/AreYouSureModal";

export default function Payments({ token, socket }) {
  useBackgroundStyle();
  const [futurePayments, setFuturePayments] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState(false);
  const [buttonId, setButtonId] = useState(false);
  const [projectName, setProjectName] = useState(false);
  const [vendorName, setVendorName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [filteredMonth, setFilteredMonth] = useState(false);
  const [contractId, setContractId] = useState([]);
  const [contractMonthNo, setContractMonthNo] = useState([]);
  const [months, setMonths] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_PORT}/api/contracts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setContracts(res.data.reverse());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const paymentHandler = (id) => {
    setIsPaid((prevState) => ({
      ...prevState,
      [id]: true,
    }));
    markAsPaid(contractId, contractMonthNo);
    setIsModalOpen(false);
  };

  const monthNames = [
    t("payments.january"),
    t("payments.february"),
    t("payments.march"),
    t("payments.april"),
    t("payments.may"),
    t("payments.june"),
    t("payments.july"),
    t("payments.august"),
    t("payments.september"),
    t("payments.october"),
    t("payments.november"),
    t("payments.december"),
  ];

  const options = [];
  for (let i = 0; i < 12; i++) {
    options.push({
      value: i + 1,
      label: monthNames[i],
    });
  }

  const currencyList = [
    {
      value: "TRY",
      ad: "TRY",
      prefix: "₺",
      thousandSeparator: ".",
      decimalSeparator: ",",
      decimalDigits: 2,
    },
    {
      value: "USD",
      ad: "USD",
      prefix: "$",
      thousandSeparator: ",",
      decimalSeparator: ".",
      decimalDigits: 2,
    },
    {
      value: "EUR",
      ad: "EUR",
      prefix: "€",
      thousandSeparator: ".",
      decimalSeparator: ",",
      decimalDigits: 2,
    },
  ];

  const handleSortChange = (value) => {
    setFilteredMonth(value);

    if (value) {
      setFuturePayments(false);
      setPaymentHistory(false);
    } else {
      setFuturePayments(true);
      setPaymentHistory(false);
    }
  };

  useEffect(() => {
    if (filteredMonth) {
      const filtered = [];

      filtered.push({
        monthNumber: filteredMonth,
        monthName: monthNames[filteredMonth - 1],
        year: currentYear,
      });
      setMonths(filtered);
    } else {
      if (futurePayments) {
        const futureMonths = [];
        for (let i = currentMonth; i < 12; i++) {
          futureMonths.push({
            monthNumber: i + 1,
            monthName: monthNames[i],
            year: currentYear,
          });
          setMonths(futureMonths);
        }
      } else {
        const previousMonths = [];
        for (let i = currentMonth - 1; i >= 0; i--) {
          previousMonths.push({
            monthNumber: i + 1,
            monthName: monthNames[i],
            year: currentYear,
          });
        }
        setMonths(previousMonths);
      }
    }
  }, [futurePayments, filteredMonth]);

  const columns = [
    {
      title: t("contract.vendor"),
      dataIndex: "vendorName",
    },
    {
      title: t("contract.project"),
      dataIndex: "projectName",
    },
    {
      title: t("contract.contractName"),
      dataIndex: "contractName",
    },
    {
      title: t("payments.amount"),
      dataIndex: "paymentRate",
      render: (paymentRate, record) => {
        const currency = currencyList.find(
          (item) => item.value === record.currency
        );
        const formattedPaymentRate = `${
          currency.prefix
        } ${paymentRate.toLocaleString(undefined, {
          minimumFractionDigits: currency.decimalDigits,
          maximumFractionDigits: currency.decimalDigits,
        })}`;
        return <p>{formattedPaymentRate}</p>;
      },
    },
  ];

  const markAsPaid = async (id, monthNumber) => {
    await axios.put(
      `${import.meta.env.VITE_API_PORT}/api/contracts/${id}`,
      {
        monthNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  };

  const handleFuturePayments = () => {
    setFuturePayments(true);
    setPaymentHistory(false);
  };

  const handlePaymentHistory = () => {
    setFuturePayments(false);
    setPaymentHistory(true);
  };

  const [isModalVisible, setIsModalVisible] = useState(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    //onClose();
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header socket={socket} />
      <Row
        justify="center"
        style={{ backgroundColor: "#F9F9F9", minHeight: "83.5vh" }}
      >
        <Col style={{ padding: "20px" }} sm={24} lg={18} xl={18} xxl={18}>
          <Breadcrumb style={{ marginBottom: "10px" }}>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item
              onClick={() => {
                navigate("/payments");
              }}
            >
              <span style={{ cursor: "pointer" }}>
                {t("payments.payments")}
              </span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ padding: "10px 0px" }}>
            <Card className="payment-body-card">
              <Row style={{ paddingBottom: "20px" }}>
                <Col span={24} sm={24} md={12}>
                  <Input.Search
                    size="large"
                    placeholder={t("payments.search")}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 200, color: "black", marginBottom: "15px" }}
                  />

                  {/* Filter */}
                  <Select
                    className="custom-select"
                    variant="borderless"
                    size="large"
                    placeholder={t("payments.default")}
                    style={{ width: 120, marginLeft: "1em" }}
                    options={options}
                    allowClear={true}
                    onChange={handleSortChange}
                  ></Select>
                </Col>

                <Col span={24} sm={24} md={12} style={{ textAlign: "end" }}>
                  <Button
                    style={{
                      borderRadius: " 8px 0 0 8px ",
                      backgroundColor: futurePayments ? "#1890ff" : "#f0f0f0",
                      color: futurePayments ? "#fff" : "#000",
                    }}
                    onClick={() => handleFuturePayments()}
                  >
                    {t("payments.futurePayments")}
                  </Button>
                  <Button
                    style={{
                      borderRadius: " 0 8px 8px 0",
                      backgroundColor: paymentHistory ? "#1890ff" : "#f0f0f0",
                      color: paymentHistory ? "#fff" : "#000",
                    }}
                    onClick={() => handlePaymentHistory()}
                  >
                    {" "}
                    {t("payments.previousPayments")}
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12} className="payment-title">
                  {t("payments.paymentTitle")}
                </Col>
              </Row>
              {months
                .filter((month) => {
                  // If search term is empty, return true for all months
                  if (!searchTerm) {
                    return true;
                  }

                  // Check if any contracts in this month match the search term
                  return contracts.some((contract) => {
                    var contractMonth =
                      new Date(contract.startDate).getMonth() + 1;
                    return (
                      contract.status === "approved" &&
                      contract.vendorName &&
                      contract.vendorName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    );
                  });
                })
                .map((month, index) => (
                  <Card
                    className="payment-card"
                    key={index}
                    title={month.monthName + " " + currentYear}
                    loading={loading}
                  >
                    <ConfigProvider
                      theme={{
                        token: {
                          borderRadius: 0,
                        },
                        components: {
                          Table: {
                            headerBg: "#0000000F",
                            borderColor: "none",
                          },
                        },
                      }}
                    >
                      <Table
                        scroll={{ x: "calc(800px)" }}
                        columns={[
                          {
                            title: t("contract.vendor"),
                            dataIndex: "vendorName",
                          },
                          {
                            title: t("contract.project"),
                            dataIndex: "projectName",
                            render: (text) => {
                              return text ? (
                                text
                              ) : (
                                <div style={{ textAlign: "center" }}>-</div>
                              );
                            },
                          },
                          {
                            title: t("contract.contractName"),
                            dataIndex: "contractName",
                          },
                          {
                            title: t("payments.date"),
                            dataIndex: "paymentDates",
                            render: (text) => {
                              const date = new Date(
                                text[month.monthNumber]?.startDate
                              );
                              return date.toLocaleDateString();
                            },
                          },
                          {
                            title: t("payments.amount"),
                            dataIndex: "paymentDates",
                            render: (text, record) => {
                              const currency = currencyList.find(
                                (item) => item.value === record.currency
                              );
                              const formattedPaymentRate = `${
                                currency.prefix
                              } ${text[
                                month.monthNumber
                              ]?.paymentAmount?.toLocaleString(undefined, {
                                minimumFractionDigits: currency.decimalDigits,
                                maximumFractionDigits: currency.decimalDigits,
                              })}`;
                              return <p>{formattedPaymentRate}</p>;
                            },
                          },

                          {
                            title: (
                              <div style={{ textAlign: "center" }}>
                                {t("payments.status")}
                              </div>
                            ),
                            dataIndex: "paymentDates",
                            render: (text, record) => {
                              `${record.paymentRate} ${record.currency}`;
                              return (
                                <>
                                  {isPaid[record._id + month.monthNumber] ||
                                  contracts.some(
                                    (contract) =>
                                      contract._id == record._id &&
                                      contract.paymentDates[month.monthNumber]
                                        .isPaid
                                  ) ? (
                                    <div style={{ textAlign: "center" }}>
                                      <PrimaryButton
                                        disabled={true}
                                        style={{
                                          height: "32px",
                                          borderRadius: "25px",
                                          lineHeight: "1.0em",
                                          backgroundColor: "#00cc00",
                                          borderColor: "#00cc00",
                                          color: "white",
                                        }}
                                      >
                                        {t("payments.paid")}
                                      </PrimaryButton>
                                    </div>
                                  ) : (
                                    <div style={{ textAlign: "center" }}>
                                      <PrimaryButton
                                        onClick={() => {
                                          setButtonId(
                                            record._id + month.monthNumber
                                          );
                                          setContractId(record._id);
                                          setContractMonthNo(month.monthNumber);
                                          setIsModalOpen(true);
                                          setProjectName(record.projectName);
                                          setVendorName(record.vendorName);
                                        }}
                                        disabled={
                                          text[month.monthNumber]
                                            ?.paymentAmount == 0
                                        }
                                        style={{
                                          height: "32px",
                                          borderRadius: "25px",
                                          lineHeight: "1.0em",
                                        }}
                                      >
                                        {t("payments.markAsPaid")}
                                      </PrimaryButton>
                                    </div>
                                  )}
                                </>
                              );
                            },
                          },
                        ]}
                        dataSource={contracts.filter((contract) => {
                          const paymentDates = contract.paymentDates?.map(
                            (payment) => new Date(payment.startDate)
                          );

                          const isConfirmed = contract.status;
                          return (
                            paymentDates?.some((payment) => {
                              return (
                                payment.getMonth() + 1 === month.monthNumber
                              );
                            }) &&
                            isConfirmed === "approved" &&
                            contract.vendorName &&
                            contract.vendorName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          );
                        })}
                        onChange={null}
                        loading={loading}
                        pagination={{
                          defaultPageSize: 5, // Show 5 data per page
                          pageSizeOptions: ["5", "10", "20"], // Options for page size
                          showQuickJumper: true,
                          showSizeChanger: true,
                          style: { marginRight: "16px" }, // Add margin-right here
                        }}
                      />
                    </ConfigProvider>
                  </Card>
                ))}
            </Card>
          </div>
        </Col>
      </Row>
      <AreYouSureModal
        loading={payLoading}
        onOkModal={() => {
          paymentHandler(buttonId);
        }}
        description={""}
        title={
          i18n.language == "tr"
            ? `${
                projectName
                  ? projectName +
                    " " +
                    t("payments.areUSureText1") +
                    " " +
                    vendorName +
                    " " +
                    t("payments.areUSureText2")
                  : "" + vendorName + " " + t("payments.areUSureText2")
              }`
            : i18n.language == "en"
            ? `
      ${
        t("payments.areUSureText1") +
        " " +
        vendorName +
        (projectName ? t("payments.areUSureText2") + " " + projectName : "") +
        ". Do you confirm?"
      }`
            : `${
                projectName
                  ? projectName +
                    " " +
                    t("payments.areUSureText1") +
                    " " +
                    vendorName +
                    " " +
                    t("payments.areUSureText2")
                  : "" + vendorName + " " + t("payments.areUSureText2")
              }`
        }
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
      ></AreYouSureModal>{" "}
    </>
  );
}
