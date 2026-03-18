import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { getActionsForPath } from "../../utils/permissionHelpers";

export const usePermission = () => {
  const { permissions } = useAuth();
  const { pathname } = useLocation();
  // console.log(permissions);

  const actions = getActionsForPath(permissions, pathname);

  const can = (actionName) => {
    return actions.some((a) => a.actionName === actionName && a.allowed);
  };

  return { actions, can };
};
