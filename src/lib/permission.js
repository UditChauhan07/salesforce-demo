
import { DestoryAuth, GetAuthData } from "./store";

// Get permissions based on logged in user
export async function getPermissions() {
  const authData = await GetAuthData();

  if (!authData) {
    console.log("No auth data found, or session expired.");
    DestoryAuth();
    return null;
  }
  

  let userPermissions =  null;
  if(authData?.permission){
    userPermissions= JSON.parse(authData.permission)
    console.log({userPermissions})
  }

  if (!userPermissions) {
    console.log("Permissions not found for the user type.");
    return null;
  }

  return userPermissions;
}
