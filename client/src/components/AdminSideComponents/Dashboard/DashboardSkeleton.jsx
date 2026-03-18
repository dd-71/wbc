import { assets } from "../../../assets/assets";

const DashboardSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative flex items-center justify-center">

        {/* Spinner */}
        <div className="absolute w-24 h-24 border-4 border-gray-200 border-t-[4px] border-t-[#1D1DA4] rounded-full animate-spin" />

        {/* Logo */}
        <img
          src={assets.logo2}
          alt="Company Logo"
          className="w-14 h-14 animate-pulse object-contain"
        />

      </div>
    </div>
  );
};

export default DashboardSkeleton;



// const DashboardSkeleton = () => {
//   return (
//     <div className="flex min-h-screen bg-gray-50 animate-pulse">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white border-r px-4 py-6 space-y-6">
//         {/* Logo */}
//         <div className="h-8 w-32 bg-gray-200 rounded mx-auto" />

//         {/* Menu items */}
//         <div className="space-y-4 mt-8">
//           {Array.from({ length: 10 }).map((_, i) => (
//             <div
//               key={i}
//               className="h-4 w-full bg-gray-200 rounded"
//             />
//           ))}
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Top Bar */}
//         <header className="h-16 bg-white border-b flex items-center justify-between px-6">
//           <div className="h-4 w-40 bg-gray-200 rounded" />
//           <div className="flex items-center gap-4">
//             <div className="h-8 w-8 bg-gray-200 rounded-full" />
//             <div className="h-8 w-8 bg-gray-200 rounded-full" />
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="p-6 space-y-6">
//           {/* Page Title */}
//           <div>
//             <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
//             <div className="h-4 w-72 bg-gray-200 rounded" />
//           </div>

//           {/* Main Card */}
//           <div className="bg-white rounded-lg border p-6 space-y-6">
//             <div className="h-32 w-full bg-gray-200 rounded" />
//             <div className="grid grid-cols-3 gap-4">
//               {Array.from({ length: 3 }).map((_, i) => (
//                 <div
//                   key={i}
//                   className="h-20 bg-gray-200 rounded"
//                 />
//               ))}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardSkeleton;
