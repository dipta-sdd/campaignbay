import { background } from "@wordpress/icons";

const Required = () => {
    return <span className="wpab-required" style={{
        background: 'transparent',
        color: '#ff0000',
    }}>*</span>;
}

export default Required;