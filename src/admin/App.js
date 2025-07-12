import { HashRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Campaigns from './pages/Campaigns';
import CampaignsAdd from './pages/CampaignsAdd';
import CampaignsEdit from './pages/CampaignsEdit';
import CampaignsNew from './pages/CampaignsNew';
// import React, { useEffect } from '@wordpress/element';
import Page1 from './pages/Page1';

const App = () => {

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Page1 />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="campaigns" element={<Campaigns />} />
                    <Route path="campaigns/add" element={<CampaignsAdd />} />
                    <Route path="campaigns/new" element={<CampaignsNew />} />
                    <Route path="campaigns/edit/:id" element={<CampaignsEdit />} />

                    {/* <Route path="rules/new" element={<AddNewRulePage />} /> */}
                    {/* <Route path="rules/edit/:ruleId" element={<AddNewRulePage />} />  */}
                </Route>
            </Routes>
        </HashRouter>
    );
};

export default App;
