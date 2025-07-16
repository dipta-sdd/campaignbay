import Checkbox from "./Checkbox";
import SettingCard from "./SettingCard";
import Input from "./Input";
import Select from "./Select";
import { __ } from '@wordpress/i18n';
import Toggle from "./Toggle";
import { Eye, Save, Trash2 } from "lucide-react";
import { Icon, seen, trash } from "@wordpress/icons";

const GlobalSettings = ({ globalSettings, setGlobalSettings }) => {

    return (
        <div className="wpab-cb-settings-tab">
            <SettingCard title="Global Options">
                <Toggle
                    label={__('Enable Discount Add-on', 'wpab-cb')}
                    help={__('Turn off to temporarily disable all discount campaigns.', 'wpab-cb')}
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
                        label={__('Default Rule Priority', 'wpab-cb')}
                        help={__('Lower number indicate higher priority for rules with the same conditions.', 'wpab-cb')}
                        value={globalSettings.global_defaultPriority}
                        onChange={(value) => setGlobalSettings((prev) => ({
                            ...prev,
                            global_defaultPriority: parseInt(value, 10)
                        }))}
                    />
                    <Select
                        className='w-100'
                        label={__('Discount Calculation Mode', 'wpab-cb')}
                        // help={__('Select the calculation mode for the addon', 'wpab-cb')}
                        options={[
                            { label: __('After Tax', 'wpab-cb'), value: 'after_tax' },
                            { label: __('Before Tax', 'wpab-cb'), value: 'before_tax' }
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
                    label={__('Decimal Places for Discount Values', 'wpab-cb')}
                    value={globalSettings.global_decimalPlaces}
                    onChange={(value) => setGlobalSettings((prev) => ({
                        ...prev,
                        global_decimalPlaces: parseInt(value) || 0
                    }))}

                    min={0}
                    max={10}
                />
            </SettingCard>
            <SettingCard title="Performence & Caching">
                <Checkbox checked={globalSettings.perf_enableCaching}
                    onChange={() => setGlobalSettings((prev) => ({
                        ...prev,
                        perf_enableCaching: !prev.perf_enableCaching
                    }))}
                    label={__('Enable Discount Caching', 'wpab-cb')}
                    help={__("Improve performance by caching discount rule calculations. Clear cache if rules don't seem to apply immediately", 'wpab-cb')}
                />

                <div className="wpab-cb-btn-con-bottom">
                    <button className="wpab-cb-btn wpab-cb-btn-outline-danger">
                        <Icon icon={trash} fill="currentColor" />
                        Clear Discount Cache</button>
                </div>
            </SettingCard>
            <SettingCard title="Debugging & Logging">
                <Checkbox checked={globalSettings.debug_enableLogging}
                    onChange={() => setGlobalSettings((prev) => ({
                        ...prev,
                        debug_enableLogging: !prev.debug_enableLogging
                    }))}
                    label={__('Enable Debug Mode', 'wpab-cb')}
                    help={__('Show detailed error messages and logging for troubleshooting.', 'wpab-cb')}
                />
                <Select
                    label={__('Log Level', 'wpab-cb')}
                    options={[
                        { label: __('Error Only', 'wpab-cb'), value: 'error' },
                        { label: __('All', 'wpab-cb'), value: 'all' }
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
                        View Logs
                    </button>
                    <button className="wpab-cb-btn wpab-cb-btn-outline-danger">
                        <Icon icon={trash} fill="currentColor" />
                        Clear Log Files
                    </button>
                </div>
            </SettingCard>

        </div>
    );
};

export default GlobalSettings;
