import {
  EntityDefinition,
  GeneralRequestData,
  Session,
  TypeOnly,
  ReqRes,
  Entity
} from "@phenyl/interfaces";

type AuthorizationSetting = {};

export class StandardEntityDefinition<
  EN extends string,
  Ereqres extends ReqRes<Entity>
> implements EntityDefinition {
  authorizationSetting: AuthorizationSetting;
  entityName: TypeOnly<EN>;
  entity: TypeOnly<Ereqres>;

  constructor(authorizationSetting: AuthorizationSetting) {
    this.authorizationSetting = authorizationSetting;
    // @ts-ignore
    this.entityName = "";
    // @ts-ignore
    this.entity = "";
  }

  async authorize(
    reqData: GeneralRequestData,
    session: Session | null | undefined
  ): Promise<boolean> {
    // TODO
    return false;
  }

  async validate(
    reqData: GeneralRequestData,
    session: Session | null | undefined
  ): Promise<void> {
    // eslint-disable-line no-unused-vars
  }
}
