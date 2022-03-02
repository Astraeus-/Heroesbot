export interface Region {
    name: string;
    timezone: string | null;
    heroesloungeId: 1 | 2 | null;
    blizzardRegion: '1' | '2' | '3' | '5';
}

export type GameMode = 'Quick Match' | 'Unranked Draft' | 'Hero League' | 'Team League' | 'Storm League';

export interface GameModeData {
  mmr: number,
  games_played: number,
  games_played_last_90_days?: number,
  league_tier: string,
}

export interface GameModeDataActive extends GameModeData {
  active: boolean,
}

export type GameDataObject = {[Key: string]: GameModeData}
