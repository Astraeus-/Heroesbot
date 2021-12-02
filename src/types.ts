export interface Match {
    id: number;
    div_id?: number;
    playoff_id?: number
    winner_id: number;
    round?: number;
    is_played: boolean;
    schedule_date: string,
    tbp: string,
    wbp: string;
    playoff_postion?: number;
    playoff_winner_next?: number;
    playoff_loser_next?: number;
}

export interface Region {
    name: string;
    timezone: string | null;
    heroesloungeId: 1 | 2 | null;
    blizzardRegion: '1' | '2' | '3' | '5';
  }

export interface Sloth {
    id: number;
    title: string;
    discord_id: string;
    discord_tag: string;
    region_id: number;
}

export interface TwitchChannel {
    id: number;
    title: string;
    url: string;
    pivot: {match_id: number, channel_id: number};
}
