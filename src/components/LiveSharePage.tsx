// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFluidContainer } from "fluid-framework";
import { FC, ReactNode, useMemo } from "react";

export const LiveSharePage: FC<{
  children: ReactNode;
  started: boolean;
  container?: IFluidContainer;
}> = ({ children, started, container }) => {
  const loadText = useMemo(() => {
    if (!container) {
      return "Joining Live Share session...";
    }
    if (!started) {
      return "Starting sync...";
    }
    return undefined;
  }, [container, started]);

  return (
    <>
      {loadText && <div>{loadText}</div>}
      <div style={{ visibility: loadText ? "hidden" : undefined }}>
        {children}
      </div>
    </>
  );
};
