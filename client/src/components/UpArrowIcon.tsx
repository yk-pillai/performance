const UpArrowIcon = ({
  className = "h-12 w-12 fixed right-6 bottom-6 border border-gray-50 rounded-full bg-slate-200 cursor-pointer",
  stroke = "currentColor",
}: {
  className?: string;
  stroke?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 5l-7 7m14 0l-7-7m0 14v-8" />
  </svg>
);

export default UpArrowIcon;
