import React, { useState, useContext, useEffect, useRef } from "react";
import { Button, Input, Space, Table, ConfigProvider, Modal } from "antd";
import GlobalContext from "../../context/GlobalContext";
import ProfileCard from "../profile/ProfileCard";
import axios from "../../services/axios";
import { DeleteOutlined } from "@ant-design/icons";
import { notification, Select } from "antd";
import PrimaryButton from "../buttons/primaryButton";
import AreYouSureModal from "../modals/AreYouSureModal";
import { useTranslation } from "react-i18next";
const Context = React.createContext({
  name: "Default",
});
export default function ProjectVendors({ socket }) {
  const { t } = useTranslation();
  const {
    currentUser,
    projectVendors,
    token,
    response,
    setProjectVendors,
    users,
    newProjectManegerId,
  } = useContext(GlobalContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedProjectUsers, setSelectedProjectUsers] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { Option } = Select;
  const [projectManagerId, setProjectManagerId] = useState(
    response.projectManagerId?._id
  );

  const handleUpdateVendors = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = response._id;
    const deletedVendorIds = selectedProjectUsers.map((user) => user._id);

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_PORT}/api/projects/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            deletedVendorIds,
          },
        }
      );

      setProjectVendors((prevState) => {
        const updatedProjectUsers = prevState.filter(
          (existingUser) =>
            !selectedProjectUsers.some((user) => user._id === existingUser._id)
        );
        return updatedProjectUsers;
      });
      setSelectedProjectUsers([]);
      openSuccessNotification("topRight", t("allAlert.vendorDeleteSuccess"));
    } catch (error) {
      openErrorNotification("topRight", t("allAlert.vendorDeleteError"));
    }
    setSelectedProjectUsers([]);
    setLoading(false);
  };
  const [api, contextHolder] = notification.useNotification();
  const openSuccessNotification = (placement, message) => {
    api.success({
      message: message,
      placement,
    });
  };
  useEffect(() => {
    const filtered = projectVendors.filter((vendor) =>
      searchText
        ? vendor.userName.toLowerCase().includes(searchText.toLowerCase())
        : true
    );
    setFilteredVendors(filtered);
  }, [projectVendors, searchText]);

  const onSearchChange = (e) => setSearchText(e.target.value);

  useEffect(() => {
    if (newProjectManegerId) setProjectManagerId(newProjectManegerId);
  }, [newProjectManegerId]);

  const openErrorNotification = (placement, message) => {
    api.error({
      message: message,
      placement,
    });
  };

  const columns = [
    {
      title: t("projectvendorlist.consultantName"),
      dataIndex: "firstName",
      render: (firstName, record) => (
        <p>
          {firstName
            ? firstName?.toUpperCase() + " " + record.lastName?.toUpperCase()
            : "Bilgi yok"}
        </p>
      ),
    },
    {
      title: t("projectvendorlist.email"),
      dataIndex: "email",
      sorter: (a, b) => a.dailySalary - b.dailySalary,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: t("projectvendorlist.role"),
      dataIndex: "role",
      render: (role, record) => (
        <p>
          {" "}
          {projectManagerId === record._id
            ? "Proje Yetkilisi"
            : "Danışman"}{" "}
        </p>
      ),
    },
  ];

  const closeProfileCard = () => {
    setSelectedUser(null);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedProjectUsers(selectedRows);
    },
    getCheckboxProps: (record) => ({
      name: record.name,
      _id: record._id,
    }),
  };

  const [isModalVisible, setIsModalVisible] = useState(true);

  const [pageNumber, setPageNumber] = useState();

  useEffect(() => {
    setSelectedProjectUsers([]);
    setPageNumber(1);
  }, [response]);

  const [sortOrder, setSortOrder] = useState("default");
  const [sortedUsers, setSortedUsers] = useState([]);

  useEffect(() => {
    const filteredUsers = projectVendors.filter((user) =>
      searchText
        ? `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchText.toLowerCase())
        : true
    );

    if (sortOrder === "default") {
      setSortedUsers(filteredUsers);
    } else {
      const sorted = [...filteredUsers].sort((a, b) => {
        if (sortOrder === "asc") {
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
        } else {
          return `${b.firstName} ${b.lastName}`.localeCompare(
            `${a.firstName} ${a.lastName}`
          );
        }
      });
      setSortedUsers(sorted);
    }
  }, [users, searchText, sortOrder, projectVendors]);

  const handleSortChange = (value) => {
    setSortOrder(value);
    const filteredUsers = users.filter((user) =>
      searchText
        ? `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchText.toLowerCase())
        : true
    );

    if (value === "default") {
      setSortedUsers(filteredUsers);
    } else {
      const sorted = [...filteredUsers].sort((a, b) => {
        if (value === "asc") {
          return `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
        } else {
          return `${b.firstName} ${b.lastName}`.localeCompare(
            `${a.firstName} ${a.lastName}`
          );
        }
      });
      setSortedUsers(sorted);
    }
  };

  return (
    <>
      <>
        <Context.Provider>{contextHolder}</Context.Provider>
        <AreYouSureModal
          loading={loading}
          onOkModal={handleUpdateVendors}
          escription={""}
          title={`Seçilen danışmanları ${response.projectName} projesinden çıkarmak istediğinize emin misiniz?`}
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
        ></AreYouSureModal>
      </>
      {/* <PrimaryButton disabled={false} loading={false}>+ Danışman Ekle</PrimaryButton> */}

      {currentUser.role === "none" && (
        <PrimaryButton
          style={{
            float: "right",
            marginBottom: "10px",
          }}
          onClick={showModal}
        >
          + Danışman Ekle
        </PrimaryButton>
      )}
      {currentUser.role === "admin" && (
        <Button
          ghost
          danger
          disabled={selectedProjectUsers.length === 0 ? true : false}
          onClick={() => setIsModalOpen(true)}
          style={{
            float: "right",
            height: "40px",
            marginRight: "10px",
            transition: "0.3s",
          }}
        >
          <p style={{ margin: 0 }}>
            <DeleteOutlined />{" "}
            {selectedProjectUsers.length !== 0 ? "Danışmanları Sil" : null}
          </p>
        </Button>
      )}

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
          size="large"
          placeholder={t("projectvendorlist.search")}
          onChange={onSearchChange}
          style={{ width: 200, color: "black", marginBottom: "15px" }}
        />
        <Select
          className="custom-select"
          size="large"
          variant="borderless"
          placeholder={t("projectvendorlist.sortBy")}
          style={{ marginLeft: "1em" }}
          onChange={handleSortChange}
        >
          <Option value="default">{t("projectvendorlist.default")}</Option>
          <Option value="asc">{t("projectvendorlist.ascending")}</Option>
          <Option value="desc">{t("projectvendorlist.descending")}</Option>
        </Select>

        <p className="table-title">{t("projectvendorlist.consultants")}</p>
        <p className="table-count">
          {t("projectvendorlist.totalResultsListed").replace(
            "{projectVendors.length}",
            projectVendors.length.toString()
          )}
        </p>
        <Table
          scroll={{ x: "calc(800px)", y: "calc(800px)" }}
          rowKey={"_id"}
          showHeader={true}
          headerColor="#fafafa"
          dataSource={sortedUsers}
          pagination={{
            pageSize: 10,
            current: pageNumber,
            showQuickJumper: true,
            showSizeChanger: true,
            onChange: (page) => {
              setSelectedProjectUsers([]);
              setPageNumber(page);
            },
          }}
          rowSelection={
            currentUser.role === "admin" ||
            currentUser.role === "project_manager"
              ? {
                  type: "checkbox",
                  selectedRowKeys: selectedProjectUsers.map((item) => item._id),
                  ...rowSelection,
                }
              : null
          }
          columns={columns}
        />
      </ConfigProvider>

      {selectedUser && (
        <ProfileCard
          user={selectedUser}
          token={token}
          socket={socket}
          onClose={closeProfileCard}
        />
      )}
    </>
  );
}
