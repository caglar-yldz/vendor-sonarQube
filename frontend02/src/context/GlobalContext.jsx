import { createContext } from "react";

const GlobalContext = createContext({
  response: {},
  projects: [],
  users: [],
  projectId: {},
  alert: {},
  projectVendors: {},
  efforts: {},
  newProjectName: {},
  newEffort: {},
  setProjectId: () => { },
  newOrDeletedProject: {},
  currentUser: {},
  newOrDeletedUserId: {},
  AllCompanyUsers: {},
  contractId: {},
  token: {},
  isProjectsFetched: {},
  newProjectManegerId: {},
  isReadContinuing: {},
  isUsersFetched: {},
  setIsUsersFetched: () => {},
  setIsReadContinuing: () => {},
  setNewProjectManegerId: () => {},
  setIsProjectsFetched: () => { },
  setToken: () => { },
  setContractId: () => { },
  setAllCompanyUsers: () => { },
  setEfforts: () => { },
  setProjectVendors: () => { },
  setResponse: () => { },
  setAlert: () => { },
  setNewProjectName: () => { },
  setNewOrDeletedProject: () => { },
  setCurrentUser: () => { },
  setNewOrDeletedUserId: () => { },
  setNewEffort: () => { },
  setProjects: () => { },
  setUsers: () => { },
  handleDeleteProjectInParent: () => { },
 
  favoriteProjects:[],
  setFavoriteProjects:() =>{},

  //contracts
  contractDetails: {},
  setContractDetails: () => { },

});


export default GlobalContext;