import { appwriteConfig, databases } from "./appwrite";

// Saves the phone number on the signed-in user's profile row (users table).
// `userRowId` is the users-table row id, i.e. user.$id.
export async function updateUserPhone(userRowId: string, phoneNumber: string) {
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userRowId,
    { phoneNumber },
  );
}
