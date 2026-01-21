import { FC } from "react";
import { Spinner } from "@wordpress/components";

const Loader: FC = () => {
  return (
    <div className="campaignbay-loader-container">
      <Spinner />
    </div>
  );
};

export default Loader;
