import "./Header.scss";
import HeaderLogo from "../images/HeaderLogo.png";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";
import { Col, Row, Dropdown, Space, Menu, Typography } from "antd";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import axios from "axios";
import {
  ProjectOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import LoadingContext from "../context/LoadingContext";
import NotificationDrawer from "../components/notification/NotificationDrawer";
import useHomeFetchUserData from "../hooks/useHomeFetchUserData";
import useFetchUsers from "../hooks/useFetchUsers";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from "../components";
import { useMediaQuery } from "react-responsive";
import { Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import moment from "moment";
import "moment/locale/tr"; // Import the Turkish locale
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";
// Extend day.js with the relativeTime plugin

// Set the locale to Turkish
moment.locale("tr");

function Header({ socket }) {
  const { setIsLoading } = useContext(LoadingContext);
  const {
    currentUser,
    projects,
    setCurrentUser,
    token,
    setToken,
    setUsers,
    newProjectName,
    setIsProjectsFetched,
    setFavoriteProjects,
    favoriteProjects,
    isReadContinuing,
    setIsUsersFetched
  } = useContext(GlobalContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openProjects, setOpenProjects] = useState(false);
  const [oneProjectId, setOneProjectId] = useState(false);
  const { setResponse, setEfforts, setProjectVendors, setProjects } =
    useContext(GlobalContext);
  const [projectName, setProjectName] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [notifications, setNotifications] = useState([]);
  const [unreadedNotificationCount, setUnreadedNotificationCount] = useState(0);
  const { t, i18n } = useTranslation();
  const menuItem = [t("header.consultantManagement")];

  dayjs.extend(relativeTime);
  dayjs.locale(i18n.language == "en" ? "en" : "tr");

  const isPhone = useMediaQuery({ query: "(max-width: 600px)" });

  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === "user" && !currentUser.firstName)
      navigate("/");
  }, [currentUser]);

  const fetchNotifications = () => {
    axios
      .get(`${import.meta.env.VITE_API_PORT}/api/notifications/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((notifications) => {
        setUnreadedNotificationCount(
          notifications.data.filter((notification) => !notification.isRead)
            .length
        );
        setNotifications(
          notifications.data
            .map((notification) => ({
              ...notification,
              createdAt: dayjs().to(notification.createdAt),
            }))
            .reverse()
        );
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    socket.on("notification", (data) => {
      fetchNotifications();
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  useEffect(() => {
    const fetchFavoriteProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_PORT}/api/favoriteProjects`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFavoriteProjects(response.data);
      } catch (error) {
        console.error("Error fetching favorite projects:", error);
      }
    };

    fetchFavoriteProjects();
  }, []);

  useEffect(() => {
    if (!isReadContinuing) fetchNotifications();
  }, [isReadContinuing, i18n.language]);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };
  const sortedProjects = projects
    .slice()
    .sort((a, b) => a.projectName.localeCompare(b.projectName));

  const projectMenu = (
    <Menu>
      {sortedProjects
        .filter((project) => favoriteProjects.includes(project._id)) // Sadece favori projeleri filtrele
        .slice(0, 5)
        .map((project, index) => (
          <Menu.Item
            style={{
              display: "flex",
              height: "40px",
              padding: "0px 24px",
              alignItems: "center",
              gap: "8px",
            }}
            key={index}
            onClick={() => {
              setOneProjectId(project._id);
              handleProjectGet(project._id);
            }}
          >
            <ProjectOutlined style={{ marginRight: "10px" }} />
            {project.projectName.toUpperCase()}
          </Menu.Item>
        ))}
      {projects.length >= 0 && (
        <Menu.Divider
          style={{ margin: "8px 0", borderTop: "1px solid #e8e8e8" }}
        />
      )}
      {projects.length >= 0 && (
        <Menu.Item
          key="viewAll"
          onClick={() => {
            setResponse("");
          }}
          style={{
            display: "flex",
            height: "40px",
            padding: "0px 24px",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Link to="/projects" style={{ textDecoration: "none" }}>
            {t("header.viewAll")}{" "}
          </Link>
        </Menu.Item>
      )}
    </Menu>
  );
  const items = [
    {
      key: "1",
      label: (
        <Link style={{ textDecoration: "none" }} to="/profile">
          {" "}
          {t("header.profile")}
        </Link>
      ),
    },
    {
      key: "2",
      label: (
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
          {t("header.exit")}
        </Link>
      ),
    },
  ];



  useEffect(() => {
    setToken(token);
    useHomeFetchUserData(token).then((user) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (currentUser.role !== "admin") {
      return;
    }

    const chatListener = (data) => {
      if (data.message === "vendorChanges") {
        useFetchUsers(token, currentUser)
          .then((users) => setUsers(users))
          .catch((error) => console.error(error));
      }
    };

    socket.on("chat", chatListener);

    return () => {
      socket.off("chat", chatListener);
    };
  }, [currentUser]);

  useEffect(() => {
    {
      if (currentUser && currentUser.role === "admin") {
        useFetchUsers(token, currentUser)
          .then((users) => {
            setUsers(users)
            setIsUsersFetched(true);
          })
          .catch((error) => console.error(error));
      }
    }
  }, [token, currentUser]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_PORT}/api/projects`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    setIsProjectsFetched(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    socket.on("chat", (data) => {
      if (data.message === "addNewProject") fetchProjects();
    });

    return () => {
      socket.off("chat");
    };
  }, [newProjectName]);

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
      navigate("/projects");
      setEfforts(res.data.project);
      setProjectUsers(response.data.users);
      setProjectVendors(response.data.users);
      setProjectName(response.data.project.projectName);
      setResponse(response.data.project);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row>
      {isPhone ? (
        <>
          <Row
            justify="space-between"
            align="middle"
            style={{ width: "100%", backgroundColor: "#f0f4fc" }}
          >
            <Button
              type="primary"
              onClick={showDrawer}
              style={{ color: "black" }}
            >
              <MenuOutlined />
            </Button>
            <Link to="/">
              <img src={HeaderLogo} className="header-logo" alt="Logo"></img>
            </Link>

            <div style={{ display: "flex", alignItems: "center" }}>
              <Col style={{ paddingRight: "30px" }}>
                <NotificationDrawer
                  setNotifications={setNotifications}
                  setUnreadedNotificationCount={setUnreadedNotificationCount}
                  unreadedNotificationCount={unreadedNotificationCount}
                  notifications={notifications}
                  style={{ fontSize: "24px" }}
                />
              </Col>
              <div className="header-username-role">
                <div className="header-username">
                  {(currentUser.companyName &&
                    currentUser.companyName.toUpperCase()) ||
                    (currentUser.userName &&
                      currentUser.firstName?.toUpperCase())}
                </div>
                {currentUser && currentUser.role === "user" ? (
                  <div className="header-role">{t("header.employee")}</div>
                ) : (
                  <div className="header-role">{t("header.employer")}</div>
                )}
              </div>
              {selectedUser && (
                <ProfileCard
                  key={selectedUser._id}
                  user={selectedUser}
                  token={token}
                  socket={socket}
                  onClose={() => setSelectedUser(null)}
                />
              )}
              <Dropdown
                overlayStyle={{ zIndex: 9999 }}
                menu={{
                  items,
                }}
                placement="bottomRight"
              >
                <button
                  style={{ backgroundColor: "#0057D9" }}
                  className="header-avatar"
                >
                  {(currentUser.companyName &&
                    currentUser.companyName.charAt(0).toUpperCase()) ||
                    (currentUser.userName &&
                      currentUser.firstName?.charAt(0).toUpperCase())}
                </button>
              </Dropdown>
            </div>
          </Row>
          <Drawer
            title="Menu"
            placement="left"
            onClick={onClose}
            onClose={onClose}
            visible={drawerVisible}
          >
            <Menu>
              <Menu.Item>
                <Link to="/">{t("header.consultantManagement")}</Link>
              </Menu.Item>
            </Menu>
          </Drawer>
        </>
      ) : (
        <Col className="header-box">
          <Col className="header-major-menu">
            <Link to="/">
              <img src={HeaderLogo} className="header-logo" alt="Logo"></img>
            </Link>
            <Col className="header-menu">
              {menuItem.map((item, index) => (
                <Col style={{ display: "flex" }} key={index}>
                  <div style={{ display: "flex" }}>
                    <div style={{ backgroundColor: "white" }}>
                      <div className="border-left-bottom"></div>
                    </div>
                    <div className="border-left-top"></div>
                  </div>
                  <div className="header-menu-item">
                    <Link
                      style={{ color: "black", textDecoration: "none" }}
                      to="/"
                    >
                      {item}
                    </Link>
                  </div>
                  <div style={{ display: "flex" }}>
                    {" "}
                    <div className="border-right-bottom"></div>
                    <div style={{ backgroundColor: "white" }}>
                      <div className="border-right-top"></div>
                    </div>
                  </div>
                </Col>
              ))}
            </Col>
          </Col>
          <Row style={{ paddingRight: "15px" }}>
            <Col span={6} style={{ paddingRight: "30px" }}>
              <NotificationDrawer
                setNotifications={setNotifications}
                setUnreadedNotificationCount={setUnreadedNotificationCount}
                unreadedNotificationCount={unreadedNotificationCount}
                notifications={notifications}
                style={{ fontSize: "24px" }}
              />
            </Col>
            <Col
              span={12}
              style={{ paddingRight: "15px" }}
              className="header-username-role"
            >
              <div className="header-username">
                {(currentUser.companyName &&
                  currentUser.companyName.toUpperCase()) ||
                  (currentUser.userName &&
                    currentUser.firstName?.toUpperCase())}
              </div>
              {currentUser && currentUser.role === "user" ? (
                <div className="header-role">{t("header.employee")}</div>
              ) : (
                <div className="header-role">{t("header.employer")}</div>
              )}
            </Col>
            <Col span={6}>
              <Dropdown
                overlayStyle={{ zIndex: 9999 }}
                menu={{
                  items,
                }}
                placement="bottomRight"
              >
                <button
                  style={{ backgroundColor: "#0057D9" }}
                  className="header-avatar"
                >
                  {(currentUser.companyName &&
                    currentUser.companyName.charAt(0).toUpperCase()) ||
                    (currentUser.userName &&
                      currentUser.firstName?.charAt(0).toUpperCase())}
                </button>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      )}
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          overflowX: "auto",
          width: "100vw",
        }}
      >
        {isPhone ? (
          <Row className="header-submenu-mobile" style={{ flexShrink: 0 }}>
            <Link to="/" style={{ color: "#000000E0" }}>
              <Typography>
                <Space
                  style={{
                    width: "150px",
                  }}
                  className="header-submenu-item"
                >
                  {t("header.dashboard")}
                </Space>
              </Typography>
            </Link>
            {favoriteProjects.length > 0 ? (
              <Dropdown
                overlay={projectMenu}
                onVisibleChange={(visible) => setOpenProjects(visible)}
                visible={openProjects}
                trigger={["click"]}
              >
                <Typography>
                  <Space
                    style={{
                      background: openProjects ? "#f5f5f5" : "transparent",
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.projects")}
                    {openProjects ? <CaretUpOutlined /> : <CaretDownOutlined />}
                  </Space>
                </Typography>
              </Dropdown>
            ) : (
              <Link
                onClick={() => {
                  setResponse("");
                }}
                to="/projects"
                style={{ color: "black" }}
              >
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.projects")}
                  </Space>
                </Typography>
              </Link>
            )}
            {currentUser && currentUser.role === "admin" && (
              <Link to="/users" style={{ color: "black" }}>
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.consultants")}
                  </Space>
                </Typography>
              </Link>
            )}
            <Link to="/contracts" style={{ color: "#000000E0" }}>
              <Typography>
                <Space
                  style={{
                    width: "150px",
                  }}
                  className="header-submenu-item"
                >
                  {t("header.contracts")}
                </Space>
              </Typography>
            </Link>
            {currentUser.role !== "admin" && (
              <Link to="/efforts" style={{ color: "black" }}>
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.efforts")}
                  </Space>
                </Typography>
              </Link>
            )}
            {currentUser.role == "admin" && (
              <Link to="/payments" style={{ color: "black" }}>
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.payments")}
                  </Space>
                </Typography>
              </Link>
            )}
          </Row>
        ) : (
          <Col
            span={24}
            className="header-submenu"
            style={{ flexShrink: 0, width: "100vw" }}
          >
            <Link to="/" style={{ color: "#000000E0" }}>
              <Typography>
                <Space
                  style={{
                    width: "150px",
                  }}
                  className="header-submenu-item"
                >
                  {t("header.dashboard")}
                </Space>
              </Typography>
            </Link>
            {favoriteProjects.length > 0 ? (
              <Dropdown
                overlay={projectMenu}
                onVisibleChange={(visible) => setOpenProjects(visible)}
                visible={openProjects}
                trigger={["click"]}
              >
                <Typography>
                  <Space
                    style={{
                      background: openProjects ? "#f5f5f5" : "transparent",
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.projects")}
                    {openProjects ? <CaretUpOutlined /> : <CaretDownOutlined />}
                  </Space>
                </Typography>
              </Dropdown>
            ) : (
              <Link
                onClick={() => {
                  setResponse("");
                }}
                to="/projects"
                style={{ color: "black" }}
              >
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.projects")}
                  </Space>
                </Typography>
              </Link>
            )}

            {currentUser && currentUser.role === "admin" && (
              <Link to="/users" style={{ color: "black" }}>
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.consultants")}
                  </Space>
                </Typography>
              </Link>
            )}
            <Link to="/contracts" style={{ color: "black" }}>
              <Typography>
                <Space
                  style={{
                    width: "150px",
                  }}
                  className="header-submenu-item"
                >
                  {t("header.contracts")}
                </Space>
              </Typography>
            </Link>
            {currentUser.role !== "admin" && (
              <Link to="/efforts" style={{ color: "black" }}>
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.efforts")}
                  </Space>
                </Typography>
              </Link>
            )}
            {currentUser.role == "admin" && (
              <Link to="/payments" style={{ color: "black" }}>
                <Typography>
                  <Space
                    style={{
                      width: "150px",
                    }}
                    className="header-submenu-item"
                  >
                    {t("header.payments")}
                  </Space>
                </Typography>
              </Link>
            )}
          </Col>
        )}
        {selectedUser && (
          <ProfileCard
            key={selectedUser._id}
            user={selectedUser}
            token={token}
            socket={socket}
            onClose={() => setSelectedUser(null)}
            style={{ flexShrink: 0 }}
          />
        )}
      </Row>
    </Row>
  );
}

export default Header;
