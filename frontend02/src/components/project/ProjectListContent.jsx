import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";
import GlobalContext from "../../context/GlobalContext";
import ModalComponent from "../modals/CreateNewProjectModal";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import {
  Table,
  Input,
  Button,
  Row,
  Col,
  Select,
  ConfigProvider,
  Menu,
  Dropdown,
  Card,
} from "antd";
import { MenuOutlined } from "@ant-design/icons";
import LoadingContext from "../../context/LoadingContext";
import "../../styles/Global.scss";
import "./ProjectListContent.css";
import PrimaryButton from "../buttons/primaryButton";
import { useTranslation } from "react-i18next";

const ProjectListContent = ({ token, socket, openNotification }) => {
  const { t } = useTranslation();
  const { isLoading, setIsLoading } = useContext(LoadingContext);
  const { projects, setProjects, favoriteProjects, setFavoriteProjects } =
    useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const { currentUser, isProjectsFetched } = useContext(GlobalContext);
  const [sortOrder, setSortOrder] = useState("default");
  const [sortedProjects, setSortedProjects] = useState([]);
  const [oneProjectId, setOneProjectId] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(false);

  const handleVisibleChange = (flag) => {
    setDropdownVisible(flag);
  };
  const handleMenuClick = (e) => {
    e.domEvent.stopPropagation();
  };

  useEffect(() => {
    if (isProjectsFetched && favoriteProjects) {
      setLoading(false);
      setFavoriteCount(favoriteProjects.length);
    }
  }, [isProjectsFetched, favoriteProjects, projects]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const {
    setResponse,
    setEfforts,
    setProjectVendors,

    newOrDeletedProject,
  } = useContext(GlobalContext);
  const { Option } = Select;
  const [projectName, setProjectName] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

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
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  const handleFavoriteProject = async (record) => {
    setFavoriteLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [record._id]: true,
    }));
    if (favoriteCount < 5) {
      setFavoriteProjects((prevFavoriteProjects) =>
        prevFavoriteProjects.concat(record._id)
      );
      setFavoriteCount((prevCount) => prevCount + 1);
    } else {
      openNotification("topRight", "error", t("allAlert.favoriProject"));
      setFavoriteLoading((prevLoadingMap) => ({
        ...prevLoadingMap,
        [record._id]: false,
      }));
      return;
    }

    try {
      await axios
        .post(
          `${import.meta.env.VITE_API_PORT}/api/favoriteProjects/favorite`,
          {
            projectId: record._id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            setFavoriteLoading((prevLoadingMap) => ({
              ...prevLoadingMap,
              [record._id]: false,
            }));
          }
        });
    } catch (error) {
      console.error(error.response.data.message);
      openNotification("topRight", "error", t("allAlert.favoriProject"));
      setFavoriteLoading((prevLoadingMap) => ({
        ...prevLoadingMap,
        [record._id]: false,
      }));
    }
  };

  const handleDeleteFavoriteProject = async (record) => {
    setFavoriteLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [record._id]: true,
    }));
    setFavoriteProjects((prevFavoriteProjects) =>
      prevFavoriteProjects.filter((id) => id !== record._id)
    );
    setFavoriteCount((prevCount) => prevCount - 1);
    try {
      await axios
        .post(
          `${
            import.meta.env.VITE_API_PORT
          }/api/favoriteProjects/favoritedelete`,
          {
            projectId: record._id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            setFavoriteLoading((prevLoadingMap) => ({
              ...prevLoadingMap,
              [record._id]: false,
            }));
          }
        });
    } catch (error) {
      console.error(error);
      setFavoriteLoading((prevLoadingMap) => ({
        ...prevLoadingMap,
        [record._id]: false,
      }));
    }
  };

  useEffect(() => {
    const filteredProjects = projects.filter((project) =>
      searchText
        ? project.projectName.toLowerCase().includes(searchText.toLowerCase())
        : true
    );

    if (sortOrder === "default") {
      setSortedProjects(filteredProjects);
    } else {
      const sorted = [...filteredProjects].sort((a, b) => {
        if (sortOrder === "asc") {
          return a.projectName.localeCompare(b.projectName);
        } else {
          return b.projectName.localeCompare(a.projectName);
        }
      });
      setSortedProjects(sorted);
    }
  }, [projects, searchText, sortOrder, newOrDeletedProject]);

  const columns = [
    {
      title: "",
      dataIndex: "favoriteProjects",
      width: "5%",
      align: "center",
      render: (text, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          {favoriteProjects && favoriteProjects.includes(record._id) ? (
            <button
              onClick={() => handleDeleteFavoriteProject(record)}
              disabled={favoriteLoading[record._id]}
            >
              <StarFilled style={{ color: "#FCD901", fontSize: "20px" }} />
            </button>
          ) : (
            <button
              onClick={() => handleFavoriteProject(record)}
              disabled={favoriteLoading[record._id]}
            >
              <StarOutlined style={{ fontSize: "20px" }} />
            </button>
          )}
        </div>
      ),
    },
    {
      title: t("ProjectList.projectName"),
      dataIndex: "projectName",
      width: "95%",
    },
  ];

  const onSearchChange = (e) => setSearchText(e.target.value);

  const filteredProjects = projects.filter((project) =>
    searchText
      ? project.projectName.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

  const handleSortChange = (value) => {
    setSortOrder(value);
    setDropdownVisible(false);
    if (value === "default") {
      setSortedProjects(filteredProjects);
    } else {
      const sorted = [...filteredProjects].sort((a, b) => {
        if (value === "asc") {
          return a.projectName.localeCompare(b.projectName);
        } else {
          return b.projectName.localeCompare(a.projectName);
        }
      });
      setSortedProjects(sorted);
    }
  };

  useEffect(() => {
    const filteredProjects = projects.filter((project) =>
      searchText
        ? project.projectName.toLowerCase().includes(searchText.toLowerCase())
        : true
    );

    let sorted = [];
    if (sortOrder === "default") {
      sorted = filteredProjects.reverse();
    } else {
      sorted = [...filteredProjects].sort((a, b) => {
        if (sortOrder === "asc") {
          return a.projectName.localeCompare(b.projectName);
        } else {
          return b.projectName.localeCompare(a.projectName);
        }
      });
    }
    const favoritedProjects = sorted.filter((project) =>
      favoriteProjects.includes(project._id)
    );
    const nonFavoritedProjects = sorted.filter(
      (project) => !favoriteProjects.includes(project._id)
    );
    const reorderedProjects = [...favoritedProjects, ...nonFavoritedProjects];

    setSortedProjects(reorderedProjects);
  }, [projects, favoriteProjects, searchText, sortOrder, newOrDeletedProject]);

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="search">
        <Input.Search
          size="large"
          placeholder={t("ProjectList.searchProject")}
          onChange={onSearchChange}
          onPressEnter={() => setDropdownVisible(false)}
          onSearch={() => setDropdownVisible(false)}
          style={{ width: 200, color: "black" }}
        />
      </Menu.Item>
      <Menu.Item key="0">
        <Select
          className="custom-select"
          variant="borderless"
          size="large"
          defaultValue="default"
          style={{ width: 120, marginLeft: "1em" }}
          onChange={handleSortChange}
        >
          <Option value="default">{t("ProjectList.sort")}</Option>
          <Option value="asc">{t("ProjectList.ascending")}</Option>
          <Option value="desc">{t("ProjectList.descending")}</Option>
        </Select>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Card bodyStyle={{ padding: 25 }} style={{ overflow: "auto" }}>
        <Row style={{ width: "100%" }}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              {isMobile ? (
                <div>
                  <Dropdown
                    overlay={menu}
                    trigger={["click"]}
                    visible={dropdownVisible}
                    onVisibleChange={handleVisibleChange}
                  >
                    <Button icon={<MenuOutlined />}>Filtreler</Button>
                  </Dropdown>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <Input.Search
                      size="large"
                      placeholder={t("ProjectList.searchProject")}
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
                      <Option value="default">{t("ProjectList.sort")}</Option>
                      <Option value="asc">{t("ProjectList.ascending")}</Option>
                      <Option value="desc">
                        {t("ProjectList.descending")}
                      </Option>
                    </Select>
                  </div>
                </>
              )}

              {currentUser && currentUser.role === "admin" && (
                <PrimaryButton
                  style={{
                    marginLeft: "auto",
                  }}
                  onClick={handleOpenModal}
                >
                  {t("ProjectList.createProject")}
                </PrimaryButton>
              )}
              {openModal && (
                <ModalComponent
                  open={handleOpenModal}
                  handleClose={handleCloseModal}
                  token={token}
                  socket={socket}
                  openNotification={openNotification}
                />
              )}
            </div>
          </Col>
        </Row>
        <p className="table-title">{t("ProjectList.projects")}</p>
        <p className="table-count">
          {t("ProjectList.totalResultsListed").replace(
            "{projects.length}",
            projects.length.toString()
          )}
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
            className="clickable"
            columns={columns}
            dataSource={sortedProjects}
            loading={loading}
            onRow={(record) => {
              return {
                onClick: () => {
                  setOneProjectId(record._id);
                  handleProjectGet(record._id);
                },
              };
            }}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: true,
            }}
          />
        </ConfigProvider>
      </Card>
    </>
  );
};

export default ProjectListContent;
