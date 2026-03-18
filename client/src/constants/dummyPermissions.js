export const dummyPermissions = {
  permissions: [
    {
      componentName: "Dashboard",
      visible: true,
      permissionLabel: "dashboard",
      path: "/",
      icon: "MdDashboard",
      subComponents: [],
    },
    {
      componentName: "User Management",
      visible: true,
      permissionLabel: "user-management",
      path: "/user-management",
      icon: "MdPeople",

      subComponents: [
        {
          subComponentName: "Admin Management",
          visible: true,
          permissionLabel: "admin-management",
          path: "/user-management/admins",
          icon: "MdAdminPanelSettings",

          actions: [
            { actionName: "create", allowed: true },
            { actionName: "edit", allowed: true },
            { actionName: "delete", allowed: true },
            { actionName: "view", allowed: true },
          ],
        },

        {
          subComponentName: "Tutor Management",
          visible: true,
          permissionLabel: "tutor-management",
          path: "/user-management/tutors",
          icon: "MdSchool",

          actions: [
            { actionName: "create", allowed: true },
            { actionName: "edit", allowed: true },
            { actionName: "delete", allowed: true },
            { actionName: "view", allowed: true },
          ],
        },

        {
          subComponentName: "Marketing Staff",
          visible: true,
          permissionLabel: "marketing-management",
          path: "/user-management/marketing-staff",
          icon: "MdCampaign",
          actions: [
            { actionName: "create", allowed: true },
            { actionName: "edit", allowed: true },
            { actionName: "delete", allowed: true },
            { actionName: "view", allowed: true },
          ],
        },
      ],
    },
    {
      componentName: "Branch",
      visible: true,
      permissionLabel: "branch",
      path: "/branch",
      icon: "FaCodeBranch",

      subComponents: [],
    },

    {
      componentName: "role",
      visible: true,
      permissionLabel: "role",
      path: "/role",
      icon: "GrUserAdmin",
      subComponents: [],
    },
    {
      componentName: "holiday",
      visible: true,
      permissionLabel: "holiday",
      path: "/holiday",
      icon: "MdOutlineHolidayVillage",
      subComponents: [],
    },
    {
      componentName: "lead",
      visible: true,
      permissionLabel: "lead",
      path: "/lead",
      icon: "GrContactInfo",
      subComponents: [],
    },
  ],
};
