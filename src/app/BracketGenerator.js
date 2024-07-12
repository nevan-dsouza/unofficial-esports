import React from 'react';
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-tournament-bracket';

const BracketGenerator = ({ rounds }) => {
  return (
    <div className="bracket-container">
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="round">
          <h3>{round.title}</h3>
          {round.seeds.map((seed, seedIndex) => (
            <Bracket
              key={seedIndex}
              game={seed}
              homeOnTop={false}
              renderSeedComponent={(props) => (
                <Seed {...props}>
                  <SeedItem>
                    <div className="seed-item">
                      <SeedTeam>{props.game.teams[0]?.name || 'TBD'}</SeedTeam>
                      <SeedTeam>{props.game.teams[1]?.name || 'TBD'}</SeedTeam>
                    </div>
                  </SeedItem>
                </Seed>
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BracketGenerator;
