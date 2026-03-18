export const mergeUserPermissions = (template, userPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return template;

  return template.map((comp) => {
    const userComp = userPermissions.find(
      (u) => u.componentName === comp.componentName
    );

    if (!userComp) return comp;

    return {
      ...comp,
      visible: userComp.visible,
      actions: comp.actions.map((a) => {
        const ua = userComp.actions.find((x) => x.actionName === a.actionName);
        return ua ? { ...a, allowed: ua.allowed } : a;
      }),
      subComponents: comp.subComponents.map((sub) => {
        const userSub = userComp.subComponents.find(
          (s) => s.subComponentName === sub.subComponentName
        );

        if (!userSub) return sub;

        return {
          ...sub,
          visible: userSub.visible,
          actions: sub.actions.map((a) => {
            const ua = userSub.actions.find(
              (x) => x.actionName === a.actionName
            );
            return ua ? { ...a, allowed: ua.allowed } : a;
          }),
        };
      }),
    };
  });
};
