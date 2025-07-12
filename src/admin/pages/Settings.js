import { G, TabPanel } from '@wordpress/components';
import GlobalSettings from '../components/GlobalSettings';
import ProductSettings from './../components/ProductSettings';
import CartSettings from './../components/CartSettings';
import PromotionSettings from './../components/PromotionSettings';
import AdvancedSettings from './../components/AdvancedSettings';
const Settings = () => {
    
    return (
        <div className="wpab-cb-page">
            <h1 className='wpab-cb-page-header'> Discount Campaigns Settings</h1>
            <TabPanel
            className='wpab-cb-settings-tabs'
            // activeClass='wpab-cb-settings-active-tab'
                tabs={[
                    {
                        name: 'global',
                        title: 'Global Settings'
                    },
                    {
                        name: 'product',
                        title: 'Product Settings'
                    },
                    {
                        name: 'cart',
                        title: 'Cart Settings'
                    },
                    {
                        name: 'promotion',
                        title: 'Promotion Settings'
                    },
                    {
                        name: 'advanced',
                        title: 'Advanced Settings'
                    }
                ]}
            >
                {(tab) => (
                    (() => {
                        switch (tab.name) {
                            case 'global':
                                return <GlobalSettings />;
                            case 'product':
                                return <ProductSettings />;
                            case 'cart':
                                return <CartSettings /> ;
                            case 'promotion':
                                return <PromotionSettings />;
                            case 'advanced':
                                return <AdvancedSettings />;
                            default:
                                return <GlobalSettings />;
                        }
                    })()
                )}
            </TabPanel>
        </div>
    );
}
export default Settings;