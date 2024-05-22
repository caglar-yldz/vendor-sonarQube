import { useState } from "react";
import GlobalContext from "./GlobalContext";

// eslint-disable-next-line react/prop-types
const GlobalProvider = ({ children }) => {

  const [response, setResponsee] = useState("");
  const [projectId, setProjectIdd] = useState("");
  const [alert, setAlertt] = useState("");
  const [efforts, setEffortss] = useState("");
  const [projectVendors, setProjectVendorss] = useState("");
  const [newProjectName, setNewProjectNamee] = useState("");
  const [newOrDeletedProject, setNewOrDeletedProjectt] = useState("");
  const [currentUser, setCurrentUserr] = useState("");
  const [newOrDeletedUserId, setNewOrDeletedUserIdd] = useState("");
  const [newEffort, setNewEffortt] = useState("");
  const [AllCompanyUsers, setAllCompanyUserss] = useState("");
  const [token, setTokenn] = useState("");
  const [projects, setProjectss] = useState([]);
  const [users, setUserss] = useState([]);
  const [isUsersFetched, setIsUsersFetchedd] = useState(false);
  const [contractDetails, setContractDetailss] = useState("");
  const [contractId, setContractIdd] = useState("");
  const [isProjectsFetched, setIsProjectsFetchedd] = useState("");
  const [favoriteProjects, setFavoriteProjectss] = useState([]);
  const [newProjectManegerId, setNewProjectManegerIdd] = useState(null);
  const [isReadContinuing, setIsReadContinuingg] = useState(false);


   
  const handleDeleteProjectInParent = async (_id) => {
    setProjectss((prevProjects) =>
      prevProjects.filter((project) => project._id !== _id)
    );
  };
  const setIsUsersFetched = async (response) => {
    setIsUsersFetchedd(response);
  };
  const setIsProjectsFetched = async (response) => {
    setIsProjectsFetchedd(response);
  };
  const setIsReadContinuing = async (response) => {
    setIsReadContinuingg(response);
  };

  const setProjects = async (projects) => {
    setProjectss(projects);
  };

  const setFavoriteProjects = async (projects) => {
    setFavoriteProjectss(projects);
  };


  const setUsers = async (users) => {
    setUserss(users);
  };
  const setContractDetails = async (contractDetails) => {
    setContractDetailss(contractDetails);
  };
  const setContractId = async (contractId) => {
    setContractIdd(contractId);
  };

  const setProjectId = async (response) => {
    setProjectIdd(response);
  };

  const setResponse = async (response) => {
    setResponsee(response);
  };

  const setAlert = async (response) => {
    setAlertt(response);
  };
  const setEfforts = async (response) => {
    setEffortss(response);
  };
  const setProjectVendors = async (response) => {
    setProjectVendorss(response);
  };
  const setNewProjectName = async (response) => {
    setNewProjectNamee(response);
  };
  const setNewOrDeletedProject = async (response) => {
    setNewOrDeletedProjectt(response);
  };
  const setCurrentUser = async (response) => {
    setCurrentUserr(response);
  };
  const setNewOrDeletedUserId = async (response) => {
    setNewOrDeletedUserIdd(response);
  };
  const setNewEffort = async (response) => {
    setNewEffortt(response);
  };
  const setAllCompanyUsers = async (response) => {
    setAllCompanyUserss(response);
  };
  const setToken = async (response) => {
    setTokenn(response);
  };
  const setNewProjectManegerId = async (response) => {
    setNewProjectManegerIdd(response);
  };

  const values = {
    response,
    setResponse,
    efforts,
    setEfforts,
    projectVendors,
    setProjectVendors,
    alert,
    setAlert,
    newProjectName,
    setNewProjectName,
    projectId,
    setProjectId,
    newOrDeletedProject,
    setNewOrDeletedProject,
    currentUser,
    setCurrentUser,
    newOrDeletedUserId,
    setNewOrDeletedUserId,
    newEffort,
    setNewEffort,
    AllCompanyUsers,
    setAllCompanyUsers,
    token,
    setToken,
    projects,
    setProjects,
    users,
    setUsers,
    handleDeleteProjectInParent,
    contractDetails,
    setContractDetails,
    contractId,
    setContractId,
    isProjectsFetched,
    setIsProjectsFetched,
    setFavoriteProjects,
    favoriteProjects,
    setNewProjectManegerId,
    newProjectManegerId,
    setIsReadContinuing,
    isReadContinuing,
    setIsUsersFetched,
    isUsersFetched,
  };

  return <GlobalContext.Provider value={values}>{children}</GlobalContext.Provider>;
};

export default GlobalProvider;