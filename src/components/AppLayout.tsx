import { Outlet } from "react-router-dom";
import { FC } from "react";

const AppLayout: FC = () => {
  return (
    <div className="wpab-cb-container radius-large">
      <Outlet />
    </div>
  );
};

export default AppLayout;
