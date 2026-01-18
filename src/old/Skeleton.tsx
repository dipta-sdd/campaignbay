import { FC, ReactNode } from "react";

interface SkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
  children?: ReactNode;
  className?: string;
}

const Skeleton: FC<SkeletonProps> = ({
  height,
  width,
  borderRadius,
  children,
  className,
}) => {
  return (
    <div
      className={`campaignbay-skeleton ${
        height ? `campaignbay-h-${height}` : ""
      } ${width ? `campaignbay-w-${width}` : ""} ${
        borderRadius ? `campaignbay-br-${borderRadius}` : ""
      } ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default Skeleton;
