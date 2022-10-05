import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import randomstring from "randomstring";
import Link from "next/link";
const socket = socketIOClient("https://pokemon-socketio.herokuapp.com", {
  autoConnect: false,
});

export default function Battle({ pokemon, battleId }) {
  const [battle, setBattle] = useState({
    _id: null,
    playerOne: {
      pokemon: {},
    },
    playerTwo: {
      pokemon: {},
    },
  });

  useEffect(() => {
    socket.connect();
    socket.on("connect", async () => {
      socket.emit("join", battleId ? battleId : randomstring.generate());
    });
    socket.on("refresh", (battle) => {
      setBattle(battle);
    });
    console.log(battle);
  }, []);

  useEffect(() => {
    console.log(battle);
    console.log(pokemon);
  }, [battle]);
  return (
    <div className="bg-blue-100 h-screen">
      <h1 className="text-5xl font-bold text-center p-16">PokeBattle!</h1>
      <h2 className="text-center">BattleId:{battle._id}</h2>
      {!battle.playerOne.pokemon._id || !battle.playerTwo.pokemon._id ? (
        <SelectStage battle={battle} pokemon={pokemon}></SelectStage>
      ) : (
        ""
      )}
      {battle.playerOne.pokemon._id && battle.playerTwo.pokemon._id ? (
        <BattleStage battle={battle} pokemon={pokemon}></BattleStage>
      ) : (
        ""
      )}

      {battle.playerOne.pokemon.hp <= 0 || battle.playerTwo.pokemon.hp <= 0 ? (
        <VictoryStage battle={battle}></VictoryStage>
      ) : (
        ""
      )}
    </div>
  );
}

const SelectStage = ({ battle, pokemon }) => {
  return (
    <div className="container mx-auto text-center">
      <div className="flex space-x-24">
        <div className="w-1/2">
          <h1>Player 1</h1>
          <div className="flex flex-wrap">
            {pokemon &&
              pokemon.map((poke) => {
                return (
                  <div
                    key={poke._id}
                    className={
                      "w-1/2" +
                      (battle.playerOne.pokemon._id == poke._id
                        ? " bg-red-100"
                        : "")
                    }
                    onClick={() => socket.emit("select", 1, poke)}
                  >
                    <img src={poke.image} className="w-1/3"></img>
                    <h2 className="font-bold text-xl">{poke.name}</h2>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="w-1/2">
          <h1>Player Two</h1>
          <div className="flex flex-wrap ">
            {pokemon &&
              pokemon.map((poke) => {
                return (
                  <div
                    key={poke._id}
                    className={
                      "w-1/2" +
                      (battle.playerTwo.pokemon._id === poke._id
                        ? " bg-red-100"
                        : "")
                    }
                    onClick={() => socket.emit("select", 2, poke)}
                  >
                    <img src={poke.image} className="w-1/3"></img>
                    <h2 className="font-bold text-xl">{poke.name}</h2>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
const BattleStage = ({ battle, pokemon }) => {
  return (
    <div className="container mx-auto text-center">
      <h1 className="text-5xl font-bold">FIGHT!!</h1>
      <div className="flex space-x-24">
        <div className="w-1/2">
          <h1>Player 1</h1>
          <img
            className="w-64 mx-auto"
            src={battle.playerOne.pokemon.image}
          ></img>
          <h2 className="text-2xl font-bold">
            {battle.playerOne.pokemon.name}
          </h2>
          <h2 className="text-2xl font-bold">
            HP : {battle.playerOne.pokemon.hp}
          </h2>
          <h2 className="text-2xl font-bold">
            PP :{battle.playerOne.pokemon.pp}
          </h2>
          <div className="flex flex-col">
            {battle.playerOne.pokemon.moves &&
              battle.playerOne.pokemon.moves.map((move) => {
                return (
                  <div
                    key={move.name}
                    onClick={() => socket.emit("attack", 1, move)}
                  >
                    <h2 className="w-full font-bold text-xl p-6 m-2 bg-blue-300">
                      {move.name} ({move.pp})
                    </h2>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="w-1/2">
          <h1>Player Two</h1>
          <img
            className="w-64 mx-auto"
            src={battle.playerTwo.pokemon.image}
          ></img>
          <h2 className="text-2xl font-bold">
            {battle.playerTwo.pokemon.name}
          </h2>
          <h2 className="text-2xl font-bold">
            HP :{battle.playerTwo.pokemon.hp}
          </h2>
          <h2 className="text-2xl font-bold">
            PP :{battle.playerTwo.pokemon.pp}
          </h2>
          <div className="flex flex-col">
            {battle.playerTwo.pokemon.moves &&
              battle.playerTwo.pokemon.moves.map((move) => {
                return (
                  <div
                    key={move.name}
                    onClick={() => socket.emit("attack", 2, move)}
                  >
                    <h2 className="w-full font-bold text-xl p-6 m-2 bg-blue-300">
                      {move.name} ({move.pp})
                    </h2>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
const VictoryStage = ({ battle }) => {
  return (
    <div className="fixed h-screen left-0 top-0 bg-purple-200 text-center p-48 w-full">
      {battle.playerOne.pokemon.hp <= 0 && (
        <div>
          <img
            className="w-64 mx-auto"
            src={battle.playerTwo.pokemon.image}
          ></img>
          <h1 className="text-center text-4xl font-bold">
            Player Two Wins !!!
          </h1>
        </div>
      )}
      {battle.playerTwo.pokemon.hp <= 0 && (
        <div>
          <img
            className="w-64 mx-auto"
            src={battle.playerOne.pokemon.image}
          ></img>
          <h1 className="text-center text-4xl font-bold">
            Player One Wins !!!
          </h1>
        </div>
      )}
      <Link href="/">Play Again</Link>
    </div>
  );
};

export async function getServerSideProps({ query }) {
  try {
    const response = await fetch(
      "https://pokemon-socketio.herokuapp.com/pokemon"
    );
    const data = await response.json();
    const pokemon = JSON.parse(JSON.stringify(data.result));
    return {
      props: {
        pokemon,
        battleId: query.battleId || null,
      },
    };
  } catch (err) {
    console.log(err);
  }
}
