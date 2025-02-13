import React, { useEffect } from "react";

interface SmoothScrollLinkProps {
  href: string;
  children: React.ReactNode;
}

const SmoothScrollLink: React.FC<SmoothScrollLinkProps> = ({
  href,
  children,
}) => {
  useEffect(() => {
    const link = document.querySelector(`a[href="${href}"]`);
    if (link) {
      const handleClick = (event: MouseEvent) => {
        event.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      };
      link.addEventListener("click", handleClick as EventListener); // Correct type casting
      return () => {
        link.removeEventListener("click", handleClick as EventListener); // Correct type casting
      };
    }
  }, [href]);
  return <a href={href}>{children}</a>;
};

export default SmoothScrollLink;
