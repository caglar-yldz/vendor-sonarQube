import { useState, useEffect } from "react";
import axios from "../../services/axios";
import { Modal, Form, Input, Button, Spin } from "antd";
import PrimaryButton from "../buttons/primaryButton";
import { useTranslation } from "react-i18next";

const InviteVendorComponent = ({
  open,
  handleClose,
  handleSuccessInviteVendor,
  handleErrorInviteVendor,
  handleError2InviteVendor,
}) => {
  const [emailName, setEmailName] = useState("");
  const [error, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalKey, setModalKey] = useState(Math.random());
  const [buttonState, setButtonState] = useState("initial");
  const { t } = useTranslation();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    setEmailName(null);
    setErrorMessage(null);
    setLoading(false);
    setButtonState("initial");
  }, [open, handleClose]);

  const handleInvite = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_PORT}/api/email/send`,
        {
          email: emailName,
        }
      );

      if (result.status === 200) {
        handleClose();
        handleSuccessInviteVendor();
      }
    } catch (error) {
      console.error("Invite failed:", error.response.data);
      if (error.response.data == "User already exists") {
        handleClose();
        handleError2InviteVendor();
      } else {
        handleErrorInviteVendor();
        setErrorMessage(error.response.data);
      }
    } finally {
      setEmailName("");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setEmailName("");
      setErrorMessage(null);
      setLoading(false);
      setButtonState("initial"); // Reset the button state
    }
  }, [open]);

  const isInviteDisabled = !emailRegex.test(emailName) || loading;

  return (
    <Modal
      key={modalKey}
      visible={open}
      onCancel={handleClose}
      title={t("inviteVendor.inviteVendor")}
      footer={null}
    >
      <Form
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={handleInvite}
      >
        <Form.Item
          label={t("inviteVendor.email")}
          name="email"
          rules={[
            { required: true, message: t("inviteVendor.emailMessage") },
            {
              type: "email",
              message: t("inviteVendor.emailWrongType"),
            },
          ]}
        >
          <Input
            placeholder={t("inviteVendor.emailPlaceHolder")}
            value={emailName}
            onChange={(e) => {
              setEmailName(e.target.value);
              setErrorMessage("");
            }}
          />
        </Form.Item>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <Form.Item>
          <PrimaryButton
            type="primary"
            ghost
            htmlType="submit"
            loading={loading}
            style={{
              height: "32px",
              width: "100%",
            }}
            disabled={isInviteDisabled || buttonState !== "initial"}
          >
            {loading ? "" : t("inviteVendor.invite")}
          </PrimaryButton>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteVendorComponent;
