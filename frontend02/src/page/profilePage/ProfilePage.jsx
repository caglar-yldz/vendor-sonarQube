import React, { useContext, useState, useEffect } from "react";
import {
  Layout,
  Card,
  Avatar,
  Row,
  Col,
  Typography,
  List,
  Button,
  Input,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import GlobalContext from "../../context/GlobalContext";
import Header from "../../Layout/Header";
import axios from "axios";
import { notification } from "antd";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";
import { LanguageSelector } from "../../components";
import { useTranslation } from "react-i18next";

const Context = React.createContext({
  name: "Default",
});

const { Content } = Layout;
const { Title } = Typography;

const ProfilePage = ({ socket }) => {
  useBackgroundStyle();
  const { currentUser, setCurrentUser } = useContext(GlobalContext);
  const [editMode, setEditMode] = useState(false);
  const [address, setAddress] = useState({ city: "", country: "" });
  const [role, setRole] = useState("");
  const [about, setAbout] = useState({ bio: "", skills: [] });
  const { t } = useTranslation();

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

  useEffect(() => {
    setAddress({
      city: currentUser?.address?.city,
      country: currentUser?.address?.country,
    });
    setRole(currentUser?.role);
    setAbout({
      bio: currentUser?.about?.bio,
      skills: currentUser?.about?.skills,
    });
  }, [currentUser]);

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_PORT}/api/users/current`,
        {
          address,
          role,
          about,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedUser = { ...currentUser };
        updatedUser.address = address;
        updatedUser.role = role;
        updatedUser.about = about;

        setCurrentUser(updatedUser);
        setEditMode(false);
        openSuccessNotification("topRight", t("allAlert.profileEditSuccess"));
      } else {
        console.error("Update failed");
      }
    } catch (error) {
      openErrorNotification("topRight", t("allAlert.profileEditError"));
      console.error("Update failed", error);
    }
  };

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const renderListItem = (item, index) => (
    <List.Item key={index}>
      <List.Item.Meta title={item.label} description={item.value} />
    </List.Item>
  );

  return (
    <>
      <>
        <Context.Provider>{contextHolder}</Context.Provider>
      </>
      <Header socket={socket} />
      <Layout>
        <Content
          style={{
            padding: "0 50px",
            minHeight: "calc(100vh - 128px)",
          }}
        >
          <Row justify="center" style={{ marginTop: "20px" }}>
            <Col align="center">
              <Avatar
                icon={<UserOutlined />}
                src={currentUser?.profilePicture}
                size={64}
              />
              <Title level={2} style={{ textAlign: "center" }}>
                {currentUser?.firstName} {currentUser?.lastName}
              </Title>
              <Button
                style={{ marginBottom: "20px" }}
                onClick={editMode ? handleSave : handleEdit}
              >
                {editMode ? t("profile.save") : t("profile.edit")}
              </Button>{" "}
            </Col>
          </Row>
          <Row gutter={16} justify="center">
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              style={{ display: "flex", marginBottom: "16px" }}
            >
              <Card
                title={t("profile.personalinformation")}
                style={{ width: "40vw", margin: "auto" }}
              >
                {currentUser.role == "user" ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      {
                        label: t("profile.name"),
                        value: currentUser?.firstName,
                      },
                      {
                        label: t("profile.surname"),
                        value: currentUser?.lastName,
                      },
                      { label: t("profile.email"), value: currentUser?.email },
                      {
                        label: t("profile.phone"),
                        value: currentUser?.phoneNumber
                          ? "+" + currentUser?.phoneNumber
                          : "",
                      },
                      {
                        label: t("profile.contactSelection"),
                        value: currentUser?.prefferedContact?.map(
                          (contact, index) => {
                            return (
                              <div key={index}>
                                <p>
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
                              </div>
                            );
                          }
                        ),
                      },
                      {
                        label: t("profile.city"),
                        value: editMode ? (
                          <Input
                            value={address.city}
                            onChange={(e) =>
                              setAddress({ ...address, city: e.target.value })
                            }
                          />
                        ) : (
                          address.city
                        ),
                      },
                      {
                        label: t("profile.country"),
                        value: editMode ? (
                          <Input
                            value={address.country}
                            onChange={(e) =>
                              setAddress({
                                ...address,
                                country: e.target.value,
                              })
                            }
                          />
                        ) : (
                          address.country
                        ),
                      },
                    ]}
                    renderItem={renderListItem}
                  />
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={[
                      { label: t("profile.email"), value: currentUser?.email },
                      {
                        label: t("profile.phone"),
                        value: currentUser?.phoneNumber
                          ? "+" + currentUser?.phoneNumber
                          : "",
                      },
                      {
                        label: t("profile.city"),
                        value: editMode ? (
                          <Input
                            value={address.city}
                            onChange={(e) =>
                              setAddress({ ...address, city: e.target.value })
                            }
                          />
                        ) : (
                          address.city
                        ),
                      },
                      {
                        label: t("profile.country"),
                        value: editMode ? (
                          <Input
                            value={address.country}
                            onChange={(e) =>
                              setAddress({
                                ...address,
                                country: e.target.value,
                              })
                            }
                          />
                        ) : (
                          address.country
                        ),
                      },
                    ]}
                    renderItem={renderListItem}
                  />
                )}
              </Card>
            </Col>
            <Col
              span={24}
              xs={24}
              sm={24}
              md={24}
              lg={24}
              style={{ display: "flex", marginBottom: "16px" }}
            >
              <Card
                title={t("profile.languageOption")}
                style={{ width: "40vw", margin: "auto" }}
              >
                <LanguageSelector />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </>
  );
};

export default ProfilePage;
