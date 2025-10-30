import { FC } from "react";
import { Spinner } from "@wordpress/components";

const Loader: FC = () => {
  return (
    <div className="wpab-cb-loader">
      <Spinner />
    </div>
  );
};

export default Loader;
