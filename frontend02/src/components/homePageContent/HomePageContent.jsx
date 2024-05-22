import GlobalContext from "../../context/GlobalContext";
import { useState, useContext, useEffect } from "react";
import CompanyEffortsChart from "../chart/CompanyEffortsChart";
import { Row, Col, Spin, Modal, Form, Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import StackedBarChart from "../chart/StackedBarChart";
import PrimaryButton from "../buttons/primaryButton";
import { Link } from "react-router-dom";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../homePageContent/HomePageContent.scss";
import { encryptContractId } from "../../utils/utils.jsx";
import { useTranslation } from "react-i18next";
import
{ Divider }
from
"antd"
;

import { Select } from "antd";

const { Meta } = Card;

const HomePageContent = ({ token, open, handleClose }) => {
  const {
    isUsersFetched,
    response,
    currentUser,
    setResponse,
    projects,
    contractId,
  } = useContext(GlobalContext);
  const { newProjectName, users, setCurrentUser, setToken } =
    useContext(GlobalContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const signOut = useSignOut();
  const [projectName, setProjectName] = useState("");
  const [userCount, setUserCount] = useState(null);
  const [phone, setPhone] = useState(null);
  const [fetchContracts, setFetchContracts] = useState([]);
  const [isContractsCountFetched, setIsContractsCountFetched] = useState(false);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [isContractFetched, setIsContractFetched] = useState(false);
  const encryptedContractId = encryptContractId();
  const [contractsCount, setContractsCount] = useState(0);
  const { t } = useTranslation();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartProjects, setChartProjects] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_PORT}/api/projects/efforts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          year: selectedYear,
        },
      })
      .then((response) => {
        setChartProjects(response.data);
        setIsChartLoaded(true);
      })
      .catch((error) => {
        console.error("Veri çekilirken hata oluştu:", error);
      });
  }, [selectedYear]);

  useEffect(() => {
    if (
      isUsersFetched &&
      isContractFetched &&
      isContractsCountFetched &&
      isChartLoaded
    )
      setLoading(false);
    setUserCount(users.length);
  }, [
    isUsersFetched,
    isContractFetched,
    isContractsCountFetched,
    isChartLoaded,
    users.length,
  ]);

  useEffect(() => {
    if (currentUser.role == "admin") {
      return;
    } else if (currentUser.role == "user") {
      setLoading2(false);
    }
  }, [currentUser]);

  useEffect(() => {
    setProjectName(response.projectName);
  }, [response]);

  useEffect(() => {
    if (newProjectName) setProjectName(newProjectName);
  }, [newProjectName]);

  const handleProjeCardClick = () => {
    setResponse("");
    navigate("/projects");
  };
  const handleEffortsCardClick = () => {
    navigate("/efforts");
  };
  const handleContractsCardClick = () => {
    navigate("/contracts");
  };
  const handleContractClick = (contractId) => {
    navigate(`/contractDetails/${encryptContractId(contractId)}`);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    if (currentUser.role == "user" && !currentUser.firstName)
      setIsModalOpen(true);
  }, [currentUser]);

  const onFinish = async (values) => {
    setLoadingInfo(true);
    await axios
      .post(`${import.meta.env.VITE_API_PORT}/api/users/firstinfo`, values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setIsModalOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
    setLoadingInfo(false);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${day}/${month}/${year}`;
  };

  const contactOptions = [
    { label: t("profilecard.Phone"), value: "phone" },
    { label: t("profilecard.Email2"), value: "email" },
    { label: t("profilecard.Message"), value: "message" },
    { label: t("profilecard.VideoConference"), value: "videoConference" },
    { label: t("profilecard.FaceToFaceMeeting"), value: "faceToFaceMeeting" },
  ];

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_PORT}/api/contracts/pending`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFetchContracts(res.data.reverse());
        setIsContractFetched(true);
      } catch (err) {
        console.error(err);
      }
    };

    fetchContracts();
  }, [contractId, token]);

  useEffect(() => {
    const getContracts = async () => {
      try {
        axios
          .get(`${import.meta.env.VITE_API_PORT}/api/contracts/count`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response) => {
            setContractsCount(response.data.count);
            setIsContractsCountFetched(true);
          });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    getContracts();
  }, [token]);

  return (
    <div>
      <div>
        {currentUser && currentUser.role === "admin" ? (
          <Row gutter={[16, 16]} style={{ marginTop: "36px" }}>
            <Col span={12}>
              <Col span={24} style={{ marginBottom: "16px" }}>
                <Card
                  hoverable
                  style={{ width: "100%" }}
                  loading={loading}
                  onClick={() => handleProjeCardClick()}
                >
                  <Meta
                    title={t("homePage.totalProjectNumber")}
                    description={projects.length == 0 ? "0" : projects.length}
                  />
                </Card>
              </Col>
              <Col span={24} style={{ marginBottom: "16px" }}>
                <Card
                  hoverable
                  style={{ width: "100%" }}
                  loading={loading}
                  onClick={() => navigate("/users")}
                >
                  <Meta
                    title={t("homePage.totalVendorNumber")}
                    description={userCount == 0 ? "0" : userCount}
                  />
                </Card>
              </Col>
              <Col span={24} style={{ marginBottom: "16px" }}>
                <Card
                  hoverable
                  loading={loading}
                  style={{ width: "100%" }}
                  onClick={() => handleContractsCardClick()}
                >
                  <Meta
                    title={t("homePage.totalContractNumber")}
                    description={contractsCount == 0 ? "0" : contractsCount}
                  />
                </Card>
              </Col>
            </Col>
            <Col span={12} style={{ marginBottom: "16px" }}>
              <div>
                <Card
                title={t("homePage.contractsSentLastDays")}
                  className="contract-scroll"
                  style={{
                    dividers: "2",
                    height: 325,
                    overflowY: "auto",
                    scrollbarColor: "blue",
                  }}
                  bordered={false}
                  loading={loading}
                >
          
                  {fetchContracts.map((contract) => (
                    <div
                      key={contract._id}
                      style={{
                        width: "100%",
                        height: "50px",
                        backgroundColor: "#F9F9F9",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.s ease",
                      }}
                      onClick={() => handleContractClick(contract._id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "15px",
                        }}
                      >
                        <span>{contract.contractName?.toUpperCase()}</span>
                        <span style={{ marginLeft: "auto" }}>
                          {formatDate(contract.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </Col>
            <Col span={24} style={{ marginBottom: "16px" }}></Col>
            <Col span={24} style={{ marginBottom: "16px" }}>
              <Card hoverable style={{ width: "100%" }} loading={loading}>
                <Meta title={t("homePage.totalEffortProject")} />
                <CompanyEffortsChart
                  setSelectedYear={setSelectedYear}
                  selectedYear={selectedYear}
                  projects={chartProjects}
                />
              </Card>
            </Col>
          </Row>
        ) : currentUser && currentUser.role === "user" ? (
          <Row gutter={[16, 16]} style={{ marginTop: "36px" }}>
            <Col span={12}>
              <Col span={24} style={{ marginBottom: "16px" }}>
                <Card hoverable style={{ width: "100%" }} loading={loading2}>
                  <Meta
                    title={t("homePage.totalProjectNumber")}
                    description={
                      currentUser.projectIds.length == 0
                        ? "0"
                        : currentUser.projectIds.length
                    }
                    onClick={() => handleProjeCardClick()}
                  />
                </Card>
              </Col>
              <Col span={24} style={{ marginBottom: "16px" }}>
                <Card hoverable style={{ width: "100%" }} loading={loading2}>
                  <Meta
                    title={t("homePage.effortCount")}
                    description={
                      currentUser.effortIds.length == 0
                        ? "0"
                        : currentUser.effortIds.length
                    }
                    onClick={() => handleEffortsCardClick()}
                  />
                </Card>
              </Col>

              <Col span={24} style={{ marginBottom: "16px" }}>
                <Card
                  hoverable
                  style={{ width: "100%" }}
                  onClick={() => handleContractsCardClick()}
                >
                  <Meta
                    title={t("homePage.totalContractNumber")}
                    description={contractsCount == 0 ? "0" : contractsCount}
                  />
                </Card>
              </Col>
            </Col>
            <Col span={12} style={{ marginBottom: "16px" }}>
              <div>
                <Card
                  className="contract-scroll"
                  style={{
                    height: 325,
                    overflowY: "auto",
                    scrollbarColor: "blue",
                  }}
                  title={t("homePage.pendingContracts")}
                  bordered={false}
                >
                  {fetchContracts.map((contract) => (
                    <div
                      key={contract._id}
                      style={{
                        width: "100%",
                        height: "50px",
                        backgroundColor: "#F9F9F9",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.s ease",
                      }}
                      onClick={() => handleContractClick(contract._id)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "15px",
                        }}
                      >
                        <span>{contract.contractName?.toUpperCase()}</span>
                        <span style={{ marginLeft: "auto" }}>
                          {formatDate(contract.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </Col>
            <Col span={24} style={{ marginBottom: "16px" }}></Col>
            <Col span={24} style={{ marginBottom: "16px" }}>
              <Card hoverable style={{ width: "100%" }} loading={loading2}>
                <Meta title={t("homePage.yourEfforts")} />
                <StackedBarChart user={currentUser} />
              </Card>
            </Col>
          </Row>
        ) : (
          <div className="loading-overlay">
            <Spin size="large" />
          </div>
        )}
      </div>
      <Modal
        closeIcon={false}
        title={t("setUserInfoModal.title")}
        open={isModalOpen}
        onOk={handleOk}
        footer={null}
      >
        <Form
          name="basic"
          labelCol={{
            span: 24,
          }}
          wrapperCol={{
            span: 24,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label={t("setUserInfoModal.firstName.label")}
            name="firstName"
            rules={[
              {
                required: true,
                message: t("setUserInfoModal.firstName.error"),
              },
            ]}
          >
            <Input
              count={{
                show: true,
                max: 30,
              }}
              maxLength={30}
              placeholder={t("setUserInfoModal.firstName.placeholder")}
            />
          </Form.Item>

          <Form.Item
            label={t("setUserInfoModal.lastName.label")}
            name="lastName"
            rules={[
              {
                required: true,
                message: t("setUserInfoModal.lastName.error"),
              },
            ]}
          >
            <Input
              count={{
                show: true,
                max: 30,
              }}
              maxLength={30}
              placeholder={t("setUserInfoModal.lastName.placeholder")}
            />
          </Form.Item>

          <Form.Item
            label={t("setUserInfoModal.phoneNumber.label")}
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: t("setUserInfoModal.phoneNumber.error"),
              },
            ]}
          >
            <PhoneInput
              country={"tr"}
              value={phone}
              onChange={setPhone}
              inputStyle={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label={t("setUserInfoModal.prefferedContact.label")}
            name="prefferedContact"
            rules={[
              {
                required: true,
                message: t("setUserInfoModal.prefferedContact.error"),
              },
            ]}
          >
            <Select
              placeholder={t("setUserInfoModal.prefferedContact.placeholder")}
              allowClear
              mode="multiple" // Allow multiple selections
            >
              {contactOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 24,
            }}
          >
            <PrimaryButton
              loading={loadingInfo}
              disabled={loadingInfo}
              style={{ width: "100%", fontSize: "16px" }}
              type="primary"
              htmlType="submit"
            >
              {t("setUserInfoModal.complete")}
            </PrimaryButton>
          </Form.Item>
          <Form.Item style={{ marginTop: "-10px" }}>
            <Link
              to="/login"
              style={{ textDecoration: "none" }}
              onClick={() => {
                setResponse("");
                setCurrentUser("");
                setToken("");
                signOut();
              }}
              color="inherit"
            >
              <Button
                size="large"
                danger
                type="primary"
                style={{ width: "100%" }}
              >
                {t("setUserInfoModal.logout")}
              </Button>
            </Link>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HomePageContent;
