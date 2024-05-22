import { useContext, useState, useEffect, useRef, createContext } from "react";
import axios from "../../services/axios";
import { Modal, Form, Input, Button, Col, Space, Row } from "antd";
import "react-toastify/dist/ReactToastify.css";
import GlobalContext from "../../context/GlobalContext";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const ModalComponent = ({ open, handleClose, socket, openNotification }) => {
  const { users } = useContext(GlobalContext);
  const [projectName, setProjectName] = useState("");
  const [projectManagerId, setprojectManagerId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedAllUsers, setSelectedAllUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSetProjectName = (projectName) => {
    if (projectName.length < 30) {
      setProjectName(projectName);
      setErrorMessage("");
    } else setErrorMessage("Project name must be at least 30 characters");
  };

  const handleNewProject = async () => {
    setLoading(true);

    const vendorIds = selectedAllUsers.map((userId) => userId);
    const manager = users.find((user) => user._id === projectManagerId);
    const role = manager ? "project_manager" : null;
    await axios
      .post(`${import.meta.env.VITE_API_PORT}/api/projects/new`, {
        projectName,
        vendorIds,
        projectManagerId,
      })
      .then((result) => {
        openNotification(
          "topRight",
          "success",
          t("allAlert.addProjectSuccess")
        );
        socket.emit("chat", {
          message: "addNewProject",
          sender: socket.id,
        });
        setLoading(false);
        handleClose();
      })
      .catch((err) => {
        openNotification("topRight", "error", t("allAlert.addProjectError"));
        setErrorMessage(err.response.data);
        setLoading(false);
      });
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Kullanıcı Adı Ara`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            ghost
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Ara
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Temizle
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filtrele
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Kapat
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Danışman İsmi",
      dataIndex: "userName",
      ...getColumnSearchProps("userName"),
      render: (userName, record) => (
        <>
          <Button style={{ color: "black" }} type="link">
            {userName.toUpperCase()}
          </Button>
        </>
      ),
    },
  ];

  const [pageNumber, setPageNumber] = useState();

  useEffect(() => {
    if (open) {
      setPageNumber(1);
      setSelectedAllUsers([]);
    }
  }, [open]);

  return (
    <>
      <Modal
        visible={open}
        onCancel={handleClose}
        title={t("createProjectModal.title")}
        footer={null}
      >
        <Form onSubmitCapture={handleNewProject}>
          <Row>
            <Col span={24}>
              <label htmlFor="">{t("createProjectModal.projectName")}</label>
              <Form.Item name="projectName" rules={[{ required: true }]}>
                <Input
                  placeholder={t("createProjectModal.projectNamePlaceHolder")}
                  value={projectName}
                  count={{
                    show: true,
                    max: 30,
                  }}
                  maxLength={30}
                  onChange={(e) => handleSetProjectName(e.target.value)}
                ></Input>
              </Form.Item>
            </Col>
            <Col span={24}>
              {errorMessage == "Project Name already exists" && (
                <p style={{ color: "red" }}>{t("createProjectModal.error")}</p>
              )}
            </Col>
          </Row>

          <Row justify="end" gutter={10}>
            <Col>
              <Form.Item>
                <Button
                  danger
                  onClick={handleClose}
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {t("createProjectModal.back")}
                </Button>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button
                  ghost
                  type="primary"
                  htmlType="submit"
                  style={{
                    marginTop: "16px",
                    width: "120px",
                  }}
                  loading={loading}
                  disabled={loading}
                >
                  {!loading && t("createProjectModal.createProject")}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ModalComponent;
