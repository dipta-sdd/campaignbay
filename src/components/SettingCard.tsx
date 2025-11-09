import { FC, ReactNode } from "react";

interface SettingCardProps {
  title: ReactNode;
  children: ReactNode;
}

const SettingCard: FC<SettingCardProps> = ({ title, children }) => {
  return (
    <div className="wpab-cb-settings-card">
      <h2 className="wpab-cb-sc-header m-0">{title}</h2>
      <div className="wpab-cb-sc-content">{children}</div>
    </div>
  );
};

export default SettingCard;
