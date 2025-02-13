import { useEffect } from "react";

const useMetaDescription = (description: string) => {
  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [description]);
};

export default useMetaDescription;
