/** What an agent handed one agent by `pass_to`: the texts it wrote for it, joined in the order of the calls. */
export interface RoutePass {
  agentId: string;
  text: string;
}
