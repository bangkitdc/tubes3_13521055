export interface IUser {
    _id?: string;
    email: string;
    name: string;
}

export interface LoginUserParams {
    email: string;
    password: string;
}

export interface QnAParams {
    question: string;
    answer: string;
}

export interface Message {
    text: string;
    role: string;
    room: number;
    sender: string;
}