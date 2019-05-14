import http from "http";
import PhenylRestApi from "@phenyl/rest-api";
import { createEntityClient } from "@phenyl/memory-db";
import {
  StandardUserDefinition,
  StandardEntityDefinition
} from "@phenyl/standards";
import PhenylHttpServer from "@phenyl/http-server";
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
  ReqRes,
  KvsClient
} from "@phenyl/interfaces";
import crypt from "power-crypt";
import PhenylApiExplorer from "../src/PhenylApiExplorer";

const PORT = 8000;

type PlainHospital = {
  id: string;
  name: string;
};

class HospitalDefinition extends StandardEntityDefinition {
  async authorize(
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
  hospital: PlainHospital;
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

  async authorize(reqData: any, session: any): Promise<boolean> {
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

type MemberSessionValue = { externalId: string; ttl: number };

// insert initial values
memoryClient.insertOne({
  entityName: "patient",
  value: {
    name: "hoge",
    email: "hoge@cureapp.jp",
    password: crypt("hoge")
  }
});

memoryClient.insertOne({
  entityName: "hospital",
  value: { name: "hoge hospital" }
});

const server = new PhenylHttpServer(http.createServer(), {
  restApiHandler: new PhenylRestApi(functionalGroup, {
    // @ts-ignore TODO
    client: memoryClient,
    sessionClient: memoryClient.createSessionClient() as KvsClient<
      Session<"patient", MemberSessionValue>
    >
  }),
  customRequestHandler: new PhenylApiExplorer(functionalGroup, {
    path: "/explorer"
  }).handler
});

server.listen(PORT);
console.log(`server is listening on :${PORT}`);
