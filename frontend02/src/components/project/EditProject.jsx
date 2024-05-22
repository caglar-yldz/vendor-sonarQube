import { useEffect, useContext, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../services/axios";
import GlobalContext from "../../context/GlobalContext";
import "react-toastify/dist/ReactToastify.css";
import { Col, Row, Typography, Input, Button, Select, Card } from "antd";
import PrimaryButton from "../buttons/primaryButton";
import { useTranslation } from "react-i18next";

export default function EditProject({ token, socket, openNotification }) {
  const {
    response,
    setResponse,
    currentUser,
    users,
    projectVendors,
    setNewProjectManegerId,
  } = useContext(GlobalContext);
  const [projectName, setProjectName] = useState([]);
  const [selectedAllUsers, setSelectedAllUsers] = useState([]);
  const [selectedProjectUsers, setSelectedProjectUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { setNewProjectName } = useContext(GlobalContext);
  const [errorMessage, setErrorMessage] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [projectManagerId, setprojectManagerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSetProjectName = (projectName) => {
    if (projectName.length <= 30) {
      setProjectName(projectName);
      setErrorMessage("");
    } else setErrorMessage("Project name must be at least 30 characters");
  };

  const handleDeleteProject = async (id) => {
    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_PORT}/api/projects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      openNotification(
        "topRight",
        "success",
        t("allAlert.deleteProjectSuccess")
      );
      socket.emit("chat", {
        message: "addNewProject",
        sender: socket.id,
      });

      setResponse("");
    } catch (error) {
      console.error("Error deleting project:", error);
      openNotification("topRight", "error", t("allAlert.deleteProjectError"));
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteProject(response._id);
    handleCloseDeleteDialog();
  };

  useEffect(() => {
    setAllUsers(users);
  }, [users]);

  useEffect(() => {
    setProjectName(response.projectName);
  }, [response]);

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = response._id;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_PORT}/api/projects/${id}`,
        { projectName, projectManagerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket.emit("chat", {
        message: "addNewProject",
        sender: socket.id,
      });

      setNewProjectManegerId(projectManagerId);

      setNewProjectName(projectName);

      setErrorMessage();

      openNotification(
        "topRight",
        "success",
        t("allAlert.updateProjectSuccess")
      );
    } catch (error) {
      setErrorMessage(error.response.data);
      openNotification("topRight", "error", t("allAlert.updateProjectError"));
    }
    setSelectedAllUsers([]);
    setSelectedProjectUsers([]);
    setLoading(false);
  };

  const handleManagerAssign = (userId) => {
    setprojectManagerId(projectManagerId === userId ? null : userId);
  };

  return (
    <>
      <form onSubmit={handleUpdateProject}>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          <div className="edit-container">
            <Card style={{ padding: "0px" }}>
              <Row>
                <Col span={16}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h5"
                    style={{ color: "#333" }}
                  >
                    {t("projectsetting.projectName")}
                  </Typography>
                </Col>
                <Col span={8} style={{ float: "right" }}>
                  <Input
                    type="text"
                    value={projectName}
                    maxLength={31}
                    onChange={(e) => handleSetProjectName(e.target.value)}
                  />
                </Col>
              </Row>
            </Card>
            <Row style={{ marginTop: "10px" }}>
              <Card style={{ width: "100%" }}>
                <Row>
                  <Col span={16}>
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h5"
                      style={{ color: "#333" }}
                    >
                      {t("projectsetting.projectAuthority")}
                    </Typography>
                  </Col>
                  <Col span={8}>
                    <Select
                      style={{ width: "100%" }}
                      showSearch
                      defaultValue={
                        response.projectManagerId &&
                        response.projectManagerId.userName
                      }
                      placeholder={t("projectsetting.managerPlaceHolder")}
                      optionFilterProp="children"
                      onChange={(value, event) =>
                        handleManagerAssign(value, event)
                      }
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {projectVendors.map((user) => (
                        <Option key={user._id} value={user._id}>
                          {user.userName}
                        </Option>
                      ))}
                    </Select>{" "}
                  </Col>
                </Row>
              </Card>
            </Row>

            <PrimaryButton
              type="primary"
              ghost
              htmlType="submit"
              style={{
                marginTop: "16px",
                width: "100px",
              }}
              disabled={loading}
              loading={loading}
            >
              {!loading && t("projectsetting.update")}
            </PrimaryButton>
            {currentUser.role === "admin" && (
              <Button
                danger
                type="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenDeleteDialog(response._id);
                }}
                style={{
                  marginLeft: "10px",
                  height: "40px",
                }}
                disabled={loading}
                loading={loading}
              >
                <p style={{ margin: "0px" }}>
                  {!loading && <DeleteIcon style={{ paddingBottom: "2px" }} />}
                  {!loading && t("projectsetting.deleteProject")}
                </p>
              </Button>
            )}

            <div style={{ color: "red" }}>{errorMessage}</div>
          </div>
        </Typography>
      </form>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t("projectsetting.areYouSure")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("projectsetting.confirmProjectDeletion")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button danger type="primary" onClick={handleCloseDeleteDialog}>
            {t("projectsetting.no")}
          </Button>
          <PrimaryButton
            style={{ height: "32px" }}
            onClick={handleConfirmDelete}
            color="primary"
            autoFocus
          >
            {t("projectsetting.yes")}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
