import * as firestore from '@google-cloud/firestore';
import { IEntity, ICollectionQuery, ICollection } from '../types';

/**
 * Utility functions to build firestore-compatiable queries.
 */
export default class QueryBuilder {
  /**
   * Converts a firestom query into a firestore query.
   * @param collectionRef The native firestore collection reference.
   * @param query The firestorm query
   */
  public static query<T extends IEntity>(collection: ICollection<T>, query: ICollectionQuery<T>) : firestore.Query {
    const collectionRef = collection.native;
    const {
      where: whereQueries,
      orderBy: orderByQueries,
      startAfter: startAfterQuery,
      startAt: startAtQuery,
      endAt: endAtQuery,
      endBefore: endBeforeQuery,
      limit: limitQuery,
    } = query;
    let q = (whereQueries || []).reduce((accum: any, curr) => {
      const [field, operator, value] = curr;
      return accum.where(field as any, operator, value);
    }, collectionRef);

    if (orderByQueries) {
      orderByQueries.forEach(obq => {
        q = q.orderBy(obq[0], obq[1] || 'asc');
      });
      if (startAtQuery || startAfterQuery) {
        let addedStartAt = false;
        if (startAtQuery) {
          addedStartAt = true;
          q = q.startAt(startAtQuery);
        }
        if (startAfterQuery && !addedStartAt) {
          q = q.startAfter(startAfterQuery);
        }
      }
      if (endAtQuery || endBeforeQuery) {
        let addedEndAt = false;
        if (endAtQuery) {
          addedEndAt = true;
          q = q.endAt(endAtQuery);
        }
        if (endBeforeQuery && !addedEndAt) {
          q = q.endBefore(endBeforeQuery);
        }
      }
    }

    if (limitQuery) {
      q = q.limit(limitQuery);
    }
    return q;
  }
}