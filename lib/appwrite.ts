import {
  CreateUserParams,
  GetMenuParams,
  SignInParams,
} from "@/constants/props";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: "com.britoncodex.uniplug",
  databaseId: "69e8b933003795dc4810",
  bucketId: "69f083d5000997343bf5",
  userCollectionId: "69e8baeb003e07b8bfc5",
  categoriesCollectionId: "categories",
  menuCollectionId: "menu",
  customizationsCollectionId: "customizations",
  menuCustomizationsCollectionId: "menu_customizations",
};

//accept new client
export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

//also create new account from user with the client
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

//function that creates and registers a user
export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    //create new account
    const newAccount = await account.create(
      ID.unique() as any,
      email,
      password,
      name,
    );
    //if ow user was created throw error
    if (!newAccount) throw Error;
    //if account is created automatically sign in the user
    await signIn({ email, password });

    //get avatars with names initial
    const avatarUrl = avatars.getInitialsURL(name);

    //create a new database user
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl,
        phoneNumber: "",
        address: "",
      },
    );
  } catch (error) {
    throw new Error(error as string);
  }
};

//signin functionality
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    // create new session
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCurrentUser = async () => {
  try {
    //get access to the current account
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

//getting menu
export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries,
    );
    return menus.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
    );
    return categories.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

//logout functionality
export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    throw new Error(error as string);
  }
};

//send email verification
// export const sendEmailVerification = async () => {
//   try {
//     return await account.createVerification("client://verify-email");
//   } catch (error) {
//     throw new Error(error as string);
//   }
// };

export const updateUserAddress = async (userId: string, address: string) => {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        address,
      },
    );
  } catch (error) {
    console.log("Address update failed", error);
  }
};
