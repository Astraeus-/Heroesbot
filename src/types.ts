import Eris from 'eris';
import { Sloth } from 'heroeslounge-api';

export interface Region {
    name: string;
    timezone: string | null;
    heroesloungeId: 1 | 2 | null;
    blizzardRegion: '1' | '2' | '3' | '5';
}

export interface Caster extends Sloth {
  pivot?: {
    match_id: number;
    caster_id: number;
    approved: 0 | 1 | 2;
  }
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

export type InteractionResponse = Promise<void> | Promise<Eris.Message<Eris.TextableChannel> | undefined>;
