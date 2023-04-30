import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

const UserProfile = () => {
  const { data: session }: any = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 bg-gray-50 dark:bg-gray-900">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {session && (
              <>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Hello {session?.user?.name}
                </p>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  {session?.user?.email}
                </p>

                <button 
                  onClick={handleSignOut}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
