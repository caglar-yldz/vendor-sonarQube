import GlobalContext from "../../context/GlobalContext";
import { useState, useContext, useEffect, createContext } from "react";
import { Row, Col, Tabs,Card } from "antd";
import {EffortListPagination,ProjectDescription,ProjectVendors,EditProject,ProjectListContent} from '../../components';
import Header from "../../Layout/Header";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import  useBackgroundStyle  from "../../hooks/useBackgroundStyle";
import { useTranslation } from "react-i18next";
const ProjectList = ({socket, openNotification}) => {
  useBackgroundStyle();

  const {
    response,
    currentUser,
    setResponse,
    token,
    newProjectName,
    setNewProjectName,
  } = useContext(GlobalContext);
  const [projectName, setProjectName] = useState(response.projectName);
  const { t } = useTranslation();

  useEffect(() => {
    setProjectName(response.projectName);
  }, [response]);

  useEffect(() => {
    if (newProjectName) {
      setProjectName(newProjectName);
      setNewProjectName("");
    }
  }, [newProjectName]);
 
  const items = [
    {
      key: "1",
      label: t("projectlist.details"),
      children: <ProjectDescription />,
    },
    {
      key: "2",
      label: t("projectlist.effortList"),
      children: <EffortListPagination token={token} socket={socket} />,
    },
    {
      key: "3",
      label: t("projectlist.vendorList"),
      children: <ProjectVendors socket={socket} />,
    },

    ...(currentUser &&
    (currentUser.role === "admin" || currentUser.role === "projectmanager")
      ? [
          {
            key: "4",
            label: t("projectlist.projectSettings"),
            children: <EditProject openNotification={openNotification} token={token} socket={socket} />,
          },
        ]
      : []),
  ];

  return (
    <div >
      {/* <Context.Provider>{contextHolder}</Context.Provider> */}
      <Header socket={socket} />
      <Row justify="center" style={{ minHeight: "83.5vh" }}>
        <Col style={{ padding: "20px" }} span={24} sm={24} lg={18} xl={18} xxl={18}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item
              onClick={() => {
                setResponse("");
              }}
            >
              <span style={{ cursor: "pointer" }}>{t("projectlist.projects")}</span>
            </Breadcrumb.Item>
            {response._id && (
              <Breadcrumb.Item>
                <span>{response.projectName}</span>
              </Breadcrumb.Item>
            )}
          </Breadcrumb>
          <div style={{ padding: "10px" }}></div>
          {response._id ? (
          <Row>
              <Col span={24} className="project-title">
                {projectName && projectName.toUpperCase()}
              </Col>
              <Col span={24}>
                <Tabs defaultActiveKey="1" items={items} />
              </Col>
            </Row>
          ) : (
            <ProjectListContent openNotification={openNotification} token={token} socket={socket} />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProjectList;
