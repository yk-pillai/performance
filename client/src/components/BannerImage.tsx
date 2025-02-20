import { useEffect } from "react";
import { preloadImage } from "../utils";

const BannerImage = ({
  imageUrl,
  altTxt,
  width = "1200px",
  height = "600px",
}: {
  imageUrl: string;
  altTxt: string;
  width?: string;
  height?: string;
}) => {
  useEffect(() => {
    const cleanup = preloadImage(imageUrl);
    return cleanup;
  }, [imageUrl]);

  return (
    <div className="bg-black flex justify-center">
      <img
        src={imageUrl}
        alt={altTxt}
        className="object-cover"
        width={width}
        height={height}
      />
    </div>
  );
};

export default BannerImage;
