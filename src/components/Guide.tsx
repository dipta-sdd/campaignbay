import React, { useState, useLayoutEffect, FC, useRef, useEffect } from "react";
import { useGuide } from "../store/GuideContext";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CbCheckbox from "./CbCheckbox";
import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../store/toast/use-toast";
import { __ } from "@wordpress/i18n";

const initialStyles: {
  tooltip: React.CSSProperties;
  highlight: React.CSSProperties;
} = {
  tooltip: { visibility: "hidden", opacity: 0 },
  highlight: { display: "none" },
};

const Guide: FC = () => {
  const { getRef, tourStep, setTourStep, config } = useGuide();
  const [styles, setStyles] = useState(initialStyles);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Derived visibility based on whether current state exists in config
  const isVisible = tourStep !== 0 && !!config[tourStep];

  // Effect to find the target element for the current tour step.
  useEffect(() => {
    if (!isVisible) {
      setTargetElement(null);
      return;
    }

    setTargetElement(null);
    setStyles(initialStyles); // Hide guide while finding new target
    setTargetRect(null);

    let attempts = 0;
    const maxAttempts = 50; // Try for 5 seconds.
    const interval = setInterval(() => {
      const element = getRef(tourStep)?.current;

      if (element && element.getBoundingClientRect().width > 0) {
        clearInterval(interval);
        setTargetElement(element);
      } else if (++attempts > maxAttempts) {
        clearInterval(interval);
        console.error(`Guide target for step ${tourStep} not found.`);
        setTourStep(0); // End tour if target not found
      }
    }, 100);

    return () => clearInterval(interval);
  }, [tourStep, getRef, setTourStep, isVisible]);

  // Effect to auto-focus the target element if configured
  useEffect(() => {
    if (targetElement && config[tourStep]?.autoFocus) {
      targetElement.focus();
    }
  }, [targetElement, tourStep, config]);

  // Effect to handle "Enter" key navigation
  useEffect(() => {
    if (!targetElement || !config[tourStep]?.nextOnEnter) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {

        const stepConfig = config[tourStep];
        if (stepConfig.onNext) {
          stepConfig.onNext({
            next: () => setTourStep(tourStep + 1),
            setStep: setTourStep,
            navigate: navigate,
          });
        } else {
          setTourStep(tourStep + 1);
        }
      }
    };

    targetElement.addEventListener("keydown", handleKeyDown);
    return () => {
      targetElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [targetElement, tourStep, config, setTourStep, navigate]);

  // Effect to handle "Change" event navigation (for selects)
  useEffect(() => {
    if (!targetElement || !config[tourStep]?.nextOnSelect) return;

    const handleChange = () => {
      const stepConfig = config[tourStep];
      // Add a small delay to allow the selection to be registered by the browser/React state
      setTimeout(() => {
        if (stepConfig.onNext) {
          stepConfig.onNext({
            next: () => setTourStep(tourStep + 1),
            setStep: setTourStep,
            navigate: navigate,
          });
        } else {
          setTourStep(tourStep + 1);
        }
      }, 1000);
    };

    targetElement.addEventListener("change", handleChange);
    return () => {
      targetElement.removeEventListener("change", handleChange);
    };
  }, [targetElement, tourStep, config, setTourStep, navigate]);

  // Effect to calculate and apply styles once the target element is found.
  useLayoutEffect(() => {
    const tooltipEl = tooltipRef.current;

    if (!targetElement || !tooltipEl || !isVisible) {
      setStyles(initialStyles);
      setTargetRect(null);
      return;
    }

    let animationFrameId: number;

    const calculatePosition = () => {
      if (!document.body.contains(targetElement) || !tooltipRef.current) {
        setStyles(initialStyles);
        setTargetRect(null);
        return;
      }

      const tooltipRect = tooltipEl.getBoundingClientRect();

      // If tooltip width is 0, browser hasn't calculated layout yet.
      if (tooltipRect.width === 0) {
        animationFrameId = requestAnimationFrame(calculatePosition);
        return;
      }

      const tooltipWidth = tooltipRect.width > 300 ? 300 : tooltipRect.width;

      const stepConfig = config[tourStep];
      const tRect = targetElement.getBoundingClientRect();

      // Update raw rect for the blocking overlay logic
      const overlayTop = tRect.top - 4;
      const overlayLeft = tRect.left - 4;
      const overlayWidth = tRect.width + 8;
      const overlayHeight = tRect.height + 8;

      setTargetRect({
        top: overlayTop,
        left: overlayLeft,
        width: overlayWidth,
        height: overlayHeight,
      });

      const newHighlightStyle: React.CSSProperties = {
        position: "fixed",
        top: `${overlayTop}px`,
        left: `${overlayLeft}px`,
        width: `${overlayWidth}px`,
        height: `${overlayHeight}px`,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
        borderRadius: "2px",
        zIndex: 10000,
        pointerEvents: "none",
        transition: "opacity 0.3s ease-in-out",
        display: "block",
      };

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offset = 12;
      const margin = 8;

      let top = 0;
      let left = 0;
      let transform = "none";
      let tooltipHeight = tooltipRect.height;
      switch (stepConfig.position) {
        case "bottom":
          top = tRect.bottom + offset;
          left = tRect.left + tRect.width / 2;
          transform = "translateX(-50%)";
          break;
        case "top":
          top = tRect.top - tooltipRect.height - offset;
          left = tRect.left + tRect.width / 2;
          transform = "translateX(-50%)";
          break;
        case "left":
          top = tRect.top + tRect.height / 2;
          left = tRect.left - tooltipRect.width - offset;
          transform = "translateY(-50%)";
          tooltipHeight = tooltipRect.height / 2;
          break;
        case "right":
          top = tRect.top + tRect.height / 2;
          left = tRect.right + offset;
          transform = "translateY(-50%)";
          tooltipHeight = tooltipRect.height / 2;
          break;
        case "bottom-left":
          top = tRect.bottom + offset;
          left = tRect.left + tRect.width - tooltipRect.width + offset / 2;
          break;
        default:
          top = tRect.bottom + offset;
          left = tRect.left;
      }



      if (top + tooltipHeight > viewportHeight - margin) {
        top = tRect.top - tooltipRect.height - offset;
      }
      if (top < margin) {
        top = margin;
      }

      let effectiveLeft = left;
      if (transform === "translateX(-50%)" || transform === "translate(-50%,-50%)") {
        effectiveLeft -= tooltipWidth / 2;
      }

      if (effectiveLeft + tooltipWidth > viewportWidth - margin) {
        left = viewportWidth - tooltipWidth - margin;
        transform = "none";
      }
      if (effectiveLeft < margin) {
        left = margin;
        transform = "none";
      }

      const newTooltipStyle: React.CSSProperties = {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        transform,
        zIndex: 10001,
        transition: "opacity 0.3s ease-in-out",
        visibility: "visible",
        opacity: 1,
      };

      setStyles({
        tooltip: newTooltipStyle,
        highlight: newHighlightStyle,
      });
    };

    calculatePosition();

    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    // ResizeObserver to handle scrollbar changes or other layout shifts
    const resizeObserver = new ResizeObserver(() => {
      calculatePosition();
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
      resizeObserver.disconnect();
    };
  }, [targetElement, tourStep, config, isVisible]);

  const stepConfig = config[tourStep];

  const [dontShowAgain, setDontShowAgain] = useState(true);


  const [isClosing, setIsClosing] = useState(false);
  const { addToast } = useToast();
  const handleClose = async () => {
    if (dontShowAgain) {
      setIsClosing(true);
      try {
        const response = await apiFetch({
          path: "/campaignbay/v1/settings/guide",
          method: "POST",
        });
        setIsClosing(false);
        setTourStep(0);
        addToast(__("Tour dismissed successfully.", "campaignbay"), "success");
      } catch (error) {
        console.error("Failed to dismiss tour:", error);
        setIsClosing(false);
        addToast(__("Error dismissing tour.", "campaignbay"), "error");
      }
    }
    setTourStep(0);
  };

  if (!isVisible) return null;
  return (
    <>
      {/* Transparent blocking overlays to prevent clicking outside the target */}
      {targetRect && (
        <>
          {/* Top Block */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: targetRect.top,
              zIndex: 9999,
              cursor: "default",
            }}
          />
          {/* Bottom Block */}
          <div
            style={{
              position: "fixed",
              top: targetRect.top + targetRect.height,
              left: 0,
              width: "100%",
              bottom: 0,
              zIndex: 9999,
              cursor: "default",
            }}
          />
          {/* Left Block */}
          <div
            style={{
              position: "fixed",
              top: targetRect.top,
              left: 0,
              width: targetRect.left,
              height: targetRect.height,
              zIndex: 9999,
              cursor: "default",
            }}
          />
          {/* Right Block */}
          <div
            style={{
              position: "fixed",
              top: targetRect.top,
              left: targetRect.left + targetRect.width,
              right: 0,
              height: targetRect.height,
              zIndex: 9999,
              cursor: "default",
            }}
          />
        </>
      )}

      <div style={styles.highlight} />

      <div ref={tooltipRef} style={styles.tooltip}>
        <div
          className="campaignbay-bg-white campaignbay-rounded-sm campaignbay-shadow-2xl campaignbay-p-4 campaignbay-animate-fade-in-up"
          style={{
            maxWidth: "300px",
            minWidth: 'min(300px , 80vw)'
          }}
        >
          <div className="campaignbay-flex campaignbay-justify-between campaignbay-items-start">
            <p className="campaignbay-text-[13px] campaignbay-text-[#3d3d3d] campaignbay-pr-4 campaignbay-font-medium">
              {stepConfig.text}
            </p>
            <button
              disabled={isClosing}
              onClick={handleClose}
              className="campaignbay-p-1 campaignbay-rounded-full hover:campaignbay-bg-gray-200"
              aria-label="Close tour"
            >
              <X className="campaignbay-w-4 campaignbay-h-4 campaignbay-text-gray-500" />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="campaignbay-mt-4">


            <div className="campaignbay-flex campaignbay-justify-between campaignbay-items-center">
              {/* Don't show again checkbox */}
              {/* <div className="campaignbay-flex campaignbay-items-center">
                <CbCheckbox
                  id="cb-guide-dont-show"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <label
                  htmlFor="cb-guide-dont-show"
                  className="campaignbay-ml-2 campaignbay-text-xs campaignbay-font-bold campaignbay-text-gray-500 campaignbay-cursor-pointer select-none"
                >
                  Don't show this again
                </label>
              </div> */}
              {stepConfig.showPrev ? (
                <button
                  onClick={() => {
                    if (stepConfig.onPrev) {
                      stepConfig.onPrev({
                        prev: () => setTourStep(tourStep - 1),
                        setStep: setTourStep,
                        navigate: navigate,
                      });
                    } else {
                      setTourStep(tourStep - 1);
                    }
                  }}
                  className="campaignbay-px-3 campaignbay-py-1 campaignbay-text-blue-600 text-sm campaignbay-border campaignbay-border-blue-600 campaignbay-font-medium campaignbay-rounded-sm hover:campaignbay-bg-blue-700 hover:campaignbay-text-white"
                >
                  Previous
                </button>
              ) : <span></span>}
              {stepConfig.showNext && (
                <button
                  onClick={() => {
                    if (stepConfig.onNext) {
                      stepConfig.onNext({
                        next: () => setTourStep(tourStep + 1),
                        setStep: setTourStep,
                        navigate: navigate,
                      });
                    } else {
                      setTourStep(tourStep + 1);
                    }
                  }}
                  className="campaignbay-px-3 campaignbay-py-1 campaignbay-bg-blue-600 campaignbay-text-white text-sm campaignbay-font-medium campaignbay-rounded-sm hover:campaignbay-bg-blue-700 campaignbay-border campaignbay-border-blue-600"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Guide;
