export interface ISession {
    _id: string;
    username: string;
    email: string;
    joinedOrganizations: string[];
    accessToken: string;
}
