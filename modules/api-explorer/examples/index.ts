import http from "http";
import PhenylRestApi from "@phenyl/rest-api";
import { createEntityClient } from "@phenyl/memory-db";
import {
  StandardUserDefinition,
  StandardEntityDefinition
} from "@phenyl/standards";
import PhenylHttpServer from "@phenyl/http-server";
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
  FunctionalGroup,
  ReqRes
} from "@phenyl/interfaces";

const PORT = 8000;

class HospitalDefinition extends StandardEntityDefinition {
  async authorization(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<boolean> {
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

type AppReqResEntityMap = { patient: ReqRes<PlainPatient> };

type AppEntityMap = {
  patient: PlainPatient;
};

const memoryClient = createEntityClient<AppEntityMap>();

class PatientDefinition extends StandardUserDefinition<
  AppReqResEntityMap,
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

  async authorization(reqData: any, session: any): Promise<boolean> {
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
  session?: Session;
};
class TestCustomCommand implements CustomCommandDefinition {
  async authorization(
    command: CustomCommand<any, CustomCommandParams>,
    session?: Session
  ): Promise<boolean> {
    return !!session;
  }

  async validation(): Promise<void> {
    // Does nothing
  }

  async execute(
    command: CustomCommand<any, CustomCommandParams>,
    session?: Session
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
  session?: Session;
};
class TestCustomQuery implements CustomQueryDefinition {
  async authorization(
    command: CustomQuery<any, CustomQueryParams>,
    session?: Session
  ): Promise<boolean> {
    return !!session;
  }

  async validation(): Promise<void> {
    // Does nothing
  }

  async execute(
    command: CustomQuery<any, CustomQueryParams>,
    session?: Session
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
    patient: new PatientDefinition()
  },
  nonUsers: {
    hospital: new HospitalDefinition({})
  }
};

const server = new PhenylHttpServer(http.createServer(), {
  restApiHandler: new PhenylRestApi(functionalGroup, {
    // @ts-ignore TODO
    client: memoryClient
  }),
  customRequestHandler: new PhenylApiExplorer(functionalGroup, {
    path: "/explorer"
  }).handler
});

server.listen(PORT);
console.log(`server is listening on :${PORT}`);
