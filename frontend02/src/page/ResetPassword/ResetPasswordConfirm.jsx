import { useState } from "react";
import "./ResetPassword.scss";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled } from "@ant-design/icons";
import { Row, Col, Button, Form } from "antd";
import AuthLayout from '../../Layout/AuthLayout.jsx'

function ResetPasswordConfirm() {

  const navigate = useNavigate();

  const handleNavigateLogin = () => {
    navigate("/login");
  };
  
  return (
    <AuthLayout>
      <Row style={{ height: "100vh" }} justify="center" align="middle">
        <Col
        >
          <CheckCircleFilled className="check-circle" />

          <Col className="form-title">Şifreniz Gönderildi</Col>
          <Col className="form-description" span={24}>
            Şifrenizi sıfırlamak için lütfen e-postanızı kontrol edin.
          </Col>
          <Col>
            <Form
              onSubmitCapture={handleNavigateLogin}
              name="basic"
              labelCol={{
                span: 24,
              }}
              onFinish
              onFinishFailed
              autoComplete="off"
            >
              <Form.Item
                wrapperCol={{
                  span: 24,
                }}
              >
                <Button
                  className="submit"
                  ghost
                  type="primary"
                  htmlType="submit"
                >
                  Giriş sayfasına geri dön
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Col>
      </Row>
    </AuthLayout>
  );
}

export default ResetPasswordConfirm;
