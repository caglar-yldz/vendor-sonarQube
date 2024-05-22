import {
  Login,
  Home,
  ProfilePage,
  ResetPassword,
  ResetPasswordConfirm,
  ProjectListPage,
  ResetRePassword,
  UserListPage,
  AddContract,
  Contracts,
  SignaturesContract,
  Efforts,
  ContractDetails,
  Payments,
} from "./page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "react-auth-kit";
import { useState, createContext } from "react";
import GlobalProvider from "./context/GlobalProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import createStore from "react-auth-kit/createStore";
import AuthOutlet from "@auth-kit/react-router/AuthOutlet";
import LoadingContext from "./context/LoadingContext";
import { Spin, ConfigProvider } from "antd";
import "./styles/App.css";
import tr_TR from "antd/lib/locale/tr_TR";
import en_US from "antd/lib/locale/en_US";
import io from "socket.io-client";
import { notification } from "antd";
import { useTranslation } from "react-i18next";

const socket = io.connect(`${import.meta.env.VITE_API_PORT}`);

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const { i18n } = useTranslation();

  const store = createStore({
    authName: "_auth",
    authType: "cookie",
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === "https:",
  });

  const [api, contextHolder] = notification.useNotification();

  const openNotification = (placement, status, message) => {
    if (message && status === "success") {
      api.success({
        message: message,
        placement,
      });
    } else if (message && status === "error") {
      api.error({
        message: message,
        placement,
      });
    }
  };

  const Context = createContext({
    name: "Default",
  });

  return (
    <ConfigProvider locale={i18n.language == "en" ? en_US : tr_TR}>
      <div>
        <ToastContainer style={{ zIndex: 9999 }} />
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
          {isLoading && (
            <div className="loading-overlay">
              <Spin size="large" />
            </div>
          )}
          <AuthProvider store={store}>
            <Context.Provider>{contextHolder}</Context.Provider>
            <GlobalProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<AuthOutlet fallbackPath="/login" />}>
                    <Route path="/" element={<Home socket={socket} />} />
                    <Route
                      path="/profile"
                      element={<ProfilePage socket={socket} />}
                    />
                    <Route
                      path="/projects"
                      element={
                        <ProjectListPage
                          socket={socket}
                          openNotification={openNotification}
                        />
                      }
                    />
                    <Route
                      path="/payments"
                      element={
                        <Payments
                          socket={socket}
                          openNotification={openNotification}
                        />
                      }
                    />
                    <Route
                      path="/users"
                      element={<UserListPage socket={socket} />}
                    />
                    <Route
                      path="/contracts"
                      element={
                        <Contracts
                          socket={socket}
                          openNotification={openNotification}
                        />
                      }
                    />
                    <Route
                      path="/contract"
                      element={<AddContract socket={socket} />}
                    />
                    <Route
                      path="/signaturesContract"
                      element={<SignaturesContract socket={socket} />}
                    />
                    <Route
                      path="/efforts"
                      element={<Efforts socket={socket} />}
                    />
                    <Route
                      path="/contractDetails/:contractId"
                      element={<ContractDetails socket={socket} />}
                    />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset" element={<ResetPassword />} />
                  <Route path="/confirm" element={<ResetPasswordConfirm />} />
                  <Route
                    path="/rePassword/:token"
                    element={<ResetRePassword socket={socket} />}
                  />
                </Routes>
              </BrowserRouter>
            </GlobalProvider>
          </AuthProvider>
        </LoadingContext.Provider>
      </div>
    </ConfigProvider>
  );
}

export default App;
