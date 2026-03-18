import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import { useAuth } from "../../context/AuthProvider";

const STATIC_BREADCRUMBS = {
  "/profile": ["Profile"],
  "/settings": ["Settings"],
};


const Breadcrumb = () => {
  const location = useLocation();
  const { permissions } = useAuth()

  const breadcrumbItems = useMemo(() => {
    return resolveBreadcrumb(
      location.pathname,
      permissions
    );
  }, [location.pathname]);

  return (
    <div className="flex items-center gap-1 text-sm text-slate-600">
      {/* DASHBOARD */}
      <Link
        to="/"
        className="font-medium text-primaryColor/80 duration-300 hover:text-primaryColor"
      >
        Dashboard
      </Link>

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <MdChevronRight size={18} />
          <span
            className={`font-semibold capitalize hover:text-primaryColor duration-300 ${index === breadcrumbItems.length - 1
              ? "text-primaryColor"
              : "text-primaryColor/80"
              }`}
          >
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;

const resolveBreadcrumb = (pathname, permissions) => {
  // Static routes first
  if (STATIC_BREADCRUMBS[pathname]) {
    return STATIC_BREADCRUMBS[pathname];
  }

  // Permission-based routes
  for (const component of permissions) {
    if (component.path === pathname) {
      return [component.componentName];
    }

    if (
      component.subComponents?.length &&
      pathname.startsWith(component.path)
    ) {
      for (const sub of component.subComponents) {
        if (pathname === sub.path) {
          return [component.componentName, sub.subComponentName];
        }
      }

      return [component.componentName];
    }
  }

  return [];
};


// const resolveBreadcrumb = (pathname, permissions) => {
//   for (const component of permissions) {
//     // EXACT component match
//     if (component.path === pathname) {
//       return [component.componentName];
//     }

//     if (
//       component.subComponents?.length &&
//       pathname.startsWith(component.path)
//     ) {
//       for (const sub of component.subComponents) {
//         if (pathname === sub.path) {
//           return [component.componentName, sub.subComponentName];
//         }
//       }

//       // fallback: parent only
//       return [component.componentName];
//     }
//   }

//   return [];
// };
