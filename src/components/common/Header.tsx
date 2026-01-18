const Header = ({ children, className="" }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`campaignbay-text-[20px] campaignbay-font-[700] campaignbay-leading-[30px] campaignbay-text-[#000000]  ${className}`}>
            {children}
        </div>
    );
};
export default Header;