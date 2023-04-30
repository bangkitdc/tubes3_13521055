import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Conversation from '../components/Chat/Conversation'


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  return (
    <>
      <div>
        <h1>Welcome to the home page!</h1>
        <div>
          <Conversation/>
          </div>
      </div>
    </>
  );
}
