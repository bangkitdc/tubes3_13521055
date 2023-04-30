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
        <div className="grid grid-cols-5 gap-5 h-screen w-screen p-5 bg-gray-50 dark:bg-gray-900">
          <div className="col-span-1">
            <ChatHistory />
          </div>
          <div className="col-span-4">
            <Conversation />
          </div>
        </div>
      </div>
    </>
  );
}
