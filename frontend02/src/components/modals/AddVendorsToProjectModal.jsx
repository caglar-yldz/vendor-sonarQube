import { useEffect, useContext, useRef, useState } from "react";
import axios from "../../services/axios";
import GlobalContext from "../../context/GlobalContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Input, Table, Space, Button, Modal, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

export default function AddVendorsToProjectModal({
  users,
  isModalOpen,
  handleCancel,
  handleSuccessAddUser,
  handleErrorAddUser,
  props,
}) {
  const { response, token } = useContext(GlobalContext);
  const [selectedAllUsers, setSelectedAllUsers] = useState([]);
  const [selectedProjectUsers, setSelectedProjectUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { projectVendors, setProjectVendors, AllCompanyUsers } =
    useContext(GlobalContext);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAllUsers(AllCompanyUsers);
  }, [AllCompanyUsers]);
  useEffect(() => {
    const deneme = users.filter(
      (user) =>
        !projectVendors.some((projectUser) => projectUser._id === user._id)
    );
    setAvailableUsers(deneme);
  }, [allUsers, projectVendors]);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedAllUsers(selectedRows);
    },
    getCheckboxProps: (record) => ({
      name: record.name,
      _id: record._id,
    }),
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
    },
  ];

  const handleOk = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = response._id;
    const newVendorIds = selectedAllUsers.map((user) => user._id);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_PORT}/api/projects/users/${id}`,
        { newVendorIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvailableUsers((prevState) => {
        const updatedProjectUsers = prevState.filter(
          (existingUser) =>
            !selectedAllUsers.some((user) => user._id === existingUser._id)
        );

        if (selectedProjectUsers) {
          selectedProjectUsers.forEach((user) => {
            updatedProjectUsers.push(user);
          });
        }

        return updatedProjectUsers;
      });

      setProjectVendors((prevState) => {
        const updatedProjectUsers = [...prevState];

        selectedAllUsers.forEach((user) => {
          updatedProjectUsers.push(user);
        });

        return updatedProjectUsers;
      });

      setLoading(false);
      handleSuccessAddUser();
      handleCancel();
    } catch (error) {
      setErrorMessage(error.response.data);
      handleErrorAddUser();
    }
    setLoading(false);
    setSelectedAllUsers([]);
    setSelectedProjectUsers([]);
  };
  const [pageNumber, setPageNumber] = useState();

  useEffect(() => {
    if (isModalOpen) {
      setPageNumber(1);
      setSelectedAllUsers([]);
    }
  }, [isModalOpen]);
  return (
    <div>
      <Modal
        title="Danışman Ekle"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button danger key="cancel" onClick={handleCancel}>
            Kapat
          </Button>,
          <Button
            style={{ width: "15%" }}
            disabled={loading}
            loading={loading}
            ghost
            key="ok"
            type="primary"
            onClick={handleOk}
          >
            {!loading && "Ekle"}
          </Button>,
        ]}
      >
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
          <p className="table-title">Danışmanlar</p>
          <p className="table-count">
            Toplam {availableUsers.length} sonuç listelendi
          </p>
          <Table
            scroll={{ x: "calc(800px)", y: "calc(800px)" }}
            rowKey={"_id"}
            pagination={{
              pageSize: 5,
              current: pageNumber,
              showQuickJumper: true,
              showSizeChanger: true,
              onChange: (page) => {
                setSelectedAllUsers([]);
                setPageNumber(page);
              },
            }}
            rowSelection={{
              selectedRowKeys: selectedAllUsers.map((user) => user._id),
              type: "checkbox",
              ...rowSelection,
            }}
            columns={columns}
            dataSource={availableUsers}
          />
        </ConfigProvider>
      </Modal>
    </div>
  );
}
