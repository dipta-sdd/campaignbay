import { HashRouter, Route, Routes } from "react-router-dom";
import Campaigns from "./pages/Campaigns";
import { CbStoreProvider } from "./store/cbStore";
import { CbStore } from "./old/types";
import { ToastProvider } from "./store/toast/use-toast";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "./components/common/ToastContainer";
import AppLayout from "./components/common/AppLayout";
import CampaignsAdd from "./pages/CampaignsAdd";
import CampaignsEdit from "./pages/CampaignsEdit";
import Settings from "./pages/Settings";
import { useMenuSync } from "./utils/useMenuSync";

const App = () => {
  return (
    // @ts-ignore
    <CbStoreProvider value={window.campaignbay_Localize as CbStore}>
      <ToastProvider>
        <ToastContainer />
        <HashRouter>
          <MenuSyncProvider>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaigns/add" element={<CampaignsAdd />} />
                <Route path="campaigns/:id" element={<CampaignsEdit />} />

                {/* <Route path="rules/new" element={<AddNewRulePage />} /> */}
                {/* <Route path="rules/edit/:ruleId" element={<AddNewRulePage />} />  */}
              </Route>
            </Routes>
          </MenuSyncProvider>
        </HashRouter>
      </ToastProvider>
    </CbStoreProvider>
  );
};

export default App;

const MenuSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useMenuSync();
  return <>{children}</>;
};
