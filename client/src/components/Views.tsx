import EyeIcon from "./EyeIcon";

interface ViewsType {
  noOfViews: string;
  classes: string;
}

const Views = ({ noOfViews, classes }: ViewsType) => {
  return (
    <div className="flex items-center gap-1">
      <EyeIcon className={classes} stroke="dodgerblue" />
      <span className="text-blue-800">{noOfViews}</span>
    </div>
  );
};

export default Views;
