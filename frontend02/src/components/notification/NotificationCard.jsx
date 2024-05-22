import React, { useContext, useEffect } from "react";
import "./style.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons"; 
import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";
import GlobalContext from "../../context/GlobalContext";
import { useTranslation } from "react-i18next";

export default function NotificationCard({
  title,
  description,
  createdAt,
  isRead,
  setUnreadedNotificationCount,
  relatedObjectUrl,
  id,
  props,
}) {
  const [read, setRead] = React.useState(isRead);
  const [cardTitle, setCardTitle] = React.useState("");
  const [cardDescription, setCardDiscription] = React.useState("");
  const { isReadContinuing, setIsReadContinuing } = useContext(GlobalContext);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setRead(isRead);
  }, [isRead]);

  const onClickNotification = async () => {
    setIsReadContinuing(true);
    setRead(true);
    if (read === false) {
      setUnreadedNotificationCount((prevCount) => prevCount - 1);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_PORT}/api/notifications/markasRead/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } catch (error) {
        console.error("Error:", error);
      }
    }

    setIsReadContinuing(false);
  };

  useEffect(() => {
    switch (title) {
      case "addProject":
        setCardTitle(`${t("notifications.addProjectTitle")}`);
        if (i18n.language === "en") {
          setCardDiscription(`You have been added to the ${props.projectName} project.`);
        } else if (i18n.language === "tr") {
          setCardDiscription(`${props.projectName} projesine eklendiniz.`);
        }
        else{
          setCardDiscription(`${props.projectName} projesine eklendiniz.`);
        }
        break;
      case "contractApproval":
        setCardTitle(`${t("notifications.contractApprovalTitle")}`);
        if (i18n.language === "en") {
          setCardDiscription(`${props.userName} ${props.status==="approved" ? "approved":"rejected"} the ${props.contractName} contract.`);
        } else if (i18n.language === "tr") {
          setCardDiscription(`${props.userName} ${props.contractName} kontratını ${props.status == "approved"?"onayladı.":"reddetti."}`);
        }
        else{
          setCardDiscription(`${props.userName} ${props.contractName} kontratını ${props.status == "approved"?"onayladı.":"reddetti."}`);
        }
        break;
      case "newContract":
        setCardTitle(`${t("notifications.newContractTitle")}`);
        if (i18n.language === "en") {
          setCardDiscription(`You have new contract from ${props.companyName} company.`);
        } else if (i18n.language === "tr") {
          setCardDiscription(`${props.companyName} firması size kontrat gönderdi.`);
        }
        else{
          setCardDiscription(`${props.companyName} firması size kontrat gönderdi.`);
        }
        break;
      case "comment":
        setCardTitle(`${t("notifications.commentTitle")}`);
        if (i18n.language === "en") {
          setCardDiscription(`${props.userName}: ${description}`);
        } else if (i18n.language === "tr") {
          setCardDiscription(`${props.userName}: ${description}`);
        }
        else{
          setCardDiscription(`${props.userName}: ${description}`);
        }
        break;
      case "effort":
        setCardTitle(`${t("notifications.effortTitle")}`);
        if (i18n.language === "en") {
          setCardDiscription(`${props.status==="approved"?"Your effort has been approved":"Your effort was rejected"}`);
        } else if (i18n.language === "tr") {
          setCardDiscription(`${props.status==="approved"?"Eforunuz onaylandı.":"Eforunuz reddedildi"}`);
        }
        else{
          setCardDiscription(`${props.status==="approved"?"Eforunuz onaylandı.":"Eforunuz reddedildi"}`);
        }
        break;
      default:
        console.log("Unknown notification.");
    }
  }, [title, description, i18n.language]);

  return (
    <Link to={relatedObjectUrl} onClick={onClickNotification}>
      <Row align="middle" className="notificationCard">
        <Col span={2} className="isReadIcon">
          {!read && (
            <FontAwesomeIcon
              style={{ color: "#0072ff", height: "11px", marginBottom: "1px" }}
              icon={faCircle}
            />
          )}
        </Col>
        <Col span={22}>
          <Row style={{ paddingLeft: "5px" }}>
            <Col
              span={12}
              style={{ color: read && "#000000a0" }}
              className="notificationTitle"
            >
              {cardTitle}
            </Col>
            <Col span={12} className="timeAgo">
              {createdAt}
            </Col>
            <Col
              span={24}
              style={{ color: read && "#000000a0" }}
              className="notificationDescription"
            >
              {cardDescription}
            </Col>
          </Row>
        </Col>
      </Row>
    </Link>
  );
}
