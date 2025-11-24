import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { DeveloperRecord } from '../types';

const COLLECTION_NAME = 'developers';

export const subscriptionService = {
  // Create a new subscription
  addSubscription: async (data: Omit<DeveloperRecord, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error("Error adding subscription:", error);
      throw error;
    }
  },

  // Get all subscriptions (optionally filtered by partnerCode)
  getSubscriptions: async (partnerCode?: string) => {
    try {
      let q = collection(db, COLLECTION_NAME);

      if (partnerCode && partnerCode !== 'All') {
        // @ts-ignore - complex query typing
        q = query(collection(db, COLLECTION_NAME), where('partnerCode', '==', partnerCode));
      }

      const querySnapshot = await getDocs(q);
      const results: DeveloperRecord[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as DeveloperRecord);
      });
      return results;
    } catch (error) {
      console.error("Error getting subscriptions:", error);
      throw error;
    }
  },

  // Update a subscription
  updateSubscription: async (id: string, data: Partial<DeveloperRecord>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  },

  // Delete a subscription
  deleteSubscription: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting subscription:", error);
      throw error;
    }
  },

  // Bulk add subscriptions (for CSV import)
  bulkAddSubscriptions: async (dataList: Omit<DeveloperRecord, 'id'>[]) => {
      // Note: Firestore batch writes have a limit of 500 operations.
      // For simplicity in this prototype, we'll loop.
      // In production, we should use batching.
      const results = [];
      for (const data of dataList) {
          try {
              // Check if email already exists to avoid duplicates?
              // For now, straightforward insert as per prompt "bulk uploading".
              // Ideally we'd upsert based on Email.

              // Let's implement a simple check-and-update or create strategy based on Email
              const q = query(collection(db, COLLECTION_NAME), where('email', '==', data.email));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                  // Update existing
                  const docId = querySnapshot.docs[0].id;
                  await updateDoc(doc(db, COLLECTION_NAME, docId), data);
                  results.push({ id: docId, ...data, status: 'updated' });
              } else {
                  // Create new
                  const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
                  results.push({ id: docRef.id, ...data, status: 'created' });
              }
          } catch (e) {
              console.error(`Failed to import ${data.email}`, e);
              results.push({ ...data, status: 'failed', error: e });
          }
      }
      return results;
  }
};
