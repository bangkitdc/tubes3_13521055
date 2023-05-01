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
        <div className="grid grid-cols-5 h-screen w-screen bg-gray-50 dark:bg-gray-900">
          <div className="col-span-1 py-5 pl-5 pr-2 dark:bg-gray-800">
            <ChatHistory />
          </div>
          <div className="col-span-4 p-5 overscroll-y-contain">
            <Conversation />
          </div>
        </div>
      </div>
    </>
  );
}
