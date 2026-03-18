import BatchDetails from "../components/AdminSideComponents/BatchManagement/BatchDetails";
import CourseDetails from "../components/AdminSideComponents/CourseManagement/CourseDetails";
import Login from "../components/Login/Login";
import SignUp from "../components/Login/SignUp";
import AdminManagement from "../screens/Auth/AdminManagement";
import Attendance from "../screens/Auth/Attendance";
import Batch from "../screens/Auth/Batch";
import Branch from "../screens/Auth/Branch";
import Course from "../screens/Auth/Course";
import Dashboard from "../screens/Auth/Dashboard";
import Gallery from "../screens/Auth/Gallery";
import Holiday from "../screens/Auth/Holiday";
import Lead from "../screens/Auth/Lead";
import ManageUsers from "../screens/Auth/ManageUsers";
import MarketingSManagement from "../screens/Auth/MarketingSManagement";
import NotFound from "../screens/Auth/NotFound";
import Role from "../screens/Auth/Role";
import Room from "../screens/Auth/Room";
import Settings from "../screens/Auth/Settings";
import Slot from "../screens/Auth/Slot";
import TutorManagement from "../screens/Auth/TutorManagement";
import Quiz from "../screens/Auth/Quiz";
import QuizQuestions from "../screens/Auth/QuizQuestions";
import QuizAttempt from "../screens/Auth/QuizAttempt";
import QuizResult from "../screens/Auth/QuizResult";
import Achiever from "../screens/Auth/Achiever";
import ClassPlan from "../screens/Auth/ClassPlan";
import GuestStudents from "../screens/Auth/GuestStudents";
import MyClasses from "../screens/Auth/MyClasses";
import TutorClassDetails from "../components/AdminSideComponents/MyClasses/TutorClassDetails";
import WbcStudents from "../screens/Auth/WbcStudents";
import FreeMaterials from "../screens/Auth/FreeMaterials";
import ViewStudentDetails from "../components/AdminSideComponents/WbcStudents/ViewStudentDetails";
import ResetPassword from "../components/Login/ResetPassword";

export const authRoutes = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/user-management",
    children: [
      {
        path: "admins",
        element: <AdminManagement />,
      },
      {
        path: "tutors",
        element: <TutorManagement />,
      },
      {
        path: "marketing-staff",
        element: <MarketingSManagement />,
      },
    ],
  },
  {
    path: "/branch",
    element: <Branch />,
  },
  {
    path: "/class",
    element: <Branch />,
  },
  {
    path: "/free-materials",
    element: <FreeMaterials />,
  },
  {
    path: "/role",
    element: <Role />,
  },
  {
    path: "/wbc-students",
    element: <WbcStudents />,
  },
  {
    path: "/wbc-students/:id",
    element: <ViewStudentDetails />,
  },
  {
    path: "/lead",
    element: <Lead />,
  },
  {
    path: "/holiday",
    element: <Holiday />,
  },
  {
    path: "/batch",
    element: <Batch />,
  },
  {
    path: "/batch/:id",
    element: <BatchDetails />,
  },
  {
    path: "/course",
    element: <Course />,
  },
  {
    path: "/class-plan",
    element: <ClassPlan />,
  },
  {
    path: "/my-classes",
    element: <MyClasses />,
  },
  {
    path: "/my-classes/:id",
    element: <TutorClassDetails />,
  },
  {
    path: "/room",
    element: <Room />,
  },
  {
    path: "/slot",
    element: <Slot />,
  },
  {
    path: "/achiever",
    element: <Achiever />,
  },
  {
    path: "/gallery",
    element: <Gallery />,
  },
  {
    path: "/attendance",
    element: <Attendance />,
  },
  {
    path: "/guest-students",
    element: <GuestStudents />,
  },
  {
    path: "/quiz",
    element: <Quiz />,
  },
  {
    path: "/quiz/:id/questions",
    element: <QuizQuestions />,
  },
  {
    path: "/quiz/:id/attempt",
    element: <QuizAttempt />,
  },
  {
    path: "/quiz/:id/result",
    element: <QuizResult />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
];

export const adminNonAuthRoutes = [
  // {
  //   path: "/signup",
  //   element: <SignUp />,
  // },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/not-found",
    element: <NotFound />,
  },
];
