import { useState } from '@wordpress/element';
import MultiSelect from './Multiselect';


const AdvancedSettings = ({ advancedSettings, setAdvancedSettings }) => {
    const [selected, setSelected] = useState(['africa']);
    const options = [
        {
            label: 'Africa',
            value: 'africa'
        },
        {
            label: 'America',
            value: 'america'
        },
        {
            label: 'Antarctica',
            value: 'antarctica'
        },
        {
            label: 'Asia',
            value: 'asia'
        },

    ]
    return (
        <div className="wpab-cb-settings-tab">
            <h3>Advanced Settings</h3>
            <p>Configure advanced options here.</p>
            <MultiSelect
                label="Continents"
                options={options}
                value={selected}
                onChange={setSelected}
            />
        </div>
    );
};

export default AdvancedSettings;
