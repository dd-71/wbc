import { ROUTE_COMPONENT_MAP } from "./routeComponentMap";

export const generateRoutesFromPermissions = (permissions = []) => {
  const routes = [];

  permissions.forEach((component) => {
    // Component-level route
    if (component.visible && ROUTE_COMPONENT_MAP[component.path]) {
      routes.push({
        path: component.path,
        element: ROUTE_COMPONENT_MAP[component.path],
      });
    }

    // Sub-components
    component.subComponents?.forEach((sub) => {
      if (sub.visible && ROUTE_COMPONENT_MAP[sub.path]) {
        routes.push({
          path: sub.path,
          element: ROUTE_COMPONENT_MAP[sub.path],
        });
      }
    });
  });

  return routes;
};
