import React, { useState, useEffect, useContext } from "react";
import { Card, Modal, Tag, Tabs, Empty } from "antd";
import { useTranslation } from "react-i18next";
import { DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { Row, Col, Divider } from "antd";
import GlobalContext from "../../context/GlobalContext";
import StackedBarChart from "../chart/StackedBarChart";
import PolarChart from "../chart/PolarChart";
import { notification, Button } from "antd";
import { useNavigate } from "react-router-dom";
import LoadingContext from "../../context/LoadingContext";
import AreYouSureModal from "../modals/AreYouSureModal";
import "./style.scss";

const Context = React.createContext({
  name: "Default",
});

const { Meta } = Card;

export default function ProfileCard({
  user,
  token,
  onClose,
  setSelectedUser,
  socket,
}) {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [dailySalary, setDailySalary] = useState(user.dailySalary);
  const [userProfile, setUserProfile] = useState(user.dailySalary);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [projectUsers, setProjectUsers] = useState([]);
  const { isLoading, setIsLoading } = useContext(LoadingContext);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const [projectName, setProjectName] = useState([]);

  const {
    setProjectVendors,
    setNewOrDeletedUserId,
    newOrDeletedUserId,
    currentUser,
    projects,
    setResponse,
    setEfforts,
  } = useContext(GlobalContext);

  const handleProjectGet = async (id) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_PORT}/api/projects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const res = await axios.get(
        `${import.meta.env.VITE_API_PORT}/api/effort/getEfforts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEfforts(res.data.project);
      setProjectUsers(response.data.users);
      setProjectVendors(response.data.users);
      setProjectName(response.data.project.projectName);
      setResponse(response.data.project);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
      navigate("/projects");
    }
  };

  const [api, contextHolder] = notification.useNotification();
  const openSuccessNotification = (placement, message) => {
    api.success({
      message: message,
      placement,
    });
  };
  const openErrorNotification = (placement, message) => {
    api.error({
      message: message,
      placement,
    });
  };

  const onDeleteUser = (deletedUserId) => {
    setProjectVendors((prevUsers) =>
      prevUsers.filter((userItem) => userItem._id !== deletedUserId)
    );
  };

  useEffect(() => {
    setIsLoadingModal(true);
    axios
      .get(`${import.meta.env.VITE_API_PORT}/api/company/users/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const user = response.data;
        setUserProfile(user);
        setIsLoadingModal(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setIsLoadingModal(false);
      });
  }, [newOrDeletedUserId]);

  const onOk = async (_id) => {
    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_PORT}/api/company/users/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProjectVendors((prevUsers) =>
        Array.isArray(prevUsers)
          ? prevUsers.filter((user) => user._id !== _id)
          : []
      );
      onDeleteUser(_id);
      setNewOrDeletedUserId(_id);
      socket.emit("chat", {
        message: "vendorChanges",
        sender: socket.id,
      });
      setSelectedUser(null); // Deselect the user
      toast.success(t("profilecard.ConsultantDeleteSuccess"));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(t("profilecard.UserCannotBeDeleted"));
    }
    setLoading(false);
  };

  const [isModalVisible, setIsModalVisible] = useState(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    onClose();
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  function capitalizeFirstLetter(string) {
    return string && string.charAt(0).toUpperCase() + string.slice(1);
  }

  console.log("userProfile", userProfile);
  const onChange = (key) => {
    console.log(key);
  };

  return (
    <>
      <Context.Provider>{contextHolder}</Context.Provider>
      <AreYouSureModal
        loading={loading}
        onOkModal={() => {
          onOk(user._id);
        }}
        description={""}
        title={`${t("profilecard.ConfirmConsultantDeletion").replace(
          "{consultantName}",
          user.firstName + " " + user.lastName
        )}`}
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
      ></AreYouSureModal>
      <Modal
        className="profilecard"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        closeIcon={
          <Button
            shape="circle"
            onClick={handleCancel}
            icon={<CloseOutlined style={{ color: "black" }} />}
            style={{ backgroundColor: "white", borderColor: "#f5f5f5" }}
          />
        }
      >
        {user && (
          <Card
            loading={isLoadingModal}
            style={{ backgroundColor: "#f9f9f9" }}
            actions={
              currentUser.role === "admin" && [
                <DeleteOutlined
                  key="delete"
                  onClick={() => {
                    // Find the projects that the user is a part of
                    const userProjects = userProfile.projectIds
                      .map((projectId) => {
                        const project = projects.find(
                          (p) => p._id === projectId
                        );
                        return project ? project.projectName : null;
                      })
                      .filter(Boolean); // Remove null values

                    // Check if the user has any active projects
                    const activeProjects = userProjects.length;

                    if (activeProjects > 0) {
                      // If the user has active projects, show a warning modal
                      Modal.warning({
                        title: t("profilecard.UserDeletionError"),
                        content: (
                          <div>
                            {t("profilecard.UserActiveInProjects")}{" "}
                            <span style={{ color: "red" }}>
                              {userProjects.join(", ")}
                            </span>
                            {t("profilecard.RemoveUserFromProjects")}
                          </div>
                        ),
                        okButtonProps: {
                          style: {
                            backgroundColor: "blue",
                            borderColor: "blue",
                            color: "white",
                          },
                        },
                      });
                    } else {
                      // If the user doesn't have any active projects, show the delete confirmation modal
                      setIsModalOpen(true);
                    }
                  }}
                />,
              ]
            }
          >
            <Card
              style={{
                backgroundColor: "white",
                height: "5rem",
                border: "none",
              }}
            >
              <h2
                style={{
                  fontWeight: "bold",
                  fontSize: "20px",
                  textAlign: "center",
                }}
              >
                {userProfile &&
                  `${capitalizeFirstLetter(
                    userProfile.firstName
                  )} ${capitalizeFirstLetter(userProfile.lastName)}`}
              </h2>
            </Card>
            <Row gutter={16} style={{ padding: "1rem" }}>
              <Col span={12}>
                {userProfile.prefferedContact?.length > 0 && (
                  <p>
                    <strong>{t("profilecard.ContactOptions")}</strong>
                  </p>
                )}
                <p style={{ color: "red", lineHeight: "30px" }}>
                  {userProfile.prefferedContact?.map((contact, index) => (
                    <Tag
                      style={{ borderRadius: "15px" }}
                      color="#99C2FF"
                      key={index}
                    >
                      <p style={{ color: "black" }}>
                        {contact === "phone"
                          ? t("profilecard.Phone")
                          : contact === "videoConference"
                          ? t("profilecard.VideoConference")
                          : contact === "message"
                          ? t("profilecard.Message")
                          : contact === "faceToFaceMeeting"
                          ? t("profilecard.FaceToFaceMeeting")
                          : contact === "email"
                          ? t("profilecard.Email2")
                          : null}
                      </p>
                    </Tag>
                  ))}
                </p>
              </Col>
              <Col span={12}>
                {userProfile.projectIds?.length > 0 && (
                  <p>
                    <strong>{t("profilecard.ActiveProjects")}</strong>
                  </p>
                )}
                {userProfile.projectIds &&
                  userProfile.projectIds.map((projectId, index) => {
                    const project = projects.find((p) => p._id === projectId);
                    return project ? (
                      <button
                        onClick={() => {
                          handleProjectGet(projectId);
                        }}
                        style={{ lineHeight: "30px" }}
                      >
                        <Tag
                          style={{ borderRadius: "15px" }}
                          color="#02e292"
                          key={index}
                        >
                          <p style={{ color: "black" }}>
                            {project.projectName}
                          </p>
                        </Tag>
                      </button>
                    ) : null;
                  })}
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Card className="profile-field">
                  <p className="text">
                    <strong>{t("profilecard.Email")}</strong>{" "}
                    {userProfile.email}
                  </p>
                  <Divider className="divider" />
                  <p className="text">
                    <strong>{t("profilecard.PhoneNumber")}</strong>{" "}
                    {userProfile.phoneNumber}
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card className="profile-field">
                  <p className="text">
                    <strong>{t("profilecard.TotalEffortNumber")}</strong>
                    {userProfile.effortIds && userProfile.effortIds.length}
                  </p>
                </Card>
              </Col>
              <Col span={24} style={{ marginTop: "1rem" }}>
                <Card>
                  {userProfile &&
                  userProfile.projectIds &&
                  userProfile.projectIds.length > 0 ? (
                    <Tabs
                      defaultActiveKey="1"
                      items={userProfile.projectIds.map((projectId) => {
                        const project = projects.find(
                          (p) => p._id === projectId
                        );
                        return project
                          ? {
                              key: projectId,
                              label: project.projectName,
                              children: (
                                <PolarChart
                                  user={user}
                                  currentuser={currentUser}
                                  projectId={projectId}
                                />
                              ),
                            }
                          : null;
                      })}
                      onChange={onChange}
                    />
                  ) : (
                    <Empty />
                  )}
                </Card>
              </Col>
            </Row>
          </Card>
        )}
      </Modal>
    </>
  );
}
