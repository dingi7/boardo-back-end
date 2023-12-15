export interface IUser{
    _id: string;
    firstName: string;
    username: string;
    email: string;
    joinedOrganizations: string[];
    hashedPassword: string;
}