import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  ConfigProvider,
  Input,
  Popconfirm,
  Table,
  Typography,
  Space,
  Tag,
  Col,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  Loading3QuartersOutlined,
} from "@ant-design/icons";
import GlobalContext from "../../context/GlobalContext";
import AddEffortCommentModal from "../modals/AddEffortCommentModal";
import axios from "axios";
import CreateEffortModal from "../modals/CreateEffortModal";
import { notification } from "antd";
import PrimaryButton from "../buttons/primaryButton";

const Context = React.createContext({
  name: "Default",
});
import "../../styles/Global.scss";

const EffortListPagination = ({ token, socket }) => {
  const { t } = useTranslation();
  const {
    efforts,
    response,
    currentUser,
    setEfforts,
    setProjectId,
    newEffort,
  } = useContext(GlobalContext);
  const [form] = Form.useForm();
  const [data, setData] = useState(efforts);
  const [editingKey, setEditingKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [effortIdInModal, setEffortIdInModal] = useState(null);
  const [openEffort, setOpenEffort] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contractStartDate, setContractStartDate] = useState(false);

  const onSearchChange = (e) => setSearchText(e.target.value);
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
  const handleEffortsGet = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_PORT}/api/effort/getEfforts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEfforts(res.data.project);

      const contractStartDate = await axios.get(
        `${import.meta.env.VITE_API_PORT}/api/contracts/date/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setContractStartDate(contractStartDate.data.createdAt);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    handleEffortsGet(response._id);
  }, [newEffort]);

  const filteredData = data
    .filter((item) =>
      item.userName.toLowerCase().includes(searchText.toLowerCase())
    )
    .reverse();
  const { TextArea } = Input;

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    handleAddComment,
    form,
    ...restProps
  }) => {
    const inputNode = dataIndex === "description" ? <TextArea /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: title === "Efor Süresi" ? false : true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
        {!editing && dataIndex === "operation" && (
          <a
            style={{ marginLeft: 8 }}
            onClick={() => handleAddComment(record.effortId, record.vendorId)}
          >
            <CommentOutlined />
          </a>
        )}
      </td>
    );
  };

  const isEditing = (record) => record.effortId === editingKey;

  useEffect(() => {
    setData(efforts);
  }, [efforts]);

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.effortId);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const handleEffortStatus = async (effortId, newStatus, vendorId) => {
    setLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [effortId]: true,
    }));
    console.log("ID: " + vendorId);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_PORT}/api/effort/status`,
        {
          effortId: effortId,
          newStatus: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newData = [...data];
      const index = newData.findIndex((item) => item.effortId === effortId);
      if (index > -1) {
        newData[index].effortConfirmation = newStatus;
        setData(newData);
      }

      axios.post(
        `${import.meta.env.VITE_API_PORT}/api/notifications/`,
        {
          title: "effort",
          description: `Eforunuz ${
            newStatus === "approved" ? "onaylandı" : "reddedildi"
          }`,
          props: { status: newStatus },
          isRead: false,
          relatedObjectId: null,
          relatedObjectUrl: "/efforts/",
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
      console.error(error);
    }
    setLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [effortId]: false,
    }));
  };

  const save = async (key) => {
    try {
      const editedData = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.effortId);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...editedData,
        });
        setData(newData);
        setEditingKey("");
        await handleEditEffort(item.effortId, editedData);
      } else {
        newData.push(editedData);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.error("Validate Failed:", errInfo);
    }
  };

  const handleOpenEffort = () => {
    setOpenEffort(true);
  };

  const handleCloseEffort = () => {
    setOpenEffort(false);
  };

  const handleSuccessEffort = () => {
    openNotification("topRight");
    setShowAlert(true);
    setProjectId(response._id);
    setOpenEffort(false);
  };
  const handleErrorEffort = () => {
    openErrorNotification("topRight");
    setShowAlert(true);
    setProjectId(response._id);
    setOpenEffort(false);
  };

  const handleEditEffort = async (effortId, editedData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_PORT}/api/effort/updateEffort/${effortId}`,
        {
          description: editedData.description,
          dayCount: editedData.dayCount,
          month: editedData.month,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const oldWorkHours = data.find(
          (item) => item.effortId === effortId
        ).workHours;
        const oldDescription = data.find(
          (item) => item.effortId === effortId
        ).description;
        const comment = `~~Eski Work Hours: ${oldWorkHours}, Eski Açıklama: ${oldDescription}~~\nYeni Work Hours: ${editedData.workHours}, Yeni Açıklama: ${editedData.description}`;
        await axios.post(
          `${import.meta.env.VITE_API_PORT}/api/effort/addComment`,
          {
            effortId: effortId,
            comment: comment,
            date: new Date().toLocaleString(), // Sending the date with the comment
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        console.error("Edit failed:", response.status);
      }
    } catch (error) {
      console.error("Edit failed:", error);
    }
  };

  const handleAddComment = (effortId, vendorId) => {
    setEffortIdInModal({ effortId, vendorId });
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEffortIdInModal(null);
  };

  const columns = [
    {
      title: t("effortListPagination.consultantName"),
      dataIndex: "userName",
      editable: false,
      sorter: (a, b) => a.userName.localeCompare(b.userName),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: t("efforts.month"),
      dataIndex: "month",
      editable: true,
      sorter: (a, b) => a.workHours.localeCompare(b.workHours),
      sortDirections: ["ascend", "descend"],
      render: (month) => {
        return <>{monthNames[month - 1]}</>;
      },
    },
    {
      title: t("effortListPagination.effortDuration"),
      dataIndex: "dayCount",
      editable: true,
      sorter: (a, b) => a.workHours.localeCompare(b.workHours),
      sortDirections: ["ascend", "descend"],
      render: (day) => {
        return (
          <>
            <p>
              {day} {t("efforts.day")}
            </p>
          </>
        );
      },
    },
    {
      title: t("effortListPagination.effortDescription"),
      dataIndex: "description",
      editable: true,
      render: (description) => {
        const maxLength = 40;
        if (description.length > maxLength) {
          return (
            <Tooltip title={description}>
              <p
                style={{
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                }}
              >
                {description.substring(0, maxLength) + "..."}
              </p>
            </Tooltip>
          );
        } else {
          return <p style={{ maxWidth: "150px" }}>{description}</p>;
        }
      },
    },
    {
      title: t("effortListPagination.status"),
      dataIndex: "effortConfirmation",
      editable: false,
      render: (text, record) => {
        let statusText = "";
        let color = "";
        switch (text) {
          case "approved":
            statusText = "Onaylandı";
            color = "success";
            break;
          case "rejected":
            statusText = "Reddedildi";
            color = "error";
            break;
          default:
            statusText = "Bekliyor";
            color = "warning";
            break;
        }
        return <Tag color={color}>{statusText}</Tag>;
      },
    },

    {
      title: t("effortListPagination.creationDate"),
      dataIndex: "createdAt",
      render: (text) => {
        const date = new Date(text);
        return date.toLocaleDateString();
      },
      editable: false,
    },
    {
      title: t("effortListPagination.operations"),
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <Typography.Link onClick={() => save(record.effortId)}>
              {t("effortListPagination.save")}
            </Typography.Link>
            <Popconfirm
              title={t("effortListPagination.editTitle")}
              okButtonProps={{
                style: { backgroundColor: "blue", color: "white" },
              }}
              onConfirm={cancel}
            >
              <a style={{ color: "red" }}>{t("effortListPagination.cancel")}</a>
            </Popconfirm>
          </div>
        ) : (
          <span style={{ display: "flex", justifyContent: "center" }}>
            {record.userName == currentUser.userName ? (
              <a onClick={() => edit(record)}>
                <EditOutlined />
              </a>
            ) : null}
            <a
              style={{ marginLeft: 8 }}
              onClick={() => handleAddComment(record.effortId, record.vendorId)}
            >
              <CommentOutlined />
            </a>
          </span>
        );
      },
      editable: false,
    },
    {
      title: t("effortListPagination.approval"),
      dataIndex: "approval",
      render: (_, record) =>
        !loading[record.effortId] ? (
          <Space style={{ justifyContent: "center", display: "flex" }}>
            <Col
              onClick={
                record.effortConfirmation === "rejected" ||
                record.effortConfirmation === "approved"
                  ? false
                  : () =>
                      handleEffortStatus(
                        record.effortId,
                        "approved",
                        record.vendorId,
                        record
                      )
              }
            >
              <CheckCircleOutlined
                style={{
                  color:
                    record.effortConfirmation === "rejected" ? "gray" : "green",
                  cursor:
                    record.effortConfirmation === "rejected" ||
                    record.effortConfirmation === "approved"
                      ? ""
                      : "pointer",
                }}
              />
            </Col>
            <Col
              onClick={
                record.effortConfirmation === "approved" ||
                record.effortConfirmation === "rejected"
                  ? false
                  : () =>
                      handleEffortStatus(
                        record.effortId,
                        "rejected",
                        record.vendorId,
                        record
                      )
              }
            >
              <CloseCircleOutlined
                style={{
                  color:
                    record.effortConfirmation === "approved" ? "gray" : "red",
                  cursor:
                    record.effortConfirmation === "approved" ||
                    record.effortConfirmation === "rejected"
                      ? ""
                      : "pointer",
                }}
              />
            </Col>
          </Space>
        ) : (
          <div className="rotate-container">
            <Loading3QuartersOutlined className="rotate" />
          </div>
        ),
      editable: false,
    },
  ];
  if (
    currentUser.role !== "admin" &&
    response.projectManagerId?._id !== currentUser._id
  ) {
    columns.splice(
      columns.findIndex((col) => col.dataIndex === "approval"),
      1
    );
  }

  const [api, contextHolder] = notification.useNotification();
  const openNotification = (placement) => {
    api.success({
      message: t("effortListPagination.effortAdditionSuccessful"),
      description: t("effortListPagination.findDescription"),
      placement,
    });
  }; //
  const openErrorNotification = (placement) => {
    api.error({
      message: t("effortListPagination.effortAdditionError"),
      description: t("effortListPagination.effortAdditionErrorContent"),
      placement,
    });
  }; //

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <>
      <>
        <Context.Provider>{contextHolder}</Context.Provider>
      </>
      {currentUser.role === "admin" ? null : (
        <PrimaryButton
          style={{
            float: "right",
          }}
          onClick={handleOpenEffort}
        >
          {t("effortListPagination.addEffort")}
        </PrimaryButton>
      )}

      <Form form={form} component={false}>
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
          <Input.Search
            placeholder={t("effortListPagination.searchEffort")}
            onChange={onSearchChange}
            style={{ width: 200, marginBottom: "15px" }}
            size="large"
          />

          <p className="table-title">{t("effortListPagination.efforts")}</p>
          <p className="table-count">
            {t("effortListPagination.totalResults").replace(
              "{count}",
              efforts.length.toString()
            )}
          </p>
          <Table
            scroll={{ x: "calc(800px)", y: "calc(800px)" }}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered={false}
            dataSource={filteredData}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
              showQuickJumper: true,
              showSizeChanger: true,
            }}
          />
        </ConfigProvider>
      </Form>

      {openEffort && (
        <CreateEffortModal
          response={response}
          token={token}
          open={handleOpenEffort}
          handleClose={handleCloseEffort}
          handleSuccessEffort={handleSuccessEffort}
          handleErrorEffort={handleErrorEffort}
          contractStartDate={contractStartDate}
        />
      )}
      <AddEffortCommentModal
        token={token}
        socket={socket}
        isModalOpen={isModalOpen}
        onCancel={handleCancelModal}
        effortId={effortIdInModal?.effortId}
        vendorId={effortIdInModal?.vendorId}
      />
    </>
  );
};

export default EffortListPagination;
