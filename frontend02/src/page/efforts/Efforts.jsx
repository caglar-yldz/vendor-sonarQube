import React, { useState, useEffect, useContext } from "react";
import Header from "../../Layout/Header";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Table,
  Input,
  Row,
  Col,
  Select,
  ConfigProvider,
  Tag,
  Breadcrumb,
  Card,
} from "antd";
import { CommentOutlined } from "@ant-design/icons";
import LoadingContext from "../../context/LoadingContext";
import GlobalContext from "../../context/GlobalContext";
import "../../styles/Global.scss";
import PrimaryButton from "../../components/buttons/primaryButton";
import { HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddEffortCommentModal from "../../components/modals/AddEffortCommentModal";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";

export default function Efforts({ socket }) {
  useBackgroundStyle();
  const { t } = useTranslation();
  const { isLoading, setIsLoading } = useContext(LoadingContext);
  const { currentUser, projects } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [sortedEfforts, setSortedEfforts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [effortId, setEffortId] = useState(null);
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
  useEffect(() => {
    try {
      setLoading(true);
      axios
        .get(
          `${import.meta.env.VITE_API_PORT}/api/effort/getVendorsAllEfforts`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          const fetchedEfforts = response.data;

          const projectNames = {};
          projects.forEach((project) => {
            projectNames[project._id] = project.projectName;
          });

          const effortsWithProjectNames = fetchedEfforts.map((effort) => ({
            ...effort,
            projectName: projectNames[effort.projectId] || "Unknown",
          }));

          setSortedEfforts(effortsWithProjectNames.reverse());
         

          setLoading(false);
        });
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  }, [projects]);

  const columns = [
    {
      title: t("efforts.ProjectName"),
      dataIndex: "projectName",
    },
    {
      title: t("efforts.month"),
      dataIndex: "month",
      width: "10%",
      editable: true,
      render: (month) => {
        return <>{monthNames[month - 1]}</>;
      },
    },
    {
      title: t("effortListPagination.effortDuration"),
      dataIndex: "dayCount",
      width: "10%",
      editable: true,
      render: (day) => {
        return (
          <>
            <p>
              {day} {t("effortListPagination.day")}
            </p>
          </>
        );
      },
    },
    {
      title: t("efforts.EffortDescription"),
      dataIndex: "description",
    },
    {
      title: t("efforts.Status"),
      dataIndex: "effortConfirmation",
      render: (confirmation) => (
        <Tag
          color={
            confirmation === "approved"
              ? "success"
              : confirmation === "pending"
              ? "warning"
              : "error"
          }
        >
          {confirmation === "approved"
            ? t("efforts.Approved")
            : confirmation === "pending"
            ? t("efforts.Pending")
            : t("efforts.Rejected")}
        </Tag>
      ),
    },
    {
      title: t("efforts.CreationDate"),
      dataIndex: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: t("efforts.Comments"),
      dataIndex: "effortComments",
      render: (text, record) => (
        <CommentOutlined
          onClick={() => {
            setIsModalOpen(true);
            setEffortId(record._id);
          }}
        />
      ),
    },
  ];

  const onSearchChange = (e) => setSearchText(e.target.value);

  const filteredEfforts = sortedEfforts.filter((effort) =>
    searchText
      ? effort.description.toLowerCase().includes(searchText.toLowerCase())
      : true
  );

 

  return (
    <>
      <Header socket={socket} />
      <AddEffortCommentModal
        isModalOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        effortId={effortId}
      />

      <Row
        justify="center"
        style={{ backgroundColor: "#F9F9F9", minHeight: "83.5vh" }}
      >
        <Col
          style={{ padding: "20px" }}
          span={24}
          sm={24}
          lg={18}
          xl={18}
          xxl={18}
        >
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span style={{ cursor: "pointer" }}>{t("efforts.Efforts")}</span>
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
                  <Input.Search
                    size="large"
                    placeholder={t("efforts.SearchEffort")}
                    onChange={onSearchChange}
                    style={{ width: 200, color: "black", marginBottom: "15px" }}
                  />

                  {currentUser && currentUser.role === "admin" && (
                    <Link to="/contract" style={{ marginLeft: "auto" }}>
                      <PrimaryButton onClick>
                        {t("efforts.AddContract")}
                      </PrimaryButton>
                    </Link>
                  )}
                </div>
              </Col>
            </Row>
            <p className="table-title">{t("efforts.Efforts")}</p>
            <p className="table-count">
              {t("efforts.Total")} {filteredEfforts.length}{" "}
              {t("efforts.ListedResults")}
            </p>
            <ConfigProvider
              theme={{
                token: { borderRadius: 0 },
                components: {
                  Table: { headerBg: "#0000000F", borderColor: "none" },
                },
              }}
            >
              <Table
                scroll={{ x: "calc(800px)", y: "calc(800px)" }}
                className="clickable"
                columns={columns}
                dataSource={filteredEfforts}
                pagination={{ showQuickJumper: true, showSizeChanger: true }}
                loading={loading}
                onRow={(record) => ({ onClick: () => {} })}
              />
            </ConfigProvider>
          </Card>
        </Col>
      </Row>
    </>
  );
}
