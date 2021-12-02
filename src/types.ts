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
