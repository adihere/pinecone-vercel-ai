import Image from "next/image";
//import PineconeLogo from "../../../public/pinecone.svg";
import Smartways2Logo from "../../../public/smartways2.jpeg";
import VercelLogo from "../../../public/vercel.svg";

export default function Header({ className }: { className?: string }) {
  return (
    <header
      className={`flex items-center justify-center text-gray-200 text-2xl ${className}`}
    >
      <Image
        src={Smartways2Logo}
        alt="smartways-logo"
        width="130"
        height="30"
        className="ml-3"
      />{" "}
      <div className="text-4xl ml-3 mr-3">+</div>
      <Image
        src={VercelLogo}
        alt="vercel-logo"
        width="160"
        height="30"
        className="mr-3 mt-3"
      />
    </header>
  );
}
