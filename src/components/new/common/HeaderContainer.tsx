const HeaderContainer = ({ children, className="" }: { children: React.ReactNode, className?: string }) => {
    return <div className={`campaignbay-flex campaignbay-justify-between ${className}`}>
        {children}
    </div>;
};

export default HeaderContainer;