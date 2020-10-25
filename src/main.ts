import admin from 'firebase-admin';
import { verifyIdToken } from './verifyIdToken';

export type UserProfile = Record<string, unknown>;

type User = {
  tokeninfo?: admin.auth.DecodedIdToken;
  mongouser?: UserProfile;
};

export const protector = (
  serviceAccount: string,
  userEnricher: (user: User) => Promise<UserProfile>
): ((req, res, next) => unknown) => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return async (req, _res, next) => {
    const user: User = {};
    const {
      headers: { authorization }
    } = req;
    if (!authorization)
      return next(new Error('please provide valid user token to proceed'));
    const [, token] = authorization.split(/bearer /i);
    const tokeninfo = await verifyIdToken(token);

    user.tokeninfo = tokeninfo;

    const profile = await userEnricher(user);
    user.mongouser = profile;
    req.user = user;
    return next();
  };
};
