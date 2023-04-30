import { signIn } from "next-auth/react";
import { LoginUserParams } from "../types";

export const loginUser = async ({email, password} : LoginUserParams) => {
    const res = await signIn("credentials", {
        redirect: false,
        email,
        password
    })

    return res
}