import { useState, useEffect, useContext, useRef } from "react";
import { Button, Modal, Form, Input, Avatar, List } from "antd";
import axios from "axios";
import GlobalContext from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

const AddEffortCommentModal = ({
  socket,
  isModalOpen,
  onCancel,
  effortId,
  vendorId,
}) => {
  const { currentUser, token } = useContext(GlobalContext);
  const [newComment, setNewComment] = useState("");
  const [effortComments, setEffortComments] = useState([]);
  const [emptyCommentWarning, setEmptyCommentWarning] = useState(false);
  const [count, setCount] = useState(0); // Yorum eklenme sayacı
  const [effortDate, setEffortDate] = useState(""); // Tarih ve saat bilgisi
  const [fullDate, setFullDate] = useState(new Date().toLocaleString()); // Tarih ve saat bilgisi
  const listRef = useRef(null);
  const [form] = Form.useForm(); // Create a reference to the form
  const { t } = useTranslation();

  useEffect(() => {
    const fetchEffortComments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_PORT}/api/effort/getComments/${effortId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEffortDate(response.data.date);
        setEffortComments(response.data.comments);
      } catch (error) {
        console.error(error);
      }
    };

    if (isModalOpen) {
      fetchEffortComments();
    }
  }, [isModalOpen, effortId, token]);

  useEffect(() => {
    if (count > 0) {
      const updatedComments = [
        ...effortComments,
        {
          comment: newComment,
          user: currentUser.userName || currentUser.companyName,
          date: fullDate,
        },
      ];
      setEffortComments(updatedComments);
      setNewComment("");
      setCount(0);

      if (listRef.current) {
        setTimeout(() => {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }, 100);
      }
    }
  }, [
    count,
    newComment,
    effortComments,
    currentUser.userName,
    currentUser.companyName,
    effortDate,
  ]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setEmptyCommentWarning(true);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_PORT}/api/effort/addComment`,
        {
          effortId: effortId,
          comment: newComment,
          date: fullDate, // Sending the date with the comment
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEmptyCommentWarning(false);
      setCount(count + 1);
      form.resetFields(); // Reset the form fields

      if (currentUser._id != vendorId) {
        axios.post(
          `${import.meta.env.VITE_API_PORT}/api/notifications/`,
          {
            title: `comment`,
            description: newComment,
            props: {
              userName: currentUser.firstName || currentUser.companyName,
            },

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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    setEmptyCommentWarning(false);
  };

  return (
    <Modal
      title={t("addCommentModal.addComment")}
      open={isModalOpen}
      footer={null}
      onCancel={onCancel}
      destroyOnClose={true} // Modal kapatıldığında bileşeni temizler
    >
      <div style={{ maxHeight: "300px", overflowY: "auto" }} ref={listRef}>
        <List
          itemLayout="horizontal"
          dataSource={effortComments}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                  />
                }
                title={<>{item.user}</>}
                description={item.comment}
              />
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                {item.date}
              </div>{" "}
              {/* Displaying the date */}
            </List.Item>
          )}
        />
      </div>
      <Form form={form} onFinish={handleAddComment}>
        <Form.Item
          label={t("addCommentModal.comment")}
          name="comment"
          rules={[{ required: true, message: "Lütfen yorumunuzu girin!" }]}
          validateStatus={emptyCommentWarning ? "error" : ""}
          help={emptyCommentWarning ? "Lütfen yorumunuzu girin!" : ""}
        >
          <Input onChange={handleCommentChange} value={newComment} />
        </Form.Item>
        <Button block disabled={!newComment.trim()} htmlType="submit">
          {t("addCommentModal.addComment")}
        </Button>
      </Form>
    </Modal>
  );
};

export default AddEffortCommentModal;
