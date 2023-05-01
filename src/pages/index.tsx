import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Conversation from '../components/Chat/Conversation'
import ChatHistory from '../components/Chat/ChatHistory'


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
        <ChatHistory/>
      </div>
    </>
  );
}
