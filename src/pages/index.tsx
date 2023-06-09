import { getSession } from "next-auth/react";
import ChatHistory from '../components/Chat/ChatHistory'
import { GetServerSidePropsContext } from "next";
import { ToastContainer } from "react-toastify";

export const getServerSideProps = async (context : GetServerSidePropsContext ) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else {
    const expires = Date.parse(session.expires);
    const currentTime = Date.now();
    if (expires < currentTime) {
      // token has expired, redirect to login page
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
};

export default function Home() {
  return (
    <div>
      <ToastContainer />
      <ChatHistory />
    </div>
  );
}
