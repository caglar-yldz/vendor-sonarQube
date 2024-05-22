import { useEffect, useContext } from "react";
import Box from "@mui/material/Box";
import Header from "../../Layout/Header";
import { HomePageContent } from "../../components";
import useFetchProjects from "../../hooks/useFetchProjects";
import GlobalContext from "../../context/GlobalContext";
import { Row, Col } from "antd";
import "../../styles/index.css";
import "./Home.scss";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useBackgroundStyle from "../../hooks/useBackgroundStyle";

export default function ButtonAppBar({ socket }) {
  useBackgroundStyle();
  const {
    newProjectName,
    newOrDeletedProject,
    currentUser,
    projects,
    setProjects,
    users,
    handleDeleteProjectInParent,
  } = useContext(GlobalContext);
  const authHeader = useAuthHeader();
  var token = null;
  if (authHeader && authHeader.startsWith("Bearer"))
    token = authHeader.split(" ")[1];

  useEffect(() => {
    useFetchProjects(token)
      .then((fetchedProjects) => {
        setProjects(fetchedProjects);
      })
      .catch((error) => {
        // handle error
        console.error(error);
      });
  }, [token, newProjectName, newOrDeletedProject]);

  return (
    <div className="body">
      <Box sx={{ flexGrow: 1 }}>
        <Header
          projects={projects}
          users={users}
          currentUser={currentUser}
          socket={socket}
          onDeleteProject={handleDeleteProjectInParent}
        />
      </Box>

      <Row justify="center" style={{ minHeight: "83.5vh" }}>
        <Col style={{ padding: "20px" }} sm={24} lg={18} xl={18} xxl={18}>
          <HomePageContent
            token={token}
            users={users}
            currentUser={currentUser}
          />
        </Col>
      </Row>
    </div>
  );
}
