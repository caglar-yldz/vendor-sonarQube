import Header from "../../Layout/Header";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import GlobalContext from "../../context/GlobalContext";
import { PDFViewer } from "../../components";
import {
  HomeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";
import { encryptContractId } from "../../utils/utils.jsx";
import {
  Table,
  Input,
  Button,
  Row,
  Col,
  Select,
  ConfigProvider,
  Tag,
  Breadcrumb,
  Modal,
  Checkbox,
  Card,
  Tooltip,
} from "antd";
import "../../styles/Global.scss";
import PrimaryButton from "../../components/buttons/primaryButton";
import { useTranslation } from "react-i18next";
import {currencyList} from '../../constans/currencyList.js';

export default function Contracts({ socket, openNotification }) {
  useBackgroundStyle();
  const [loading, setLoading] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState({});
  const [loadingButton, setLoadingButton] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { currentUser } = useContext(GlobalContext);
  const [sortOrder, setSortOrder] = useState("default");
  const [sortedContracts, setSortedContracts] = useState([]);
  const [contracts, setContracts] = useState([]);
  const { Option } = Select;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [url, setUrl] = useState("");
  const [contractName, setContractName] = useState("");
  const [loadingContract, setLoadingContract] = useState(false);
  const [isContractConfirmed, setIsContractConfirmed] = useState(false);
  const [contractId, setContractId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [contractStatus, setContractStatus] = useState("pending");
  const [isRejected, setIsRejected] = useState(false);
  const { t } = useTranslation();
  const [loadingConfButtons, setLoadingConfButtons] = useState({});
  const navigate = useNavigate();

  const handleOpenModal = (
    url,
    contractName,
    id,
    status,
    companyId,
    projectId,
    projectName
  ) => {
    setUrl(url);
    setContractName(contractName);
    setContractId(id);
    setContractStatus(status);
    setIsModalVisible(true);
    setIsContractConfirmed(false);
    setCompanyId(companyId);
    setProjectId(projectId);
    setProjectName(projectName);
    setIsRejected(false);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setIsConfirmed(false);
  };

  const handleConfirmCheckbox = (e) => {
    setIsConfirmed(e.target.checked);
  };

  const handleSendContract = async (contractId, vendorId) => {
    try {
      setLoadingButtons({ ...loadingButtons, [contractId]: true });
      await axios.post(
        `${import.meta.env.VITE_API_PORT}/api/contracts/send/${contractId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      socket.emit("chat", {
        message: "contracts",
        sender: socket.id,
        isTableRefresh: false,
      });
      axios.post(
        `${import.meta.env.VITE_API_PORT}/api/notifications/`,
        {
          title: `newContract`,
          description: `${currentUser.companyName} firması size kontrat gönderdi.`,
          props: { companyName: currentUser.companyName },
          isRead: false,
          relatedObjectId: null,
          relatedObjectUrl: "/contracts/",
          vendorId: vendorId,
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
    } catch (error) {
      console.error("contract failed:", error);
      setLoadingButtons({ ...loadingButtons, [contractId]: false });
    }
  };

  const handleConfirmation = async (
    contractId,
    status,
    companyId,
    contractName,
    projectId
  ) => {
    setLoadingContract(true);
    setLoadingConfButtons((prevState) => ({
      ...prevState,
      [contractId]: true,
    }));
    try {
      await axios
        .post(
          `${
            import.meta.env.VITE_API_PORT
          }/api/contracts/confirmation/${contractId}`,
          {
            status: status,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((result) => {
          if (result.status == 200) {
            setIsContractConfirmed(true);
            socket.emit("chat", {
              message: "contracts",
              sender: socket.id,
              isTableRefresh: false,
            });

            axios.post(
              `${import.meta.env.VITE_API_PORT}/api/notifications/`,
              {
                title: "contractApproval",
                description:
                  status === "approved"
                    ? `${
                        currentUser.firstName + " " + currentUser.lastName
                      } adlı danışman ${contractName} adlı kontratı onayladı`
                    : `${
                        currentUser.firstName + " " + currentUser.lastName
                      } adlı danışman ${contractName} adlı kontratı reddetti`,
                props: {
                  userName: `${currentUser.firstName} ${currentUser.lastName}`,
                  contractName,
                  status,
                },
                isRead: false,
                relatedObjectId: contractId,
                relatedObjectUrl: "/contracts",
                companyId: companyId,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (projectId && status === "approved") {
              axios.post(
                `${import.meta.env.VITE_API_PORT}/api/notifications/`,
                {
                  title: "addProject",
                  description: `${projectName} adlı projeye eklendin.`,
                  props: { projectName: projectName },
                  isRead: false,
                  relatedObjectId: projectId,
                  relatedObjectUrl: "/projects/",
                  vendorId: currentUser._id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
            }
            socket.emit("notification", {
              message: "contracts updated",
            });
          }
        });
    } catch (error) {
      console.error("contract failed:", error);
      setLoadingContract(false);
      setLoadingConfButtons((prevState) => ({
        ...prevState,
        [contractId]: false,
      }));
     
      openNotification(
        "topRight",
        "error",
        t("allAlert.contractApproveError")
      );
    }
  };

  const getContracts = async (data) => {
    if (data.isTableRefresh) setLoading(true);
    try {
      axios
        .get(`${import.meta.env.VITE_API_PORT}/api/contracts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          setLoadingConfButtons(false);
          setContracts(response.data.reverse());
          setSortedContracts(response.data);
          setLoading(false);
          setLoadingButton(false);
          setLoadingContract(false);
        });
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter((contract) =>
    searchText
      ? contract.vendorName &&
        contract.vendorName.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

  useEffect(() => {
    setSortedContracts(filteredContracts);
  }, [filteredContracts]);

  useEffect(() => {
    socket.on("chat", (data) => {
      if (data.message === "contracts") getContracts(data);
    });

    return () => {
      socket.off("chat");
    };
  }, []);

  useEffect(() => {
    const data = { isTableRefresh: true };
    getContracts(data);
  }, []);

  useEffect(() => {

    const filteredContracts = contracts.filter((contract) =>
      searchText && contract.contractName !== undefined
        ? contract.contractName.toLowerCase().includes(searchText.toLowerCase())
        : true
    );

    if (sortOrder === "default") {
      setSortedContracts(filteredContracts);
    } else {
      const sorted = [...filteredContracts].sort((a, b) => {
        if (sortOrder === "asc") {
          return a.contractName?.localeCompare(b.contractName);
        } else {
          return b.contractName?.localeCompare(a.contractName);
        }
      });
      setSortedContracts(sorted);
    }
  });

  const columns = [
    {
      title: t("contract.contractName"),
      dataIndex: "contractName",
    },
    {
      title: t("contract.vendor"),
      dataIndex: "vendorName",
    },
    {
      title: t("contract.project"),
      dataIndex: "projectName",
      render: (text) => {
        return text ? text : <div style={{ textAlign: "center" }}>-</div>;
      },
    },
    {
      title: t("contract.salary"),
      dataIndex: "paymentRate",
      render: (paymentRate, record) => {
        const currency = currencyList.find(
          (item) => item.value === record.currency
        );
        const formattedPaymentRate = `${
          currency?.prefix
        } ${paymentRate?.toLocaleString(undefined, {
          minimumFractionDigits: currency?.decimalDigits,
          maximumFractionDigits: currency?.decimalDigits,
        })}`;
        return <p>{formattedPaymentRate}</p>;
      },
    },
    {
      title: t("contract.confirmation"),
      dataIndex: "status",
      render: (text, record) => {
        let statusText = "";
        let color = "";
        const currentDate = new Date();
        let validThroughDate = new Date(record.validThroughDate);
        validThroughDate.setDate(validThroughDate.getDate() + 1);
        if (record.status === "pending" && currentDate > validThroughDate) {
          handleConfirmation(record._id, "rejected");
        }
        switch (text) {
          case "approved":
            (statusText = t("contract.approved")), (color = "success");
            break;
          case "rejected":
            (statusText = t("contract.rejected")), (color = "error");
            break;
          default:
            (statusText = t("contract.pending")), (color = "warning");
            break;
        }
        return (
          <>
            <Tooltip
              title={
                statusText == t("contract.pending")
                  ? new Date(
                      validThroughDate.setDate(validThroughDate.getDate() - 1)
                    ).toLocaleDateString() + t("contract.dateApprove")
                  : ""
              }
              overlayStyle={{ textAlign: "center" }}
            >
              <Tag color={color} style={{ width: "80px", textAlign: "center" }}>
                {statusText}
                {statusText === "Bekliyor" && (
                  <InfoCircleOutlined
                    style={{ marginLeft: "8px", color: "red" }}
                  />
                )}
              </Tag>
            </Tooltip>
          </>
        );
      },
    },
    {
      title: t("contract.status"),
      dataIndex: "isSend",
      render: (isSend, record) => {
        if (isSend) {
          return (
            <PrimaryButton
              disabled={true}
              style={{ height: "32px", width: "55%", color: "#008631aa" }}
            >
              {t("contract.sent")}
            </PrimaryButton>
          );
        } else {
          return (
            <PrimaryButton
              onClick={() => handleSendContract(record._id, record.vendorId)}
              loading={loadingButtons[record._id]}
              disabled={loadingButtons[record._id]}
              style={{ height: "32px", width: "55%" }}
            >
              {t("contract.send")}
            </PrimaryButton>
          );
        }
      },
    },
    {
      title: t("contract.detail"),
      dataIndex: "_id",
      render: (contractId) => (
        <Link to={`/contractDetails/${encryptContractId(contractId)}`}>
          <PrimaryButton style={{ height: "32px", width: "55%" }}>
            {t("contract.inspect")}
          </PrimaryButton>
        </Link>
      ),
    },

    {
      title: t("contract.jobContract"),
      dataIndex: ["contractName"],
      render: (contractName, record) => {
        const url = `${import.meta.env.VITE_API_PORT}/files/${contractName}${
          record.vendorId
        }.pdf`;
        return (
          <>
            <PrimaryButton
              style={{ height: "32px", width: "55%" }}
              onClick={() =>
                handleOpenModal(
                  url,
                  record.contractName,
                  record._id,
                  record.status,
                  record.companyId,
                  record.projectId,
                  record.projectName
                )
              }
            >
              {record.status === "pending"
                ? t("contract.approval")
                : t("contract.view")}
            </PrimaryButton>
          </>
        );
      },
    },
  ];

  if (currentUser.role !== "admin") {
    columns.splice(
      columns.findIndex((col) => col.dataIndex === "isSend"),
      1
    );
  }

  if (currentUser.role !== "user") {
    columns.splice(
      columns.findIndex((col) => col.title === "Onayla"),
      1
    );
  }


  const onSearchChange = (e) => setSearchText(e.target.value);

  const handleSortChange = (value) => {
    setSortOrder(value);
    if (value === "default") {
      setSortedContracts(filteredContracts);
    } else {
      const sorted = [...filteredContracts].sort((a, b) => {
        if (value === "asc") {
          return a.contractName.localeCompare(b.contractName);
        } else {
          return b.contractName.localeCompare(a.contractName);
        }
      });
      setSortedContracts(sorted);
    }
  };

  return (
    <>
      <Header socket={socket} />

      <Row
        justify="center"
        style={{ backgroundColor: "#F9F9F9", minHeight: "83.5vh" }}
      >
        <Col style={{ padding: "20px" }} sm={24} lg={18} xl={18} xxl={18}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item
              onClick={() => {
                navigate("/contracts");
              }}
            >
              <span style={{ cursor: "pointer" }}>
                {t("contract.contracts")}
              </span>
            </Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ padding: "10px" }}></div>

          <Card bodyStyle={{ padding: 25 }} style={{ overflow: "auto" }}>
            <Row>
              <Col span={24}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <div style={{ marginBottom: "15px" }}>
                    <Input.Search
                      size="large"
                      placeholder={t("contract.searchContract")}
                      onChange={onSearchChange}
                      style={{ width: 200, color: "black" }}
                    />
                    <Select
                      className="custom-select"
                      variant="borderless"
                      size="large"
                      defaultValue="default"
                      style={{ width: 120, marginLeft: "1em" }}
                      onChange={handleSortChange}
                    >
                      <Option value="default">{t("contract.contracts")}</Option>
                      <Option value="asc">A-Z</Option>
                      <Option value="desc">Z-A</Option>
                    </Select>
                  </div>
                  {currentUser && currentUser.role === "admin" && (
                    <Link
                      to="/contract"
                      style={{
                        marginLeft: "auto",
                      }}
                    >
                      <PrimaryButton onClick>
                        + {t("contract.addContract")}
                      </PrimaryButton>
                    </Link>
                  )}
                </div>
              </Col>
            </Row>
            <p className="table-title">{t("contract.contracts")}</p>
            <p className="table-count">
              {t("contract.total")} {contracts.length} {t("contract.result")}
            </p>
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
                scroll={{ x: "calc(800px)", y: "calc(800px)" }}
                columns={columns}
                dataSource={sortedContracts}
                loading={loading}
                pagination={{
                  showQuickJumper: true,
                  showSizeChanger: true,
                }}
              />
            </ConfigProvider>
          </Card>
        </Col>
      </Row>
      <Modal
        title=""
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        style={{ maxHeight: "10px" }}
      >
        <Row>
          {contractName && <PDFViewer pdfURL={url} />}
          {currentUser.role === "user" && (
            <Row
              justify="center"
              display="flex"
              style={{
                justify: "center",
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "25px",
              }}
            >
              {contractStatus === "approved" && (
                <Row
                  justify="center"
                  style={{
                    justify: "center",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <PrimaryButton
                    onClick={() => handleConfirmation(contractId, "approved")}
                    style={{
                      width: "100%",
                    }}
                    disabled="true"
                    loading={loading}
                  >
                    {t("contract.approved")}
                  </PrimaryButton>
                </Row>
              )}
              {contractStatus === "rejected" && (
                <Row
                  justify="center"
                  style={{
                    justify: "center",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <PrimaryButton
                    onClick={() => handleConfirmation(contractId, "approved")}
                    style={{
                      width: "100%",
                      backgroundColor: "#FFF2F0",
                      color: "#FF4D4F",
                    }}
                    disabled="true"
                    loading={loading}
                  >
                    {t("contract.contracts")}
                  </PrimaryButton>
                </Row>
              )}
              {contractStatus === "pending" && (
                <Row
                  justify="center"
                  style={{
                    justify: "center",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Row style={{ padding: "25px" }}>
                    {!isContractConfirmed && (
                      <Checkbox
                        checked={isConfirmed}
                        onChange={handleConfirmCheckbox}
                      >
                        {t("contract.readContract")}{" "}
                      </Checkbox>
                    )}
                  </Row>
                  <PrimaryButton
                    onClick={() =>
                      handleConfirmation(
                        contractId,
                        "approved",
                        companyId,
                        contractName,
                        projectId
                      )
                    }
                    style={{
                      width: "100%",
                    }}
                    loading={loadingContract}
                    disabled={
                      !isConfirmed || isContractConfirmed || loadingContract
                    }
                  >
                    {isContractConfirmed
                      ? isRejected
                        ? "Reddedildi"
                        : "Kabul Edildi"
                      : t("contract.approval")}
                  </PrimaryButton>
                  {!isContractConfirmed && (
                    <Button
                      danger
                      type="primary"
                      onClick={() => {
                        handleConfirmation(
                          contractId,
                          "rejected",
                          companyId,
                          contractName,
                          projectId
                        );
                        setIsRejected(true);
                      }}
                      style={{
                        width: "100%",
                        height: "40px",
                        marginTop: "10px",
                      }}
                      loading={loadingContract}
                      disabled={isContractConfirmed || loadingContract}
                    >
                      {isContractConfirmed
                        ? "Reddedildi"
                        : t("contract.reject")}
                    </Button>
                  )}
                </Row>
              )}
            </Row>
          )}
        </Row>
      </Modal>
    </>
  );
}
