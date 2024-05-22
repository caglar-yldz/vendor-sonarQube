import React, { useState, useContext, useEffect } from "react";
import { Input, Select, Card, Typography } from "antd";
import GlobalContext from "../../context/GlobalContext";
import "../../page/contract/contract.scss";
import { useTranslation } from "react-i18next";
import {ulkeler} from '../../constans/country'
const { Option } = Select;


function GeneralInfo() {
  const { contractDetails, setContractDetails, users, projects } =
    useContext(GlobalContext);
  const [vendorName, setVendorName] = useState(
    contractDetails.vendorName || ""
  );
  const [projectName, setProjectName] = useState(
    contractDetails.projectName || ""
  );
  const [contractName, setContractName] = useState(
    contractDetails.contractName || ""
  );
  const [country, setCountry] = useState(contractDetails.country || "");
  const [selectedUser, setSelectedUser] = useState(
    contractDetails.selectedUser || ""
  );
  const [vendorId, setVendorId] = useState(contractDetails.vendorId || "");
  const [projectId, setProjectId] = useState(contractDetails.projectId || "");
  const [selectedUserData, setSelectedUserData] = useState();
  const { t } = useTranslation();

  const handleContractNameChange = (value) => {
    setContractName(value);
  };

  const handleCountryChange = (value) => {
    setCountry(value);
  };

  const handleSelectedUserChange = (value) => {
    setSelectedUser(value);
    setProjectId(null);
    setProjectName(null);
    const selectedUserData = users.find((user) => user.userName === value);
    setSelectedUserData(selectedUserData);
    if (selectedUserData) {
      setVendorId(selectedUserData._id);
    }
  };

  const handleProjectNameChange = (value) => {
    setProjectName(value);
    const projectData = projects.find(
      (project) => project.projectName === value
    );
    if (projectData) {
      setProjectId(projectData._id);
    }
  };

  useEffect(() => {
    console.log('Project:',selectedUserData);
    setContractDetails((prevState) => ({
      ...prevState,
      vendorName: `${
        users.find((user) => user.userName === selectedUser)?.firstName
      } ${users.find((user) => user.userName === selectedUser)?.lastName}`,
      country: country,
      selectedUser: selectedUser,
      projectName: projectName,
      contractName: contractName,
      vendorId: vendorId,
      projectId: projectId,
    }));
  }, [
    vendorName,
    country,
    selectedUser,
    projectName,
    contractName,
    vendorId,
    projectId,
  ]); // Add vendorId to the dependency array

  return (
    <div className="content">
      <Card bordered={false} className="card-container-centered">
        <Typography.Title style={{ marginBottom: "0" }} level={4}>
          <span style={{ color: "#888" }}>{t("contractPages.step1")}</span>{" "}
          <span style={{ marginLeft: "5px" }}>
            {" "}
            {t("contractPages.generelInformation")}
          </span>
        </Typography.Title>
      </Card>

      <Card bordered={false} className="card-content">
        <Typography.Text strong>
          {" "}
          {t("contractPages.vendorInformation")}
        </Typography.Text>

        <div className="margin-top">
          <label className={`label-above ${contractName ? "" : "required"}`}>
            {t("contractPages.contractName")}
          </label>
          <Input
            className="custom-margin"
            placeholder={t("contractPages.contractPlaceHolder")}
            value={contractName}
            count={{
              show: true,
              max: 30,
            }}
            maxLength={30}
            onChange={(e) => handleContractNameChange(e.target.value)}
          />
        </div>

        <div className="margin-top">
          <label className={`label-above ${country ? "" : "required"}`}>
            {t("contractPages.selectCountry")}
          </label>
          <Select
            className={`select-input custom-margin ${
              country ? "" : "required"
            }`}
            value={country}
            onChange={handleCountryChange}
          >
            {ulkeler.map((ulke) => (
              <Option key={ulke.id} value={ulke.ad}>
                {ulke.ad}
              </Option>
            ))}
          </Select>
        </div>

        <div className="margin-top">
          <label className={`label-above ${selectedUser ? "" : "required"}`}>
            {t("contractPages.selectVendor")}
          </label>
          <Select
            className={`select-input custom-margin ${
              selectedUser ? "" : "required"
            }`}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={selectedUser}
            onChange={handleSelectedUserChange}
          >
            {users.map(
              (user) =>
                user.firstName &&
                user.lastName && (
                  <Option key={user._id} value={user.userName}>
                    {user.firstName + " " + user.lastName}
                  </Option>
                )
            )}
          </Select>
        </div>

        <div className="margin-top">
          <label> {t("contractPages.vendorEmail")}</label>
          <Input
            className={`select-input custom-margin ${
              selectedUser ? "" : "required"
            }`}
            showSearch
            placeholder="E-Posta"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={users.find((user) => user.userName === selectedUser)?.email}
            disabled
            onChange={handleSelectedUserChange}
          ></Input>
        </div>

        <div className="margin-top">
          <label> {t("contractPages.selectProject")}</label>
          <Select
            className={`select-input custom-margin ${
              projectName ? "" : "required"
            }`}
            showSearch
            placeholder="Proje Seç"
            optionFilterProp="children"
            allowClear
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={projectName}
            onChange={handleProjectNameChange}
          >
            {projects.map((project) => (
              <>
                {!selectedUserData?.projectIds?.includes(project._id) && (
                  <Option key={project._id} value={project.projectName}>
                    {project.projectName}
                  </Option>
                )}
              </>
            ))}
          </Select>
        </div>
      </Card>
    </div>
  );
}

export default GeneralInfo;
