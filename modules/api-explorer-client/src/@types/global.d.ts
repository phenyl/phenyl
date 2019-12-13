import { GeneralFunctionalGroup } from "@phenyl/interfaces";

declare global {
  interface Window {
    phenylApiExplorerClientGlobals: {
      PhenylFunctionalGroupSkeleton: GeneralFunctionalGroup;
      phenylApiUrlBase: string;
    };
  }
}
