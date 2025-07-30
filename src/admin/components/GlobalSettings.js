import Checkbox from "./Checkbox";
import SettingCard from "./SettingCard";
import Input from "./Input";
import Select from "./Select";
import { __ } from '@wordpress/i18n';
// import { useI18n } from '@wordpress/react-i18n';

import Toggle from "./Toggle";
import { Eye, Save, Trash2 } from "lucide-react";
import { Icon, seen, trash } from "@wordpress/icons";

const GlobalSettings = ({ globalSettings, setGlobalSettings }) => {


    return (
        <div className="wpab-cb-settings-tab">
            <SettingCard title={__('Global Options', 'campaignbay')}>
                <Toggle
                    label={__('Enable Discount Add-on', 'campaignbay')}
                    help={__('Turn off to temporarily disable all discount campaigns.', 'campaignbay')}
                    checked={globalSettings.global_enableAddon}
                    onChange={() => setGlobalSettings((prev) => ({
                        ...prev,
                        global_enableAddon: !prev.global_enableAddon
                    }))}
                />
                <div className="wpab-grid-2 w-100">
                    <Input
                        className='w-100'
                        type="number"
                        label={__('Default Rule Priority', 'campaignbay')}
                        help={__('Lower number indicate higher priority for rules with the same conditions.', 'campaignbay')}
                        value={globalSettings.global_defaultPriority}
                        onChange={(value) => setGlobalSettings((prev) => ({
                            ...prev,
                            global_defaultPriority: parseInt(value, 10)
                        }))}
                    />
                    <Select
                        className='w-100'
                        label={__('Discount Calculation Mode', 'campaignbay')}
                        // help={__('Select the calculation mode for the addon', 'campaignbay')}
                        options={[
                            { label: __('After Tax', 'campaignbay'), value: 'after_tax' },
                            { label: __('Before Tax', 'campaignbay'), value: 'before_tax' }
                        ]}
                        value={globalSettings.global_calculationMode}
                        onChange={(value) => setGlobalSettings((prev) => ({
                            ...prev,
                            global_calculationMode: value
                        }))}
                    />

                </div>
                <Input
                    type="number"
                    label={__('Decimal Places for Discount Values', 'campaignbay')}
                    value={globalSettings.global_decimalPlaces}
                    onChange={(value) => setGlobalSettings((prev) => ({
                        ...prev,
                        global_decimalPlaces: parseInt(value) || 0
                    }))}

                    min={0}
                    max={10}
                />
            </SettingCard>
            <SettingCard title={__('Performence & Caching', 'campaignbay')}>
                <Checkbox checked={globalSettings.perf_enableCaching}
                    onChange={() => setGlobalSettings((prev) => ({
                        ...prev,
                        perf_enableCaching: !prev.perf_enableCaching
                    }))}
                    label={__('Enable Discount Caching', 'campaignbay')}
                    help={__("Improve performance by caching discount rule calculations. Clear cache if rules don't seem to apply immediately", 'campaignbay')}
                />

                <div className="wpab-cb-btn-con-bottom">
                    <button className="wpab-cb-btn wpab-cb-btn-outline-danger">
                        <Icon icon={trash} fill="currentColor" />
                        {__('Clear Discount Cache', 'campaignbay')}</button>
                </div>
            </SettingCard>
            <SettingCard title={__('Debugging & Logging', 'campaignbay')}>
                <Checkbox checked={globalSettings.debug_enableLogging}
                    onChange={() => setGlobalSettings((prev) => ({
                        ...prev,
                        debug_enableLogging: !prev.debug_enableLogging
                    }))}
                    label={__('Enable Debug Mode', 'campaignbay')}
                    help={__('Show detailed error messages and logging for troubleshooting.', 'campaignbay')}
                />
                <Select
                    label={__('Log Level', 'campaignbay')}
                    options={[
                        { label: __('Error Only', 'campaignbay'), value: 'error' },
                        { label: __('All', 'campaignbay'), value: 'all' }
                    ]}
                    value={globalSettings.debug_logLevel}
                    onChange={(value) => setGlobalSettings((prev) => ({
                        ...prev,
                        debug_logLevel: value
                    }))}
                />
                <div className="wpab-cb-btn-con-bottom">
                    <button className="wpab-cb-btn wpab-cb-btn-outline-primary">
                        <Icon icon={seen} fill="currentColor" />
                        {__('View Logs', 'campaignbay')}
                    </button>
                    <button className="wpab-cb-btn wpab-cb-btn-outline-danger">
                        <Icon icon={trash} fill="currentColor" />
                        {__('Clear Log Files', 'campaignbay')}
                    </button>
                </div>
            </SettingCard>

        </div>
    );
};

export default GlobalSettings;
