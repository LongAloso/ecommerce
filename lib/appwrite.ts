import {Account, Avatars, Client} from "react-native-appwrite";
import * as Linking from "expo-linking";
import {openAuthSessionAsync} from "expo-web-browser";

export const config = {
    platform: 'com.jsm.restate',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectID!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
    try {
        const redirectUri = Linking.createURL(path:'/');

        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        );

        if(!response) throw new Error('Failed to login');

        const browerResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        )

        if(browerResult.type !== 'success') throw new Error('Failed to login');

        const url = new URL(browerResult.url);

        const secret = url.searchParams.get('secret ')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!userId || !userId || !secret) throw new Error('Failed to login');

        const session = await account.createSession(userId, secret);

        if (!session) throw new Error('Failed to create a session');

        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function logout() {
    try {
        await account.deleteSession('current')
        return true
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getUsers() {
    try {
        const response = await account.get();

        if(response.$id) {
            const userAvatar = avatar.getInitials(response.name);

            return {
                ...response,
                avatar: userAvatar.toString(),
            }
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}