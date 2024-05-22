import { useState, useEffect, useContext } from "react";
import loginImage from "../images/LogoImage.png";
import logo from "../images/Logo-Icon.png";
import logoLabel from "../images/HRHUB.png";
import { Row, Col } from "antd";
import GlobalContext from "../context/GlobalContext.jsx";
import { Alert, Space } from "antd";

import "./style.scss";

// eslint-disable-next-line react/prop-types
function Login({ children }) {
  const { alert, setAlert } = useContext(GlobalContext);

  const onCloseError = () => {
    setAlert(false);
  };
  return (
    <>
      <Row>
        <img
          style={{ position: "absolute", bottom: "36px", right: "26px" }}
          className="venhancer-logo"
          src="https://cdn.animaapp.com/projects/65f01eff1e0f8111128710cb/releases/65f0201296a996cc2d9f3a2c/img/vh-logo.svg"
          alt="VH Logo"
        />
        <Col span={0} xs={0} sm={10}>
          <Row
            className="logo-container"
            align="middle"
            style={{ position: "absolute", left: "6%", top: "3%" }}
          >
            <Col span={6}>
              <img className="logo-img" src={logo} alt="logo" />
            </Col>
            <Col style={{ paddingLeft: "10px" }} span={18}>
              <img src={logoLabel} alt="logo" />
            </Col>
          </Row>
          <img
            className="login-image"
            style={{
              height: `100vh`,
            }}
            src={loginImage}
            alt="asset 15"
          />
          <div className="blue-layer"></div>
        </Col>
        <Col span={24} xs={24} sm={14}>
          {alert && (
            <Space
              direction="vertical"
              style={{
                padding: "20px",
                position: "absolute",
                zIndex: "5",
                right:"0px"
              }}
            >
              <Alert
                message={alert.message}
                description={alert.description}
                type={alert.type}
                showIcon
                closable
                onClose={onCloseError}
              />
            </Space>
          )}
          <Row style={{ height: "100vh" }} justify="center" align="middle">
            <Col>{children}</Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default Login;
