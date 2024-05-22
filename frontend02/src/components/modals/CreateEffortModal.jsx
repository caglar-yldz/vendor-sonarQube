import React, { useState, useContext } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Col,
  Row,
  DatePicker,
  Tooltip,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import axios from "../../services/axios";
import GlobalContext from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";
import moment from "moment"; // Import moment library for date manipulation

const { TextArea } = Input;

export default function CreateEffortModal(props) {
  const [day, setDay] = useState();
  const [month, setMonth] = useState("");
  const [document, setDocument] = useState("");
  const { setNewEffort } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { t } = useTranslation();
  const startDate = new Date(props.contractStartDate);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleSendDocument = async (e) => {
    setLoading(true);
    try {
      const date = new Date(month).getMonth() + 1;
      const year = new Date(month).getFullYear();

      const result = await axios.post(
        `${import.meta.env.VITE_API_PORT}/api/effort/singlecreateEffort`,
        {
          projectId: props.response._id,
          description: document,
          month: date,
          dayCount: day,
          year: year,
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        }
      );

      if (result.status === 201) {
        props.handleSuccessEffort();
        setNewEffort(result.data);
      } else {
        console.error("Error occurred", result.status, result.data);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data ===
          "No more than 8 hours of effort can be made in one day"
      ) {
        props.handleErrorEffort();
      }
      console.error("Failed to make the request:", error);
    }
    setLoading(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Disable dates after the current month and year
  const disabledDate = (current) => {
    return (
      current &&
      (current.isBefore(startDate, 'day') ||
        current.year() > moment().year() ||
        (current.year() === moment().year() &&
          current.month() > moment().month()))
    );
  };

  const disabledCheck = () => {
    return !document || !day || !month;
  };

  return (
    <Modal
      title={t("effortModal.title")}
      visible={props.open}
      onCancel={props.handleClose}
      footer={[
        <Button danger onClick={props.handleClose}>
          {t("effortModal.cancel")}
        </Button>,
        <Button
          style={{
            width: "18%",
          }}
          type="primary"
          ghost
          key="submit"
          onClick={handleSendDocument}
          disabled={disabledCheck()}
          loading={loading}
        >
          {!loading && t("effortModal.save")}
        </Button>,
      ]}
    >
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col span={11}>
            <Typography.Text strong>{t("effortModal.month")}</Typography.Text>{" "}
            <DatePicker
              value={month}
              onChange={(value) => setMonth(value)}
              picker="month"
              style={{ width: "100%", marginTop: "5px" }}
              disabledDate={disabledDate} // Apply disabledDate function
            />
          </Col>
          <Col span={2}></Col>
          <Col span={11}>
            <Typography.Text strong>
              {t("effortModal.day")}
              <Tooltip title={t("effortModal.dayToolTip")}>
                <InfoCircleOutlined style={{ paddingLeft: "5px" }} />
              </Tooltip>
            </Typography.Text>
            <Input
              style={{ width: "100%", marginTop: "5px" }}
              type="number"
              value={day}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  if (value > 30) {
                    setDay(30);
                  } else if (value < 0) {
                    setDay(0);
                  } else {
                    setDay(value);
                  }
                } else {
                  setDay(undefined);
                }
              }}
              placeholder={t("effortModal.dayPlaceHolder")}
              max={30}
              min={0}
            />
          </Col>
        </Row>

        <Form.Item style={{ paddingTop: "30px" }}>
          <Typography.Text strong>
            {t("effortModal.description")}
          </Typography.Text>
          <TextArea
            style={{ marginTop: "5px" }}
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder={t("effortModal.descriptionPlaceHolder")}
            autoSize={{ minRows: 3, maxRows: 7 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
