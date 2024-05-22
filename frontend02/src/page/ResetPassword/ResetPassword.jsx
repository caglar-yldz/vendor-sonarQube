import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./ResetPassword.scss";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Form, Input } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Alert, Space } from "antd";
import AuthLayout from "../../Layout/AuthLayout.jsx";
import GlobalContext from "../../context/GlobalContext.jsx";
import PrimaryButton from "../../components/buttons/primaryButton.jsx";
import { useTranslation } from "react-i18next";

function ResetPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [mailIsValid, setMailIsValid] = useState(["init"]);
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };
  const { token, setToken, setAlert } = useContext(GlobalContext);

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");


  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setAlert("");
  };

  useEffect(() => {
    if (loading) {
      (async () => {
        try {
          await axios
            .post(`${import.meta.env.VITE_API_PORT}/api/email/${email}`, {
              email,
            })
            .then((result) => {
              const jwtToken = result.data.accessToken;
              localStorage.setItem("token", jwtToken);

              if (result.status == 200) {
                if (rememberMe) {
                  localStorage.setItem("email", email);
                } else {
                  localStorage.removeItem("email");
                }
                navigate("/confirm");
                setToken(result.data.accessToken);
                setErrorMessage("");
                setLoading(false);
              } else {
                setAlert({
                  message: "Geçersiz mail adresi",
                  description:
                    "Girmiş olduğunuz mail adresinin sistemde kaydı bulunmamaktadır.",
                  type: "error",
                });
                setLoading(false);
              }
            });
        } catch (error) {
          setAlert({
            message: "Geçersiz mail adresi",
            description:
              "Girmiş olduğunuz mail adresinin sistemde kaydı bulunmamaktadır.",
            type: "error",
          });
          console.error("Login failed:", error.response.data);
          setErrorMessage(error.response.data);
          setLoading(false);
        }
      })();
    }
  }, [loading]);
  return (
    <AuthLayout>
      <Row>
        <Col
          style={{
            height: "55%",
            marginTop: "2%",
            paddingTop: "5%",
          }}
        >
          <Col className="form-title"> {t("loginPages.resetPassword")}</Col>
          <Col className="form-description" span={24}>
            {t("loginPages.infoText")}{" "}
          </Col>
          <Col>
            <Form
              form={form}
              onSubmitCapture={handleSubmit}
              name="basic"
              labelCol={{
                span: 24,
              }}
              onFinishFailed={() => {}}
              onValuesChange={async (_, allFields) => {
                try {
                  await form.validateFields();
                  setErrorMessage("");
                } catch (error) {
                  setErrorMessage(error.message);
                }
                const errors = form.getFieldsError();
                const isValid = errors.every(({ errors }) => !errors.length);
                setFormIsValid(isValid);

                const emailErrors = form.getFieldError("email");
                setMailIsValid(emailErrors);
              }}
              autoComplete="off"
            >
              <label className="input-label" htmlFor="">
                Mail
              </label>
              <Form.Item
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "Bu E-posta adresi geçerli değil!",
                  },
                  {
                    required: true,
                    message: "Lütfen E-posta adresinizi giriniz!",
                  },
                ]}
                validateStatus={
                  isFocused
                    ? ""
                    : mailIsValid[0] == "init"
                    ? ""
                    : mailIsValid.length == 0
                    ? "success"
                    : "error"
                }
                help={
                  isFocused ? "" : mailIsValid[0] == "init" ? "" : mailIsValid
                }
                hasFeedback={!isFocused}
              >
                <Input
                  className="input-field"
                  placeholder={t("loginPages.emailPlaceHolder")}
                  value={email}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={{
                    borderColor: isFocused
                      ? "#133163"
                      : mailIsValid
                      ? ""
                      : "#FF4D4F",
                  }}
                  prefix={
                    <MailOutlined
                      style={{
                        color: isFocused
                          ? ""
                          : mailIsValid.length === 0
                          ? "green"
                          : "",
                      }}
                    />
                  }
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  disabled={loading} // Disable the input when loading
                />
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  span: 24,
                }}
              >
                <PrimaryButton
                  className="submit"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                  }}
                  type="primary"
                  htmlType="submit"
                  disabled={!formIsValid || loading} // Disable the button when loading
                  loading={loading} // Show loading spinner
                >
                  {!loading && t("loginPages.next")}
                </PrimaryButton>
              </Form.Item>
              <Form.Item>
                <Row justify="center">
                  <Button
                    type="link"
                    href="login"
                    style={{
                      color: loading ? "#00000040" : "#000000E0",
                    }}
                    primaryColor="Black"
                    textHoverBg="black"
                    disabled={loading}
                  >
                    {t("loginPages.returnText")}
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          </Col>
        </Col>
      </Row>
    </AuthLayout>
  );
}

export default ResetPassword;
