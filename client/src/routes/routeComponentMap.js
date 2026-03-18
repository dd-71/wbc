import Dashboard from "../screens/Auth/Dashboard";
import AdminManagement from "../screens/Auth/AdminManagement";
import TutorManagement from "../screens/Auth/TutorManagement";
import MarketingSManagement from "../screens/Auth/MarketingSManagement";
import Branch from "../screens/Auth/Branch";
import Role from "../screens/Auth/Role";
import Lead from "../screens/Auth/Lead";
import Holiday from "../screens/Auth/Holiday";
import Quiz from "../screens/Auth/Quiz";

export const ROUTE_COMPONENT_MAP = {
  "/": <Dashboard />,
  "/user-management/admins": <AdminManagement />,
  "/user-management/tutors": <TutorManagement />,
  "/user-management/marketing-staff": <MarketingSManagement />,
  "/branch": <Branch />,
  "/role": <Role />,
  "/lead": <Lead />,
  "/holiday": <Holiday />,
  "/quiz": <Quiz />,
};
