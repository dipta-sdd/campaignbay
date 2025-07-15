import { useId } from '@wordpress/element';
import { check, Icon } from '@wordpress/icons';

const Checkbox = ({ label, help, value, onChange, className, ...props }) => {
    const inputId = useId();

    return (
        <div className="wpab-input-con">
            <div className='wpab-checkbox-con-inner'>
                <div className='wpab-checkbox-con-inner-checkbox'>
                    <input
                        id={inputId}
                        type="checkbox"
                        value={value}
                        onChange={onChange}
                        {...props}
                        className={`wpab-checkbox${className ? ' ' + className : ''}`}
                    />
                    <Icon
                        icon={check}
                        className="wpab-checkbox-icon"
                        role="presentation"
                    />
                </div>

                <label className="wpab-input-label" htmlFor={inputId}>{label}</label>
            </div>
            <span className="wpab-input-help">{help}</span>
        </div>
    )
}

export default Checkbox;