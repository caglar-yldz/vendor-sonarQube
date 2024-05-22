import React, { useState, useEffect, useContext } from "react";
import InviteVendorComponent from "./InviteVendor";
import {
  Table,
  Input,
  Button,
  Row,
  Col,
  Select,
  ConfigProvider,
  Card,
} from "antd";
import GlobalContext from "../../context/GlobalContext";
import ProfileCard from "../profile/ProfileCard";
import { HomeOutlined, MenuOutlined } from "@ant-design/icons";
import { Breadcrumb, Dropdown, Menu } from "antd";
import PrimaryButton from "../buttons/primaryButton";
import { notification } from "antd";
import { useTranslation } from "react-i18next";

const Context = React.createContext({
  name: "Default",
});

const VendorList = ({ token, socket }) => {
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [sortedUsers, setSortedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { users, setUsers, setNewOrDeletedUserId, newOrDeletedUserId, isUsersFetched } =
    useContext(GlobalContext);
  const { Option } = Select;
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openInviteModal = () => setInviteModalOpen(true);
  const closeInviteModal = () => {
    setInviteModalOpen(false);
  };

  

  const handleSuccessInviteVendor = () => {
    openSuccessNotification("topRight", t("allAlert.inviteVendorSuccess"));
    setShowAlert(true);
  };
  const handleErrorInviteVendor = () => {
    openErrorNotification("topRight", t("allAlert.inviteVendorError"));
    setShowAlert(true);
  };
  const handleError2InviteVendor = () => {
    openErrorNotification("topRight", t("allAlert.inviteVendorRegistered"));
    setShowAlert(true);
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

  


  useEffect(() => {
    const filteredUsers = users.filter((user) =>
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
  }, [users, searchText, sortOrder]);

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
  const columns = [
    {
      title: t("vendor.vendorName"),
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
      title: t("vendor.email"),
      dataIndex: "email",
    },
    {
      title: t("vendor.phone"),
      dataIndex: "phoneNumber",
      render: (phoneNumber) => <p> {"+" + phoneNumber + ""} </p>,
    },
  ];

  const tableOnChange = (pagination) => {
    setCurrentPage(pagination.current);
  };

  const onSearchChange = (e) => setSearchText(e.target.value);

  return (
    <>
      <>
        <Context.Provider>{contextHolder}</Context.Provider>
      </>
      <Breadcrumb>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/users">
          <span>{t("vendor.vendors")}</span>
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
              <div>
                {isMobile ? (
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item>
                          <Input.Search
                            size="large"
                            placeholder={t("vendor.searchVendor")}
                            onChange={onSearchChange}
                            style={{
                              width: 200,
                              color: "black",
                              marginBottom: "15px",
                            }}
                          />
                        </Menu.Item>
                        <Menu.Item>
                          <Select
                            className="custom-select"
                            size="large"
                            variant="borderless"
                            placeholder={t("vendor.sortByName")}
                            style={{ marginLeft: "1em" }}
                            onChange={(value) => {
                              handleSortChange(value);
                              setDropdownVisible(false);
                            }}
                          >
                            <Option value="default">
                              {t("vendor.default")}
                            </Option>
                            <Option value="asc">A-Z</Option>
                            <Option value="desc">Z-A</Option>
                          </Select>
                        </Menu.Item>
                      </Menu>
                    }
                    visible={dropdownVisible}
                    onVisibleChange={setDropdownVisible}
                  >
                    <Button icon={<MenuOutlined />}>Filtreler</Button>
                  </Dropdown>
                ) : (
                  <>
                    <Input.Search
                      size="large"
                      placeholder={t("vendor.searchVendor")}
                      onChange={onSearchChange}
                      style={{
                        width: 200,
                        color: "black",
                        marginBottom: "15px",
                      }}
                    />
                    <Select
                      className="custom-select"
                      size="large"
                      variant="borderless"
                      placeholder={t("vendor.sortByName")}
                      style={{ marginLeft: "1em" }}
                      onChange={handleSortChange}
                    >
                      <Option value="default">{t("vendor.default")}</Option>
                      <Option value="asc">A-Z</Option>
                      <Option value="desc">Z-A</Option>
                    </Select>
                  </>
                )}
              </div>
              <PrimaryButton
                size="large"
                style={{
                  marginLeft: "auto",
                }}
                onClick={openInviteModal}
              >
                + {t("vendor.inviteVendor")}
              </PrimaryButton>
            </div>
          </Col>
        </Row>
        <div></div>
        <p className="table-title">{t("vendor.vendors")}</p>
        <p className="table-count">
          {t("vendor.total")}
          {users.length} {t("vendor.result")}
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
            loading={!isUsersFetched}
            dataSource={sortedUsers}
            onChange={tableOnChange}
            onRow={(record) => {
              return {
                onClick: () => setSelectedUser(record),
              };
            }}
            pagination={{
              current: currentPage,
              pageSize: 10,
              showQuickJumper: true,
              showSizeChanger: true,
            }}
          />
        </ConfigProvider>
      </Card>

      <InviteVendorComponent
        open={isInviteModalOpen}
        handleClose={closeInviteModal}
        handleSuccessInviteVendor={handleSuccessInviteVendor}
        handleErrorInviteVendor={handleErrorInviteVendor}
        handleError2InviteVendor={handleError2InviteVendor}
      />
      {selectedUser && (
        <ProfileCard
          key={selectedUser._id}
          user={selectedUser}
          token={token}
          socket={socket}
          onClose={() => setSelectedUser(null)}
          setSelectedUser={setSelectedUser} // Pass setSelectedUser to ProfileCard
        />
      )}
    </>
  );
};

export default VendorList;
