import React, { useEffect, useState } from "react";
import { Drawer, Space, Button, Empty, ConfigProvider } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationCard from "./NotificationCard";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../../styles/Global.scss";

const NotificationDrawer = ({
  setNotifications,
  setUnreadedNotificationCount,
  notifications,
  unreadedNotificationCount,
}) => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  const { t, i18n } = useTranslation();

  const clearAll = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_PORT}/api/notifications/markAllasRead`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);

      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
      setUnreadedNotificationCount(0);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {}, [notifications]);

  const showDefaultDrawer = () => {
    setSize("default");
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Space>
        <div
          onClick={showDefaultDrawer}
          className="notificationBell"
          style={{ cursor: "pointer", position: "relative" }}
        >
          <BellOutlined style={{ fontSize: "24px" }} />
          {unreadedNotificationCount > 0 && (
            <div className="notificationCount">{unreadedNotificationCount}</div>
          )}
        </div>
      </Space>
      <ConfigProvider
        theme={{
          components: {
            Drawer: {
              footerPaddingInline: "0px 0px 0px 0px",
            },
          },
        }}
      >
        <Drawer
          title={`${t("notifications.title")}`}
          placement="right"
          size={size}
          onClose={onClose}
          open={open}
          extra={
            <Space>
              <Button
                style={{ backgroundColor: "#1677ff", color: "#fff" }}
                onClick={clearAll}
              >
                {t("notifications.readAll")}
              </Button>
            </Space>
          }
        >
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <NotificationCard
                key={index}
                id={notification._id}
                title={notification.title}
                description={notification.description}
                isRead={notification.isRead}
                createdAt={notification.createdAt}
                setUnreadedNotificationCount={setUnreadedNotificationCount}
                relatedObjectId={notification.relatedObjectId}
                relatedObjectUrl={notification.relatedObjectUrl}
                props={notification.props}
              />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Empty description="No data" />
            </div>
          )}
        </Drawer>
      </ConfigProvider>
    </>
  );
};

export default NotificationDrawer;
