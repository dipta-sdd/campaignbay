import React, { useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole } from 'lucide-react';

interface BuyProTooltipProps {
    children: ReactNode;
    className?: string;
}

export const BuyProTooltip: React.FC<BuyProTooltipProps> = ({ children, className = '' }) => {
    const [tooltipState, setTooltipState] = useState<{
        visible: boolean;
        top: number;
        left: number;
    } | null>(null);

    const hoverTimeoutRef = useRef<number | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipState({
            visible: true,
            top: rect.top,
            left: rect.left + rect.width / 2,
        });
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = window.setTimeout(() => {
            setTooltipState(null);
        }, 150);
    };

    const handleTooltipMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const handleTooltipMouseLeave = () => {
        hoverTimeoutRef.current = window.setTimeout(() => {
            setTooltipState(null);
        }, 150);
    };

    return (
        <>
            <div
                className={`campaignbay-relative campaignbay-inline-block ${className}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
                <div className="campaignbay-absolute campaignbay-right-2 campaignbay-top-1/2 -campaignbay-translate-y-1/2 campaignbay-pointer-events-none">
                    <LockKeyhole className="campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-[#f02a74]" />
                </div>
            </div>
            {tooltipState?.visible && createPortal(
                <div
                    ref={tooltipRef}
                    className="campaignbay-fixed campaignbay-z-[50001] campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-gap-1.5 campaignbay-bg-gray-900 campaignbay-text-white campaignbay-text-xs campaignbay-p-2 campaignbay-min-w-[140px]"
                    style={{
                        top: tooltipState.top + 5, // Adjusted to user preference
                        left: tooltipState.left,
                        transform: 'translate(-50%, -100%)',
                    }}
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                >
                    <span className="campaignbay-font-medium campaignbay-whitespace-nowrap">Upgrade to unlock</span>
                    <a
                        href="https://wpanchorbay.com/campaignbay/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="campaignbay-w-full campaignbay-bg-[#f02a74] hover:!campaignbay-bg-[#e71161] campaignbay-text-white hover:!campaignbay-text-white campaignbay-font-bold campaignbay-py-1.5 campaignbay-px-3 campaignbay-transition-colors focus:campaignbay-outline-none focus:campaignbay-ring-0 campaignbay-cursor-pointer"
                    >
                        Buy Pro
                    </a>
                    {/* Tooltip Arrow */}
                    <div className="campaignbay-absolute campaignbay-top-full campaignbay-left-1/2 -campaignbay-translate-x-1/2 campaignbay-border-4 campaignbay-border-transparent campaignbay-border-t-gray-900"></div>
                </div>,
                document.body
            )}
        </>
    );
};
