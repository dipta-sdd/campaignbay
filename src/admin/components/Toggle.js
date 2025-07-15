import { useId } from '@wordpress/element';

const Toggle = ({ label, help, checked, onChange, className, ...props }) => {
    const inputId = useId();

    return (
        <div className="wpab-input-con">
            <div className="wpab-toggle-con-inner">
                <label className="wpab-input-label" htmlFor={inputId}>
                    {label}

                </label>
                <span className="wpab-toggle-switch-con">
                    <input
                        id={inputId}
                        {...props}
                        type="checkbox"
                        checked={checked}
                        onChange={onChange}
                        className={`wpab-toggle${className ? ' ' + className : ''}`}
                    />
                    <span className="wpab-toggle-slider" />
                </span>
            </div>
            {help && <span className="wpab-input-help" style={{ marginTop: '-4px' }}>{help}</span>}
        </div>
    );
};

export default Toggle;