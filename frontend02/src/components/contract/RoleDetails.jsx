import { useContext, useState, useEffect } from "react";
import { Card, Typography, Select, Input } from "antd";
import GlobalContext from "../../context/GlobalContext";
import "../../page/contract/contract.scss";
import { useTranslation } from "react-i18next";
import {jobOptions} from '../../constans/jobOptions';
import {competenceLevelOptions} from '../../constans/competenceLevelOptions'
const { Option } = Select;


const RoleDetails = () => {
  const { contractDetails, setContractDetails } = useContext(GlobalContext);
  const [job, setJob] = useState(contractDetails.job || "");
  const [competenceLevel, setCompetenceLevel] = useState(
    contractDetails.competenceLevel || ""
  );
  const [scopeTemplate, setScopeTemplate] = useState(
    contractDetails.scopeTemplate || ""
  );
  const [scopeDescription, setScopeDescription] = useState(
    contractDetails.scopeDescription || ""
  );
  const { t } = useTranslation();

  useEffect(() => {
    setContractDetails((prevState) => ({
      ...prevState,
      job: job,
      competenceLevel: competenceLevel,
      scopeTemplate: scopeTemplate,
      scopeDescription: scopeDescription,
    }));
  }, [job, competenceLevel, scopeTemplate, scopeDescription]);

  const handleScopeTemplateChange = (value) => {
    if (value.length <= 30) {
      setScopeTemplate(value);
    }
  };

  const handleScopeDescriptionChange = (value) => {
    if (value.length <= 1500) {
      setScopeDescription(value);
    }
  };

  useEffect(() => {
    setContractDetails((prevState) => ({
      ...prevState,
      job: job,
      competenceLevel: competenceLevel,
      scopeTemplate: scopeTemplate,
      scopeDescription: scopeDescription,
    }));
  }, [job, competenceLevel, scopeTemplate, scopeDescription]);

  return (
    <div className="content">
      <Card bordered={false} className="card-container-centered">
        <Typography.Title style={{ marginBottom: "0" }} level={4}>
          <span style={{ color: "#888" }}> {t("contractPages.step2")}</span>{" "}
          <span style={{ marginLeft: "5px" }}>
            {" "}
            {t("contractPages.roleDetails")}
          </span>
        </Typography.Title>
      </Card>

      <Card bordered={false} className="card-content">
        <Typography.Text strong>
          {" "}
          {t("contractPages.jobDetails")}
        </Typography.Text>

        <div className="margin-top">
          <label className={`label-above ${job ? "" : "required"}`}>
            {t("contractPages.occupation")}
          </label>{" "}
          <Select
            className="select-input custom-margin"
            value={job}
            onChange={(value) => setJob(value)}
          >
            {jobOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <div className="margin-top">
          <label className={`label-above ${competenceLevel ? "" : "required"}`}>
            {t("contractPages.competency")}
          </label>{" "}
          <Select
            className="select-input custom-margin"
            value={competenceLevel}
            onChange={(value) => setCompetenceLevel(value)}
          >
            {competenceLevelOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

      <Card bordered={false} className="card-content">
        <Typography.Text strong>
          {" "}
          {t("contractPages.scopeWork")}
        </Typography.Text>

        <div className="margin-top">
          <label className={`label-above ${scopeTemplate ? "" : "required"}`}>
            {t("contractPages.jobTitle")}
          </label>
          <Input
            className="custom-margin"
            placeholder={t("contractPages.jobTitlePlaceHolder")}
            value={scopeTemplate}
            count={{
              show: true,
              max: 30,
            }}
            maxLength={30}
            onChange={(e) => handleScopeTemplateChange(e.target.value)}
          />
        </div>

        <div className="margin-top">
          <label
            className={`label-above ${scopeDescription ? "" : "required"}`}
          >
            {t("contractPages.jobDescription")}{" "}
          </label>{" "}
          <Input.TextArea
            className="custom-margin"
            placeholder={t("contractPages.jobDescriptionPlaceHolder")}
            autosize={{ minRows: 4, maxRows: 6 }}
            value={scopeDescription}
            count={{
              show: true,
              max: 1500,
            }}
            maxLength={1500}
            onChange={(e) => handleScopeDescriptionChange(e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
};

export default RoleDetails;
