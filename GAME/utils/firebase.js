const admin = require("firebase-admin");
const FIREBASE_CONFIG = {
  type: "service_account",
  project_id: "betting-game-f305e",
  private_key_id: "2ab5cf95e53de1287aeb61532ae5741578a89611",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDyDGpM7BWXyzT\n7mMGdBfKszi+9lix8EVEi2YQe13D4mrTsapjGDgGcrKYq0uFxgqZ1bOjbQyPzzG5\n8gemSc2XnEF3OAqPbBbf+Z7DHKVg0xLjzw5TrOxuP4rOR5a3u+labcjOYm/S74Vx\nZb7i2KqfH/FqKxKYtpzS1p4YmUgZyv8dnEuHN3BEnadYB4Wl7qR+d2LDvnaDHnmf\ngsf57qvoog/+9c8lrpvOnLYs4bAX/+wUA4m8DQAJYptnVspR16Ta0BSUeWBHq7cb\nXussndYAYaN2JfjIqV0ZrL/bMK/KUFkvn1gz/8iBm1ZWvc2OYhI4ED5qp7uh51pX\nVnAZeC8xAgMBAAECggEAF2qV2f13LVVz2KNOD8MJ53IZKunvANVSi5i6q+T9eYTW\nrxw0W2bVqJvGVbFDNqxRr0Wal0TfOEIZWfqjRJXWM7h6MgavaKkOcVp7TS3bb+G/\nBCVLOuHXY3ZRJUv1sGMWzXyNBHZMlqeUR9RaCOrOOXsKFl8xebd5uVP3E80djQv/\ncNHFpxQ9MSqpQyOsf7Pi+qTaq9TyVq89/smIhLpRmgRo+n2hl4xBGMYvbTdyGkt4\nNSg/QOQ7KhlGHkEh6nxAoyTgiG62WhDqZnsHNEC8gE+FXEBiC2/LUANAq/eNgItB\npSBDnTe2PEs0OEpV5nSrwlbD9TtqR3Bb6pSIxpSV0wKBgQDoh2ifQuv0mT8fm8qc\nKy0lPf7qACAKL8Byp+JWWZm87eJ/duMKHmTDQsFn08SDIKTvjuvmbwK5zDlhIzOu\nCAUCy7dgqBw9V+LvCTI18/WohapffAFTPbQ47/5K8Komy1cGftVXjwU5ozUr+whD\nw89HBbK6+ahXR6KDGchsG8TzowKBgQDXizzZ4V+Tdv0PkmdIcMQODb1jj+pRXHGm\nS3ZWBUl5xUSvHsav5F1GAMi7kGTeZXrxhqD5JDM+X6KMwz0u8wZxapMjBSkZ1PqF\n0zGJErVyA21Ru++AEndg4f3+D8x+DU2LkhNyCcVj573a8oL94rj/hEH40axfJfG2\nE6/ngiNfGwKBgQDgYfJSZNiectbX4JUWOA/bdUSsd6xzR/sUaO7fVp0lFATR7V5P\nYF7pkVxinZZu1qxyQt9ewNbHhcwE8VwoXrK/LOfqzK5bf5iMA7rBF4aBtWJfu6Dn\nu45StzwTAsOepe93ZCLo2Ck5okVoCFjEU4qMRXJgPRP2DTlD+zhNIkreswKBgH2S\ns/fnskvyRYpd6+grMj1RyeWIQaX26otMaXvCBsV3pQU1M+HjdGfFKy0C+ZELpC20\nFnIvod8TzlqdoDaLBVTsFx6O8hwHlZCDstc93BG5Z2X3zJdbqsr5voTWZXeGfofy\nqXuFr8b9iwFUyfXpsYfDYL/6P6cLLx+5poCEs+DDAoGAFtOBYqmgC4twqCW8W7Xt\nBFWFb5AIKtOXH7Cmu1vDOU4vnWHEya5ZR5mPMoRbSCQ3R9MH5kplj4QZ4nkn46cQ\nxjolmshTvZ/WWvrvqfwYF2l8P/Vl71aiXCFdUbKHdsOME3S4AYneEQJfgMDhgWVm\naqQRFBkbSIfq3AtCkZCX3qc=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-sxz6q@betting-game-f305e.iam.gserviceaccount.com",
  client_id: "102284293520223358928",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-sxz6q%40betting-game-f305e.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};
const app = admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_CONFIG),
});
const auth = app.auth();

async function getUserDetails(id) {
  return await auth.getUser(id);
}

module.exports = getUserDetails;

// https://console.firebase.google.com/u/0/project/betting-game-f305e/settings/serviceaccounts/adminsdk
