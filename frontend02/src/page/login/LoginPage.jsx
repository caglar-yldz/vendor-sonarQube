import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Checkbox, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Space } from "antd";
import GlobalContext from "../../context/GlobalContext.jsx";
import AuthLayout from "../../Layout/AuthLayout.jsx";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import PrimaryButton from "../../components/buttons/primaryButton.jsx";
import { useTranslation } from "react-i18next";

function Login() {
  const { alert, setAlert } = useContext(GlobalContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();


  const [showAlert, setShowAlert] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [mailIsValid, setMailIsValid] = useState(["init"]);
  const [passwordIsValid, setPasswordIsValid] = useState(["init"]);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const { token, setToken } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedemail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    const storedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (storedemail && storedPassword && storedRememberMe) {
      setEmail(storedemail);
      setPassword(storedPassword);
      setRememberMe(storedRememberMe);
    }
  }, []);

  const signIn = useSignIn();

  const handleSubmit = async () => {
    setLoading(true);
    setAlert("");
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_PORT}/api/users/login`,
        {
          email,
          password,
        }
      );

      if (result && result.data) {
        if (result.status == 200) {
          if (
            signIn({
              auth: {
                token: result.data.accessToken,
                type: "Bearer",
              },
              userState: {
                name: "React User",
                uid: 123456,
              },
            })
          ) {
            navigate("/");
            localStorage.setItem("token", result.data.accessToken);
            setToken(result.data.accessToken);
          } else {
            //Throw error
          }
          setErrorMessage("");
          setLoading(false);
        } else {
          console.error("Login failed");
          setLoading(false);
        }
      }
    } catch (error) {
      setAlert({
        message: "Mail veya şifre yanlış",
        description: "Lütfen mailinizi ve şifrenizi kontrol ediniz.",
        type: "error",
      });
      console.error(
        "Login failed:",
        error.response ? error.response.data : error
      );
      setErrorMessage(error.response ? error.response.data : error.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Row justify="end"></Row>
      <Row>
        <Col
          style={{
            height: "55%",
            marginTop: "2%",
          }}
        >
          <Col className="form-title" span={20}>
            {t("loginPages.slogan")}
          </Col>
          <Col className="form-description" span={24}>
            {t("loginPages.loginGetStarted")}
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

                if (isEmailFocused) {
                  const emailErrors = form.getFieldError("email");
                  setMailIsValid(emailErrors);
                }

                if (isPasswordFocused) {
                  const passwordErrors = form.getFieldError("password");
                  setPasswordIsValid(passwordErrors);
                }
              }}
              autoComplete="off"
            >
              <label className="input-label" htmlFor="">
                {t("loginPages.email")}
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
                    message: t("loginPages.emailWarning"),
                  },
                ]}
                validateStatus={
                  isEmailFocused
                    ? ""
                    : mailIsValid[0] == "init"
                    ? ""
                    : mailIsValid.length == 0
                    ? "success"
                    : "error"
                }
                help={
                  isEmailFocused
                    ? ""
                    : mailIsValid[0] == "init"
                    ? ""
                    : mailIsValid
                }
                hasFeedback={!isEmailFocused}
              >
                <Input
                  className="input-field"
                  placeholder={t("loginPages.emailPlaceHolder")}
                  value={email}
                  onFocus={() => {
                    setIsEmailFocused(true);
                  }}
                  onBlur={() => {
                    setIsEmailFocused(false);
                  }}
                  style={{
                    borderColor: isEmailFocused
                      ? "#133163"
                      : mailIsValid
                      ? ""
                      : "#FF4D4F",
                  }}
                  prefix={
                    <MailOutlined
                      style={{
                        color: isEmailFocused
                          ? ""
                          : mailIsValid.length === 0
                          ? "green"
                          : "",
                      }}
                    />
                  }
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  disabled={loading}
                />
              </Form.Item>
              <label className="input-label" htmlFor="">
                {t("loginPages.password")}
              </label>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: t("loginPages.passwordWarning"),
                  },
                ]}
                validateStatus={
                  isPasswordFocused
                    ? ""
                    : passwordIsValid[0] == "init"
                    ? ""
                    : passwordIsValid.length == 0
                    ? "success"
                    : "error"
                }
                help={
                  isPasswordFocused
                    ? ""
                    : passwordIsValid[0] == "init"
                    ? ""
                    : passwordIsValid
                }
                hasFeedback={!isPasswordFocused}
              >
                <Input.Password
                  className="input-field"
                  placeholder={t("loginPages.passwordPlaceHolder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  style={{
                    borderColor: isPasswordFocused
                      ? "#133163"
                      : passwordIsValid
                      ? ""
                      : "#FF4D4F",
                  }}
                  prefix={
                    <LockOutlined
                      className="site-form-item-icon"
                      style={{
                        color: isPasswordFocused
                          ? ""
                          : passwordIsValid.length == 0
                          ? "green"
                          : "",
                      }}
                    />
                  }
                  disabled={loading}
                />
              </Form.Item>

              <Row
                style={{
                  marginTop: "-15px",
                }}
              >
                <Col span={12}>
                  <Form.Item>
                    <Checkbox
                      className="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    >
                      {t("loginPages.rememberMe")}
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col align="end" span={12}>
                  <Form.Item>
                    <Button
                      className="forget-password"
                      type="link"
                      href="reset"
                      style={{
                        color: "#0057d9",
                      }}
                    >
                      {t("loginPages.forgotPassword")}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item wrapperCol={{ span: 24 }}>
                <PrimaryButton
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    backgroundColor: loading
                      ? "#0057D9"
                      : formIsValid
                      ? "#0057D9"
                      : "#0000000A",
                    color: loading
                      ? "white"
                      : formIsValid
                      ? "white"
                      : "#00000040",
                    borderColor: loading
                      ? "#0057D9"
                      : formIsValid
                      ? "#0057D9"
                      : "#00000026",
                  }}
                  htmlType="submit"
                  disabled={!formIsValid || loading}
                  loading={loading}
                >
                  {!loading && t("loginPages.login")}
                </PrimaryButton>
              </Form.Item>
              <Col className="form-end-message">
                {t("loginPages.userInformation")}
              </Col>
            </Form>
          </Col>
        </Col>
      </Row>
    </AuthLayout>
  );
}

export default Login;
