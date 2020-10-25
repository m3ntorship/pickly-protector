import admin from 'firebase-admin';


export const verifyIdToken = (
  idToken: string
): Promise<admin.auth.DecodedIdToken> => admin.auth().verifyIdToken(idToken);
