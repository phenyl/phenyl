import {
  EntityDefinition,
  GeneralRequestData,
<<<<<<< HEAD
  Session
} from "@phenyl/interfaces";

type AuthorizationSetting = {};

// @ts-ignore @TODO: implement this class
export class StandardEntityDefinition implements EntityDefinition {
  authorizationSetting: AuthorizationSetting;

  constructor(authorizationSetting: AuthorizationSetting) {
    this.authorizationSetting = authorizationSetting;
  }

  async authorization(
    reqData: GeneralRequestData,
    session: Session | null | undefined
  ): Promise<boolean> {
    // eslint-disable-line no-unused-vars
=======
  Session,
  TypeOnly,
  ReqRes,
  Entity,
} from '@phenyl/interfaces'

type AuthorizationSetting = {}

export class StandardEntityDefinition<
  EN extends string,
  Ereqres extends ReqRes<Entity>
> implements EntityDefinition {
  authorizationSetting: AuthorizationSetting
  entityName: TypeOnly<EN>
  entity: TypeOnly<Ereqres>

  constructor(authorizationSetting: AuthorizationSetting) {
    this.authorizationSetting = authorizationSetting
    // @ts-ignore
    this.entityName = ''
    // @ts-ignore
    this.entity = ''
  }

  async authorize(
    reqData: GeneralRequestData,
    session: Session | null | undefined,
  ): Promise<boolean> {
>>>>>>> fix types
    // TODO
    return false;
  }

<<<<<<< HEAD
  async validation(
    reqData: GeneralRequestData,
    session: Session | null | undefined
=======
  async validate(
    reqData: GeneralRequestData,
    session: Session | null | undefined,
>>>>>>> fix types
  ): Promise<void> {
    // eslint-disable-line no-unused-vars
  }
}
