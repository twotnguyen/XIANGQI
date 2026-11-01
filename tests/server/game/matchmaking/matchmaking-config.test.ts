import { expect, it } from "vitest";
import { readMatchmakingConfig } from "../../../../apps/server/src/game/matchmaking/matchmaking-config.js";

it("forbids weakened pair and leaderboard rules in release even with a demo flag",()=>{
  for(const overrides of [{MATCHMAKING_PAIR_LIMIT_ENABLED:"false"},{RANKED_MINIMUM_GAMES:"1"}]) {
    expect(()=>readMatchmakingConfig({NODE_ENV:"production",DEMO_ENABLED:"true",...overrides})).toThrow();
    expect(()=>readMatchmakingConfig(overrides)).toThrow();
  }
});
it("permits an explicitly local demo while ordinary acceptance retains real rules",()=>{
  expect(readMatchmakingConfig({NODE_ENV:"test",MATCHMAKING_PAIR_LIMIT_ENABLED:"false",RANKED_MINIMUM_GAMES:"1"})).toEqual({pairLimitEnabled:false,minimumGames:1,demo:true});
  expect(readMatchmakingConfig({NODE_ENV:"production"})).toEqual({pairLimitEnabled:true,minimumGames:5,demo:false});
  for(const value of ["0","6","1.5","","secret"]) expect(()=>readMatchmakingConfig({RANKED_MINIMUM_GAMES:value})).toThrow();
});
