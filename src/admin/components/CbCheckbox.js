import { useId } from "@wordpress/element";
import { check, Icon } from "@wordpress/icons";

const CbCheckbox = ({ checked, onChange, className, ...props }) => {
  const inputId = useId();

  return (
    <div className="campaignbay-checkbox-single-checkbox-con">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        {...props}
        className={`campaignbay-checkbox-single-checkbox${className ? " " + className : ""}`}
      />
      <Icon icon={check} className="campaignbay-checkbox-single-checkbox-icon"/>
    </div>
  );
};

export default CbCheckbox;
