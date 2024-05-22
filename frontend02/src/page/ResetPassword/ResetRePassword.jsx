import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./ResetPassword.scss";
import { useNavigate, useParams, useLocation  } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { Row, Col } from "antd";
import "react-toastify/dist/ReactToastify.css";
import { Alert, Space } from "antd";
import GlobalContext from "../../context/GlobalContext.jsx";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AuthLayout from '../../Layout/AuthLayout.jsx'
import PrimaryButton from "../../components/buttons/primaryButton.jsx";

import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

function ResetRePassword({ socket }) {
  const { alert, setAlert } = useContext(GlobalContext);

  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams(); // Get the token from the URL
  const [loading, setLoading] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasLetter, setHasLetter] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const newUser = searchParams.get("newUser");
  const email = searchParams.get("email");
  const dailySalary = searchParams.get("dailySalary");
  const companyName = searchParams.get("companyName");



  const handleChangePassword = async () => {
    setLoading(true);
    // Use the token to reset the password
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_PORT}/api/email/`,
        {
          newpassword: password,
          newpassword2: password2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        if(newUser){
          await axios.post(
            `${import.meta.env.VITE_API_PORT}/api/company/accept`,
            {
              email,
              dailySalary,
              companyName
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ).then(()=>{
            socket.emit("chat", {
              message: "vendorChanges",
              sender: socket.id,
            });
            setAlert(
              {
                type: "success",
                message: "Şifre başarıyla değiştirildi.",
                description: "Kullanıcı bilgileri ile giriş yapabilirsiniz.",
              }
            );
          }).catch(err =>
            console.error(err)
          );
        }

        navigate("/login");
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle error
    }
    setLoading(false);

    
  };
  useEffect(() => {
    setIsLengthValid(password.length >= 8);
    setHasLetter(/[a-zA-Z]/.test(password));
    setHasNumber(/\d/.test(password));
    if (
      password &&
      password == password2 &&
      isLengthValid &&
      hasLetter &&
      hasNumber
    )
      setFormIsValid(true);
    else setFormIsValid(false);
  }, [password, password2]);

  return (
    <AuthLayout>
      <Row>
        <Col
        >
          <Col className="form-title" span={14}>
            Şifre Belirle
          </Col>
          <Col className="form-description" span={24}>
            Lütfen şifre kurallarına uygun olarak şifrelerinizi belirleyiniz.
          </Col>

          <Col>
            <Form
              onSubmitCapture={handleChangePassword}
              name="dependencies"
              autoComplete="off"
              style={{
                maxWidth: 600,
              }}
              layout="vertical"
            >
              <Form.Item label="Şifre" name="password">
                <Input
                  placeholder="Şifrenizi yazınız"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="text"
                />
              </Form.Item>

              <Form.Item
                label="Şifre Tekrar"
                name="password2"
                dependencies={["password"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "Şifreler eşleşmiyor!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input
                  placeholder="Şifrenizi tekrar yazınız"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  type="text"
                />
              </Form.Item>

              {!password || !(isLengthValid && hasLetter && hasNumber) ? (
                <Col className="password-alert">
                  <Row>
                    <Col span={2}>
                      <ExclamationCircleOutlined className="icon" />{" "}
                    </Col>
                    <Col span={22} className="alert-title">
                      Şifre Kuralları
                    </Col>
                    <Col span={2}></Col>

                    <Col style={{ paddingLeft: "5px" }} span={22}>
                      <p>
                        {!isLengthValid && "En az 8 karakter içermelidir."}{" "}
                      </p>
                      <p>{!hasLetter && "En az bir harf içermelidir."} </p>
                      <p>{!hasNumber && "En az bir rakam içermelidir."}</p>
                    </Col>
                  </Row>
                </Col>
              ) : password === password2 ? null : (
                <Col className="password-success">
                  <Row>
                    <Col span={2}>
                      <CheckCircleOutlined className="icon" />{" "}
                    </Col>
                    <Col span={22} className="alert-title">
                      Şifre Kuralları
                    </Col>
                    <Col span={2}></Col>
                    <Col style={{ paddingLeft: "5px" }} span={22}>
                      Lütfen belirlediğiniz şifreyi tekrar yazın
                    </Col>
                  </Row>
                </Col>
              )}

              <PrimaryButton
                className="submit"
                style={{
                  width: "100%",
                  marginTop:"10px",
                }}
                type="primary"
                htmlType="submit"
                disabled={!formIsValid || loading} // Disable the button when loading
                loading={loading} // Show loading spinner
              >
                {!loading && " İlerle"}
              </PrimaryButton>
            </Form>
          </Col>
        </Col>
      </Row>
    </AuthLayout>
  );
}

export default ResetRePassword;
