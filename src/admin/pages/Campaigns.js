import { __ } from "@wordpress/i18n";
import { Icon, plus } from "@wordpress/icons";
import { useNavigate } from "react-router-dom";

const Campaigns = () => {
    const navigate = useNavigate();
    return (
        <div className="cb-page">
            <div className="cb-page-header-container">
                <div className="cb-page-header-title">{__('All Discount Campaigns', 'wpab-cb')}</div>
                <div className="cb-page-header-actions">
                    <button className="wpab-cb-btn wpab-cb-btn-primary " onClick={() => navigate('/campaigns/add')}>
                        <Icon icon={plus} fill="currentColor" />
                        {__('Add New Campaign', 'wpab-cb')}
                    </button>
                </div>
            </div>
            <div className="cb-page-container">

            </div>
        </div>
    );
};

export default Campaigns;
