import { useEffect } from 'react';

const useBackgroundStyle = () => {
  //
  useEffect(() => {
    document.body.style.backgroundColor = '#f9f9f9';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    return () => {
      document.body.style.backgroundColor = null;
      document.body.style.backgroundSize = null;
      document.body.style.backgroundPosition = null;
    };
  }, []);
};

export default useBackgroundStyle;
