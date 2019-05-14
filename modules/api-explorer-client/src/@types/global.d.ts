import { FunctionalGroup } from "@phenyl/interfaces";

declare global {
  interface Window {
    phenylApiExplorerClientGlobals: {
      PhenylFunctionalGroupSkeleton: FunctionalGroup;
      phenylApiUrlBase: string;
    };
  }
}
