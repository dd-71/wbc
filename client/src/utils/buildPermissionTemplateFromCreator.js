export const buildPermissionTemplateFromCreator = (creatorPermissions) => {
  return creatorPermissions.map((component) => ({
    componentName: component.componentName,
    permissionLabel: component.permissionLabel,
    path: component.path,
    icon: component.icon ?? null,

    // creator can decide visibility
    visible: false,

    // actions only if component has no subComponents
    actions: Array.isArray(component.actions)
      ? component.actions.map((action) => ({
          actionName: action.actionName,
          allowed: false, // 👈 always false initially
        }))
      : [],

    subComponents: Array.isArray(component.subComponents)
      ? component.subComponents.map((sub) => ({
          subComponentName: sub.subComponentName,
          permissionLabel: sub.permissionLabel,
          path: sub.path,
          icon: sub.icon ?? null,
          visible: false,

          actions: Array.isArray(sub.actions)
            ? sub.actions.map((action) => ({
                actionName: action.actionName,
                allowed: false, // 👈 always false initially
              }))
            : [],
        }))
      : [],
  }));
};

export const mergeUserPermissions = (creator, user) => {
  return creator.map((c) => {
    const u = user.find((x) => x.path === c.path);

    return {
      ...c,
      visible: u?.visible || false,

      actions: c.actions.map((a) => {
        const ua = u?.actions?.find((x) => x.actionName === a.actionName);
        return {
          ...a,
          allowed: ua?.allowed || false,
        };
      }),

      subComponents: c.subComponents.map((s) => {
        const us = u?.subComponents?.find((x) => x.path === s.path);

        return {
          ...s,
          visible: us?.visible || false,

          actions: s.actions.map((a) => {
            const ua = us?.actions?.find((x) => x.actionName === a.actionName);
            return {
              ...a,
              allowed: ua?.allowed || false,
            };
          }),
        };
      }),
    };
  });
};

