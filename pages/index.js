import { useState } from "react";
import Link from "next/link";
export default function Home() {
  const [battleId, setBattleId] = useState("");

  return (
    <div className="bg-blue-100 h-screen">
      <h1 className="text-5xl font-bold text-center p-16">PokeBattle!</h1>
      <div className="flex text-center space-x-16">
        <div className="w-1/2">
          <Link href="/battle" className="w-full p-6 bg-blue-200 m-2">
            New Game
          </Link>
        </div>

        <div className="w-1/2">
          <input
            className="w-1/2 p-6"
            type="text"
            onChange={(e) => setBattleId(e.target.value)}
          ></input>
          <Link
            href={"/battle?battleId=" + battleId}
            className="w-full p-6 bg-blue-200 m-2"
          >
            Join Game
          </Link>
        </div>
      </div>
    </div>
  );
}
