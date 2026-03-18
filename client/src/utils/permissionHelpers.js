export const hasComponentAccess = (permissions, pathname) => {
  // Find exact match or best match (longest path)
  let bestMatch = null;

  for (const component of permissions) {
    if (
      pathname === component.path ||
      pathname.startsWith(component.path + "/")
    ) {
      if (!bestMatch || component.path.length > bestMatch.path.length) {
        bestMatch = component;
      }
    }
  }

  return bestMatch ? bestMatch.visible : false;
};

export const hasSubAccess = (permissions, pathname) => {
  let bestMatch = null;

  for (const component of permissions) {
    for (const sub of component.subComponents || []) {
      if (pathname === sub.path || pathname.startsWith(sub.path + "/")) {
        if (!bestMatch || sub.path.length > bestMatch.path.length) {
          bestMatch = sub;
        }
      }
    }
  }

  return bestMatch ? bestMatch.visible : false;
};

export const getActionsForPath = (permissions, pathname) => {
  let bestMatch = null;

  for (const comp of permissions) {
    // Check exact match or starts with path/
    if (pathname === comp.path || pathname.startsWith(comp.path + "/")) {
      if (!bestMatch || comp.path.length > bestMatch.path.length) {
        bestMatch = { path: comp.path, actions: comp.actions };
      }
    }

    for (const sub of comp.subComponents || []) {
      if (pathname === sub.path || pathname.startsWith(sub.path + "/")) {
        if (!bestMatch || sub.path.length > bestMatch.path.length) {
          bestMatch = { path: sub.path, actions: sub.actions };
        }
      }
    }
  }

  return bestMatch?.actions || [];
};

export const can = (actions, actionName) => {
  return actions.some((a) => a.actionName === actionName && a.allowed);
};

// export const hasComponentAccess = (permissions, pathname) => {
//   return permissions.some((c) => c.visible && pathname.startsWith(c.path));
// };

// export const hasSubAccess = (permissions, pathname) => {
//   return permissions.some((c) =>
//     c.subComponents?.some((s) => s.visible && pathname.startsWith(s.path))
//   );
// };

// export const getActionsForPath = (permissions, pathname) => {
//   let bestMatch = null;

//   for (const comp of permissions) {
//     if (pathname.startsWith(comp.path)) {
//       if (!bestMatch || comp.path.length > bestMatch.path.length) {
//         bestMatch = { path: comp.path, actions: comp.actions };
//       }
//     }

//     for (const sub of comp.subComponents || []) {
//       if (pathname.startsWith(sub.path)) {
//         if (!bestMatch || sub.path.length > bestMatch.path.length) {
//           bestMatch = { path: sub.path, actions: sub.actions };
//         }
//       }
//     }
//   }

//   return bestMatch?.actions || [];
// };

// export const can = (actions, actionName) => {
//   return actions.some((a) => a.actionName === actionName && a.allowed);
// };
