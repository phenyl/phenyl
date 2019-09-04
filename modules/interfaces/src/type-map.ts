import { GeneralEntityRestInfoMap } from "./entity-rest-info-map";
import { GeneralCustomMap } from "./custom-map";
import { GeneralAuthCommandMap } from "./auth-command-map";

/**
 * This type includes all the types in API.
 * - entities contains Entity types.
 * - customQueries contains params and result of each custom query.
 * - customCommands contains params and result of each custom command.
 * - auths contains credential and option of each user entity.
 *
 * Library users implement concrete TypeMap of his or her own API like the following example.
 *
 *    interface MyTypeMap extends GeneralTypeMap {
 *      entities: {
 *        member: {
 *          request: { id: string; name: string };
 *          response: { id: string; name: string };
 *          extraParams: { find: { externalId: string } },
 *          extraResult: { find: { externalEntity: Entity } },
 *        };
 *        message: {
 *          request: {
 *            id: string;
 *            body: string;
 *            ...
 *          };
 *          response: {
 *            id: string;
 *            body: string;
 *            ...
 *          };
 *        };
 *      };
 *      customQueries: {
 *        countMessagesOfMember: {
 *          params: { memberId: string };
 *          result: { count: number };
 *          extraResult: { foo: number };
 *        };
 *        getCurrentVersion: {
 *          // params: {} // optional
 *          result: { version: string };
 *        };
 *      };
 *      customCommands: {
 *        register: { params: { name: string }; result: { ok: 1 } };
 *      };
 *      auths: {
 *        member: {
 *          credentials: { email: string; password: string };
 *          // session: {} // optional
 *        };
 *      };
 *    }
 */

export interface GeneralTypeMap {
  entities: GeneralEntityRestInfoMap;
  customQueries: GeneralCustomMap;
  customCommands: GeneralCustomMap;
  auths: GeneralAuthCommandMap;
}
