import React from 'react';

const I18nProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      {children}
    </>
  );
};

export { I18nProvider };
