export interface ToBottomProps {
  /** Replies that came while the person was away; 0 leaves a quiet arrow. */
  news: number;
  onGo: () => void;
}
