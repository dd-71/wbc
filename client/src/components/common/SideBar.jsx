import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import * as MdIcons from "react-icons/md";
import * as FiIcons from "react-icons/fi";
import { ICONS } from "../../constants/iconMap";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthProvider";

const SideBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { permissions } = useAuth();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  const isExpanded = isSidebarOpen || isHoverExpanded;

  /* Auto open parent if child route active */
  useEffect(() => {
    if (!permissions) return;

    const activeIndex = permissions.findIndex((comp) =>
      comp.subComponents?.some((sub) =>
        location.pathname.startsWith(sub.path)
      )
    );

    setOpenDropdown(activeIndex !== -1 ? activeIndex : null);
  }, [location.pathname, permissions]);

  if (!permissions) return null;

  return (
    <aside
      onMouseEnter={() => !isSidebarOpen && setIsHoverExpanded(true)}
      onMouseLeave={() => !isSidebarOpen && setIsHoverExpanded(false)}
      className={`h-screen sticky top-0 left-0 flex flex-col overflow-hidden capitalize bg-gradient-to-t from-[#fff] via-white to-white border-r border-slate-200 transition-all duration-500
    ${isExpanded ? "w-[17rem]" : "w-[4.5rem]"}`}
    >
      <div className={`sticky ${isExpanded ? 'py-5' : ''}  top-0 border-y z-50 bg-transparent h-16 flex items-center justify-center`}>
        <img
          src={assets.logo2}
          alt="logo"
          className={`transition-all duration-300 ${isExpanded ? "w-32 visible" : "w-0 invisible"
            }`}
        />

        {!isExpanded && (
          <h1 className="text-white bg-primaryColor rounded-lg px-2 py-1 font-bold">
            W
          </h1>
        )}

        {isExpanded && (
          <button title="colapse sidebar"
            className={`absolute cursor-ew-resize hover:bg-primaryColor/10 p-1 transition rounded-md ${isExpanded ? 'right-3 top-3' : ''}  text-lg ${!isSidebarOpen ? 'text-gray-400' : 'text-primaryColor'} `}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FiIcons.FiSidebar />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-2 text-sm whitespace-nowrap space-y-2 capitalize">
          {permissions
            .filter((comp) => comp.visible)
            .map((component, index) => {
              const ComponentIcon = ICONS[component.icon];
              const hasChildren =
                component.subComponents &&
                component.subComponents.some((s) => s.visible);

              const isChildActive = hasChildren
                ? component.subComponents.some((sub) =>
                  location.pathname.startsWith(sub.path)
                )
                : false;

              if (!hasChildren) {
                return (
                  <NavLink
                    key={index}
                    to={component.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md duration-200
                    ${isActive
                        ? "bg-gradient-to-r from-primaryColor/20 shadow-sm via-white to-primaryColor/20 border-x-4 border-primaryColor text-primaryColor"
                        : "text-slate-700  hover:text-primaryColor"
                      }`
                    }
                  >
                    {ComponentIcon && <span className={`${isExpanded ? 'text-xl' : 'text-xl'}`}><ComponentIcon /></span>}
                    <span
                      className={`transition-all ${isExpanded ? "visible" : "invisible w-0"
                        }`}
                    >
                      {component.componentName}
                    </span>
                  </NavLink>
                );
              }

              return (
                <div key={index}>
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === index ? null : index)
                    }
                    className={`w-full  ${component.componentName === 'settings' && 'hidden'} flex items-center justify-between px-3 py-2 rounded-md transition-all
                  ${openDropdown === index || isChildActive
                        ? "bg-gradient-to-r from-primaryColor/20 shadow-sm via-white to-primaryColor/20 border-x-4 border-primaryColor text-primaryColor"
                        : "text-slate-700  hover:text-primaryColor"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {ComponentIcon && <span className={`${isExpanded ? 'text-xl' : 'text-xl'}`}><ComponentIcon /></span>}
                      <span
                        className={`transition-all ${isExpanded ? "visible" : "invisible w-0"
                          }`}
                      >
                        {component.componentName}
                      </span>
                    </div>

                    {isExpanded && (
                      <MdIcons.MdKeyboardArrowDown
                        size={18}
                        className={`transition-transform duration-300 text-gray-500 ${openDropdown === index || isChildActive
                          ? "rotate-180"
                          : ""
                          }`}
                      />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300
                  ${(openDropdown === index || isChildActive) && isExpanded
                        ? "max-h-96 visible"
                        : "max-h-0 invisible"
                      }`}
                  >
                    {component.subComponents
                      .filter((sub) => sub.visible)
                      .map((sub, i) => {
                        const SubIcon = ICONS[sub.icon];
                        return (
                          <NavLink
                            key={i}
                            to={sub.path}
                            className={({ isActive }) =>
                              `flex items-center gap-2 ml-4 px-3 py-2 text-sm rounded-md transition-all
                            ${isActive
                                ? "text-primaryColor"
                                : "text-slate-700  hover:text-primaryColor"
                              }`
                            }
                          >
                            {SubIcon && <SubIcon size={16} />}
                            {isExpanded && sub.subComponentName}
                          </NavLink>
                        );
                      })}
                  </div>
                </div>
              );
            })}
        </nav>
      </div>
      <div className="border-t border-slate-200 flex items-center justify-center p-4 space-y-3">
        {/* <p className="text-xs text-secondaryTextColor">Lorem ipsum dolor sit amet consectetur. lore3
        </p> */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center w-fit gap-2 rounded-md transition-all
      ${isActive
              ? "bg-gradient-to-r from-primaryColor/20 shadow-sm via-white to-primaryColor/20 border-x-4 border-primaryColor text-primaryColor"
              : "text-slate-700 hover:text-primaryColor"
            }`
          }
        >
          <MdIcons.MdSettings size={20} className="animate-spin" />
          <span className={`transition-all text-xs ${isExpanded ? "visible" : "invisible w-0"}`}>
            Settings
          </span>
        </NavLink>
      </div>

    </aside>
  );
};

export default SideBar;
