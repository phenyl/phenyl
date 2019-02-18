import http from "http";
import PhenylRestApi from "phenyl-rest-api";
import { createEntityClient } from "phenyl-memory-db";
import {
  StandardUserDefinition,
  StandardEntityDefinition
} from "phenyl-standards";
import PhenylHttpServer from "phenyl-http-server";
import PhenylApiExplorer from "../src/PhenylApiExplorer";
import {
  Session,
  GeneralRequestData,
  CustomCommand,
  CustomCommandDefinition,
  CustomCommandResult,
  CustomQuery,
  CustomQueryDefinition,
  CustomQueryResult,
  FunctionalGroup
} from "@phenyl/interfaces";

const PORT = 8000;
const memoryClient = createEntityClient();

class HospitalDefinition extends StandardEntityDefinition {
  async authorization(
    reqData: GeneralRequestData,
    session: Session | null
  ): Promise<boolean> {
    // eslint-disable-line no-unused-vars
    return true;
  }
}

type PlainPatient = {
  id: string;
  name: string;
  email: string;
  password?: string;
};
type PatientAuthSetting = {
  credentials: { email: string; password: string };
  options: Object;
};
class PatientDefinition extends StandardUserDefinition<
  { patient: PlainPatient },
  PatientAuthSetting
> {
  constructor() {
    super({
      entityClient: memoryClient,
      accountPropName: "email",
      passwordPropName: "password",
      ttl: 24 * 3600
    });
  }

  async authorization(reqData, session): Promise<boolean> {
    switch (reqData.method) {
      case "insertOne":
      case "insertAndGet":
      case "insertAndGetMulti":
      case "login":
        return true;
      default:
        return session != null;
    }
  }
}

type CustomCommandParams = {
  echo: string;
};
type CustomCommandResponse = {
  echo: string;
  session: Session | null;
};
class TestCustomCommand
  implements
    CustomCommandDefinition<any, CustomCommandParams, CustomCommandResponse> {
  async authorization(
    command: CustomCommand<any, CustomCommandParams>,
    session: Session | null
  ): Promise<boolean> {
    return !!session;
  }

  async validation(): Promise<void> {
    // Does nothing
  }

  async execute(
    command: CustomCommand<any, CustomCommandParams>,
    session: Session | null
  ): Promise<CustomCommandResult<CustomCommandResponse>> {
    return {
      result: {
        echo: command.params.echo,
        session
      }
    };
  }
}

type CustomQueryParams = {
  echo: string;
};
type CustomQueryResponse = {
  echo: string;
  session: Session | null;
};
class TestCustomQuery
  implements
    CustomQueryDefinition<any, CustomQueryParams, CustomQueryResponse> {
  async authorization(
    command: CustomQuery<any, CustomQueryParams>,
    session: Session | null
  ): Promise<boolean> {
    return !!session;
  }

  async validation(): Promise<void> {
    // Does nothing
  }

  async execute(
    command: CustomQuery<any, CustomQueryParams>,
    session: Session | null
  ): Promise<CustomQueryResult<CustomQueryResponse>> {
    return {
      result: {
        echo: command.params.echo,
        session
      }
    };
  }
}

const functionalGroup: FunctionalGroup = {
  customQueries: {
    test: new TestCustomCommand()
  },
  customCommands: {
    test: new TestCustomQuery()
  },
  users: {
    // @ts-ignore TODO Convert phenyl-standards to TS
    patient: new PatientDefinition()
  },
  nonUsers: {
    // @ts-ignore TODO Convert phenyl-standards to TS
    hospital: new HospitalDefinition()
  }
};

const server = new PhenylHttpServer(http.createServer(), {
  restApiHandler: PhenylRestApi.createFromFunctionalGroup(functionalGroup, {
    client: memoryClient
  }),
  customRequestHandler: new PhenylApiExplorer(functionalGroup, {
    path: "/explorer"
  }).handler
});

server.listen(PORT);
console.log(`server is listening on :${PORT}`);
