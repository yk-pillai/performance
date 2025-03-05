import HeartIcon from "./HeartIcon";

interface LikeType {
  noOfLikes: string;
  classes: string;
  onLike?: () => void;
}

const Like = ({ onLike, noOfLikes, classes }: LikeType) => {
  return (
    <div className="flex items-center gap-1 cursor-pointer" onClick={onLike}>
      <HeartIcon className={classes} />
      <span className="text-red-500">{noOfLikes}</span>
    </div>
  );
};

export default Like;
