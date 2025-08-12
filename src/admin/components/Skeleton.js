export default function Skeleton({ height, width, borderRadius, children, className }) {
  return <div className={`campaignbay-skeleton ${height ? `campaignbay-h-${height}` : ""} ${width ? `campaignbay-w-${width}` : ""} ${borderRadius ? `campaignbay-br-${borderRadius}` : ""} ${className ? className : ""}`}>
    {children}
  </div>;
}