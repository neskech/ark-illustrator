// eslint-disable-next-line @typescript-eslint/ban-types
type StateMap<Keys extends string, Args> = Record<Keys, (args: Args) => Keys | undefined>;

export default class FunctionalStateMachine<Keys extends string, Args> {
  private stateMap: StateMap<Keys, Args>;
  private currentState: Keys;

  constructor(stateMap: StateMap<Keys, Args>, defaultState: Keys) {
    this.stateMap = stateMap;
    this.currentState = defaultState;
  }

  update(args: Args) {
    const state = this.stateMap[this.currentState];
    const newState = state(args);

    if (newState != null) this.currentState = newState;
  }
}
