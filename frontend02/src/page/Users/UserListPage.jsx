import { VendorList } from "../../components";
import { Row, Col } from "antd";
import { useContext } from "react";
import GlobalContext from "../../context/GlobalContext";
import Header from "../../Layout/Header";
import  useBackgroundStyle  from "../../hooks/useBackgroundStyle";

const UserListPage = ({socket}) => {
  useBackgroundStyle();
  const { response, currentUser, setResponse, token } =
    useContext(GlobalContext);
  return (
    <div style={{ backgroundColor: "#F9F9F9" }}>
      <Header socket={socket} />
      <Row justify="center" style={{ minHeight: "83.5vh" }}>
        <Col style={{ padding: "20px" }} sm={24} lg={18} xl={18} xxl={18}>
          <VendorList token={token} socket={socket} />
        </Col>
      </Row>
    </div>
  );
};

export default UserListPage;
