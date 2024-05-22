import { useState, useContext } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Modal, Form, Input, Button, Typography, Row, DatePicker } from "antd";
import axios from "../../services/axios";
import GlobalContext from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../buttons/primaryButton";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function EffortModal(props) {
  const { Text } = Typography;
  const [document, setDocument] = useState("");
  const { setNewEffort } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [singleEffort, setSingleEffort] = useState(true);
  const [multipleEffort, setMultipleEffort] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [singleDate, setDate] = useState("");
  const [multipleDate, setMultipleDate] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleSendDocument = async (e) => {
    setLoading(true);
    try {
      console.table({
        hour,
        minute,
        document,
        singleDate,
        multipleDate,
        singleEffort,
        multipleEffort,
      });
      if (singleEffort) {
        const result = await axios.post(
          `${import.meta.env.VITE_API_PORT}/api/effort/singlecreateEffort`,
          {
            projectId: props.response._id,
            description: document,
            date: singleDate,
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
          console.error("Hata oluştu", result.status, result.data);
        }
      } else if (multipleEffort) {
        const result = await axios.post(
          `${import.meta.env.VITE_API_PORT}/api/effort/createMultipleEfforts`,
          {
            projectId: props.response._id,
            description: document,
            startDate: multipleDate[0],
            endDate: multipleDate[1],
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
          console.error("Hata oluştu", result.status);
        }
      }
    } catch (error) {
      if (
        error.response.data ==
        "No more than 8 hours of effort can be made in one day"
      ) {
        props.handleErrorEffort();
      }

      console.error("İsteği gerçekleştirme başarısız:", error);
      // Hata durumu
    }
    setLoading(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleMultipleEffort = () => {
    setSingleEffort(false);
    setMultipleEffort(true);
  };

  const handleSingleEffort = () => {
    setSingleEffort(true);
    setMultipleEffort(false);
  };

  const onChangeSingleDataPicker = (date, dateString) => {
    setDate(dateString);
    console.log("single DATE: ", date);
  };
  const onOkMultipleDataPicker = (date, dateString) => {
    setMultipleDate(dateString);
    console.log(multipleDate);
  };

  const disabledCheck = () => {
    if (document === "") {
      return true;
    } else if (singleDate || (multipleDate[0] && multipleDate[1])) return false;
    else return true;
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
          onClick={handleOpenDialog}
          disabled={disabledCheck()}
        >
          {t("effortModal.save")}{" "}
        </Button>,
      ]}
    >
      <Form onSubmit={handleSubmit}>
        <Row justify="center">
          <Button
            style={{
              borderRadius: " 8px 0 0 8px ",
              backgroundColor: singleEffort ? "#1890ff" : "#f0f0f0",
              color: singleEffort ? "#fff" : "#000",
            }}
            onClick={() => {
              setMultipleDate([]);
              handleSingleEffort();
            }}
          >
            {t("effortModal.singleEffort")}{" "}
          </Button>
          <Button
            style={{
              borderRadius: " 0 8px 8px 0",
              backgroundColor: multipleEffort ? "#1890ff" : "#f0f0f0",
              color: multipleEffort ? "#fff" : "#000",
            }}
            onClick={() => {
              setDate("");
              handleMultipleEffort();
            }}
          >
            {t("effortModal.multipleEffort")}{" "}
          </Button>
        </Row>

        {singleEffort && (
          <Row justify="center" style={{ padding: "8px", marginTop: "24px" }}>
            <DatePicker
              style={{ width: "270px" }}
              onChange={onChangeSingleDataPicker}
            />
          </Row>
        )}

        {multipleEffort && (
          <Row justify="center" style={{ padding: "8px", marginTop: "24px" }}>
            <RangePicker onChange={onOkMultipleDataPicker} />
          </Row>
        )}

        <Form.Item style={{ paddingTop: "30px" }}>
          <Text>{t("effortModal.description")}</Text>
          <TextArea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder={t("effortModal.descriptionPlaceHolder")}
            autoSize={{ minRows: 3, maxRows: 7 }}
          />
        </Form.Item>
      </Form>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {" "}
          {singleEffort
            ? singleDate +
              " " +
              t("effortListPagination.saveEffortModalSingleTitle")
            : multipleDate[0] +
              " - " +
              multipleDate[1] +
              t("effortListPagination.saveEffortModalMultipleTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("effortListPagination.saveEffortModalContent")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button danger type="primary" onClick={handleCloseDialog}>
            {t("effortListPagination.no")}
          </Button>
          <PrimaryButton
            style={{ height: "32px" }}
            onClick={handleSendDocument}
            color="primary"
            autoFocus
            loading={loading}
          >
            {t("effortListPagination.yes")}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Modal>
  );
}
