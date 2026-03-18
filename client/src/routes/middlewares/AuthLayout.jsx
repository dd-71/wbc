import React, { useState } from 'react'

import { Outlet } from 'react-router-dom';
import AuthNavBar from './../../components/common/AuthNavBar';
import AuthFooter from './../../components/common/AuthFooter';
import ScrollToTop from './ScrollToTop';
import SideBar from './../../components/common/SideBar';

const AuthLayout = ({ children }) => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <>
      <ScrollToTop />
      <div className='flex'>
        <SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className='w-full h-screen overflow-y-auto bg-gradient-to-t from-[#fff] via-white to-white'>
          <AuthNavBar />
          <div className='w-full h-auto min-h-[calc(100vh-118px)] px-5 bg-transparent'>
            {children || <Outlet />}
          </div>
          <AuthFooter />
        </div>
      </div>
    </>
  )
}

export default AuthLayout