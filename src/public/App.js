import apiFetch from '@wordpress/api-fetch';
import { Button } from '@wordpress/components';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import { HashRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';


const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Page1 />} />
                    <Route path="rules" element={<Page2 />} />
                    {/* <Route path="rules/new" element={<AddNewRulePage />} /> */}
                    {/* <Route path="rules/edit/:ruleId" element={<AddNewRulePage />} />  */}
                </Route>
            </Routes>
        </HashRouter>
    );
};

export default App;
