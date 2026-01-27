import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "danger";
  variant?: "solid" | "outline" | "ghost";
}

const Button = ({
  children,
  className = "",
  size = "medium",
  color = "primary",
  variant = "solid",
  ...props
}: ButtonProps) => {
  const sizeClasses = {
    small: "campaignbay-px-[8px] campaignbay-py-[5px]",
    medium: "campaignbay-px-[12px] campaignbay-py-[6px]",
    large: "campaignbay-px-[16px] campaignbay-py-[10px]",
  };

  const colorClasses = {
    primary: {
      solid:
        "campaignbay-bg-primary campaignbay-text-white campaignbay-border campaignbay-border-primary hover:campaignbay-bg-primary-hovered hover:campaignbay-border-primary-hovered",
      outline:
        "campaignbay-bg-transparent campaignbay-border campaignbay-border-primary campaignbay-text-primary hover:campaignbay-bg-primary hover:campaignbay-text-white",
      ghost:
        "campaignbay-bg-transparent campaignbay-text-primary hover:campaignbay-text-primary-hovered hover:campaignbay-bg-primary/10",
    },
    secondary: {
      solid:
        "campaignbay-bg-secondary campaignbay-text-white campaignbay-border campaignbay-border-secondary hover:campaignbay-bg-secondary-hovered",
      outline:
        "campaignbay-bg-transparent campaignbay-border campaignbay-border-secondary campaignbay-text-secondary hover:campaignbay-bg-secondary hover:campaignbay-text-white",
      ghost:
        "campaignbay-bg-transparent campaignbay-text-[#1e1e1e] hover:!campaignbay-text-primary",
    },
    danger: {
      solid:
        "campaignbay-bg-red-500 campaignbay-text-white campaignbay-border campaignbay-border-red-500 hover:campaignbay-bg-red-600 hover:campaignbay-border-red-600",
      outline:
        "campaignbay-bg-transparent campaignbay-border campaignbay-border-red-500 campaignbay-text-red-500 hover:campaignbay-bg-red-500 hover:campaignbay-text-white",
      ghost:
        "campaignbay-bg-transparent campaignbay-text-red-500 hover:campaignbay-bg-red-500/10",
    },
  };

  // Safely access nested properties
  const variantClasses =
    colorClasses[color]?.[variant] ?? colorClasses.primary.solid;
  const finalSizeClass = sizeClasses[size] ?? sizeClasses.medium;

  return (
    <button
      className={`
                campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-gap-[6px]
                campaignbay-text-default campaignbay-rounded-[8px] campaignbay-transition-all campaignbay-duration-200
                disabled:campaignbay-opacity-50 disabled:campaignbay-cursor-not-allowed
                ${finalSizeClass} 
                ${variantClasses} 
                ${className}
            `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
